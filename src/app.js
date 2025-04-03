const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const allowedOriginAndMethodMiddleware = require("./middlewares/allowedOriginAndMethodMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");
const authorizationMiddleware = require("./middlewares/authorizationMiddleware");

const app = express();

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Security Middleware
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(hpp());

// Custom Middleware
app.use(allowedOriginAndMethodMiddleware);

// Logging Middleware
const logStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
logStream.on("error", (err) => console.error("Failed to write to access.log:", err));
app.use(morgan("combined", { stream: logStream }));
app.use(morgan("dev"));

// Wildcard Route
app.get("/user", (req, res) => {
  res.send("Welcome to The Horizon - Your journey starts here!");
});
app.use(authorizationMiddleware);

// Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;