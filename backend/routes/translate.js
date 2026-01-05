const express = require("express");
const router = express.Router();
const axios = require("axios"); // Import axios
const Translation = require("../models/Translation");

router.post("/", async (req, res) => {
  const { text, target } = req.body;

  if (!text || !target) {
    return res.status(400).json({ error: "Text and target language are required" });
  }

  try {
    // 1️⃣ Check cache first
    const cached = await Translation.findOne({ key: text, target });
    if (cached) {
      return res.json({ translated: cached.translated, cached: true });
    }

    // 2️⃣ Helper to try fetching from Lingva (GET)
    const tryLingva = async () => {
      console.log(`Trying Lingva API...`);
      try {
        const encodedText = encodeURIComponent(text);
        const url = `https://lingva.ml/api/v1/en/${target}/${encodedText}`;
        
        const response = await axios.get(url);
        // Lingva returns { translation: "..." }
        return { translatedText: response.data.translation }; 
      } catch (err) {
        console.log(`Lingva failed: ${err.message}`);
        return null;
      }
    };

    // 3️⃣ Helper to try fetching from LibreTranslate (POST)
    const tryLibre = async (url) => {
      console.log(`Trying LibreTranslate mirror: ${url}`);
      try {
        const response = await axios.post(url, {
          q: text,
          source: "en",
          target,
          format: "text",
        }, {
          headers: { "Content-Type": "application/json" }
        });
        
        // LibreTranslate returns { translatedText: "..." }
        return response.data;
      } catch (err) {
        console.log(`Mirror ${url} connection failed: ${err.message}`);
        return null;
      }
    };

    let data = null;

    // 4️⃣ Try Lingva first
    data = await tryLingva();

    // 5️⃣ If Lingva fails, try LibreTranslate mirrors
    if (!data || !data.translatedText) {
      const mirrors = [
        "https://libretranslate.de/translate",
        "https://translate.argosopentech.com/translate",
        "https://lt.vern.cc/translate",
        "https://translate.terraprint.co/translate"
      ];

      for (const url of mirrors) {
        data = await tryLibre(url);
        if (data && data.translatedText) break;
      }
    }

    // 6️⃣ Final check
    if (!data || !data.translatedText) {
      throw new Error("All translation mirrors failed");
    }

    const translatedText = data.translatedText;

    // 7️⃣ Save / cache translation
    const newEntry = new Translation({
      key: text,
      target,
      translated: translatedText
    });

    await newEntry.save();

    return res.json({ translated: translatedText, cached: false });

  } catch (error) {
    console.error("Translation route error:", error.message);
    res.status(500).json({ error: "Translation failed", details: error.message });
  }
});

module.exports = router;
