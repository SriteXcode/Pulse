const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.post("/", contactController.submitContactForm);
router.get("/", auth, role("admin"), contactController.getContacts);

module.exports = router;
