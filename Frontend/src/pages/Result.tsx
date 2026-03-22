import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Nav';
import InspectionInfoCard from '../components/result/InspectionInfoCard';
import CompositionTable from '../components/result/CompositionTable';
import DefectTable from '../components/result/DefectTable';
import {
    type Grain,
    type StandardCategory,
    type CalculationResult,
    computeCompositionPercentages,
    computeDefects,
} from '../components/result/types';

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
                console.error('Failed to fetch inspection:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchResult();
    }, [id]);

    // Fetch all standards then find the right one.
    // Tries: exact ID → numeric suffix (std-1→1) → name → first standard.
    useEffect(() => {
        if (!inspection) return;
        const fetchStandard = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/standard`);
                if (!res.ok) return;
                const all: any[] = await res.json();

                const sid = inspection.standardID ?? '';
                let matched = all.find(s => s.id === sid);

                if (!matched) {
                    const num = sid.replace(/\D+/g, '');
                    if (num) matched = all.find(s => s.id === num);
                }
                if (!matched && inspection.standardName) {
                    matched = all.find(s => s.name === inspection.standardName);
                }
                if (!matched && all.length > 0) matched = all[0];

                if (matched?.standardData) setStandardCategories(matched.standardData);
            } catch (err) {
                console.error('Failed to fetch standards:', err);
            }
        };
        fetchStandard();
    }, [inspection]);

    const grains: Grain[] = useMemo(
        () => inspection?.standardData?.grains ?? [],
        [inspection]
    );

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

    const defects = useMemo(
        () => (grains.length > 0 ? computeDefects(grains) : []),
        [grains]
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
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
                                    src={inspection.imageLink || 'https://easyrice-es-trade-data.s3.ap-southeast-1.amazonaws.com/example-rice.webp'}
                                    alt="Inspection sample"
                                    className="w-full rounded-xl object-cover aspect-square"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="flex-1 py-2 rounded border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => navigate(`/edit/${id}`)}
                                        className="flex-1 py-2 rounded bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            {/* Right — cards */}
                            <div className="flex-1 space-y-4 shadow-lg rounded-2xl p-4 bg-slate-50">
                                <InspectionInfoCard
                                    inspection={inspection}
                                    calculation={calculation}
                                    grains={grains}
                                />

                                {calculation && <CompositionTable calculation={calculation} />}

                                {defects.length > 0 && <DefectTable defects={defects} />}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        <p className="text-lg font-medium">Inspection not found.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 text-green-600 underline hover:text-green-700"
                        >
                            Back to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
