import { Search, X, Calendar } from "lucide-react";

type Props = {
    searchInput: string;
    setSearchInput: (value: string) => void;
    fromDateInput: string;
    setFromDateInput: (value: string) => void;
    toDateInput: string;
    setToDateInput: (value: string) => void;
    handleSearch: () => void;
    handleClearFilter: () => void;
};

export default function SearchCard({
    searchInput,
    setSearchInput,
    fromDateInput,
    setFromDateInput,
    toDateInput,
    setToDateInput,
    handleSearch,
    handleClearFilter,
}: Props) {
    return (
        <>
            {/* Search Card Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 md:p-6 transition-shadow hover:shadow-md">
                <div className="flex flex-col gap-4">
                    {/* Input Row Grid */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-600">
                                ID
                            </label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search by Inspection ID..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-600">
                                From Date
                            </label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="date"
                                    value={fromDateInput}
                                    onChange={(e) => setFromDateInput(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400 text-sm"
                                    placeholder="From Date"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-600">
                                To Date
                            </label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="date"
                                    value={toDateInput}
                                    onChange={(e) => setToDateInput(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400 text-sm"
                                    placeholder="To Date"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex justify-between items-center mt-2">
                        {/* Bottom Left: Clear Filter */}
                        <button
                            onClick={handleClearFilter}
                            className="flex items-center gap-2 text-red-500 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm"
                        >
                            <X className="w-4 h-4" />
                            Clear Filter
                        </button>

                        {/* Bottom Right: Search */}
                        <button
                            onClick={handleSearch}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all active:scale-95"
                        >
                            <Search className="w-4 h-4" />
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}