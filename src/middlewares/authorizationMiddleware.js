import { verifyJwt } from '../utils/JWTconfig';

const authorize = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const decoded = verifyJwt(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded; // Store decoded data (e.g., user info) in the request object
  next();
};

export default authorize;
