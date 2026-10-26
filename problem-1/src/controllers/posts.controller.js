const postsService = require("../services/posts.service");

async function create(req, res, next) {
  try {
    const { imageUrl, caption, location } = req.body;

    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return res.status(400).json({
        error: "imageUrl is required",
      });
    }

    const newPost = await postsService.createPost({
      imageUrl: imageUrl.trim(),
      caption,
      location,
    });

    return res.status(201).json(newPost);
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const posts = await postsService.listPosts();
    return res.status(200).json(posts);
  } catch (error) {
    return next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const post = await postsService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }
    return res.status(200).json(post);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = {};
    if (req.body.caption !== undefined) {
      data.caption = req.body.caption;
    }
    if (req.body.location !== undefined) {
      data.location = req.body.location;
    }

    const updatedPost = await postsService.updatePost(req.params.id, data);
    return res.status(200).json(updatedPost);
  } catch (error) {
    if (error.status === 404 || error.message === "Post not found") {
      return res.status(404).json({
        error: "Post not found",
      });
    }
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    await postsService.deletePost(req.params.id);
    return res.status(204).send();
  } catch (error) {
    if (error.status === 404 || error.message === "Post not found") {
      return res.status(404).json({
        error: "Post not found",
      });
    }
    return next(error);
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
