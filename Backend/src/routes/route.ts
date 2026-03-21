import { Router, Request, Response } from 'express';
import multer from 'multer';
import { getStandardService } from '../services/standard';
import { getHistoryService, getHistoryByIdService, deleteHistoryService, saveHistoryService } from '../services/history';

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

router.post('/history', upload.single('file'), async (req: Request, res: Response) => {
    try {
        console.log("Received new DB insertion payload:", req.body.name);
        
        if (!req.file) {
            return res.status(400).json({ error: "JSON raw data file is absolutely required" });
        }

        const rawJson = JSON.parse(req.file.buffer.toString('utf-8'));
        
        const inspectionData = {
            inspectionID: "", 
            name: req.body.name,
            createDate: new Date().toLocaleDateString('en-GB') + ' - ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            standardID: req.body.standard,
            standardName: req.body.standard, 
            note: req.body.note,
            price: parseFloat(req.body.price || "0"),
            samplingDate: req.body.datetime || "",
            samplingPoint: JSON.parse(req.body.samplingPoint || "[]"),
            imageLink: "",
            standardData: rawJson
        };

        const result = await saveHistoryService(inspectionData);
        res.status(200).json({ success: true, message: "Inspection saved securely to DB!", data: result });
    } catch (err) {
        console.error("DB Insertion Error:", err);
        res.status(500).json({ error: "Failed to persist to Postgres" });
    }
});

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