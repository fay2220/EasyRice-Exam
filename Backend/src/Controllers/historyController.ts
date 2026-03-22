import { Request, Response } from 'express';
import { getStandardById, calculateRiceCategories, Grain } from '../services/standard';
import { getHistoryService, getHistoryByIdService, deleteHistoryService, saveHistoryService, updateHistoryService, bulkDeleteHistoryService } from '../services/history';



export const createHistoryController = async (req: Request, res: Response) => {
    try {
        console.log("Received new inspection payload for:", req.body.name);

        if (!req.file) {
            return res.status(400).json({ error: "JSON raw data file is required" });
        }

        // 1. Parse uploaded grain data
        const rawJson = JSON.parse(req.file.buffer.toString('utf-8'));
        const grains: Grain[] = rawJson.grains ?? rawJson; // support both {grains:[]} and []

        // 2. Look up the selected standard
        const standardId = req.body.standard;
        const standard = getStandardById(standardId);

        if (!standard) {
            return res.status(400).json({ error: `Standard ID "${standardId}" not found` });
        }

        // 3. Calculate rice categories
        const calculationResult = calculateRiceCategories(grains, standard);
        console.log(`Categorization done: ${calculationResult.totalGrains} grains across ${calculationResult.categories.length} categories`);

        // 4. Build inspection record
        const inspectionData = {
            inspectionID: "",
            name: req.body.name,
            createDate: new Date().toLocaleDateString('en-GB') + ' - ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            standardID: standard.id,
            standardName: standard.name,
            note: req.body.note || "",
            price: parseFloat(req.body.price || "0"),
            samplingDate: req.body.datetime || "",
            samplingPoint: JSON.parse(req.body.samplingPoint || "[]"),
            imageLink: rawJson.imageURL || "",
            standardData: {
                calculation: calculationResult,
                grains: grains
            }
        };

        const result = await saveHistoryService(inspectionData);
        res.status(200).json({
            success: true,
            message: "Inspection saved to DB!",
            data: result,
            calculation: calculationResult
        });
    } catch (err) {
        console.error("Inspection save error:", err);
        res.status(500).json({ error: "Failed to save inspection" });
    }
};

export const deleteHistoryController = async (req: Request, res: Response) => {
    try {
        // the :id param matches the inspectionID variable since Prisma relies on that unique ID
        const id = String(req.params.id);
        const data = await deleteHistoryService(id);
        res.json({ success: true, message: "Deleted successfully", data });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Failed to delete" });
    }
}

export const bulkDeleteHistoryController = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "An array of IDs is required" });
        }
        const data = await bulkDeleteHistoryService(ids);
        res.json({ success: true, message: `Deleted ${data.count} items successfully`, data });
    } catch (err) {
        console.error("Bulk Delete Error:", err);
        res.status(500).json({ error: "Failed to bulk delete" });
    }
}

export const getHistoryByIdController = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const data = await getHistoryByIdService(id);
        if (!data) return res.status(404).json({ error: "Inspection not found" });
        res.json(data);
    } catch (error) {
        console.error("Failed to fetch inspection by id:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getHistoryController = async (req: Request, res: Response) => {
    try {
        const data = await getHistoryService();
        res.json(data);
    } catch (error) {
        console.error("Failed to fetch history:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const updateHistoryController = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const { note, price, samplingPoint, samplingDate } = req.body;
        const updated = await updateHistoryService(id, {
            note,
            price: price !== undefined ? parseFloat(price) : undefined,
            samplingPoint: Array.isArray(samplingPoint) ? samplingPoint : undefined,
            samplingDate,
        });
        res.json({ success: true, data: updated });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Failed to update inspection" });
    }
}