import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useContext(LanguageContext);

  return (
    <select 
      value={lang} 
      onChange={(e) => setLang(e.target.value)}
      className="text-black p-1 rounded"
    >
      <option value="en">English</option>
      <option value="hi">Hindi</option>
      <option value="mr">Marathi</option>
      <option value="bn">Bengali</option>
      <option value="ta">Tamil</option>
      <option value="te">Telugu</option>
      <option value="gu">Gujarati</option>
      <option value="ml">Malayalam</option>
      <option value="kn">Kannada</option>
    </select>
  );
}
