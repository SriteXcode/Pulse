const mongoose = require("mongoose");

const attributeSchema = new mongoose.Schema({
  avg: Number,
  sd: Number
});



const cropSchema = new mongoose.Schema({
  crop: String,
  variety: String,
  translations: {
  crop: { hi: String, mr: String, bn: String, ta: String, te: String, gu: String },
  variety: { hi: String, mr: String, bn: String, ta: String, te: String, gu: String }
},
  attributes: {
    bulkDensity: attributeSchema,
    seedWeight: attributeSchema,
    equivalentDiameter: attributeSchema,
    swellingIndex: attributeSchema,
    potentialDalRecovery: attributeSchema,
    dalRecovery: attributeSchema,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Crop", cropSchema);
