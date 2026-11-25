import express from 'express';
import { getFinance, updateFinance } from '../controllers/financeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection middleware to all finance routes
router.use(protect);

router.get('/', getFinance);
router.put('/', updateFinance);

export default router;
