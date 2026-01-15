import 'dotenv/config';
import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './routes/userRouter'
import productRouter from './routes/productRouter'
const app = express();
app.use(express.json());
app.use(cors())
app.use(cookieParser())

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'hello world' });
});

app.use('/api',userRouter)
app.use('/api',productRouter)

app.listen(process.env.PORT, () =>
    console.log(`server on PORT ${process.env.PORT}`)
);
