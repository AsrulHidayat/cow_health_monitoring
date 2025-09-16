const express = require("express");
const cors = require("cors");
require("dotenv").config();

const temperatureRoutes = require("./routes/temperatureRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/temperature", temperatureRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
