// authorizationMiddleware.js

const jwt = require("jsonwebtoken");
const { User } = require("../models/user"); // Adjust the path to your User model or wherever user data is stored

const authorize = (roles = []) => {
  // If roles are not provided, we allow all roles to access
  if (typeof roles === "string") {
    roles = [roles];
  }

  return async (req, res, next) => {
    // 1. Check if there is a token in the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied, no token provided." });
    }

    try {
      // 2. Verify the token and get the user
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Store the decoded user data on the request object

      // 3. Check if the user's role is in the allowed roles
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Forbidden: You do not have access to this resource." });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      console.error(err);
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
  };
};

module.exports = authorize;
