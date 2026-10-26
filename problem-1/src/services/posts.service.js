const prisma = require("../db");

async function createPost(data) {
  return await prisma.post.create({
    data: {
      imageUrl: data.imageUrl,
      caption: data.caption !== undefined ? data.caption : null,
      location: data.location !== undefined ? data.location : null,
    },
  });
}

async function listPosts() {
  return await prisma.post.findMany();
}

async function getPostById(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || String(numericId) !== String(id)) {
    return null;
  }
  return await prisma.post.findUnique({
    where: { id: numericId },
  });
}

async function updatePost(id, data) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || String(numericId) !== String(id)) {
    const err = new Error("Post not found");
    err.status = 404;
    throw err;
  }

  const updateData = {};
  if (data.caption !== undefined) {
    updateData.caption = data.caption;
  }
  if (data.location !== undefined) {
    updateData.location = data.location;
  }

  try {
    if (Object.keys(updateData).length === 0) {
      const existing = await prisma.post.findUnique({
        where: { id: numericId },
      });
      if (!existing) {
        const err = new Error("Post not found");
        err.status = 404;
        throw err;
      }
      return existing;
    }

    const updated = await prisma.post.update({
      where: { id: numericId },
      data: updateData,
    });
    return updated;
  } catch (error) {
    if (error.code === "P2025") {
      const err = new Error("Post not found");
      err.status = 404;
      throw err;
    }
    throw error;
  }
}

async function deletePost(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || String(numericId) !== String(id)) {
    const err = new Error("Post not found");
    err.status = 404;
    throw err;
  }

  try {
    await prisma.post.delete({
      where: { id: numericId },
    });
  } catch (error) {
    if (error.code === "P2025") {
      const err = new Error("Post not found");
      err.status = 404;
      throw err;
    }
    throw error;
  }
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
