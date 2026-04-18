const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Friendships
router.post('/friends/request', authenticateToken, socialController.sendFriendRequest);
router.put('/friends/accept/:friendshipId', authenticateToken, socialController.acceptFriendRequest);
router.get('/friends/:userId', authenticateToken, socialController.getFriends);

// Challenges
router.post('/challenges/create', authenticateToken, socialController.createChallenge);
router.post('/challenges/report', authenticateToken, socialController.reportChallengeScore);

// Leaderboard
router.get('/leaderboard', authenticateToken, socialController.getLeaderboard);

module.exports = router;
