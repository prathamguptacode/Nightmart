import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export async function listProduct(req: Request, res: Response) {
    const userEmail = req.user;

    if (!req.body) {
        return res.status(400).json({ message: 'Body not found' });
    }
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
        return res.status(400).json({ message: 'Invalid inputs' });
    }

    let userId: {
        id: number;
    } | null;
    try {
        userId = await prisma.user.findUnique({
            where: {
                email: userEmail,
            },
            select: {
                id: true,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }
    if (!userId?.id) {
        return res.status(500).json({ message: 'Something went wrong' });
    }

    try {
        const dbRes = await prisma.product.create({
            data: {
                name: name,
                description: description,
                price: price,
                userId: userId.id,
            },
            select: {
                name: true,
                description: true,
                price: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        res.status(201).json({ message: 'product listed', product: dbRes });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

export async function seeProducts(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ message: 'Body not found' });
    }
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Invalid inputs' });
    }
    try {
        const dbRes = await prisma.product.findMany({
            where: {
                name: name,
            },
            select: {
                name: true,
                description: true,
                price: true,
            },
        });
        return res.json({ message: 'product in db', products: dbRes });
    } catch (error) {
        return res.status(500).json({ message: 'something went worng' });
    }
}
