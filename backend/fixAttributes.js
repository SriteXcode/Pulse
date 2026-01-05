const mongoose = require("mongoose");
const Crop = require("./models/Crop");

// UPDATE THIS TO YOUR CONNECTION STRING
const MONGO_URI = "mongodb://localhost:27017/agriDB";

const map = {
  BulkDensity: "bulkDensity",
  bulkDensity: "bulkDensity",

  SeedWeight: "seedWeight",
  seedWeight: "seedWeight",

  EquivalentDiameter: "equivalentDiameter",
  equivalentDiameter: "equivalentDiameter",

  SwellingIndex: "swellingIndex",
  swellingIndex: "swellingIndex",

  PotentialDalRecovery: "potentialDalRecovery",
  potentialDalRecovery: "potentialDalRecovery",

  DalRecovery: "dalRecovery",
  dalRecovery: "dalRecovery",
};

async function fixDB() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected!");

  const crops = await Crop.find({});

  for (let crop of crops) {
    const attrs = crop.attributes;
    if (!attrs) continue;

    const newAttrs = {};

    Object.keys(attrs).forEach(key => {
      const newKey = map[key]; // map old → correct
      if (newKey) {
        newAttrs[newKey] = attrs[key];
      }
    });

    crop.attributes = newAttrs;
    await crop.save();
    console.log(`Fixed: ${crop.crop} - ${crop.variety}`);
  }

  console.log("All attribute keys normalized!");
  process.exit();
}

fixDB();
