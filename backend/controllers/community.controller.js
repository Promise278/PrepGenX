const { Posts, Comments, Users } = require('../models');

// GET /community - Fetch all posts with author and comments
const getAllPosts = async (req, res) => {
  try {
    const posts = await Posts.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Users,
          as: 'author',
          attributes: ['id', 'fullname', 'username'],
        },
        {
          model: Comments,
          as: 'comments',
          include: [{ model: Users, as: 'author', attributes: ['id', 'fullname', 'username'] }],
        },
      ],
    });
    res.json({ success: true, posts });
  } catch (err) {
    console.error('getAllPosts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
};

// POST /community - Create a new post
const createPost = async (req, res) => {
  try {
    const { content, mediaUrl } = req.body;
    const userId = req.user.id;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty' });
    }
    const post = await Posts.create({ userId, content: content.trim(), mediaUrl: mediaUrl || null });
    const fullPost = await Posts.findByPk(post.id, {
      include: [{ model: Users, as: 'author', attributes: ['id', 'fullname', 'username'] }],
    });
    res.status(201).json({ success: true, post: fullPost });
  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
};

// DELETE /community/:postId - Delete a post (author only)
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const post = await Posts.findByPk(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.userId !== userId) return res.status(403).json({ success: false, message: 'Not authorized' });
    await post.destroy();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    console.error('deletePost error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
};

// POST /community/:postId/comments - Add a comment
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }
    const post = await Posts.findByPk(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comments.create({ postId, userId, content: content.trim() });
    await post.increment('commentsCount');

    const fullComment = await Comments.findByPk(comment.id, {
      include: [{ model: Users, as: 'author', attributes: ['id', 'fullname', 'username'] }],
    });
    res.status(201).json({ success: true, comment: fullComment });
  } catch (err) {
    console.error('addComment error:', err);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};

// POST /community/:postId/like - Like a post
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Posts.findByPk(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    await post.increment('likesCount');
    res.json({ success: true, likesCount: post.likesCount + 1 });
  } catch (err) {
    console.error('likePost error:', err);
    res.status(500).json({ success: false, message: 'Failed to like post' });
  }
};

module.exports = { getAllPosts, createPost, deletePost, addComment, likePost };
