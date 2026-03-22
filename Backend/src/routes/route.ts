import { Router, Request, Response } from 'express';
import multer from 'multer';
import { getStandardController, getStandardByIdController } from '../Controllers/standardController';
import { createHistoryController, getHistoryByIdController, deleteHistoryController, getHistoryController, updateHistoryController, bulkDeleteHistoryController } from '../Controllers/historyController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Standard routes
router.get('/standard', getStandardController);
router.get('/standard/:id', getStandardByIdController);

// History routes
router.get('/history', getHistoryController);
router.post('/history', upload.single('file'), createHistoryController);
router.post('/history/bulk-delete', bulkDeleteHistoryController);
router.delete('/history/:id', deleteHistoryController);
router.get('/history/:id', getHistoryByIdController);
router.patch('/history/:id', updateHistoryController);


export default router;