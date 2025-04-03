const app = require("./src/app"); // Import the Express app
const http = require("http");
const {port} = require('./src/configs/envConfig')

// Create and start the server
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server running securely on http://localhost:${port}`);
});
