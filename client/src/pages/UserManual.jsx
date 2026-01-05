import { useContext, useEffect, useState } from "react";
import useTranslator from "../hooks/useTranslator";
import { LanguageContext } from "../contexts/LanguageContext";

export default function UserManual() {
  const { t } = useTranslator();
  const { lang } = useContext(LanguageContext);
  
  const [content, setContent] = useState({
    title: "User Manual",
    introTitle: "Welcome to the Agricultural Crop Trait Portal",
    introText: "This portal allows researchers and farmers to manage and visualize crop trait data efficiently.",
    sections: []
  });

  useEffect(() => {
    const loadContent = async () => {
      setContent({
        title: await t("User Manual"),
        introTitle: await t("Welcome to the Agricultural Crop Trait Portal"),
        introText: await t("This portal allows researchers and farmers to manage and visualize crop trait data efficiently."),
        sections: [
          {
            title: await t("Getting Started"),
            body: await t("To start using the portal, please register an account or login if you already have one. Navigate using the top menu bar.")
          },
          {
            title: await t("Data Entry"),
            body: await t("Logged-in users can add new crop data via the 'Data Entry' page. Ensure you have all the attribute measurements ready.")
          },
          {
            title: await t("Visualization"),
            body: await t("Use the 'Data Visualization' page to analyze crop trends using interactive charts. You can filter by crop, variety, and specific attributes.")
          },
          {
            title: await t("Crop Records"),
            body: await t("View the public repository of crop data in the 'Crop Records' section.")
          }
        ]
      });
    };
    loadContent();
  }, [lang]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg mb-10">
      <h1 className="text-3xl font-bold text-green-800 mb-6 border-b pb-2">{content.title}</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{content.introTitle}</h2>
        <p className="text-gray-600 leading-relaxed">
          {content.introText}
        </p>
      </div>

      <div className="space-y-8">
        {content.sections.map((section, index) => (
          <div key={index} className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{section.title}</h3>
            <p className="text-gray-600">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
