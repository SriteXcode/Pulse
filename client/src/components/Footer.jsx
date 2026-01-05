import { useState, useEffect, useContext } from "react";
import useTranslator from "../hooks/useTranslator";
import { LanguageContext } from "../contexts/LanguageContext";

export default function Footer() {
  const { t } = useTranslator();
  const { lang } = useContext(LanguageContext);

  const [labels, setLabels] = useState({
    quick: "",
    contactUs: "",
    address: "",
    home: "",
    records: "",
    help: ""
  });

  useEffect(() => {
    const load = async () => {
      setLabels({
        quick: await t("Quick Links"),
        contactUs: await t("Contact Us"),
        address: await t("Address"),
        home: await t("Home"),
        records: await t("Records"),
        help: await t("Help")
      });
    };
    load();
  }, [lang]);

  return (
<footer className="bg-green-900 text-white py-6 flex flex-col w-full">
      {/* <footer className="bg-green-900 text-white py-6 fixed bottom-0 w-full"> */}

      <div className="flex justify-around">
        <div>
          <h3 className="font-bold mb-2">{labels.quick}</h3>
          <p>{labels.home}</p>
          <p>{labels.records}</p>
          <p>{labels.help}</p>
        </div>

        <div>
          <h3 className="font-bold mb-2">{labels.contactUs}</h3>
          <p>info@agriportal.in</p>
          <p>+91 9876543210</p>
        </div>

        <div>
          <h3 className="font-bold mb-2">{labels.address}</h3>
          <p>Indian Agriculture Research Dept</p>
          <p>India</p>
        </div>
      </div>
    </footer>
  );
}
