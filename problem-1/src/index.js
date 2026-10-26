require("dotenv/config");
require("./db");
const app = require("./server");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = { app, server };