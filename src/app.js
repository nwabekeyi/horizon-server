const express = require("express");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./configs/swaggerConfig");
const limiter = require("./middlewares/rateLimiter");
const connectDB = require("./configs/DBconns");
const userRoutes = require('./routes/userRoutes');
const authController = require('./routes/authRoute')
const verification = require('./routes/verification')
// Connect to DB
connectDB();

const allowedOriginAndMethodMiddleware = require("./middlewares/allowedOriginAndMethodMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// Rate Limiting
app.use(limiter);

// Security Middleware
app.use(helmet());

// Body parsing middleware (using Express built-ins)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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

// API Routes
app.use(userRoutes);
app.use(authController);
app.use(verification);

// Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;