import { ChevronRight, ChevronLeft } from "lucide-react";

export default function ChangePageButton({
    filteredData,
    itemsPerPage,
    currentPage,
    totalPages,
    setCurrentPage,
}: any) {
    return (
        <>
            {filteredData.length > itemsPerPage && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">


                    <button
                        onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="group flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 px-4 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4 group-disabled:text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                        Previous
                    </button>

                    <span className="text-sm font-semibold text-slate-500">
                        {currentPage} / {totalPages}
                    </span>


                    <button
                        onClick={() =>
                            setCurrentPage((p: number) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="group flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 px-4 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight className="w-4 h-4 group-disabled:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            )}
        </>
    );
}