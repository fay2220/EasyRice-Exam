import { Clock, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Item = {
    rawId: string;
    createDate: string;
    name: string;
    standard: string;
    note: string;
};

type Props = {
    currentData: Item[];
    filterId: string;
};

export default function DataTable({ currentData, filterId }: Props) {
    const navigate = useNavigate();

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 flex flex-col overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-green-600 border-b border-slate-200">
                                <th className="py-4 px-6 text-sm font-semibold text-white">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-white" />
                                        Create Date - Time
                                    </div>
                                </th>
                                <th className="py-4 px-6 text-sm font-semibold text-white">Inspection ID</th>
                                <th className="py-4 px-6 text-sm font-semibold text-white">Name</th>
                                <th className="py-4 px-6 text-sm font-semibold text-white">Standard</th>
                                <th className="py-4 px-6 text-sm font-semibold text-white">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? (
                                currentData.map((item) => (
                                    <tr
                                        key={item.rawId}
                                        onClick={() => navigate(`/result/${item.rawId}`)}
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                                            {item.createDate}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                                                {item.rawId}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-800">
                                            {item.name}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600">
                                            {item.standard}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500 max-w-xs truncate">
                                            {item.note}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 px-6 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Filter className="w-8 h-8 text-slate-300" />
                                            <p>No results found{filterId ? ` for "${filterId}"` : ""}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
