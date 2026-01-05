import React, { useState, useEffect } from "react";
import axios from "axios";

export default function FilterModal({ 
  isOpen, 
  onClose, 
  onApply, 
  attributeKeys, 
  cropList, 
  currentFilters 
}) {
  // Current working rule (the form)
  const [form, setForm] = useState({
    crop: "all",
    variety: "all",
    attributes: {}
  });

  // The list of staged rules
  const [stagedRules, setStagedRules] = useState([]);
  const [varietyList, setVarietyList] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Initialize from parent if needed
  useEffect(() => {
    if (isOpen) {
      // We don't necessarily want to edit old complex filters in this simple UI, 
      // but we could map them back if needed. For now, we start fresh or keep staged.
    }
  }, [isOpen]);

  // Handle Variety List and Autofill when Crop/Variety changes
  useEffect(() => {
    if (!isOpen) return;

    const updateContext = async () => {
      setLoadingStats(true);
      try {
        // 1. Update Variety Dropdown
        const varRes = await axios.get("/api/crop/names", {
          params: { crop: form.crop !== "all" ? form.crop : undefined }
        });
        setVarietyList(varRes.data.varieties || []);

        // 2. Fetch Stats for Autofill
        const statsRes = await axios.get("/api/crop/stats", {
          params: { 
            crop: form.crop !== "all" ? form.crop : undefined,
            variety: form.variety !== "all" ? form.variety : undefined
          }
        });

        const stats = statsRes.data;
        const newAttrs = {};
        attributeKeys.forEach(attr => {
          if (stats[attr.key]) {
            newAttrs[attr.key] = {
              avg: { 
                min: stats[attr.key].avg?.min ?? "", 
                max: stats[attr.key].avg?.max ?? "" 
              },
              sd: { 
                min: "", 
                max: stats[attr.key].sd?.max ?? "" 
              }
            };
          }
        });

        setForm(prev => ({ ...prev, attributes: newAttrs }));
      } catch (err) {
        console.error("Autofill error", err);
      } finally {
        setLoadingStats(false);
      }
    };

    updateContext();
  }, [form.crop, form.variety, isOpen]);

  if (!isOpen) return null;

  const handleAttrChange = (attrKey, type, field, value) => {
    setForm(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attrKey]: {
          ...prev.attributes[attrKey],
          [type]: { ...prev.attributes[attrKey][type], [field]: value }
        }
      }
    }));
  };

  const addRuleToList = () => {
    setStagedRules(prev => [...prev, { ...form }]);
    // Reset form for new filter
    setForm({
      crop: "all",
      variety: "all",
      attributes: {}
    });
  };

  const removeRule = (idx) => {
    setStagedRules(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinalApply = () => {
    // We now send the rules exactly as they were built
    onApply(stagedRules);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-black text-gray-900">Filter Rule Builder</h3>
            <p className="text-sm text-gray-500 font-medium">Build multiple filter sets to discover specific data patterns</p>
          </div>
          <button onClick={onClose} className="text-3xl text-gray-300 hover:text-gray-600 transition-colors">&times;</button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Builder Side */}
          <div className="flex-1 p-8 overflow-y-auto border-r border-gray-100 bg-white">
            <h4 className="text-xs font-black text-green-700 uppercase tracking-widest mb-6">1. Configure New Rule</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Crop Selection</label>
                <select 
                  className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-xl font-bold outline-none transition-all"
                  value={form.crop}
                  onChange={e => setForm(prev => ({ ...prev, crop: e.target.value, variety: "all" }))}
                >
                  <option value="all">All Crops</option>
                  {cropList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase">Variety Selection</label>
                <select 
                  className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-xl font-bold outline-none transition-all disabled:opacity-50"
                  value={form.variety}
                  onChange={e => setForm(prev => ({ ...prev, variety: e.target.value }))}
                  disabled={form.crop === "all"}
                >
                  <option value="all">All Varieties</option>
                  {varietyList.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-[10px] font-black text-gray-400 uppercase block">Physical Attribute Thresholds (Autofilled)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {attributeKeys.map(attr => (
                  <div key={attr.key} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-green-200 transition-all">
                    <span className="text-xs font-black text-gray-700 block mb-3 truncate">{attr.label}</span>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Avg Range</p>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            placeholder="Min" 
                            className="w-full bg-white border-none p-2 rounded-lg text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-green-500"
                            value={form.attributes[attr.key]?.avg.min || ""}
                            onChange={e => handleAttrChange(attr.key, "avg", "min", e.target.value)}
                          />
                          <input 
                            type="number" 
                            placeholder="Max" 
                            className="w-full bg-white border-none p-2 rounded-lg text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-green-500"
                            value={form.attributes[attr.key]?.avg.max || ""}
                            onChange={e => handleAttrChange(attr.key, "avg", "max", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={addRuleToList}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-green-200 active:scale-[0.98]"
            >
              + Add This Filter Set to List
            </button>
          </div>

          {/* List Side */}
          <div className="lg:w-80 bg-gray-50 p-8 overflow-y-auto">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Active Rules ({stagedRules.length})</h4>
            <div className="space-y-4">
              {stagedRules.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                  <p className="text-xs text-gray-300 font-bold px-4 leading-relaxed">No rules added yet. Configure a rule on the left and click "Add".</p>
                </div>
              ) : (
                stagedRules.map((rule, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative animate-slide-up">
                    <button 
                      onClick={() => removeRule(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      &times;
                    </button>
                    <p className="text-xs font-black text-green-700 mb-1">{rule.crop === 'all' ? 'All Crops' : rule.crop}</p>
                    <p className="text-[10px] text-gray-400 font-bold truncate mb-2">{rule.variety === 'all' ? 'All Varieties' : rule.variety}</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(rule.attributes).map(k => {
                        const a = rule.attributes[k];
                        if (a.avg.min !== "" || a.avg.max !== "") {
                          return <span key={k} className="bg-gray-100 text-[8px] px-1.5 py-0.5 rounded font-black text-gray-500 uppercase">{k}</span>
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex items-center justify-between">
          <button 
            onClick={() => { setStagedRules([]); setForm({ crop: 'all', variety: 'all', attributes: {} }); }}
            className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline px-4"
          >
            Clear All Rules
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalApply}
              disabled={stagedRules.length === 0}
              className={`px-12 py-3 rounded-2xl font-black text-sm transition-all shadow-xl ${stagedRules.length > 0 ? 'bg-green-700 text-white hover:bg-green-800 hover:scale-105 shadow-green-100' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
            >
              Apply All {stagedRules.length} Filter Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}