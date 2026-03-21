import path from 'path';
import fs from 'fs';

// ---- Simple Standard type (for dropdown list) ----
export interface Standard {
    id: string;
    name: string;
    createDate?: string;
    standardData?: StandardCategory[];
}

export interface StandardCategory {
    key: string;
    name: string;
    shape: string[];
    minLength: number;
    maxLength: number;
    conditionMin: 'GT' | 'GTE';
    conditionMax: 'LT' | 'LTE';
}

// ---- Grain type (from uploaded mock.json) ----
export interface Grain {
    length: number;
    weight: number;
    shape: string;
    type: string;
}

// ---- Per-category result ----
export interface CategoryResult {
    key: string;
    name: string;
    count: number;
    totalWeight: number;
    percentageCount: number;
    percentageWeight: number;
    minLength: number;
    maxLength: number;
}

// ---- Full calculation result stored in DB ----
export interface CalculationResult {
    standardID: string;
    standardName: string;
    totalGrains: number;
    totalWeight: number;
    categories: CategoryResult[];
}

// ---- Load standards from standard.json at the Backend root ----
// __dirname (ts-node) = Backend/src/services  →  ../../.. = Backend root
// __dirname (compiled) = Backend/dist/services → ../../.. = Backend root
const standardsFilePath = path.resolve(__dirname, '../../../standard.json');

function loadStandards(): Standard[] {
    try {
        const raw = fs.readFileSync(standardsFilePath, 'utf-8');
        return JSON.parse(raw) as Standard[];
    } catch (e) {
        console.warn('Could not load standard.json, falling back to empty list:', e);
        return [];
    }
}

export const getStandardService = (): Pick<Standard, 'id' | 'name'>[] => {
    return loadStandards().map(({ id, name }) => ({ id, name }));
};

export const getStandardById = (id: string): Standard | undefined => {
    return loadStandards().find(s => s.id === id);
};

// ---- Core categorization algorithm ----
export function calculateRiceCategories(
    grains: Grain[],
    standard: Standard
): CalculationResult {
    const cats = standard.standardData ?? [];
    const totalGrains = grains.length;
    const totalWeight = grains.reduce((sum, g) => sum + g.weight, 0);

    const categories: CategoryResult[] = cats.map(cat => {
        const matching = grains.filter(g => {
            const minOk = cat.conditionMin === 'GTE'
                ? g.length >= cat.minLength
                : g.length > cat.minLength;
            const maxOk = cat.conditionMax === 'LTE'
                ? g.length <= cat.maxLength
                : g.length < cat.maxLength;
            return minOk && maxOk;
        });

        const catWeight = matching.reduce((sum, g) => sum + g.weight, 0);

        return {
            key: cat.key,
            name: cat.name,
            count: matching.length,
            totalWeight: parseFloat(catWeight.toFixed(6)),
            percentageCount: totalGrains > 0
                ? parseFloat(((matching.length / totalGrains) * 100).toFixed(2))
                : 0,
            percentageWeight: totalWeight > 0
                ? parseFloat(((catWeight / totalWeight) * 100).toFixed(2))
                : 0,
            minLength: cat.minLength,
            maxLength: cat.maxLength,
        };
    });

    return {
        standardID: standard.id,
        standardName: standard.name,
        totalGrains,
        totalWeight: parseFloat(totalWeight.toFixed(6)),
        categories,
    };
}