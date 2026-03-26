const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./models");

// Import routes
const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");
const chatRoutes = require("./routes/chat.routes");

const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use("/auth", authRoutes);
app.use("/ai", aiRoutes);
app.use("/chat", chatRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "up", timestamp: new Date().toISOString() });
});

// Socket.io Logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", (data) => {
    const { roomId, message } = data;
    // Broadcast message to everyone in the room
    io.to(roomId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Database Sync & Server Start
const PORT = process.env.PORT || 5000;

db.sequelize
  .sync({ alter: true })
  .then(() => {
    server.listen(PORT, () => console.log(`Database connected and server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to sync database: ", err.message);
  });
