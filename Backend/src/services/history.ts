import { PrismaClient } from '@prisma/client';
import { getStandardById, calculateRiceCategories, Grain } from './standard';
const prisma = new PrismaClient();



export const processAndSaveHistoryService = async (body: any, fileBuffer: Buffer) => {
    // 1. Parse uploaded grain data
    const rawJson = JSON.parse(fileBuffer.toString('utf-8'));
    const grains: Grain[] = rawJson.grains ?? rawJson; // support both {grains:[]} and []

    // 2. Look up the selected standard
    const standardId = body.standard;
    const standard = getStandardById(standardId);

    if (!standard) {
        throw new Error(`Standard ID "${standardId}" not found`);
    }

    // 3. Calculate rice categories
    const calculationResult = calculateRiceCategories(grains, standard);

    // 4. Build inspection record
    const rawId = `INS-${Date.now().toString().slice(-6)}`;

    const result = await prisma.inspection.create({
        data: {
            inspectionID: rawId,
            name: body.name,
            createDate: new Date().toLocaleDateString('en-GB') + ' - ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            rawDate: Date.now(),
            standardID: standard.id,
            note: body.note || "",
            standardName: standard.name,
            samplingDate: body.datetime || "",
            samplingPoint: JSON.parse(body.samplingPoint || "[]"),
            price: parseFloat(body.price || "0"),
            imageLink: rawJson.imageURL || null,
            standardData: {
                calculation: calculationResult,
                grains: grains
            } as any
        }
    });

    return { result, calculationResult };
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

export const getHistoryByIdService = async (inspectionID: string) => {
    return prisma.inspection.findUnique({
        where: { inspectionID }
    });
};

export const deleteHistoryService = async (inspectionID: string) => {
    return prisma.inspection.delete({
        where: { inspectionID }
    });
};

export const bulkDeleteHistoryService = async (inspectionIDs: string[]) => {
    return prisma.inspection.deleteMany({
        where: { inspectionID: { in: inspectionIDs } }
    });
};

export const updateHistoryService = async (
    inspectionID: string,
    data: { note?: string; price?: any; samplingPoint?: any; samplingDate?: string }
) => {
    return prisma.inspection.update({
        where: { inspectionID },
        data: {
            note: data.note,
            price: data.price !== undefined ? parseFloat(data.price) : undefined,
            samplingPoint: Array.isArray(data.samplingPoint) ? data.samplingPoint : undefined,
            samplingDate: data.samplingDate,
        }
    });
};

