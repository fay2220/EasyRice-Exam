// ─── Shared types used across Result page components ─────────────────────────

export interface Grain {
    length: number;
    weight: number;
    shape: string;
    type: string;
}

export interface StandardCategory {
    key: string;
    name: string;
    minLength: number;
    maxLength: number;
    conditionMin: 'GT' | 'GTE';
    conditionMax: 'LT' | 'LTE';
}

export interface CategoryResult {
    key: string;
    name: string;
    minLength: number;
    maxLength: number;
    count: number;
    totalWeight: number;
    percentageCount: number;
    percentageWeight: number;
}

export interface CalculationResult {
    standardID: string;
    standardName: string;
    totalGrains: number;
    totalWeight: number;
    categories: CategoryResult[];
}

export interface DefectRow {
    name: string;
    count: number;
    pct: number;
}

// ─── Condition helpers (mirrors standard.ts on the backend) ───────────────────

export function checkMinCondition(length: number, min: number, cond: 'GT' | 'GTE'): boolean {
    return cond === 'GTE' ? length >= min : length > min;
}

export function checkMaxCondition(length: number, max: number, cond: 'LT' | 'LTE'): boolean {
    return cond === 'LTE' ? length <= max : length < max;
}

export function grainMatchesCategory(grain: Grain, cat: StandardCategory): boolean {
    return (
        checkMinCondition(grain.length, cat.minLength, cat.conditionMin) &&
        checkMaxCondition(grain.length, cat.maxLength, cat.conditionMax)
    );
}

// ─── Composition calculation ──────────────────────────────────────────────────

export function computeCompositionPercentages(
    grains: Grain[],
    categories: StandardCategory[]
): CategoryResult[] {
    const totalGrains = grains.length;
    const totalWeight = grains.reduce((s, g) => s + g.weight, 0);

    return categories.map(cat => {
        const matched = grains.filter(g => grainMatchesCategory(g, cat));
        const catWeight = matched.reduce((s, g) => s + g.weight, 0);

        return {
            key: cat.key,
            name: cat.name,
            minLength: cat.minLength,
            maxLength: cat.maxLength,
            count: matched.length,
            totalWeight: parseFloat(catWeight.toFixed(6)),
            percentageCount: totalGrains > 0
                ? parseFloat(((matched.length / totalGrains) * 100).toFixed(2)) : 0,
            percentageWeight: totalWeight > 0
                ? parseFloat(((catWeight / totalWeight) * 100).toFixed(2)) : 0,
        };
    });
}

// ─── Defect calculation ───────────────────────────────────────────────────────

const DEFECT_TYPES = ['yellow', 'paddy', 'damaged', 'glutinous', 'chalky', 'red'];

export function computeDefects(grains: Grain[]): DefectRow[] {
    const total = grains.length;
    const rows: DefectRow[] = DEFECT_TYPES.map(type => {
        const count = grains.filter(g => g.type === type).length;
        return { name: type, count, pct: total > 0 ? (count / total) * 100 : 0 };
    });
    const defectTotal = rows.reduce((s, r) => s + r.count, 0);
    rows.push({ name: 'Total', count: defectTotal, pct: total > 0 ? (defectTotal / total) * 100 : 0 });
    return rows;
}

// ─── Length display helper ────────────────────────────────────────────────────

export function formatLength(cat: CategoryResult): string {
    if (cat.maxLength >= 99) return `>= ${cat.minLength}`;
    return `${cat.minLength} - ${(cat.maxLength - 0.01).toFixed(2)}`;
}
