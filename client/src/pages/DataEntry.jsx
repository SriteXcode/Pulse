import { useState } from "react";
import axios from "axios";
import { useModal } from "../contexts/ModalContext";

export default function DataEntry() {
    const { showAlert } = useModal();
    const [data, setData] = useState({
    crop: "",
    variety: "",
    attributes: {
      bulkDensity: { avg: "", sd: "" },
      seedWeight: { avg: "", sd: "" },
      equivalentDiameter: { avg: "", sd: "" },
      swellingIndex: { avg: "", sd: "" },
      potentialDalRecovery: { avg: "", sd: "" },
      dalRecovery: { avg: "", sd: "" }
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

  const submit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post("/api/crop", data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showAlert(res.data);
      // Optional: clear form on success
      setData({
        crop: "",
        variety: "",
        attributes: {
          bulkDensity: { avg: "", sd: "" },
          seedWeight: { avg: "", sd: "" },
          equivalentDiameter: { avg: "", sd: "" },
          swellingIndex: { avg: "", sd: "" },
          potentialDalRecovery: { avg: "", sd: "" },
          dalRecovery: { avg: "", sd: "" }
        }
      });
    } catch (err) {
      console.error(err);
      showAlert("Failed to submit data");
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto mt-8 p-6 border rounded shadow">
        <h2 className="text-2xl font-bold text-center mb-6">Data Entry Form</h2>

        <form className="space-y-4" onSubmit={submit}>
          <div className="flex gap-4">
            <input 
              name="crop" 
              value={data.crop} 
              onChange={handleMetaChange} 
              className="border p-2 flex-1" 
              placeholder="Crop" 
              required
            />
            <input 
              name="variety" 
              value={data.variety} 
              onChange={handleMetaChange} 
              className="border p-2 flex-1" 
              placeholder="Variety" 
              required
            />
          </div>

          <table className="w-full border mt-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Attribute</th>
                <th>Avg</th>
                <th>SD</th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(attributeMap).map((label) => {
                const key = attributeMap[label];
                return (
                  <tr key={key}>
                    <td className="border p-2">{label}</td>
                    <td className="border">
                      <input 
                        type="number"
                        step="any"
                        value={data.attributes[key].avg}
                        onChange={(e) => handleChange(key, 'avg', e.target.value)}
                        className="w-full p-1" 
                      />
                    </td>
                    <td className="border">
                      <input 
                        type="number"
                        step="any"
                        value={data.attributes[key].sd}
                        onChange={(e) => handleChange(key, 'sd', e.target.value)}
                        className="w-full p-1" 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button className="bg-green-600 text-white px-6 py-2 rounded mt-4">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}