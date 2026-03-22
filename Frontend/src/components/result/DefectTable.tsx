import type { DefectRow } from './types';

interface Props {
    defects: DefectRow[];
}

export default function DefectTable({ defects }: Props) {
    return (
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
    );
}
