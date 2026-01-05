import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import useTranslator from "../hooks/useTranslator";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useModal } from "../contexts/ModalContext";
import EditCropModal from "../components/EditCropModal";
import CropDetailModal from "../components/CropDetailModal";
import FilterModal from "../components/FilterModal";

export default function Visualisation() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedCrop, setSelectedCrop] = useState("all");
  const [selectedVariety, setSelectedVariety] = useState("all");

  const [cropList, setCropList] = useState([]);
  const [varietyList, setVarietyList] = useState([]);

  const [cropStats, setCropStats] = useState(null); // backend analytics

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState([]); // Array of rules
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  const { t } = useTranslator();
  const { lang } = useContext(LanguageContext);
  const { isAdmin, token } = useAuth();
  const { addToast } = useToast();
  const { showConfirm } = useModal();

  const [labels, setLabels] = useState({
    title: "Crop Records",
    searchPlaceholder: "Search by crop or variety...",
    crop: "Crop",
    variety: "Variety",
    analytics: "Analytics Summary",
    noData: "No records found",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
  });

  useEffect(() => {
    const load = async () => {
      setLabels({
        title: await t("Crop Records"),
        searchPlaceholder: await t("Search by crop or variety..."),
        crop: await t("Crop"),
        variety: await t("Variety"),
        analytics: await t("Analytics Summary"),
        noData: await t("No records found"),
        actions: await t("Actions"),
        edit: await t("Edit"),
        delete: await t("Delete"),
      });
    };
    load();
  }, [lang]);

  const attributeKeys = [
    { key: "bulkDensity", label: "Bulk Density" },
    { key: "seedWeight", label: "Seed Weight" },
    { key: "equivalentDiameter", label: "Equivalent Diameter" },
    { key: "swellingIndex", label: "Swelling Index" },
    { key: "potentialDalRecovery", label: "Potential Dal Recovery" },
    { key: "dalRecovery", label: "Dal Recovery" },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [namesRes, statsRes] = await Promise.all([
          axios.get("/api/crop/names"),
          axios.get("/api/crop/stats")
        ]);
        setCropList(namesRes.data.crops || []);
        setCropStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchRecords(1, search, true);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search, advancedFilters, sortConfig]);

  const fetchRecords = async (pageNum, searchTerm, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await axios.get("/api/crop", {
        params: {
          page: pageNum,
          limit: 25,
          search: searchTerm,
          rules: advancedFilters.length > 0 ? JSON.stringify(advancedFilters) : undefined,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction
        },
      });

      const data = res.data.records;
      const totalPages = res.data.totalPages;
      setTotalRecords(res.data.total || 0);

      if (reset) {
        setRecords(data);
      } else {
        setRecords(prev => [...prev, ...data]);
      }

      setHasMore(pageNum < totalPages);
    } catch {
      addToast("Failed to fetch records", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 opacity-30" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    );
    return sortConfig.direction === "asc" ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };


  const getAttr = (rec, key) =>
    rec.attributes?.[key] ??
    rec.attributes?.[key.charAt(0).toUpperCase() + key.slice(1)] ??
    {};

  const renderValue = (attr, rec) => {
    const d = getAttr(rec, attr.key);
    if (!d || (!d.avg && !d.sd)) return "-";
    return (
      <div className="text-xs">
        <div><b>Avg:</b> {d.avg ?? "-"}</div>
        <div className="text-gray-500"><b>SD:</b> {d.sd ?? "-"}</div>
      </div>
    );
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const res = await axios.get("/api/crop", {
        params: {
          search,
          rules: advancedFilters.length > 0 ? JSON.stringify(advancedFilters) : undefined,
        }
      });
      const allData = Array.isArray(res.data) ? res.data : (res.data.records || []);

      const doc = new jsPDF("landscape");
      autoTable(doc, {
        head: [["Crop", "Variety", ...attributeKeys.map(a => a.label)]],
        body: allData.map(rec => [
          rec.crop,
          rec.variety,
          ...attributeKeys.map(a => {
            const d = getAttr(rec, a.key);
            return `Avg: ${d.avg ?? "-"}\nSD: ${d.sd ?? "-"}`;
          }),
        ])
      });
      doc.text(labels.title, 14, 15);
      doc.save("crop_records.pdf");
    } finally {
      setExporting(false);
    }
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const res = await axios.get("/api/crop", {
        params: {
          search,
          rules: advancedFilters.length > 0 ? JSON.stringify(advancedFilters) : undefined,
        }
      });
      const allData = Array.isArray(res.data) ? res.data : (res.data.records || []);

      const rows = allData.map(rec => {
        const row = { Crop: rec.crop, Variety: rec.variety };
        attributeKeys.forEach(a => {
          const d = getAttr(rec, a.key);
          row[`${a.label} Avg`] = d.avg ?? "-";
          row[`${a.label} SD`] = d.sd ?? "-";
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Records");
      XLSX.writeFile(wb, "crop_records.xlsx");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-[95%] mx-auto mt-10 min-h-screen">

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <input
            type="text"
            placeholder={labels.searchPlaceholder}
            onChange={e => setSearch(e.target.value)}
            className="w-full border p-2.5 pl-10 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Advanced Filters
          {advancedFilters.length > 0 && (
            <span className="bg-white text-green-700 text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {advancedFilters.length}
            </span>
          )}
        </button>

        {advancedFilters.length > 0 && (
          <button
            onClick={() => setAdvancedFilters([])}
            className="text-red-600 hover:text-red-700 text-sm font-bold flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Reset All Filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {advancedFilters.map((rule, idx) => (
          <div key={idx} className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase ml-1">Rule {idx + 1}:</span>
            <span className="bg-white text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-green-100">
              {rule.crop === 'all' ? 'All Crops' : rule.crop}
            </span>
            <span className="bg-white text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-100">
              {rule.variety === 'all' ? 'All Varieties' : rule.variety}
            </span>
            {Object.keys(rule.attributes).some(k => rule.attributes[k].avg.min !== "" || rule.attributes[k].avg.max !== "") && (
              <span className="bg-orange-500 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase">Attrs</span>
            )}
            <button
              onClick={() => setAdvancedFilters(prev => prev.filter((_, i) => i !== idx))}
              className="text-gray-400 hover:text-red-500 transition-colors px-1"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* DATA TABLE */}

<div className="mb-6 flex flex-wrap justify-between items-center gap-4">

  {/* STAT TEXT */}
  <div className="text-sm text-gray-700 font-medium bg-gray-100 px-4 py-2 rounded-full border border-red-600 shadow-sm">
    Showing <span className="text-green-700 font-bold">{records.length}</span> of{" "}
    <span className="text-green-700 font-bold">{totalRecords}</span> matching records
  </div>

  {/* EXPORT BUTTONS */}
  <div className="flex gap-3">

    {/* PDF BUTTON */}
    <button
      disabled={exporting}
      onClick={exportPDF}
      className="flex items-center gap-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
        viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd"
          d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 
          2 0 002-2V7.414A2 2 0 0015.414 
          6L12 2.586A2 2 0 0010.586 2H6zm5 
          6a1 1 0 10-2 0v3.586l-1.293-1.293a1 
          1 0 10-1.414 1.414l3 3a1 1 0 
          001.414 0l3-3a1 1 0 
          00-1.414-1.414L11 11.586V8z"
          clipRule="evenodd" />
      </svg>
      Export PDF
    </button>

    {/* EXCEL BUTTON */}
    <button
      disabled={exporting}
      onClick={exportExcel}
      className="flex items-center gap-2 border border-green-700 text-green-700 hover:bg-green-700 hover:text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
        viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd"
          d="M6 2a2 2 0 00-2 2v12a2 2 0 
          002 2h8a2 2 0 002-2V7.414A2 2 
          0 0015.414 6L12 2.586A2 2 
          0 0010.586 2H6zm2 10a1 1 0 
          011-1h2a1 1 0 110 2H9a1 1 0 
          01-1-1zm1-7a1 1 0 00-1 
          1v2a1 1 0 001 1h2a1 1 0 
          001-1V6a1 1 0 00-1-1H9z"
          clipRule="evenodd" />
      </svg>
      Export Excel
    </button>

  </div>
</div>





      <div className="overflow-x-auto bg-white shadow-xl rounded-xl border border-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <p className="text-gray-500 font-medium">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center p-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-semibold text-gray-400">{labels.noData}</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-700 text-white text-xs uppercase tracking-wider">
                  <th
                    className="p-4 text-left font-bold cursor-pointer hover:bg-green-800 transition-colors"
                    onClick={() => handleSort("crop")}
                  >
                    <div className="flex items-center">
                      Crop {getSortIcon("crop")}
                    </div>
                  </th>
                  <th
                    className="p-4 text-left font-bold cursor-pointer hover:bg-green-800 transition-colors"
                    onClick={() => handleSort("variety")}
                  >
                    <div className="flex items-center">
                      Variety {getSortIcon("variety")}
                    </div>
                  </th>
                  {attributeKeys.map(attr => (
                    <th
                      key={attr.key}
                      className="p-4 text-center font-bold cursor-pointer hover:bg-green-800 transition-colors"
                      onClick={() => handleSort(attr.key)}
                    >
                      <div className="flex items-center justify-center">
                        {attr.label} {getSortIcon(attr.key)}
                      </div>
                    </th>
                  ))}
                  {isAdmin && <th className="p-4 text-right font-bold">{labels.actions}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map(rec => (
                  <tr
                    key={rec._id}
                    onClick={() => setViewingRecord(rec)}
                    className="hover:bg-green-50/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-semibold text-gray-800">{rec.crop}</td>
                    <td className="p-4 text-gray-600 italic">{rec.variety}</td>
                    {attributeKeys.map(attr => (
                      <td key={attr.key} className="p-4 text-center">
                        {renderValue(attr, rec)}
                      </td>
                    ))}

                    {isAdmin && (
                      <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingRecord(rec)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all"
                            title={labels.edit}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              showConfirm("Are you sure you want to delete this record?", async () => {
                                try {
                                  await axios.delete(`/api/crop/${rec._id}`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                  });
                                  fetchRecords(1, search, true);
                                  addToast("Record deleted successfully", "success");
                                } catch {
                                  addToast("Failed to delete record", "error");
                                }
                              })
                            }
                            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-all"
                            title={labels.delete}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {hasMore && (
              <div className="p-6 bg-gray-50 border-t text-center">
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchRecords(next, search);
                  }}
                  className="bg-white border border-green-700 text-green-700 hover:bg-green-700 hover:text-white px-8 py-2 rounded-full font-bold transition-all shadow-sm hover:shadow-md"
                >
                  {loadingMore ? "Loading more..." : "Load More Records"}
                </button>
              </div>
            )}
          </>
        )}
      </div>


      {editingRecord && (
        <EditCropModal
          isOpen
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSuccess={() => {
            setEditingRecord(null);
            fetchRecords(1, search, true);
          }}
        />
      )}

      {viewingRecord && (
        <CropDetailModal
          isOpen
          record={viewingRecord}
          onClose={() => setViewingRecord(null)}
          attributeKeys={attributeKeys}
          labels={labels}
        />
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          setIsFilterModalOpen(false);
          setPage(1);
        }}
        attributeKeys={attributeKeys}
        cropStats={cropStats}
        cropList={cropList}
        currentFilters={advancedFilters}
      />

      {exporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow">Exporting...</div>
        </div>
      )}
    </div>
  );
}



