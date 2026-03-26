const { Message, Users } = require("../models");
const { Op } = require("sequelize");

async function getChatHistory(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id; // From auth middleware

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      },
      order: [["createdAt", "ASC"]],
      include: [
        { model: Users, as: 'sender', attributes: ['id', 'fullname'] },
        { model: Users, as: 'receiver', attributes: ['id', 'fullname'] }
      ]
    });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Chat History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function sendMessage(req, res) {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
    });

    return res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports = {
  getChatHistory,
  sendMessage,
};
