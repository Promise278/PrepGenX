const express = require("express");
const cors = require("cors");
const app = express();

const connection = require("./config/connection");

app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  console.log("Welcome to the homepage");
  res.send("Welcome to our homepage");
});

// Sync database and start server
const PORT = process.env.PORT;
connection
  .sync({ force: false, alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Database connected and server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });