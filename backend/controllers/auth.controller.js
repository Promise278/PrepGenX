const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

async function register(req, res) {
  try {
    const { fullname, username, email, parentEmail, password } = req.body;

    if (!fullname || !username || !email || !parentEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Fullname, username, email, parent email, and password are required",
      });
    }

    if (username.length < 4 || password.length < 5) {
      return res.status(400).json({
        success: false,
        message:
          "Username must be at least 4 characters and Password at least 5 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const saltRounds = 12;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const newUser = await Users.create({
      fullname,
      username,
      email,
      parentEmail,
      password: hashedPassword,
      points: 0,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
        points: newUser.points,
      },
      message: "User Registered successfully",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await Users.findOne({
      where: { email },
      attributes: [
        "id",
        "fullname",
        "email",
        "password"
      ],
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Remove lastLogin update since column doesn't exist
    // await Users.update({ lastLogin: new Date() }, { where: { id: user.id } });

    const payload = {
      id: user.id,
      name: user.fullname,
      email: user.email,
      time: Date.now(),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    return res.status(200).json({
      success: true,
      token,
      user: payload,
      message: "User Login successfully",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function getMe(req, res) {
  try {
    const userId = req.user.id;
    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const { StudentProfile, Weeknesses, Subjects } = require("../models");
    let profile = null;
    if (StudentProfile) {
       profile = await StudentProfile.findOne({ where: { userId } });
    }
    
    let weaknesses = [];
    if (Weeknesses) {
       weaknesses = await Weeknesses.findAll({
         where: { userId },
         include: [{ model: Subjects, as: 'subject', attributes: ['name'] }],
         order: [['score', 'ASC']],
         limit: 3
       });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        parentEmail: user.parentEmail,
        points: user.points || 0,
        classLevel: profile ? profile.classLevel : 'SS3 Student',
        examType: profile ? profile.examType : 'Science',
        examsTaken: user.examsTaken || 0, 
        streak: user.streak || 0,
        progress: user.progress || 0,
        weaknesses: weaknesses
      }
    });

  } catch (error) {
     console.error("GetMe Error:", error);
     return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function getActivity(req, res) {
  try {
    const userId = req.user.id;
    const { Progresss, Subjects } = require("../models");
    const activity = await Progresss.findAll({
      where: { userId },
      include: [{ model: Subjects, attributes: ['name'] }],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    return res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Activity Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function getLeaderboard(req, res) {
  try {
    const users = await Users.findAll({
      attributes: ["id", "fullname", "username", "points"],
      order: [["points", "DESC"]],
      limit: 10,
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {
  register,
  login,
  getMe,
  getLeaderboard,
  getActivity,
};
