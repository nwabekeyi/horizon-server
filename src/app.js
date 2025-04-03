const express = require("express");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./configs/swaggerConfig"); // Import the spec
const limiter = require("./middlewares/rateLimiter");
const connectDB = require("./configs/DBconns");

// Connect to DB
connectDB();

const allowedOriginAndMethodMiddleware = require("./middlewares/allowedOriginAndMethodMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");
const authorizationMiddleware = require("./middlewares/authorizationMiddleware");

const app = express();

// Mount API routes
app.use("/api", apiRoutes); // Add this before authorizationMiddleware

// Rate Limiting
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

// Swagger Setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Public Routes
app.get("/", (req, res) => {
  res.send("Welcome to The Horizon - Your journey starts here!");
});

// Authorization Middleware (after public routes)
app.use(authorizationMiddleware);

// Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;