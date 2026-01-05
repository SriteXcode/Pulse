import { createContext, useState, useEffect } from "react";
import i18n from "../i18n/i18n";

export const LanguageContext = createContext();

export default function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}