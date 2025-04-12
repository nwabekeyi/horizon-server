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
const authController = require('./routes/authRoute');
const verification = require('./routes/verification');
const transaction = require('./routes/transactionsRoute');
const company = require('./routes/companyRoute');
const setupAdminJS = require('./admin');
const session = require('express-session');

const allowedOriginAndMethodMiddleware = require("./middlewares/allowedOriginAndMethodMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// Rate Limiting
app.use(limiter);

// Security Middleware with custom CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'sha256-QEvPYBVC4/elBmqZMNgsmK/t4fbYlYlKFHMNgtbQhug='",
          "'sha256-s3awwLVKIlkpRfkaaj52BR2uN8hCzlzb6MchVuAUdaM='",
          "'sha256-aX5nyihpLRVEXOfytKLTyKNbLUXABeXuSnb8+Y6MbxE='", // New hash
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com", // Allow Google Fonts
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow font files
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(hpp());

// Session Middleware
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || 'sessionsecret',
  })
);

// Custom Middleware
app.use(allowedOriginAndMethodMiddleware);

// Logging Middleware
const logStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
logStream.on("error", (err) => console.error("Failed to write to access.log:", err));
app.use(morgan("combined", { stream: logStream }));
app.use(morgan("dev"));

// Swagger Setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize App with AdminJS
async function initializeApp() {
  try {
    await connectDB();
    console.log('MongoDB connection established');

    const { adminJs, adminRouter } = await setupAdminJS(app);
    app.use(adminJs.options.rootPath, adminRouter);
    console.log(`AdminJS successfully mounted at ${adminJs.options.rootPath}`);

    app.get("/", (req, res) => {
      res.send("Welcome to The Horizon - Your journey starts here!");
    });

    app.use(userRoutes);
    app.use(authController);
    app.use(verification);
    app.use(transaction);
    app.use(company);

    app.use(errorMiddleware);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`AdminJS available at http://localhost:${PORT}${adminJs.options.rootPath}`);
    });
  } catch (err) {
    console.error('Failed to initialize app:', err);
    process.exit(1);
  }
}

initializeApp();

module.exports = app;