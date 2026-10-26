const prisma = require("../db");

async function createUser(data) {
  try {
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        fullname: data.fullname,
        bio: data.bio !== undefined ? data.bio : null,
      },
    });
    return user;
  } catch (error) {
    if (error.code === "P2002") {
      const err = new Error("username or email already taken");
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

async function listUsers(options = {}) {
  const { page = 1, limit = 10, sortBy = "createdAt", order = "desc", isPrivate, search } = options;

  const where = {};
  if (typeof isPrivate === "boolean") {
    where.isPrivate = isPrivate;
  }
  if (search && typeof search === "string" && search.trim() !== "") {
    where.OR = [
      { username: { contains: search.trim(), mode: "insensitive" } },
      { fullname: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;
  const take = limit;

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

async function getUserById(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || String(numericId) !== String(id)) {
    return null;
  }
  return await prisma.user.findUnique({
    where: { id: numericId },
  });
}

async function updateUser(id, data) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || String(numericId) !== String(id)) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const updateData = {};
  if (data.fullname !== undefined) {
    updateData.fullname = data.fullname;
  }
  if (data.bio !== undefined) {
    updateData.bio = data.bio;
  }
  if (data.isPrivate !== undefined) {
    updateData.isPrivate = data.isPrivate;
  }

  try {
    if (Object.keys(updateData).length === 0) {
      const existing = await prisma.user.findUnique({
        where: { id: numericId },
      });
      if (!existing) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
      }
      return existing;
    }

    const updated = await prisma.user.update({
      where: { id: numericId },
      data: updateData,
    });
    return updated;
  } catch (error) {
    if (error.code === "P2025") {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    throw error;
  }
}

async function deleteUser(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || String(numericId) !== String(id)) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  try {
    await prisma.user.delete({
      where: { id: numericId },
    });
  } catch (error) {
    if (error.code === "P2025") {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    throw error;
  }
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
