const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  institute: String,
  usertype: { type: String, default: "user" },
  password: String,
});

module.exports = mongoose.model("User", userSchema);
