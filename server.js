const app = require("./src/app"); // Import the Express app
const http = require("http");

const PORT = process.env.PORT || 3000;

// Create and start the server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running securely on http://localhost:${PORT}`);
});
