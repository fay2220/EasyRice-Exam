import { useState, useCallback, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

import SearchCard from "../components/home/SearchCard";
import DataTable from "../components/home/DataTable";
import CreateInspecButton from "../components/home/CreateInspecButton";
import Navbar from "../components/Nav";
import ChangePageButton from "../components/home/ChangePageButton";

export default function Home() {

    // State
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/history`);
            if (res.ok) {
                const data = await res.json();
                setHistoryData(data);
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const [searchInput, setSearchInput] = useState('');
    const [fromDateInput, setFromDateInput] = useState('');
    const [toDateInput, setToDateInput] = useState('');

    const [filterId, setFilterId] = useState('');
    const [filterFromDate, setFilterFromDate] = useState('');
    const [filterToDate, setFilterToDate] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Handlers
    const handleSearch = () => {
        setFilterId(searchInput);
        setFilterFromDate(fromDateInput);
        setFilterToDate(toDateInput);
        setCurrentPage(1);
        setSelectedIds([]);
    };

    const handleClearFilter = () => {
        setSearchInput('');
        setFromDateInput('');
        setToDateInput('');
        setFilterId('');
        setFilterFromDate('');
        setFilterToDate('');
        setCurrentPage(1);
        setSelectedIds([]);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(currentData.map(item => item.rawId));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        const confirmMsg = `Are you sure you want to delete ${selectedIds.length} item${selectedIds.length > 1 ? 's' : ''}?`;
        if (!window.confirm(confirmMsg)) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/history/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })
            });
            if (res.ok) {
                setSelectedIds([]);
                await fetchHistory();
            } else {
                alert("Failed to delete selected items");
            }
        } catch (err) {
            console.error("Bulk delete error:", err);
            alert("An error occurred during deletion");
        } finally {
            setIsDeleting(false);
        }
    };

    // Derived Data
    const filteredData = historyData.filter((item) => {
        const matchId = item.rawId.toLowerCase().includes(filterId.toLowerCase());
        let matchDate = true;
        if (filterFromDate) {
            matchDate = matchDate && item.rawDate >= new Date(filterFromDate).getTime();
        }
        if (filterToDate) {
            // Include end of the day (23:59:59.999)
            const endOfDay = new Date(filterToDate).getTime() + 86399999;
            matchDate = matchDate && item.rawDate <= endOfDay;
        }
        return matchId && matchDate;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-8 text-slate-800">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Header row with button aligned right */}
                    <div className="flex justify-end">
                        <CreateInspecButton />
                    </div>

                    {/* Search Card */}
                    <SearchCard
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        fromDateInput={fromDateInput}
                        setFromDateInput={setFromDateInput}
                        toDateInput={toDateInput}
                        setToDateInput={setToDateInput}
                        handleSearch={handleSearch}
                        handleClearFilter={handleClearFilter}
                    />

                    {/* Table Actions & Table */}
                    <div className="space-y-4">
                        {/* Bulk Delete Button */}
                        <div className="min-h-[40px] flex items-center">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {isDeleting ? 'Deleting...' : `Delete (${selectedIds.length})`}
                                </button>
                            )}
                        </div>

                        <DataTable
                            currentData={currentData}
                            filterId={filterId}
                            selectedIds={selectedIds}
                            onSelectAll={handleSelectAll}
                            onSelectRow={handleSelectRow}
                            isLoading={isLoading}
                        />
                    </div>

                    <ChangePageButton
                        filteredData={filteredData}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />

                </div>

            </div>
        </>

    );
}
