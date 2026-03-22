import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Nav';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Grain {
    length: number;
    weight: number;
    shape: string;
    type: string;
}

interface StandardCategory {
    key: string;
    name: string;
    minLength: number;
    maxLength: number;
    conditionMin: 'GT' | 'GTE';
    conditionMax: 'LT' | 'LTE';
}

interface CategoryResult {
    key: string;
    name: string;
    minLength: number;
    maxLength: number;
    count: number;
    totalWeight: number;
    percentageCount: number;
    percentageWeight: number;
}

interface CalculationResult {
    standardID: string;
    standardName: string;
    totalGrains: number;
    totalWeight: number;
    categories: CategoryResult[];
}

// ─── Condition helpers (mirrors standard.ts on the backend) ───────────────────

function checkMinCondition(length: number, min: number, cond: 'GT' | 'GTE'): boolean {
    return cond === 'GTE' ? length >= min : length > min;
}

function checkMaxCondition(length: number, max: number, cond: 'LT' | 'LTE'): boolean {
    return cond === 'LTE' ? length <= max : length < max;
}

function grainMatchesCategory(grain: Grain, cat: StandardCategory): boolean {
    return (
        checkMinCondition(grain.length, cat.minLength, cat.conditionMin) &&
        checkMaxCondition(grain.length, cat.maxLength, cat.conditionMax)
    );
}

// ─── Client-side composition calculation (same algorithm as standard.ts) ──────

function computeCompositionPercentages(
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

function computeDefects(grains: Grain[]) {
    const total = grains.length;
    const rows = DEFECT_TYPES.map(type => {
        const count = grains.filter(g => g.type === type).length;
        return { name: type, count, pct: total > 0 ? (count / total) * 100 : 0 };
    });
    const defectTotal = rows.reduce((s, r) => s + r.count, 0);
    rows.push({ name: 'Total', count: defectTotal, pct: total > 0 ? (defectTotal / total) * 100 : 0 });
    return rows;
}

// ─── Length display helper ────────────────────────────────────────────────────

function formatLength(cat: CategoryResult): string {
    if (cat.maxLength >= 99) return `>= ${cat.minLength}`;
    return `${cat.minLength} - ${(cat.maxLength - 0.01).toFixed(2)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Result() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [inspection, setInspection] = useState<any | null>(null);
    const [standardCategories, setStandardCategories] = useState<StandardCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch inspection detail
    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/history/${id}`);
                if (res.ok) setInspection(await res.json());
            } catch (err) {
                console.error("Failed to fetch inspection:", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchResult();
    }, [id]);

    // Fetch all standards (full objects with standardData) then find the right one.
    // Old records may have standardID like "std-1" which doesn't match JSON id "1",
    // so we try: exact match → numeric suffix match → first standard as last resort.
    useEffect(() => {
        if (!inspection) return;
        const fetchStandard = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/standard`);
                if (!res.ok) return;
                const all: any[] = await res.json();

                const sid = inspection.standardID ?? '';

                // 1. Exact ID match
                let matched = all.find(s => s.id === sid);

                // 2. Numeric suffix match: "std-1" → "1"
                if (!matched) {
                    const numericPart = sid.replace(/\D+/g, '');
                    if (numericPart) matched = all.find(s => s.id === numericPart);
                }

                // 3. Name match
                if (!matched && inspection.standardName) {
                    matched = all.find(s => s.name === inspection.standardName);
                }

                // 4. Fall back to first standard
                if (!matched && all.length > 0) matched = all[0];

                if (matched?.standardData) setStandardCategories(matched.standardData);
            } catch (err) {
                console.error("Failed to fetch standards:", err);
            }
        };
        fetchStandard();
    }, [inspection]);

    // Grains stored in DB
    const grains: Grain[] = useMemo(() =>
        inspection?.standardData?.grains ?? [],
        [inspection]);

    // If the DB record already has pre-computed calculation, use it;
    // otherwise compute it here from stored grains + fetched standard
    const calculation: CalculationResult | null = useMemo(() => {
        if (inspection?.standardData?.calculation) {
            return inspection.standardData.calculation as CalculationResult;
        }
        if (grains.length > 0 && standardCategories.length > 0) {
            const categories = computeCompositionPercentages(grains, standardCategories);
            return {
                standardID: inspection?.standardID ?? '',
                standardName: inspection?.standardName ?? '',
                totalGrains: grains.length,
                totalWeight: parseFloat(grains.reduce((s, g) => s + g.weight, 0).toFixed(6)),
                categories,
            };
        }
        return null;
    }, [inspection, grains, standardCategories]);

    const defects = useMemo(() =>
        grains.length > 0 ? computeDefects(grains) : [],
        [grains]);

    return (
        <div className="min-h-screen bg-[#f5f5f0] font-sans">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : inspection ? (
                    <>
                        <h1 className="text-4xl font-bold text-center text-slate-900 mb-8">Inspection</h1>

                        <div className="flex gap-6 items-start">

                            {/* Left — image + buttons */}
                            <div className="flex flex-col gap-3 w-[260px] flex-shrink-0">
                                <img
                                    src={inspection.imageLink || "https://easyrice-es-trade-data.s3.ap-southeast-1.amazonaws.com/example-rice.webp"}
                                    alt="Inspection sample"
                                    className="w-full rounded-xl object-cover aspect-square"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="flex-1 py-2 rounded border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => navigate(`/form?edit=${id}`)}
                                        className="flex-1 py-2 rounded bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            {/* Right — info cards */}
                            <div className="flex-1 space-y-4">

                                {/* Card 1 */}
                                <div className="bg-white rounded-xl border border-slate-200 p-5">
                                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Create Date - Time</p>
                                            <p className="font-semibold text-slate-800">{inspection.createDate || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Inspection ID:</p>
                                            <p className="font-semibold text-slate-800">{inspection.inspectionID || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Standard:</p>
                                            <p className="font-semibold text-slate-800">{inspection.standardName || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Total Sample:</p>
                                            <p className="font-semibold text-slate-800">
                                                {calculation
                                                    ? `${calculation.totalGrains.toLocaleString()} kernal`
                                                    : grains.length > 0 ? `${grains.length.toLocaleString()} kernal` : '-'}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-slate-500 text-xs mb-0.5">Update Date - Time:</p>
                                            <p className="font-semibold text-slate-800">{inspection.createDate || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-white rounded-xl border border-slate-200 p-5">
                                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Note</p>
                                            <p className="font-semibold text-slate-800">{inspection.note || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Price</p>
                                            <p className="font-semibold text-slate-800">
                                                {inspection.price != null ? Number(inspection.price).toLocaleString() : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Date/Time of Sampling</p>
                                            <p className="font-semibold text-slate-800">{inspection.samplingDate || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Sampling Point</p>
                                            <p className="font-semibold text-slate-800">
                                                {inspection.samplingPoint?.join(', ') || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Composition */}
                                {calculation && (
                                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                                        <h2 className="text-base font-bold text-slate-900 mb-3">Composition</h2>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-600">
                                                    <th className="py-2 px-3 text-left font-medium">Name</th>
                                                    <th className="py-2 px-3 text-right font-medium">Length</th>
                                                    <th className="py-2 px-3 text-right font-medium">Actual</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {calculation.categories.map(cat => (
                                                    <tr key={cat.key} className="border-t border-slate-100">
                                                        <td className="py-2.5 px-3 text-slate-800">{cat.name}</td>
                                                        <td className="py-2.5 px-3 text-right text-slate-600">{formatLength(cat)}</td>
                                                        <td className="py-2.5 px-3 text-right text-green-600 font-semibold">
                                                            {cat.percentageCount.toFixed(2)} %
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Defect Rice */}
                                {defects.length > 0 && (
                                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                                        <h2 className="text-base font-bold text-slate-900 mb-3">Defect Rice</h2>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-600">
                                                    <th className="py-2 px-3 text-left font-medium">Name</th>
                                                    <th className="py-2 px-3 text-right font-medium">Actual</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {defects.map(d => (
                                                    <tr key={d.name} className="border-t border-slate-100">
                                                        <td className="py-2.5 px-3 text-slate-800 capitalize">{d.name}</td>
                                                        <td className="py-2.5 px-3 text-right text-green-600 font-semibold">
                                                            {d.pct.toFixed(2)} %
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        <p className="text-lg font-medium">Inspection not found.</p>
                        <button onClick={() => navigate('/')} className="mt-4 text-green-600 underline hover:text-green-700">
                            Back to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
