const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./models");

// Import routes
const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use("/auth", authRoutes);
app.use("/ai", aiRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "up", timestamp: new Date().toISOString() });
});

// Database Sync & Server Start
const PORT = process.env.PORT;

db.sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Database connected and server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to sync database: ", err.message);
  });
