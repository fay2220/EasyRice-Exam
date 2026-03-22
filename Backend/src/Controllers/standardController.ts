import { getAllStandards, getStandardById } from "../services/standard";
import { Request, Response } from "express";

export const getStandardController = async (req: Request, res: Response) => {
    const data = getAllStandards();
    res.json(data);
}

export const getStandardByIdController = async (req: Request, res: Response) => {
    const standard = getStandardById(String(req.params.id));
    if (!standard) return res.status(404).json({ error: 'Standard not found' });
    res.json(standard);
}