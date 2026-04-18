const express = require("express");
const { register, login, getMe, getLeaderboard, getActivity } = require("../controllers/auth.controller");
const verifyToken = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.get("/leaderboard", getLeaderboard);
router.get("/activity", verifyToken, getActivity);

module.exports = router;