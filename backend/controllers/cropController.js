const Crop = require("../models/Crop");
const translate = require("../services/translateService");

exports.createCrop = async (req, res) => {
  try {
    const { crop, variety } = req.body;

    const translations = {
      crop: {
        hi: await translate(crop, "hi"),
        mr: await translate(crop, "mr"),
        bn: await translate(crop, "bn"),
        ta: await translate(crop, "ta"),
        te: await translate(crop, "te"),
        gu: await translate(crop, "gu"),
      },
      variety: {
        hi: await translate(variety, "hi"),
        mr: await translate(variety, "mr"),
        bn: await translate(variety, "bn"),
        ta: await translate(variety, "ta"),
        te: await translate(variety, "te"),
        gu: await translate(variety, "gu"),
      },
    };

    const newCrop = new Crop({
      ...req.body,
      translations,
      user: req.user.id,
    });

    await newCrop.save();
    res.json("Crop saved successfully");
  } catch (err) {
    res.status(500).json("Server Error");
  }
};

exports.getCrops = async (req, res) => {
  const { page, limit, search, crop, variety, filters, sortBy, sortOrder, rules } = req.query;

  let query = {};

  // 1. Handle Structured Rules (The "Worthy" way)
  if (rules) {
    try {
      const parsedRules = JSON.parse(rules);
      if (Array.isArray(parsedRules) && parsedRules.length > 0) {
        const orClauses = parsedRules.map(rule => {
          const clause = {};
          if (rule.crop && rule.crop !== "all") clause.crop = rule.crop;
          if (rule.variety && rule.variety !== "all") clause.variety = rule.variety;

          if (rule.attributes) {
            Object.keys(rule.attributes).forEach(attr => {
              const r = rule.attributes[attr];
              if (r.avg) {
                if (r.avg.min !== "" && r.avg.min !== null) clause[`attributes.${attr}.avg`] = { ...clause[`attributes.${attr}.avg`], $gte: Number(r.avg.min) };
                if (r.avg.max !== "" && r.avg.max !== null) clause[`attributes.${attr}.avg`] = { ...clause[`attributes.${attr}.avg`], $lte: Number(r.avg.max) };
              }
              if (r.sd && r.sd.max !== "" && r.sd.max !== null) {
                clause[`attributes.${attr}.sd`] = { $lte: Number(r.sd.max) };
              }
            });
          }
          return clause;
        });
        query.$or = orClauses;
      }
    } catch (e) {
      console.error("Rule parse error", e);
    }
  } else {
    // 2. Backward Compatibility / Simple Filters
    if (search) {
      query.$or = [
        { crop: { $regex: search, $options: "i" } },
        { variety: { $regex: search, $options: "i" } }
      ];
    }

    if (crop) {
      const cropArr = Array.isArray(crop) ? crop : [crop];
      const filtered = cropArr.filter(c => c !== "all");
      if (filtered.length > 0) query.crop = { $in: filtered };
    }

    if (variety) {
      const varArr = Array.isArray(variety) ? variety : [variety];
      const filtered = varArr.filter(v => v !== "all");
      if (filtered.length > 0) query.variety = { $in: filtered };
    }

    if (filters) {
      // ... keep existing attribute filter logic for simple filters if needed ...
      try {
        const parsed = JSON.parse(filters);
        Object.keys(parsed).forEach(attr => {
          const ranges = Array.isArray(parsed[attr]) ? parsed[attr] : [parsed[attr]];
          if (ranges.length > 0) {
            const attrOr = ranges.map(r => {
              const c = {};
              if (r.avg?.min) c[`attributes.${attr}.avg`] = { ...c[`attributes.${attr}.avg`], $gte: Number(r.avg.min) };
              if (r.avg?.max) c[`attributes.${attr}.avg`] = { ...c[`attributes.${attr}.avg`], $lte: Number(r.avg.max) };
              return c;
            });
            if (!query.$and) query.$and = [];
            query.$and.push({ $or: attrOr });
          }
        });
      } catch (e) {}
    }
  }

  // Sorting logic
  let sort = {};
  if (sortBy) {
    const order = sortOrder === "desc" ? -1 : 1;
    // Handle nested attribute sorting
    if (["crop", "variety"].includes(sortBy)) {
      sort[sortBy] = order;
    } else {
      sort[`attributes.${sortBy}.avg`] = order;
    }
  } else {
    sort = { createdAt: -1 }; // Default sort
  }

  if (page && limit) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    try {
      const count = await Crop.countDocuments(query);
      const crops = await Crop.find(query)
        .populate("user", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      return res.json({
        records: crops,
        total: count,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum
      });
    } catch (err) {
      return res.status(500).json("Server Error");
    }
  }

  // Backward compatibility: return all records if no pagination params
  try {
    const crops = await Crop.find(query).populate("user", "name email").sort(sort);
    res.json(crops);
  } catch (err) {
    res.status(500).json("Server Error");
  }
};

exports.getCropNames = async (req, res) => {
  try {
    const { crop } = req.query;

    if (!crop) {
      const crops = await Crop.distinct("crop");
      return res.json({ crops });
    }

    const cropArr = Array.isArray(crop) ? crop : [crop];
    const varieties = await Crop.distinct("variety", { crop: { $in: cropArr } });
    res.json({ varieties });
  } catch (err) {
    res.status(500).json("Server Error");
  }
};

// exports.getCropStats = async (req, res) => {
//   try {
//     const { crop, variety } = req.query;

//     const match = {};
//     if (crop) match.crop = crop;
//     if (variety) match.variety = variety;

//     const attributes = [
//       "bulkDensity",
//       "seedWeight",
//       "equivalentDiameter",
//       "swellingIndex",
//       "potentialDalRecovery",
//       "dalRecovery",
//     ];

//     const group = { _id: null, count: { $sum: 1 } };

//     attributes.forEach((attr) => {
//       group[`${attr}_avg_min`] = { $min: `$attributes.${attr}.avg` };
//       group[`${attr}_avg_max`] = { $max: `$attributes.${attr}.avg` };
//       group[`${attr}_sd_min`] = { $min: `$attributes.${attr}.sd` };
//       group[`${attr}_sd_max`] = { $max: `$attributes.${attr}.sd` };
//     });

//     const stats = await Crop.aggregate([{ $match: match }, { $group: group }]);

//     if (!stats.length) return res.json({ count: 0 });

//     const raw = stats[0];
//     const out = { count: raw.count };

//     attributes.forEach((attr) => {
//       out[attr] = {
//         avg: {
//           min: raw[`${attr}_avg_min`],
//           max: raw[`${attr}_avg_max`],
//         },
//         sd: {
//           min: raw[`${attr}_sd_min`],
//           max: raw[`${attr}_sd_max`],
//         },
//       };
//     });

//     res.json(out);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json("Server Error");
//   }
// };

exports.getCropStats = async (req, res) => {
  try {
    const { crop } = req.query;

    const attributes = [
      "bulkDensity",
      "seedWeight",
      "equivalentDiameter",
      "swellingIndex",
      "potentialDalRecovery",
      "dalRecovery",
    ];

    const group = { _id: null, totalVarieties: { $sum: 1 } };

    // For each attribute: get min/max of avg & sd (across all varieties)
    attributes.forEach(attr => {
      group[`${attr}_avg_min`] = { $min: `$attributes.${attr}.avg` };
      group[`${attr}_avg_max`] = { $max: `$attributes.${attr}.avg` };

      group[`${attr}_sd_min`] = { $min: `$attributes.${attr}.sd` };
      group[`${attr}_sd_max`] = { $max: `$attributes.${attr}.sd` };
    });

    const match = crop ? { crop } : {};

    const stats = await Crop.aggregate([
      { $match: match },  
      { $group: group }
    ]);

    if (!stats.length) return res.json({ totalVarieties: 0 });

    const raw = stats[0];
    const out = {
      totalVarieties: raw.totalVarieties,
      crop: crop || "All Crops",
    };

    attributes.forEach(attr => {
      out[attr] = {
        avg: {
          min: raw[`${attr}_avg_min`] ?? null,
          max: raw[`${attr}_avg_max`] ?? null
        },
        sd: {
          min: raw[`${attr}_sd_min`] ?? null,
          max: raw[`${attr}_sd_max`] ?? null
        }
      };
    });

    res.json(out);

  } catch (err) {
    console.log(err);
    res.status(500).json("Server Error");
  }
};


exports.updateCrop = async (req, res) => {
  await Crop.findByIdAndUpdate(req.params.id, req.body);
  res.json("Updated");
};

exports.deleteCrop = async (req, res) => {
  await Crop.findByIdAndDelete(req.params.id);
  res.json("Deleted");
};