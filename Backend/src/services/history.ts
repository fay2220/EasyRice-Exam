import { PrismaClient } from '@prisma/client';
import { Inspection } from "../models/model";

const prisma = new PrismaClient();

export const saveHistoryService = async (data: Omit<Inspection, 'standardData' | 'inspectionID'> & { standardData: any }) => {
    const rawId = `INS-${Date.now().toString().slice(-6)}`;
    
    return prisma.inspection.create({
        data: {
            inspectionID: rawId,
            name: data.name,
            createDate: data.createDate,
            rawDate: Date.now(),
            standardID: data.standardID,
            note: data.note,
            standardName: data.standardName,
            samplingDate: data.samplingDate,
            samplingPoint: data.samplingPoint,
            price: data.price,
            imageLink: data.imageLink || null,
            standardData: data.standardData
        }
    });
};

export const getHistoryService = async () => {
    const dbInspections = await prisma.inspection.findMany({
        orderBy: { rawDate: 'desc' }
    });

    return dbInspections.map(item => ({
        rawId: item.inspectionID,
        createDate: item.createDate,
        rawDate: item.rawDate,
        name: item.name,
        standard: item.standardName,
        note: item.note,
    }));
};

export const deleteHistoryService = async (inspectionID: string) => {
    return prisma.inspection.delete({
        where: { inspectionID }
    });
};
