const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const translateRoute = require("./routes/translate");
const translationRoute = require("./routes/translation");
const authRoute = require("./routes/auth");
const cropRoute = require("./routes/crop");
const userRoute = require("./routes/user");
const contactRoute = require("./routes/contact");

const app = express();

app.use(cors(
    {origin: process.env.CLIENT_URL, credentials: true}
));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Backend running");
});
app.use("/api/translate", translateRoute);
app.use("/api/auth", authRoute);
app.use("/api/crop", cropRoute);
app.use("/api/translation", translationRoute);
app.use("/api/users", userRoute);
app.use("/api/contact", contactRoute);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));