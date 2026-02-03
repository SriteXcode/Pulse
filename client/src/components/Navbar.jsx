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
  const [isOpen, setIsOpen] = useState(false);

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
    setIsOpen(false);
    navigate("/");
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const MobileLink = ({ to, children }) => (
    <li>
      <Link 
        to={to} 
        className="block py-2 hover:text-green-200" 
        onClick={() => setIsOpen(false)}
      >
        {children}
      </Link>
    </li>
  );

  return (
    <nav className="bg-green-800 text-white fixed top-0 w-full z-50 shadow-md">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="text-xl font-bold z-50"><Link to="/" onClick={() => setIsOpen(false)}>LOGO</Link></div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 font-semibold items-center">
          <li><Link to="/">{labels.home}</Link></li>
          {token && <li><Link to="/data-entry">{labels.dataEntry}</Link></li>}
          <li><Link to="/manual">{labels.userManual}</Link></li>
          <li><Link to="/records">{labels.records}</Link></li>
          <li><Link to="/contact">{labels.contact}</Link></li>
          
          {isAdmin && (
            <>
              <li><Link to="/visualisation">{labels.dataVisualization}</Link></li>
              <li><Link to="/admin">Admin</Link></li>
              <li><Link to="/admin/users">Users</Link></li>
              <li><Link to="/admin/messages">Messages</Link></li>
            </>
          )}

          {token ? (
            <li><button onClick={handleLogout} className="hover:underline">{labels.logout}</button></li>
          ) : (
             <li><button onClick={openLogin} className="hover:underline">{labels.login}</button></li>
          )}
        </ul>

        {/* Right Side: Language Switcher & Hamburger */}
        <div className="flex items-center gap-4 z-50">
          {loading && <span className="hidden md:inline text-xs italic text-green-200 animate-pulse">Translating...</span>}
          <LanguageSwitcher />
          
          {/* Hamburger Icon */}
          <button onClick={toggleMenu} className="md:hidden focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-0 left-0 w-full bg-green-900 shadow-xl pt-20 pb-6 px-6 flex flex-col items-center">
          <ul className="flex flex-col gap-4 font-semibold text-center w-full">
            <MobileLink to="/">{labels.home}</MobileLink>
            {token && <MobileLink to="/data-entry">{labels.dataEntry}</MobileLink>}
            <MobileLink to="/manual">{labels.userManual}</MobileLink>
            <MobileLink to="/records">{labels.records}</MobileLink>
            <MobileLink to="/contact">{labels.contact}</MobileLink>
            
            {isAdmin && (
              <>
                <MobileLink to="/visualisation">{labels.dataVisualization}</MobileLink>
                <MobileLink to="/admin">Admin</MobileLink>
                <MobileLink to="/admin/users">Users</MobileLink>
                <MobileLink to="/admin/messages">Messages</MobileLink>
              </>
            )}

            {token ? (
              <li>
                <button onClick={handleLogout} className="block w-full py-2 hover:text-green-200">{labels.logout}</button>
              </li>
            ) : (
              <li>
                <button onClick={() => { openLogin(); setIsOpen(false); }} className="block w-full py-2 hover:text-green-200">{labels.login}</button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
