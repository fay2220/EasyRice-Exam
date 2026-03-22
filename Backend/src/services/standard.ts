import path from 'path';
import fs from 'fs';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StandardCategory {
    key: string;
    name: string;
    shape: string[];
    minLength: number;
    maxLength: number;
    conditionMin: 'GT' | 'GTE';   // GT  = strictly greater than (>)
    conditionMax: 'LT' | 'LTE';   // LTE = less than or equal   (<=)
}

export interface Standard {
    id: string;
    name: string;
    createDate?: string;
    standardData?: StandardCategory[];
}

export interface Grain {
    length: number;
    weight: number;
    shape: string;
    type: string;
}

export interface CategoryResult {
    key: string;
    name: string;
    minLength: number;
    maxLength: number;
    count: number;
    totalWeight: number;
    percentageCount: number;   // % by grain count
    percentageWeight: number;  // % by total weight
}

export interface CalculationResult {
    standardID: string;
    standardName: string;
    totalGrains: number;
    totalWeight: number;
    categories: CategoryResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Load standard.json
// Inside Docker (ts-node):  __dirname = /app/src/services  →  ../../ = /app
// ─────────────────────────────────────────────────────────────────────────────

const STANDARD_JSON_PATH = path.resolve(__dirname, '../../standard.json');

function loadStandards(): Standard[] {
    try {
        const raw = fs.readFileSync(STANDARD_JSON_PATH, 'utf-8');
        return JSON.parse(raw) as Standard[];
    } catch (err) {
        console.error('[standard] Failed to load standard.json:', err);
        return [];
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public data access
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the id/name list shown in the Form dropdown */
export const getStandardService = (): Pick<Standard, 'id' | 'name'>[] =>
    loadStandards().map(({ id, name }) => ({ id, name }));

/** Returns ALL full standard objects including standardData (used by GET /standard) */
export const getAllStandards = (): Standard[] => loadStandards();


/** Looks up one full standard (including standardData) by its id */
export const getStandardById = (id: string): Standard | undefined =>
    loadStandards().find(s => s.id === id);

// ─────────────────────────────────────────────────────────────────────────────
// Condition helpers  (read conditionMin / conditionMax from the JSON)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether a grain's length satisfies the minimum-side condition.
 * conditionMin 'GT'  → length >  minLength (strictly greater)
 * conditionMin 'GTE' → length >= minLength (greater or equal)
 */
function checkMinCondition(
    grainLength: number,
    minLength: number,
    conditionMin: StandardCategory['conditionMin']
): boolean {
    return conditionMin === 'GTE'
        ? grainLength >= minLength
        : grainLength > minLength;
}

/**
 * Check whether a grain's length satisfies the maximum-side condition.
 * conditionMax 'LT'  → length <  maxLength (strictly less)
 * conditionMax 'LTE' → length <= maxLength (less or equal)
 */
function checkMaxCondition(
    grainLength: number,
    maxLength: number,
    conditionMax: StandardCategory['conditionMax']
): boolean {
    return conditionMax === 'LTE'
        ? grainLength <= maxLength
        : grainLength < maxLength;
}

/**
 * Returns true if the grain falls inside the category's length range.
 * Both min and max conditions (from the JSON) must be satisfied.
 */
function grainMatchesCategory(grain: Grain, cat: StandardCategory): boolean {
    return (
        checkMinCondition(grain.length, cat.minLength, cat.conditionMin) &&
        checkMaxCondition(grain.length, cat.maxLength, cat.conditionMax)
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calculation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify every grain against the standard's categories and return
 * per-category counts, weights, and percentages.
 *
 * Data source: grains from the uploaded mock.json,
 *              categories from the selected standard in standard.json.
 */
export function calculateRiceCategories(
    grains: Grain[],
    standard: Standard
): CalculationResult {
    const categories = standard.standardData ?? [];
    const totalGrains = grains.length;
    const totalWeight = grains.reduce((sum, g) => sum + g.weight, 0);

    const categoryResults: CategoryResult[] = categories.map(cat => {
        // Filter grains that satisfy this category's length conditions
        const matched = grains.filter(g => grainMatchesCategory(g, cat));

        const catWeight = matched.reduce((sum, g) => sum + g.weight, 0);

        return {
            key:             cat.key,
            name:            cat.name,
            minLength:       cat.minLength,
            maxLength:       cat.maxLength,
            count:           matched.length,
            totalWeight:     parseFloat(catWeight.toFixed(6)),
            percentageCount: totalGrains > 0
                ? parseFloat(((matched.length / totalGrains) * 100).toFixed(2))
                : 0,
            percentageWeight: totalWeight > 0
                ? parseFloat(((catWeight / totalWeight) * 100).toFixed(2))
                : 0,
        };
    });

    return {
        standardID:   standard.id,
        standardName: standard.name,
        totalGrains,
        totalWeight:  parseFloat(totalWeight.toFixed(6)),
        categories:   categoryResults,
    };
}