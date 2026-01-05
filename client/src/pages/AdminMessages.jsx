import { useState, useEffect } from "react";
import axios from "axios";
import { useModal } from "../contexts/ModalContext";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useModal();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("/api/contact", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error(err);
        showAlert("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div>
      <div className="max-w-6xl mx-auto mt-8 p-6 border rounded shadow bg-white min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No messages found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Subject</th>
                  <th className="p-3 border">Message</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 border text-sm text-gray-600 w-32">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 border font-medium">{msg.name}</td>
                    <td className="p-3 border text-blue-600">
                      <a href={`mailto:${msg.email}`}>{msg.email}</a>
                    </td>
                    <td className="p-3 border font-semibold">{msg.subject}</td>
                    <td className="p-3 border text-gray-700 whitespace-pre-wrap max-w-md">
                      {msg.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
