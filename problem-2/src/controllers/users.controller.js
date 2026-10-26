const usersService = require("../services/users.service");

function isPositiveInteger(value) {
  if (value === undefined || value === null) return false;
  const str = String(value).trim();
  if (!/^\d+$/.test(str)) return false;
  const num = Number(str);
  return Number.isInteger(num) && num > 0;
}

async function create(req, res, next) {
  try {
    const { username, email, bio } = req.body;
    const fullname = req.body.fullname !== undefined ? req.body.fullname : req.body.fullName;

    if (!username || !email || !fullname) {
      return res.status(400).json({
        error: "username, email and fullname are required",
      });
    }

    const newUser = await usersService.createUser({
      username,
      email,
      fullname,
      bio,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    if (error.status === 409 || error.message === "username or email already taken") {
      return res.status(409).json({
        error: "username or email already taken",
      });
    }
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
      if (!["createdAt", "username", "fullname"].includes(req.query.sortBy)) {
        return res.status(400).json({
          error: "sortBy must be one of: createdAt, username, fullname",
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

    let isPrivate;
    if (req.query.isPrivate !== undefined) {
      if (req.query.isPrivate !== "true" && req.query.isPrivate !== "false") {
        return res.status(400).json({
          error: "isPrivate must be true or false",
        });
      }
      isPrivate = req.query.isPrivate === "true";
    }

    const search = req.query.search;

    const result = await usersService.listUsers({
      page,
      limit,
      sortBy,
      order,
      isPrivate,
      search,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = {};
    const fullname = req.body.fullname !== undefined ? req.body.fullname : req.body.fullName;
    if (fullname !== undefined) {
      data.fullname = fullname;
    }
    if (req.body.bio !== undefined) {
      data.bio = req.body.bio;
    }
    if (req.body.isPrivate !== undefined) {
      data.isPrivate = req.body.isPrivate;
    }

    const updatedUser = await usersService.updateUser(req.params.id, data);
    return res.status(200).json(updatedUser);
  } catch (error) {
    if (error.status === 404 || error.message === "User not found") {
      return res.status(404).json({
        error: "User not found",
      });
    }
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    await usersService.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (error) {
    if (error.status === 404 || error.message === "User not found") {
      return res.status(404).json({
        error: "User not found",
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
