import { Router } from 'express';
import { createInvoice, getUserInvoices } from '../controllers/invoices.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// http://localhost:8000/api/invoices
router.post('/', authMiddleware, createInvoice);

// http://localhost:8000/api/invoices
router.get('/', authMiddleware, getUserInvoices);

export default router;
