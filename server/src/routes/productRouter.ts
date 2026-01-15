import express from 'express';
import { listProduct } from '../controller/product';
const router = express.Router();

router.post('/listproduct', listProduct);

export default router
