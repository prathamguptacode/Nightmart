import express from 'express';
import { listProduct, order, seeProducts } from '../controller/product';
import { userAuth } from '../middleware/userAuth';
const router = express.Router();

router.post('/listproduct', userAuth,  listProduct);
router.get('/products',seeProducts)
router.post('/order',userAuth,order)

export default router
