import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function EditCropModal({ isOpen, onClose, record, onSuccess }) {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState({
    crop: "",
    variety: "",
    attributes: {
      bulkDensity: { avg: "", sd: "" },
      seedWeight: { avg: "", sd: "" },
      equivalentDiameter: { avg: "", sd: "" },
      swellingIndex: { avg: "", sd: "" },
      potentialDalRecovery: { avg: "", sd: "" },
      dalRecovery: { avg: "" , sd: "" }
    }
  });

  const attributeMap = {
    "Bulk Density": "bulkDensity",
    "100 Seed Weight": "seedWeight",
    "Equivalent Diameter": "equivalentDiameter",
    "Swelling Index": "swellingIndex",
    "Potential Dal Recovery": "potentialDalRecovery",
    "Dal Recovery": "dalRecovery"
  };

  useEffect(() => {
    if (record) {
      // Normalize attributes to lowercase if they are uppercase in DB
      const normalizedAttributes = { ...data.attributes };
      
      Object.keys(attributeMap).forEach(label => {
        const lowerKey = attributeMap[label];
        const upperKey = lowerKey.charAt(0).toUpperCase() + lowerKey.slice(1);
        
        const attrSource = record.attributes?.[lowerKey] || record.attributes?.[upperKey];
        if (attrSource) {
          normalizedAttributes[lowerKey] = {
            avg: attrSource.avg ?? "",
            sd: attrSource.sd ?? ""
          };
        }
      });

      setData({
        crop: record.crop || "",
        variety: record.variety || "",
        attributes: normalizedAttributes
      });
    }
  }, [record]);

  if (!isOpen) return null;

  const handleMetaChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleChange = (attr, field, value) => {
    setData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attr]: {
          ...prev.attributes[attr],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/crop/${record._id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      addToast("Failed to update record", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative my-8">
        <button 
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-6 text-green-800">
          Edit Crop Record
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
              <input 
                name="crop" 
                value={data.crop} 
                onChange={handleMetaChange} 
                className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500 outline-none" 
                placeholder="Crop" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
              <input 
                name="variety" 
                value={data.variety} 
                onChange={handleMetaChange} 
                className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500 outline-none" 
                placeholder="Variety" 
                required
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="bg-green-50">
                  <th className="p-2 border text-left text-sm font-semibold text-green-900">Attribute</th>
                  <th className="p-2 border text-sm font-semibold text-green-900">Avg</th>
                  <th className="p-2 border text-sm font-semibold text-green-900">SD</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(attributeMap).map((label) => {
                  const key = attributeMap[label];
                  return (
                    <tr key={key}>
                      <td className="border p-2 text-sm text-gray-700">{label}</td>
                      <td className="border p-1">
                        <input 
                          type="number"
                          step="any"
                          value={data.attributes[key].avg}
                          onChange={(e) => handleChange(key, 'avg', e.target.value)}
                          className="w-full p-1 text-sm outline-none focus:bg-gray-50" 
                        />
                      </td>
                      <td className="border p-1">
                        <input 
                          type="number"
                          step="any"
                          value={data.attributes[key].sd}
                          onChange={(e) => handleChange(key, 'sd', e.target.value)}
                          className="w-full p-1 text-sm outline-none focus:bg-gray-50" 
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded transition-colors"
            >
              Update Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
