import AuthCard from "../components/AuthCard";
import { useState, useEffect, useContext } from "react";
import useTranslator from "../hooks/useTranslator";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useAuthModal } from "../contexts/AuthModalContext";

export default function Home() {
  const { t, loading } = useTranslator();
  const { lang } = useContext(LanguageContext);
  const { token } = useAuth();
  const { openLogin, openRegister } = useAuthModal();

  const [labels, setLabels] = useState({
    title: "",
    subtitle: "",
    register: "",
    login: ""
  });

  useEffect(() => {
    const load = async () => {
      setLabels({
        title: await t("Agricultural Crop Trait Portal"),
        subtitle: await t("Data Entry | Visualization | Analysis"),
        register: await t("Register"),
        login: await t("Login")
      });
    };
    load();
  }, [lang]);

  return (
    <div className="relative">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-green-500 z-50 animate-pulse">
          <div className="bg-green-300 h-full w-1/2 animate-shimmer"></div>
        </div>
      )}

      <div className="flex justify-between px-10 mt-8">
        <div className="bg-gray-300 w-32 h-32 flex justify-center items-center">Logo 1</div>
        <div className="bg-gray-300 w-32 h-32 flex justify-center items-center">Logo 2</div>
      </div>

      <h1 className="text-center mt-8 text-3xl font-bold">
        {labels.title}
      </h1>

      <p className="text-center text-gray-700 mt-2">
        {labels.subtitle}
      </p>

      {!token && (
        <div className="flex justify-center gap-10 mt-12">
          <AuthCard title={labels.register} onClick={openRegister} />
          <AuthCard title={labels.login} onClick={openLogin} />
        </div>
      )}
    </div>
  );
}
