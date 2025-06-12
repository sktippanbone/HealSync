const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const otpRoutes = require("./routes/otpRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

app.use("/api", otpRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});