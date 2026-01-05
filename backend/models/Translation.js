const mongoose = require("mongoose");

const translationSchema = new mongoose.Schema({
  key: String,          // english text key
  target: String,       // hi / mr / bn / ta etc.
  translated: String    // translated text
});

module.exports = mongoose.model("Translation", translationSchema);
