import { useState, useEffect } from "react";
import axios from "axios";
import { useModal } from "../contexts/ModalContext";

export default function AdminDashboard() {
  const [records, setRecords] = useState([]);
  const { showAlert } = useModal();

  const token = localStorage.getItem("token");

  const fetchRecords = async () => {
    const res = await axios.get("/api/crop", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRecords(res.data);
  };
  const exportCache = async () => {
  await axios.get("/api/translation/export", {
    headers: { Authorization: `Bearer ${token}` }
  });
  showAlert("Exported to offline/translations.json");
};

  const deleteRecord = async (id) => {
    await axios.delete(`/api/crop/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchRecords();
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div>
      <div className="max-w-5xl mx-auto mt-8 p-6 border rounded shadow">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
  onClick={exportCache}
  className="bg-blue-700 text-white px-4 py-2 rounded"
>
  Export Offline Cache
</button>

        <table className="w-full mt-4 border">
          <thead>
            <tr className="bg-gray-200">
              <th>Crop</th>
              <th>Variety</th>
              <th>Added By</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {records.map((rec) => (
              <tr key={rec._id}>
                <td>{rec.crop}</td>
                <td>{rec.variety}</td>
                <td>{rec.user?.email}</td>

                <td>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => deleteRecord(rec._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
 
        </table>
      </div>
    </div>
  );
}
