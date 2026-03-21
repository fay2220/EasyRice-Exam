import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Nav';

interface CategoryResult {
    key: string;
    name: string;
    count: number;
    totalWeight: number;
    percentageCount: number;
    percentageWeight: number;
    minLength?: number;
    maxLength?: number;
}

interface CalculationResult {
    standardID: string;
    standardName: string;
    totalGrains: number;
    totalWeight: number;
    categories: CategoryResult[];
}

interface Grain {
    length: number;
    weight: number;
    shape: string;
    type: string;
}

const DEFECT_TYPES = ['yellow', 'paddy', 'damaged', 'glutinous', 'chalky', 'red'];

function computeDefects(grains: Grain[]) {
    const total = grains.length;
    const result: { name: string; count: number; pct: number }[] = [];
    for (const type of DEFECT_TYPES) {
        const count = grains.filter(g => g.type === type).length;
        result.push({ name: type, count, pct: total > 0 ? (count / total) * 100 : 0 });
    }
    const defectTotal = result.reduce((s, r) => s + r.count, 0);
    result.push({ name: 'Total', count: defectTotal, pct: total > 0 ? (defectTotal / total) * 100 : 0 });
    return result;
}

function formatLength(cat: CategoryResult): string {
    const min = cat.minLength ?? null;
    const max = cat.maxLength ?? null;
    if (min !== null && max !== null) {
        if (max >= 99) return `>= ${min}`;
        return `${min} - ${max}`;
    }
    return '-';
}

export default function Result() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inspection, setInspection] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/history/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setInspection(data);
                }
            } catch (err) {
                console.error("Failed to fetch inspection detail:", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchResult();
    }, [id]);

    const calculation: CalculationResult | null = inspection?.standardData?.calculation ?? null;
    const grains: Grain[] = inspection?.standardData?.grains ?? [];
    const defects = grains.length > 0 ? computeDefects(grains) : [];

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
                        {/* Page title */}
                        <h1 className="text-4xl font-bold text-center text-slate-900 mb-8">Inspection</h1>

                        {/* Two-column layout */}
                        <div className="flex gap-6 items-start">

                            {/* Left column — image + buttons */}
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

                            {/* Right column — cards */}
                            <div className="flex-1 space-y-4">

                                {/* Card 1 — core fields */}
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
                                                {calculation ? `${calculation.totalGrains.toLocaleString()} kernal` : (grains.length > 0 ? `${grains.length.toLocaleString()} kernal` : '-')}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-slate-500 text-xs mb-0.5">Update Date - Time:</p>
                                            <p className="font-semibold text-slate-800">{inspection.createDate || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 — extra details */}
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

                                {/* Composition table */}
                                {calculation && calculation.categories.length > 0 && (
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
                                                            {cat.percentageWeight.toFixed(2)} %
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Defect Rice table */}
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
