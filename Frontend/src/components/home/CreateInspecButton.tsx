import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function CreateInspecButton() {
    const navigate = useNavigate();
    return (
        <>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                    onClick={() => navigate('/form')}
                    className="group flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-green-600/20 active:scale-95"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    Create Inspection
                </button>
            </div>
        </>
    );
}