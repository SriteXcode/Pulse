const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const Translation = require("../models/Translation");

router.get("/export", auth, role("admin"), async (req, res) => {
  const all = await Translation.find();

  const filePath = path.join(__dirname, "../offline/translations.json");

  fs.writeFileSync(filePath, JSON.stringify(all, null, 2));

  res.json({ msg: "Exported Successfully", file: filePath });
});

module.exports = router;
