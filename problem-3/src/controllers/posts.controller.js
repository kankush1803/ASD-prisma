const postsService = require("../services/posts.service");

function isPositiveInteger(value) {
  if (value === undefined || value === null) return false;
  const str = String(value).trim();
  if (!/^\d+$/.test(str)) return false;
  const num = Number(str);
  return Number.isInteger(num) && num > 0;
}

function isValidDate(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

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
    let page = 1;
    if (req.query.page !== undefined) {
      if (!isPositiveInteger(req.query.page)) {
        return res.status(400).json({
          error: "page and limit must be positive integers",
        });
      }
      page = parseInt(req.query.page, 10);
    }

    let limit = 10;
    if (req.query.limit !== undefined) {
      if (!isPositiveInteger(req.query.limit)) {
        return res.status(400).json({
          error: "page and limit must be positive integers",
        });
      }
      limit = Math.min(parseInt(req.query.limit, 10), 50);
    }

    let sortBy = "createdAt";
    if (req.query.sortBy !== undefined) {
      if (!["createdAt", "updatedAt"].includes(req.query.sortBy)) {
        return res.status(400).json({
          error: "sortBy must be one of: createdAt, updatedAt",
        });
      }
      sortBy = req.query.sortBy;
    }

    let order = "desc";
    if (req.query.order !== undefined) {
      if (!["asc", "desc"].includes(req.query.order)) {
        return res.status(400).json({
          error: "order must be asc or desc",
        });
      }
      order = req.query.order;
    }

    if (req.query.from !== undefined && !isValidDate(req.query.from)) {
      return res.status(400).json({
        error: "from and to must be valid dates",
      });
    }

    if (req.query.to !== undefined && !isValidDate(req.query.to)) {
      return res.status(400).json({
        error: "from and to must be valid dates",
      });
    }

    const location = req.query.location;
    const search = req.query.search;
    const from = req.query.from;
    const to = req.query.to;

    const result = await postsService.listPosts({
      page,
      limit,
      sortBy,
      order,
      location,
      search,
      from,
      to,
    });

    return res.status(200).json(result);
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
