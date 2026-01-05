const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, phone, institute, password } = req.body;

  try {
    // check existing
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json("Email already exists");

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      institute,
      password: hashed
    });

    await user.save();

    res.json("User Registered Successfully");

  } catch (err) {
    res.status(500).json("Server Error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json("Invalid credentials");

    const token = jwt.sign(
      { id: user._id, role: user.usertype },
      process.env.JWT_SECRET
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json("Server Error");
  }
};
