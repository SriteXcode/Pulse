const { body, query } = require("express-validator");

exports.cropValidator = [
  body("crop").notEmpty().withMessage("Crop name required"),
  body("variety").notEmpty().withMessage("Variety required"),
  
  // example numeric validations
  body("attributes.bulkDensity.avg").optional().isNumeric().withMessage("Avg must be a number"),
  body("attributes.bulkDensity.sd").optional().isNumeric().withMessage("SD must be number"),
];

exports.updateValidator = [
  body("crop").optional().notEmpty().withMessage("Crop name cannot be empty"),
  body("variety").optional().notEmpty().withMessage("Variety cannot be empty"),
];