import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export async function listProduct(req: Request, res: Response) {
    const userEmail = req.user;

    if (!req.body) {
        return res.status(400).json({ message: 'Body not found' });
    }
    const { name, description, price, tags } = req.body;
    if (!name || !description || !price || !tags) {
        return res.status(400).json({ message: 'Invalid inputs' });
    }
    const tagArray = tags.split(' ');
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
                tags: tagArray,
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
    const { tags } = req.body;
    if (!tags) {
        return res.status(400).json({ message: 'Invalid inputs' });
    }
    try {
        const dbRes = await prisma.product.findMany({
            where: {
                tags: {
                    has: tags,
                },
            },
            select: {
                name: true,
                description: true,
                price: true,
                id: true,
            },
        });
        return res.json({ message: 'product in db', products: dbRes });
    } catch (error) {
        return res.status(500).json({ message: 'something went worng here' });
    }
}

export async function order(req: Request, res: Response) {
    const userEmail = req.user;
    if (!req.body) {
        return res.status(400).json({ message: 'Body not found' });
    }
    const { productId } = req.body;
    if (!productId) {
        return res.status(400).json({ message: 'Product id not found' });
    }
    let userId: number | undefined;
    try {
        const userRes = await prisma.user.findUnique({
            where: {
                email: userEmail,
            },
            select: {
                id: true,
            },
        });
        userId = userRes?.id;
    } catch (error) {
        return res.status(500).json({ message: 'something went worng here' });
    }
    if (userId) {
        try {
            const dbRes = await prisma.order.create({
                data: {
                    productId: productId,
                    userId: userId,
                },
                select: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    product: {
                        select: {
                            name: true,
                            price: true,
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            return res.json({ message: 'order placed', order: dbRes });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ message: 'something went worng here' });
        }
    } else {
        return res.status(500).json({ message: 'something went worng here' });
    }
}

