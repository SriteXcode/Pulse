const express = require("express");
const router = express.Router();

const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email institute");
    res.json(user);
  } catch (err) {
    res.status(500).json("Server Error");
  }
});

router.get("/", auth, role("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});
router.delete("/:id", auth, role("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json("User Deleted");
});
router.put("/role/:id", auth, role("admin"), async (req, res) => {
  const { role: newRole } = req.body;
  await User.findByIdAndUpdate(req.params.id, { usertype: newRole });
  res.json("Role Updated");
});

router.put("/:id", auth, role("admin"), async (req, res) => {
  const { name, email, institute } = req.body;
  await User.findByIdAndUpdate(req.params.id, { name, email, institute });
  res.json("User Updated");
});

module.exports = router;
