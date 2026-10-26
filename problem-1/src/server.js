const express = require("express");
const usersRouter = require("./routes/users.routes");
const postsRouter = require("./routes/posts.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({
    status: "OK",
  });
});

app.use("/users", usersRouter);
app.use("/posts", postsRouter);

app.use((req, res) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.status && typeof err.status === "number") {
    return res.status(err.status).json({
      error: err.message,
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON payload",
    });
  }

  console.error("Unhandled error:", err.message);

  return res.status(500).json({
    error: "Internal server error",
  });
});

module.exports = app;
