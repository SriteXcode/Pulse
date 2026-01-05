const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { cropValidator, updateValidator } = require("../validators/cropValidator");
const { createCrop, getCrops, filterCrops, getCropNames, getCropStats } = require("../controllers/cropController");

router.post("/", auth, cropValidator, validate, createCrop);
router.get("/", getCrops);
router.get("/names", getCropNames);
router.get("/stats", getCropStats);
const role = require("../middleware/roleMiddleware");
const { deleteCrop, updateCrop } = require("../controllers/cropController");

router.delete("/:id", auth, role("admin"), deleteCrop);
router.put("/:id", auth, role("admin"), updateValidator, validate, updateCrop);


module.exports = router;