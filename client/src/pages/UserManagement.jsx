import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../contexts/ToastContext";
import { useModal } from "../contexts/ModalContext";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", institute: "" });
  
  const token = localStorage.getItem("token");
  const { addToast } = useToast();
  const { showConfirm } = useModal();

  const loadUsers = async () => {
    try {
      const res = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load users", "error");
    }
  };

  const requestDelete = (id) => {
    showConfirm(
      "Are you sure you want to delete this user? This action cannot be undone.",
      async () => {
        try {
          await axios.delete(`/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          addToast("User deleted successfully", "success");
          loadUsers();
        } catch (err) {
          addToast("Failed to delete user", "error");
        }
      }
    );
  };

  const toggleRole = async (user) => {
    const newRole = user.usertype === "admin" ? "user" : "admin";
    try {
      await axios.put(
        `/api/users/role/${user._id}`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      addToast(`Role updated to ${newRole}`, "success");
      loadUsers();
    } catch (err) {
      addToast("Failed to update role", "error");
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, institute: user.institute });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/users/${editingUser._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      addToast("User updated successfully", "success");
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      addToast("Failed to update user", "error");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>

      <div className="max-w-6xl mx-auto mt-8 p-6 border rounded shadow bg-white">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Institute</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.institute}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${u.usertype === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {u.usertype}
                    </span>
                  </td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => toggleRole(u)}
                      className={`px-3 py-1 rounded text-white text-sm ${u.usertype === 'admin' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {u.usertype === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </button>

                    <button
                      onClick={() => startEdit(u)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => requestDelete(u._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Institute</label>
                <input
                  type="text"
                  value={editForm.institute}
                  onChange={(e) => setEditForm({ ...editForm, institute: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
