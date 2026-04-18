const { Users, Friendships, Challenges, Sequelize } = require('../models');
const { Op } = Sequelize;

// FRIENDSHIP LOGIC
exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    if (userId === friendId) return res.status(400).json({ error: "You cannot friend yourself." });

    const existing = await Friendships.findOne({
      where: {
        [Op.or]: [
          { userId, friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    if (existing) return res.status(400).json({ error: "Friendship already exists or pending." });

    const friendship = await Friendships.create({ userId, friendId, status: 'pending' });
    res.json({ success: true, friendship });
  } catch (error) {
    res.status(500).json({ error: "Failed to send friend request." });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const friendship = await Friendships.findByPk(friendshipId);
    if (!friendship) return res.status(404).json({ error: "Friend request not found." });

    friendship.status = 'accepted';
    await friendship.save();
    res.json({ success: true, friendship });
  } catch (error) {
    res.status(500).json({ error: "Failed to accept friend request." });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const friends = await Friendships.findAll({
      where: {
        [Op.or]: [{ userId }, { friendId: userId }],
        status: 'accepted'
      },
      include: [
        { model: Users, as: 'user', attributes: ['id', 'fullname', 'username', 'points'] },
        { model: Users, as: 'friend', attributes: ['id', 'fullname', 'username', 'points'] }
      ]
    });
    res.json({ success: true, friends });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch friends." });
  }
};

// CHALLENGE LOGIC
exports.createChallenge = async (req, res) => {
  try {
    const { challengerId, challengedId, subjectId, topic } = req.body;
    const challenge = await Challenges.create({
      challengerId,
      challengedId,
      subjectId,
      topic,
      status: 'pending'
    });
    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ error: "Failed to create challenge." });
  }
};

exports.reportChallengeScore = async (req, res) => {
  try {
    const { challengeId, userId, score } = req.body;
    const challenge = await Challenges.findByPk(challengeId);
    if (!challenge) return res.status(404).json({ error: "Challenge not found." });

    if (challenge.challengerId === userId) {
      challenge.challengerScore = score;
    } else if (challenge.challengedId === userId) {
      challenge.challengedScore = score;
    }

    // Check if both have finished
    if (challenge.challengerScore > 0 && challenge.challengedScore > 0) {
      challenge.status = 'completed';
      if (challenge.challengerScore > challenge.challengedScore) {
        challenge.winnerId = challenge.challengerId;
      } else if (challenge.challengedScore > challenge.challengerScore) {
        challenge.winnerId = challenge.challengedId;
      }
      
      // Award points to winner
      if (challenge.winnerId) {
        const winner = await Users.findByPk(challenge.winnerId);
        winner.points += 50; // Challenge bonus
        await winner.save();
      }
    } else {
       challenge.status = 'accepted';
    }

    await challenge.save();
    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ error: "Failed to report challenge score." });
  }
};

// LEADERBOARD
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Users.findAll({
      attributes: ['id', 'fullname', 'username', 'points', 'streak'],
      order: [['points', 'DESC']],
      limit: 20
    });
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard." });
  }
};
