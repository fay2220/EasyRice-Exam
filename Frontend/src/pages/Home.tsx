import { useState } from 'react';
import { Search, X, ChevronRight, Filter, Plus, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// 1. Mock Data Source
const generateData = () => {
  return Array.from({ length: 25 }).map((_, i) => {
    const idNum = 2024001 + i;
    const date = new Date(Date.now() - (i * 86400000 + i * 3600000));
    return {
      rawId: `INS-${idNum}`,
      createDate: format(date, 'dd/MM/yyyy - HH:mm'),
      name: ['Standard Rice', 'Premium Jasmine', 'Brown Rice', 'Basmati Blend', 'Sticky Rice'][i % 5],
      standard: ['Defect High', 'Quality Standard A', 'Grade B', 'Export Quality', 'Local Market'][i % 5],
      note: i % 3 === 0 ? 'Urgent review' : 'Normal processing',
    };
  });
};

const MOCK_DATA = generateData();

export default function Home() {
  const navigate = useNavigate();

  // State
  const [searchInput, setSearchInput] = useState('');
  const [filterId, setFilterId] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handlers
  const handleSearch = () => {
    setFilterId(searchInput);
    setCurrentPage(1); // Reset page on new search
  };

  const handleClearFilter = () => {
    setSearchInput('');
    setFilterId('');
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
  const filteredData = MOCK_DATA.filter((item) =>
    item.rawId.toLowerCase().includes(filterId.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAllSelected = currentData.length > 0 && currentData.every(item => selectedRows.has(item.rawId));

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage and track your data inspections.</p>
          </div>
          <button
            onClick={() => navigate('/form')}
            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Go to Form
          </button>
        </div>

        {/* Search Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 md:p-6 transition-shadow hover:shadow-md">
          <div className="flex flex-col gap-4">
            {/* Input Row */}
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
            
            {/* Actions Row */}
            <div className="flex justify-between items-center mt-2">
              {/* Bottom Left: Clear Filter */}
              <button
                onClick={handleClearFilter}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm"
              >
                <X className="w-4 h-4" />
                Clear Filter
              </button>

              {/* Bottom Right: Search */}
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all active:scale-95"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 flex flex-col overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600 w-12">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={() => toggleSelectAll(isAllSelected)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Create Date - Time
                    </div>
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600">Inspection ID</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600">Name</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600">Standard</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600">Note</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item) => {
                    const isSelected = selectedRows.has(item.rawId);
                    return (
                      <tr
                        key={item.rawId}
                        onClick={() => toggleSelectRow(item.rawId)}
                        className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(item.rawId)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
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
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Filter className="w-8 h-8 text-slate-300" />
                        <p>No results found for "{filterId}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Array bottom-left section if rows > 10 */}
          {filteredData.length > itemsPerPage && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-start">
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="group flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 px-4 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <span className="font-semibold px-1 text-slate-500 group-hover:text-blue-500">{currentPage}/{totalPages}</span>
                 ดูข้อมูลต่อไป (Next)
                <ChevronRight className="w-4 h-4 group-disabled:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
