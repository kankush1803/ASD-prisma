const usersService = require("../services/users.service");

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
    const users = await usersService.listUsers();
    return res.status(200).json(users);
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
