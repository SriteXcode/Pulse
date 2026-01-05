const fetch = require("node-fetch");
const Translation = require("../models/Translation");
const fs = require("fs");
const path = require("path");

// Load offline cache once on startup
const offlinePath = path.join(__dirname, "../offline/translations.json");
let offlineCache = {};

if (fs.existsSync(offlinePath)) {
  try {
    const fileData = fs.readFileSync(offlinePath);
    const parsed = JSON.parse(fileData.toString());
    // Assuming structure is array of { key, target, translated }
    if (Array.isArray(parsed)) {
      parsed.forEach((entry) => {
        offlineCache[`${entry.key}_${entry.target}`] = entry.translated;
      });
    }
  } catch (err) {
    console.log("Offline cache load failed", err);
  }
}

module.exports = async function translate(text, target) {
  if (!text) return text;

  // 1. Check DB Cache
  const cached = await Translation.findOne({ key: text, target });
  if (cached) return cached.translated;

  try {
    // 2. Try API
    const response = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: "en",
        target
      }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    if (data.translatedText) {
      const newCache = new Translation({
        key: text,
        target,
        translated: data.translatedText
      });
      await newCache.save();
      return data.translatedText;
    }
    throw new Error("Translation API failed");

  } catch (error) {
    // 3. Offline Fallback
    const offlineKey = `${text}_${target}`;
    if (offlineCache[offlineKey]) {
      return offlineCache[offlineKey];
    }
    
    // 4. Return original
    return text;
  }
};