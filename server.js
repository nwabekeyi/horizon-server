import app from './src/app.js'; // Import the Express app
import http from 'http';
import { port } from './src/configs/envConfig';

// Create and start the server
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server running securely on http://localhost:${port}`);
});
