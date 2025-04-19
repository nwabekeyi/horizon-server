const jwt = require('jsonwebtoken');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Make sure to securely store this in your environment

// Function to sign a JWT Token with an optional expiration time
const signJwt = (payload, expiration = '1h') => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: expiration });
  return token;
};

// Function to verify a JWT Token
const verifyJwt = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Invalid or expired token:', error);
    return null; // Return null if the token is invalid
  }
};

// Exporting the functions for use
module.exports = { signJwt, verifyJwt };
