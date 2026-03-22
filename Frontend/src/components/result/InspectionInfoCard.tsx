import type { CalculationResult, Grain } from './types';

interface Props {
    inspection: any;
    calculation: CalculationResult | null;
    grains: Grain[];
}

export default function InspectionInfoCard({ inspection, calculation, grains }: Props) {
    return (
        <>
            {/* Card 1 — dates, ID, standard, total sample */}
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

            {/* Card 2 — note, price, sampling */}
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
        </>
    );
}
