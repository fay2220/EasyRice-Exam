import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Nav';
import { ArrowLeft, Pencil } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : inspection ? (
                    <>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Inspection Result</h2>
                            <p className="text-sm text-slate-500 mt-1">ID: <span className="font-mono font-semibold text-slate-700">{inspection.inspectionID}</span></p>
                        </div>

                        {/* Image */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <img
                                src={inspection.imageLink || "https://easyrice-es-trade-data.s3.ap-southeast-1.amazonaws.com/example-rice.webp"}
                                alt="Inspection sample"
                                className="w-full object-cover max-h-96"
                            />
                        </div>

                        {/* Action Buttons under the image */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={() => navigate(`/form?edit=${id}`)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow-sm"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit
                            </button>
                        </div>

                        {/* Info Card */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-slate-900 text-lg">Inspection Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-400 text-xs font-medium uppercase mb-1">Name</p>
                                    <p className="text-slate-800 font-medium">{inspection.name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium uppercase mb-1">Standard</p>
                                    <p className="text-slate-800 font-medium">{inspection.standardName}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium uppercase mb-1">Created</p>
                                    <p className="text-slate-800 font-medium">{inspection.createDate}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium uppercase mb-1">Price</p>
                                    <p className="text-slate-800 font-medium">{inspection.price?.toFixed(2) ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium uppercase mb-1">Sampling Date</p>
                                    <p className="text-slate-800 font-medium">{inspection.samplingDate || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium uppercase mb-1">Sampling Points</p>
                                    <p className="text-slate-800 font-medium">{inspection.samplingPoint?.join(', ') || '-'}</p>
                                </div>
                                {inspection.note && (
                                    <div className="col-span-2">
                                        <p className="text-slate-400 text-xs font-medium uppercase mb-1">Note</p>
                                        <p className="text-slate-800 font-medium">{inspection.note}</p>
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
