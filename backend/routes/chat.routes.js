const express = require("express");
const { getChatHistory, sendMessage } = require("../controllers/chat.controller");
const protect = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/history/:userId", protect, getChatHistory);
router.post("/send", protect, sendMessage);

module.exports = router;
