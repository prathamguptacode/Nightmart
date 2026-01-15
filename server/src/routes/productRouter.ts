import express from 'express';
import { listProduct, seeProducts } from '../controller/product';
import { userAuth } from '../middleware/userAuth';
const router = express.Router();

router.post('/listproduct', userAuth,  listProduct);
router.get('/products',seeProducts)

export default router
