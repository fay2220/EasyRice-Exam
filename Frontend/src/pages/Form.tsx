import React, { useState, useEffect } from "react";
import { ChevronLeft, Upload, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Nav";

export default function Form() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [standard, setStandard] = useState("");
    const [note, setNote] = useState("");
    const [price, setPrice] = useState("");
    const [samplingPoint, setSamplingPoint] = useState<string[]>([]);
    const [datetime, setDatetime] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [standardList, setStandardList] = useState<{ id: string; name: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchStandards = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/standard`);
                if (res.ok) {
                    const data = await res.json();
                    setStandardList(data);
                } else {
                    throw new Error("Failed to fetch standards");
                }
            } catch (err) {
                console.error("Backend fetch error for /standard:", err);

            }
        };
        fetchStandards();
    }, []);

    const handleSamplingPointToggle = (val: string) => {
        setSamplingPoint((prev) =>
            prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.json')) {
                setFile(selectedFile);
            } else {
                alert("Please upload a .json file only.");
                e.target.value = '';
                setFile(null);
            }
        } else {
            setFile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            alert("Please upload a raw data .json file.");
            return;
        }
        if (samplingPoint.length === 0) {
            alert("Please select at least one sampling point.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("standard", standard);
            formData.append("note", note);
            formData.append("price", price);
            formData.append("samplingPoint", JSON.stringify(samplingPoint));
            formData.append("datetime", datetime);
            formData.append("file", file);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/history`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                alert("Inspection created successfully!");
                navigate("/");
            } else {
                throw new Error("Failed submission to server");
            }
        } catch (error) {
            console.error(error);
            alert("Backend /history error. Simulated form success locally.");
            navigate("/");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium mb-2 w-fit"
                >
                    <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Create Inspection</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 md:p-8">


                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="flex flex-col space-y-6">

                            {/* 1. Name */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
                                    placeholder="Enter inspection name"
                                />
                            </div>

                            {/* 2. Standard */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Standard <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={standard}
                                    onChange={e => setStandard(e.target.value)}
                                    className="w-full h-10 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                                >
                                    <option value="" disabled>Select a standard...</option>
                                    {standardList.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 3. Upload file */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 block mb-2">Raw Data Upload (.json) <span className="text-red-500">*</span></label>
                                <div className="flex items-center justify-center w-full relative">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 hover:border-blue-300 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-6 h-6 mb-2 text-slate-400" />
                                            <p className="mb-1 text-sm text-slate-600">
                                                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-slate-500">Only .json files are supported</p>
                                            {file ? (
                                                <p className="mt-2 text-sm font-medium text-green-600">Selected: {file.name}</p>
                                            ) : (
                                                <p className="mt-2 text-sm font-medium text-red-500">File is required</p>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept=".json"
                                            onChange={handleFileChange}
                                            required={!file}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* 4. Note */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Note <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
                                    placeholder="Enter any notes"
                                />
                            </div>

                            {/* 5. Price */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Price <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100000"
                                    step="0.01"
                                    required
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
                                    placeholder="0.00 - 100,000.00"
                                />
                            </div>

                            {/* 6. Sampling point */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Sampling Point <span className="text-red-500">*</span></label>
                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    {["Front End", "Back End", "Other"].map(pt => (
                                        <label key={pt} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={samplingPoint.includes(pt)}
                                                onChange={() => handleSamplingPointToggle(pt)}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="text-slate-600 text-sm">{pt}</span>
                                        </label>
                                    ))}
                                </div>
                                {samplingPoint.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">Please select at least one sampling point.</p>
                                )}
                            </div>

                            {/* 7. Date/time of sampling */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Date/Time of Sampling <span className="text-red-500">*</span></label>
                                <input
                                    type="datetime-local"
                                    step="1"
                                    required
                                    value={datetime}
                                    onChange={e => setDatetime(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 text-sm"
                                />
                            </div>

                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
