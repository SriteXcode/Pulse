import axios from "axios";
import { useContext, useState, useCallback } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import i18n from "../i18n/i18n";

const cache = {}; // runtime cache (front-end)

export default function useTranslator() {
  const { lang } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);

  const t = useCallback(async (text) => {
    if (lang === "en") return text;

    // 1. Check local i18n resources first
    if (i18n.exists(text, { lng: lang })) {
      return i18n.t(text, { lng: lang });
    }
    
    const localTrans = i18n.t(text, { lng: lang });
    if (localTrans !== text) return localTrans;

    const key = `${text}_${lang}`;

    // 2. Check frontend runtime cache
    if (cache[key]) return cache[key];

    setLoading(true);
    try {
      // 3. Fetch from backend translate route
      const res = await axios.post("/api/translate", {
        text,
        target: lang,
      });

      cache[key] = res.data.translated;
      return res.data.translated;
    } catch (error) {
      console.error("Translation failed for:", text);
      console.error("Error details:", error.response?.data || error.message);
      return text; // Fallback to original text
    } finally {
      setLoading(false);
    }
  }, [lang]);

  return { t, loading };
}
