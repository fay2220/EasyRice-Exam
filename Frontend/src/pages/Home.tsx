import { useState } from 'react';
import { format } from 'date-fns';

import SearchCard from "../components/SearchCard";
import DataTable from "../components/DataTable";
import CreateInspecButton from "../components/CreateInspecButton";
import Navbar from "../components/Nav";
import ChangePageButton from "../components/ChangePageButton";

// 1. Mock Data Source
const generateData = () => {
    return Array.from({ length: 25 }).map((_, i) => {
        const idNum = 2024001 + i;
        const date = new Date(Date.now() - (i * 86400000 + i * 3600000));
        return {
            rawId: `INS-${idNum}`,
            createDate: format(date, 'dd/MM/yyyy - HH:mm'),
            rawDate: date.getTime(),
            name: ['Standard Rice', 'Premium Jasmine', 'Brown Rice', 'Basmati Blend', 'Sticky Rice'][i % 5],
            standard: ['Defect High', 'Quality Standard A', 'Grade B', 'Export Quality', 'Local Market'][i % 5],
            note: i % 3 === 0 ? 'Urgent review' : 'Normal processing',
        };
    });
};

const MOCK_DATA = generateData();

export default function Home() {

    // State
    const [searchInput, setSearchInput] = useState('');
    const [fromDateInput, setFromDateInput] = useState('');
    const [toDateInput, setToDateInput] = useState('');

    const [filterId, setFilterId] = useState('');
    const [filterFromDate, setFilterFromDate] = useState('');
    const [filterToDate, setFilterToDate] = useState('');

    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Handlers
    const handleSearch = () => {
        setFilterId(searchInput);
        setFilterFromDate(fromDateInput);
        setFilterToDate(toDateInput);
        setCurrentPage(1); // Reset page on new search
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

    const toggleSelectAll = (isAllSelected: boolean) => {
        if (isAllSelected) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(currentData.map(item => item.rawId)));
        }
    };

    const toggleSelectRow = (id: string) => {
        const newSet = new Set(selectedRows);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedRows(newSet);
    };

    // Derived Data
    const filteredData = MOCK_DATA.filter((item) => {
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

    const isAllSelected = currentData.length > 0 && currentData.every(item => selectedRows.has(item.rawId));

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-8 text-slate-800">
                <div className="max-w-7xl mx-auto space-y-6">

                    <CreateInspecButton />

                    {/* Search Card */}
                    <div className="p-6">
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
                    </div>

                    {/* Table */}
                    <DataTable
                        currentData={currentData}
                        selectedRows={selectedRows}
                        isAllSelected={isAllSelected}
                        toggleSelectAll={toggleSelectAll}
                        toggleSelectRow={toggleSelectRow}
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
