import { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";

export default function LoginModal({ isOpen, onClose, switchToRegister }) {
  const [cred, setCred] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const { showAlert } = useModal();

  if (!isOpen) return null;

  const handleChange = (e) =>
    setCred({ ...cred, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", cred);
      login(res.data.token);
      showAlert("Login Successful");
      onClose();
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data || "Login failed");
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
          Login
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="email"
            placeholder="Email"
            className="border p-2 w-full rounded"
            onChange={handleChange}
            autoFocus
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
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={switchToRegister}
              className="text-green-700 font-bold hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
