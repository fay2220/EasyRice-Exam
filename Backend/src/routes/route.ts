import { Router, Request, Response } from 'express';
import multer from 'multer';
import { getStandardController, getStandardByIdController } from '../Controllers/standardController';
import { createHistoryController, getHistoryByIdController, deleteHistoryController, getHistoryController } from '../Controllers/historyController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Standard routes
router.get('/standard', getStandardController);
router.get('/standard/:id', getStandardByIdController);

// History routes
router.get('/history', getHistoryController);
router.post('/history', upload.single('file'), createHistoryController);
router.delete('/history/:id', deleteHistoryController);
router.get('/history/:id', getHistoryByIdController);


export default router;