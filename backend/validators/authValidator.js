const { body } = require("express-validator");

exports.registerValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("phone").isLength({ min: 10 }).withMessage("Phone must be 10 digits"),
  body("institute").notEmpty().withMessage("Institute required"),
  body("password").isLength({ min: 6 }).withMessage("Min 6 character password"),
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required")
];
