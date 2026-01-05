import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useModal } from "../contexts/ModalContext";
import useTranslator from "../hooks/useTranslator";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { showAlert } = useModal();
  const { t } = useTranslator();
  const { lang } = useContext(LanguageContext);
  const { user, token } = useAuth();

  const [labels, setLabels] = useState({
    contactUs: "",
    name: "",
    email: "",
    subject: "",
    message: "",
    submit: "",
    sending: ""
  });
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    useEffect(() => {
      const fetchProfile = async () => {
        if (token) {
          try {
            const res = await axios.get("/api/users/me", {
              headers: { Authorization: `Bearer ${token}` }
            });
            setForm((prev) => ({
              ...prev,
              name: res.data.name || prev.name,
              email: res.data.email || prev.email
            }));
          } catch (err) {
            console.error("Failed to fetch profile", err);
          }
        }
      };
      fetchProfile();
    }, [token]);
  
    useEffect(() => {    const loadTranslations = async () => {
      setLabels({
        contactUs: await t("Contact Us"),
        name: await t("Name"),
        email: await t("Email"),
        subject: await t("Subject"),
        message: await t("Message"),
        submit: await t("Submit"),
        sending: await t("Sending...")
      });
    };
    loadTranslations();
  }, [lang]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post("/api/contact", form);
      showAlert("Message sent successfully!", () => {
        // Reset form but keep user details if logged in
        setForm({ 
          name: user?.name || "", 
          email: user?.email || "", 
          subject: "", 
          message: "" 
        });
      });
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="max-w-2xl mx-auto mt-10 p-6 border shadow rounded bg-white mb-10">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {labels.contactUs}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">{labels.name}</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">{labels.email}</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">{labels.subject}</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">{labels.message}</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              className="border p-2 w-full rounded focus:ring-2 focus:ring-green-500 outline-none"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 rounded text-white font-bold transition-colors ${
              isSubmitting ? "bg-gray-400" : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {isSubmitting ? labels.sending : labels.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
