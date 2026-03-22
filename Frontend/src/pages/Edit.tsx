import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Nav';

const SAMPLING_POINTS = ['Front End', 'Back End', 'Other'];

export default function Edit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [inspectionID, setInspectionID] = useState('');
    const [note, setNote] = useState('');
    const [price, setPrice] = useState('');
    const [samplingPoint, setSamplingPoint] = useState<string[]>([]);
    const [samplingDate, setSamplingDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fetch existing inspection to pre-fill the form
    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/history/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setInspectionID(data.inspectionID ?? '');
                    setNote(data.note ?? '');
                    setPrice(data.price != null ? String(data.price) : '');
                    setSamplingPoint(data.samplingPoint ?? []);
                    setSamplingDate(data.samplingDate ?? '');
                }
            } catch (err) {
                console.error('Failed to fetch inspection:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetch_();
    }, [id]);

    const toggleSamplingPoint = (point: string) => {
        setSamplingPoint(prev =>
            prev.includes(point) ? prev.filter(p => p !== point) : [...prev, point]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/history/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    note,
                    price: parseFloat(price) || 0,
                    samplingPoint,
                    samplingDate,
                }),
            });
            if (res.ok) {
                navigate(`/result/${id}`);
            } else {
                alert('Failed to update inspection.');
            }
        } catch (err) {
            console.error('Update error:', err);
            alert('An error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans">
                <Navbar />
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />

            <div className="max-w-xl mx-auto px-4 py-10">
                {/* Page Title */}
                <h1 className="text-2xl font-bold text-slate-900 mb-6">
                    Edit Inspection ID : {inspectionID}
                </h1>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">

                    {/* Note */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Note</label>
                        <input
                            type="text"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Enter note..."
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* Price */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Price</label>
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            placeholder="0"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* Sampling Point */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-800">Sampling Point</label>
                        <div className="flex gap-6">
                            {SAMPLING_POINTS.map(point => (
                                <label key={point} className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={samplingPoint.includes(point)}
                                        onChange={() => toggleSamplingPoint(point)}
                                        className="sr-only"
                                    />
                                    <div
                                        onClick={() => toggleSamplingPoint(point)}
                                        className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors cursor-pointer ${
                                            samplingPoint.includes(point)
                                                ? 'bg-green-700 border-green-700'
                                                : 'bg-white border-slate-300'
                                        }`}
                                    >
                                        {samplingPoint.includes(point) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm text-slate-700">{point}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Date/Time of Sampling */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Date/Time of Sampling</label>
                        <input
                            type="datetime-local"
                            value={samplingDate ? samplingDate.slice(0, 16) : ''}
                            onChange={e => setSamplingDate(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-60"
                        >
                            {submitting ? 'Saving...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
