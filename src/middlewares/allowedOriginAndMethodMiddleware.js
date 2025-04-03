// allowedOriginAndMethodMiddleware.js

const allowedOrigins = ['https://yourdomain.com', 'http://localhost:3000']; // Add localhost for local development
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE']; // Specify allowed HTTP methods

const allowedOriginAndMethodMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
  
    // Handle OPTIONS method (pre-flight request)
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', origin || 'http://localhost:3000'); // Fallback for undefined origin
      res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(200).json({});
    }
  
    // Allow requests with no origin (e.g., same-origin or non-browser clients)
    if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || 'http://localhost:3000');
    } else {
      return res.status(403).json({ message: 'Forbidden: Origin not allowed' });
    }
  
    res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    next();
  };

module.exports = allowedOriginAndMethodMiddleware;
