import { useState, useEffect } from 'react';

import SearchCard from "../components/SearchCard";
import DataTable from "../components/DataTable";
import CreateInspecButton from "../components/CreateInspecButton";
import Navbar from "../components/Nav";
import ChangePageButton from "../components/ChangePageButton";

export default function Home() {

    // State
    const [historyData, setHistoryData] = useState<any[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/history`);
                if (res.ok) {
                    const data = await res.json();
                    setHistoryData(data);
                }
            } catch (err) {
                console.error("Failed to fetch history:", err);
            }
        };
        fetchHistory();
    }, []);

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
    };

    const handleClearFilter = () => {
        setSearchInput('');
        setFromDateInput('');
        setToDateInput('');
        setFilterId('');
        setFilterFromDate('');
        setFilterToDate('');
        setCurrentPage(1);
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

                    {/* Table */}
                    <DataTable
                        currentData={currentData}
                        filterId={filterId}
                    />

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
