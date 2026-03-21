import { Router, Request, Response } from 'express';
import multer from 'multer';
import { getHistoryService, getHistoryByIdService, deleteHistoryService } from '../services/history';
import { createHistoryController } from '../Controllers/historyController';
import { getStandardService } from '../services/standard';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/standard', (req: Request, res: Response) => {
    const data = getStandardService();
    res.json(data);
});

router.get('/history', async (req: Request, res: Response) => {
    try {
        const data = await getHistoryService();
        res.json(data);
    } catch (error) {
        console.error("Failed to fetch history:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/history/:id', async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const data = await getHistoryByIdService(id);
        if (!data) return res.status(404).json({ error: "Inspection not found" });
        res.json(data);
    } catch (error) {
        console.error("Failed to fetch inspection by id:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.post('/history', upload.single('file'), createHistoryController);


router.delete('/history/:id', async (req: Request, res: Response) => {
    try {
        // the :id param matches the inspectionID variable since Prisma relies on that unique ID
        const id = String(req.params.id);
        const data = await deleteHistoryService(id);
        res.json({ success: true, message: "Deleted successfully", data });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Failed to delete" });
    }
});

export default router;