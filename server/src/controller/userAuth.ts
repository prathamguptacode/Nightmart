import { Response, Request } from 'express';
import otpGenerator from 'otp-generator';
import { createTransport } from 'nodemailer';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function signup(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ message: 'Body not found' });
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Invalid Request' });
    }
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
    if (user) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPass = await bcrypt.hash(password, 12);
    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
    });
    sendOtp(otp, email);
    await prisma.tempUser.create({
        data: {
            name: name,
            email: email,
            password: hashedPass,
            otp: otp,
        },
    });
    res.status(200).json({ message: 'Please verify your email' });
}

function sendOtp(otp: string, email: string) {
    let mailTransport = createTransport({
        service: 'gmail',
        auth: {
            user: 'prathamgupta.wk@gmail.com',
            pass: process.env.EMAILPASS,
        },
    });
    let mailDetails = {
        from: 'prathamgupta.wk@gmail.com',
        to: email,
        subject: `Your OTP to sign in to My Thrift Store is ${otp}`,
        text: `Your OTP to sign in to My Thrift Store is ${otp} \n Thank you \n From My Thrift Shop Team`,
    };
    mailTransport.sendMail(mailDetails);
}

export async function verify(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ message: 'body not found' });
    }
    const { otp, email } = req.body;
    if (!otp || !email) {
        return res.status(400).json('Invalid Request');
    }
    let tempUser: {
        id: number;
        email: string;
        name: string;
        password: string;
        otp: string;
        createdAt: Date;
    };
    try {
        const tempUserData = await prisma.tempUser.findMany({
            where: {
                email: email,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 1,
        });
        tempUser = tempUserData[0];
    } catch (error) {
        return res.status(500).json({ message: 'something went wrong' });
    }
    if (!tempUser) {
        return res.status(500).json({ message: 'something went wrong' });
    }
    if (tempUser.otp == otp) {
        try {
            const user = await prisma.user.create({
                data: {
                    name: tempUser.name,
                    email: tempUser.email,
                    password: tempUser.password,
                },
            });
            await prisma.tempUser.deleteMany({
                where: {
                    email: email,
                },
            });
            let accessToken: string = '';
            if (process.env.ACCESSTOKEN) {
                accessToken = jwt.sign(
                    { useremail: user.email },
                    process.env.ACCESSTOKEN,
                    { expiresIn: '15m' }
                );
            }
            if (process.env.REFRESHTOKEN) {
                const refreshToken = jwt.sign(
                    { useremail: user.email },
                    process.env.REFRESHTOKEN
                );
                res.cookie('refreshToken', refreshToken, { httpOnly: true });
            }
            res.status(201).json({
                message: 'User successfully created',
                accessToken: accessToken,
            });
        } catch (error) {
            return res.status(500).json({ message: 'Something went wrong' });
        }
    } else {
        res.status(401).json({ message: 'Invalid OTP' });
    }
}

export async function login(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ message: 'Body not found' });
    }
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Invalid Request' });
    }
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
    if (!user) {
        return res
            .status(400)
            .json({ message: 'User account does not exists' });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
        return res.status(400).json({ message: 'Incorrect password' });
    }
    let accessToken: string = '';
    if (process.env.ACCESSTOKEN) {
        accessToken = jwt.sign(
            { useremail: user.email },
            process.env.ACCESSTOKEN,
            { expiresIn: '15m' }
        );
    }
    if (process.env.REFRESHTOKEN) {
        const refreshToken = jwt.sign(
            { useremail: user.email },
            process.env.REFRESHTOKEN
        );
        res.cookie('refreshToken', refreshToken, { httpOnly: true });
    }
    res.json({
        message: `welcome user ${user.name}`,
        accessToken: accessToken,
    });
}
