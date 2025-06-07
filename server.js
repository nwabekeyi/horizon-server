import app from './src/app.js'; // Import the Express app
import http from 'http';
import { port } from './src/configs/envConfig.js';

// Create and start the server
const server = http.createServer(app);
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});