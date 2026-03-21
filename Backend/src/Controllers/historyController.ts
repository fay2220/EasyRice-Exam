import { Request, Response } from 'express';
import { getStandardById, calculateRiceCategories, Grain } from '../services/standard';
import { saveHistoryService } from '../services/history';

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
