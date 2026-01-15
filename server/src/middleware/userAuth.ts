import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
export function userAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(404).json({ message: 'headers not found' });
    }
    const token = header.split(' ')[1];
    if (!token) {
        return res.status(404).json({ message: 'Invalid token format' });
    }
    try {
        if (process.env.ACCESSTOKEN) {
            const tokenData = jwt.verify(
                token,
                process.env.ACCESSTOKEN
            ) as jwt.JwtPayload;
            req.user = tokenData.useremail;
            next();
        } else {
            return res.status(500).json({ message: 'SOMETHING WENT WRONG' });
        }
    } catch (error) {
        return res.status(404).json({ message: 'Invalid or Corrupted Token' });
    }
}
