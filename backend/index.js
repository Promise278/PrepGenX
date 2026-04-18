const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./models");

// Import routes
const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");
const chatRoutes = require("./routes/chat.routes");
const examsRoutes = require("./routes/exams.routes");
const weaknessRoutes = require("./routes/weakness.routes");
const parentRoutes = require("./routes/parent.routes");
const studyPlanRoutes = require("./routes/studyPlan.routes");
const socialRoutes = require("./routes/social.routes");

const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

// Simple Request/Response Logger for Testing
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

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
app.use("/exams", examsRoutes);
app.use("/weakness", weaknessRoutes);
app.use("/parent", parentRoutes);
app.use("/study-plan", studyPlanRoutes);
app.use("/social", socialRoutes);

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

  // Video Call Signaling
  socket.on("call_user", (data) => {
    const { userToCall, signalData, from, name } = data;
    console.log(`User ${from} is calling ${userToCall}`);
    // In a real app, we'd find the socket ID of userToCall.
    // For this demo/private room setup, we broadcast to the user's "personal" room or just emit globally with a target ID.
    socket.broadcast.emit("incoming_call", { signal: signalData, from, name, userToCall });
  });

  socket.on("accept_call", (data) => {
    console.log(`Call accepted by ${data.to}`);
    io.emit("call_accepted", data.signal);
  });

  socket.on("decline_call", (data) => {
    console.log(`Call declined by ${data.to}`);
    io.emit("call_declined", { to: data.to });
  });

  socket.on("end_call", (data) => {
    console.log(`Call ended by ${socket.id}`);
    socket.broadcast.emit("call_ended");
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
