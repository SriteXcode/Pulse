import { useState } from "react";
import axios from "axios";
import { useModal } from "../contexts/ModalContext";

export default function RegisterModal({ isOpen, onClose, switchToLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    institute: "",
    password: ""
  });
  const { showAlert } = useModal();

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/register", form);
      showAlert("Registration Successful. Please Login.", switchToLogin);
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data || "Registration failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          Register
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            className="border p-2 w-full rounded"
            onChange={handleChange}
            autoFocus
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border p-2 w-full rounded"
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Phone Number"
            className="border p-2 w-full rounded"
            onChange={handleChange}
          />

          <input
            name="institute"
            placeholder="Institute"
            className="border p-2 w-full rounded"
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border p-2 w-full rounded"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="bg-green-700 hover:bg-green-800 text-white w-full py-2 rounded transition-colors"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={switchToLogin}
              className="text-green-700 font-bold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
