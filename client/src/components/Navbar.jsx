import { Link, useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { useState, useEffect, useContext } from "react";
import useTranslator from "../hooks/useTranslator";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useAuthModal } from "../contexts/AuthModalContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { t, loading } = useTranslator();
  const { lang } = useContext(LanguageContext);
  const { token, logout, isAdmin } = useAuth();
  const { openLogin } = useAuthModal();

  const [labels, setLabels] = useState({
    home: "",
    dataEntry: "",
    dataVisualization: "",
    userManual: "",
    records: "",
    contact: "",
    logout: "",
    login: ""
  });

  useEffect(() => {
    const load = async () => {
      setLabels({
        home: await t("Home"),
        dataEntry: await t("Data Entry"),
        dataVisualization: await t("Data Visualization"),
        userManual: await t("User Manual"),
        records: await t("Crop Records"),
        contact: await t("Contact"),
        logout: await t("Logout"),
        login: await t("Login")
      });
    };
    load();
  }, [lang]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (

    <nav className="flex justify-between items-center px-8 py-4 bg-green-800 text-white fixed top-0 w-full">

      <div className="text-xl font-bold"><Link to="/">LOGO</Link></div>

      <ul className="flex gap-6 font-semibold items-center">
        <li><Link to="/">{labels.home}</Link></li>
        
        {token && <li><Link to="/data-entry">{labels.dataEntry}</Link></li>}

        <li><Link to="/manual">{labels.userManual}</Link></li>
        <li><Link to="/records">{labels.records}</Link></li>
        <li><Link to="/contact">{labels.contact}</Link></li>
        
        {isAdmin && (
          <>
            <li>
              <Link to="/visualisation">{labels.dataVisualization}</Link>
            </li>
            <li>
              <Link to="/admin">Admin</Link>
            </li>
            <li>
              <Link to="/admin/users">Users</Link>
            </li>
            <li>
              <Link to="/admin/messages">Messages</Link>
            </li>

          </>
        )}

        {token ? (
          <li>
            <button onClick={handleLogout} className="hover:underline">
              {labels.logout}
            </button>
          </li>
        ) : (
           <li>
            <button onClick={openLogin} className="hover:underline">
              {labels.login}
            </button>
          </li>
        )}

      </ul>

      <div className="flex items-center gap-4">
        {loading && <span className="text-xs italic text-green-200 animate-pulse">Translating...</span>}
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
