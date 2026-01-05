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

export default function CropRecords() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false); // Loading for initial/search
  const [loadingMore, setLoadingMore] = useState(false); // Loading for pagination
  const [exporting, setExporting] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
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
    bulkDensity: "Bulk Density",
    seedWeight: "Seed Weight",
    equivalentDiameter: "Equivalent Diameter",
    swellingIndex: "Swelling Index",
    potentialDalRecovery: "Potential Dal Recovery",
    dalRecovery: "Dal Recovery",
    noData: "No records found",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this record?",
    exportPdf: "Export PDF",
    exportExcel: "Export Excel",
    exporting: "Exporting...",
    loadMore: "Load More",
    loading: "Loading..."
  });

  useEffect(() => {
    const loadLabels = async () => {
      setLabels({
        title: await t("Crop Records"),
        searchPlaceholder: await t("Search by crop or variety..."),
        crop: await t("Crop"),
        variety: await t("Variety"),
        bulkDensity: await t("Bulk Density"),
        seedWeight: await t("Seed Weight"),
        equivalentDiameter: await t("Equivalent Diameter"),
        swellingIndex: await t("Swelling Index"),
        potentialDalRecovery: await t("Potential Dal Recovery"),
        dalRecovery: await t("Dal Recovery"),
        noData: await t("No records found"),
        actions: await t("Actions"),
        edit: await t("Edit"),
        delete: await t("Delete"),
        confirmDelete: await t("Are you sure you want to delete this record?"),
        exportPdf: await t("Export PDF"),
        exportExcel: await t("Export Excel"),
        exporting: await t("Exporting..."),
        loadMore: await t("Load More"),
        loading: await t("Loading...")
      });
    };
    loadLabels();
  }, [lang]);

  const attributeKeys = [
    { key: "bulkDensity", label: labels.bulkDensity },
    { key: "seedWeight", label: labels.seedWeight },
    { key: "equivalentDiameter", label: labels.equivalentDiameter },
    { key: "swellingIndex", label: labels.swellingIndex },
    { key: "potentialDalRecovery", label: labels.potentialDalRecovery },
    { key: "dalRecovery", label: labels.dalRecovery }
  ];

  const fetchRecords = async (pageNum, searchTerm, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await axios.get("/api/crop", {
        params: {
          page: pageNum,
          limit: 25,
          search: searchTerm
        }
      });
      
      const newRecords = res.data.records;
      const totalPages = res.data.totalPages;

      if (reset) {
        setRecords(newRecords);
      } else {
        setRecords((prev) => [...prev, ...newRecords]);
      }
      
      setHasMore(pageNum < totalPages);
    } catch (err) {
      console.error("Error fetching records", err);
      addToast("Failed to fetch records", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRecords(1, "", true);
  }, []);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchRecords(1, search, true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecords(nextPage, search, false);
  };

  const handleDelete = (id) => {
    showConfirm(labels.confirmDelete, async () => {
      try {
        await axios.delete(`/api/crop/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addToast("Record deleted successfully", "success");
        // Refresh current view logic: simple reload page 1
        setPage(1);
        fetchRecords(1, search, true);
      } catch (err) {
        console.error(err);
        addToast("Failed to delete record", "error");
      }
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
  };

  const handleUpdateSuccess = () => {
    setEditingRecord(null);
    addToast("Record updated successfully", "success");
    setPage(1);
    fetchRecords(1, search, true);
  };

  const getAttributeData = (rec, key) => {
    const lowerKey = key;
    const upperKey = lowerKey.charAt(0).toUpperCase() + lowerKey.slice(1);
    return rec.attributes?.[lowerKey] || rec.attributes?.[upperKey] || {};
  };

  const fetchAllForExport = async () => {
    const res = await axios.get("/api/crop", {
      params: { search: search } // No limit implies all
    });
    return res.data;
  };

  const exportPDF = async () => {
    console.log("Starting PDF export...");
    setExporting(true);
    try {
      const allData = await fetchAllForExport();
      
      console.log("Creating jsPDF instance...");
      const doc = new jsPDF("landscape");
      
      const tableColumn = [
        labels.crop, 
        labels.variety, 
        ...attributeKeys.map(a => a.label)
      ];

      const tableRows = allData.map(rec => {
        const rowData = [
          rec.crop,
          rec.variety
        ];

        attributeKeys.forEach(attr => {
          const data = getAttributeData(rec, attr.key);
          const val = (data.avg !== undefined || data.sd !== undefined)
            ? `Avg: ${data.avg ?? "- "}\nSD: ${data.sd ?? "-"}`
            : "-";
          rowData.push(val);
        });

        return rowData;
      });

      console.log("Generating AutoTable...");
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [21, 128, 61] } // green-700
      });

      console.log("Saving PDF...");
      doc.text(labels.title, 14, 15);
      doc.save("crop_records.pdf");
      console.log("PDF saved successfully.");
    } catch (err) {
      console.error("PDF Export Error:", err);
      addToast("Failed to export PDF: " + err.message, "error");
    } finally {
      setExporting(false);
    }
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const allData = await fetchAllForExport();

      const dataToExport = allData.map(rec => {
        const row = {
          [labels.crop]: rec.crop,
          [labels.variety]: rec.variety,
        };

        attributeKeys.forEach(attr => {
          const data = getAttributeData(rec, attr.key);
          row[`${attr.label} (Avg)`] = data.avg ?? "-";
          row[`${attr.label} (SD)`] = data.sd ?? "-";
        });

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Records");
      XLSX.writeFile(wb, "crop_records.xlsx");
    } catch (err) {
      console.error(err);
      addToast("Failed to export Excel", "error");
    } finally {
      setExporting(false);
    }
  };

  const renderValue = (attr, rec) => {
    const data = getAttributeData(rec, attr.key);
    
    if (!data || (data.avg === undefined && data.sd === undefined)) return "-";
    
    return (
      <div className="text-xs">
        <div><span className="font-semibold">Avg:</span> {data.avg ?? "-"}</div>
        <div><span className="font-semibold text-gray-400">SD:</span> {data.sd ?? "-"}</div>
      </div>
    );
  };

  return (
    <div className="max-w-[95%] mx-auto mt-10 p-6 bg-white shadow rounded-lg mb-10 min-h-screen relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-green-800">{labels.title}</h1>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder={labels.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={exportPDF}
            disabled={exporting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2"
          >
            {labels.exportPdf}
          </button>
          <button
            onClick={exportExcel}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2"
          >
            {labels.exportExcel}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">{labels.loading}</div>
      ) : (!records || records.length === 0) ? (
        <div className="text-center py-10 text-gray-500">{labels.noData}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-green-700 text-white text-xs">
                  <th className="p-2 text-left">{labels.crop}</th>
                  <th className="p-2 text-left">{labels.variety}</th>
                  {attributeKeys.map(attr => (
                    <th key={attr.key} className="p-2 text-left">{attr.label}</th>
                  ))}
                  {isAdmin && <th className="p-2 text-center">{labels.actions}</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr 
                    key={rec._id} 
                    className="border-b hover:bg-green-50 transition-colors cursor-pointer"
                    onClick={() => setViewingRecord(rec)}
                  >
                    <td 
                      className="p-2 font-medium text-gray-800 text-sm"
                      title={`${rec.crop} - ${rec.variety}`}
                    >
                      {rec.crop}
                    </td>
                    <td 
                      className="p-2 text-gray-700 text-sm"
                      title={`${rec.crop} - ${rec.variety}`}
                    >
                      {rec.variety}
                    </td>
                    {attributeKeys.map(attr => (
                      <td 
                        key={attr.key} 
                        className="p-2 text-gray-600 border-l border-gray-100"
                        title={`${rec.crop} - ${rec.variety} - ${attr.label}`}
                      >
                        {renderValue(attr, rec)}
                      </td>
                    ))}
                    {isAdmin && (
                      <td className="p-2 text-center border-l border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1 items-center">
                          <button
                            onClick={() => handleEdit(rec)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[10px] transition-colors"
                          >
                            {labels.edit}
                          </button>
                          <button
                            onClick={() => handleDelete(rec._id)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-[10px] transition-colors"
                          >
                            {labels.delete}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded shadow transition-colors"
              >
                {loadingMore ? labels.loading : labels.loadMore}
              </button>
            </div>
          )}
        </>
      )}

      {editingRecord && (
        <EditCropModal
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          record={editingRecord}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {viewingRecord && (
        <CropDetailModal
          isOpen={!!viewingRecord}
          onClose={() => setViewingRecord(null)}
          record={viewingRecord}
          attributeKeys={attributeKeys}
          labels={labels}
        />
      )}

      {exporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center animate-fade-in">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 font-semibold">{labels.exporting}</p>
          </div>
        </div>
      )}
    </div>
  );
}