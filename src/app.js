import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './configs/swaggerConfig.js';
import limiter from './middlewares/rateLimiter.js';
import connectDB from './configs/DBconns.js';
import userRoutes from './routes/userRoutes.js';
import authController from './routes/authRoute.js';
import verification from './routes/verification.js';
import transaction from './routes/transactionsRoute.js';
import company from './routes/companyRoute.js';
import security from './routes/securityRoute.js';
import setupAdminJS from './admin';
import session from 'express-session';
import paymentDetail from './routes/paymentDetailsRoute.js';
import withdrawal from './routes/withdrwalRoutes.js';
import brokersFee from './routes/brokerFeeRoute.js';
import paymentAccount from './routes/paymentAccountRoute.js'
import recoveryEmail from './routes/recoveryEmailRoute.js'

import allowedOriginAndMethodMiddleware from './middlewares/allowedOriginAndMethodMiddleware.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

// Set up __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Rate Limiting
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HPP middleware
app.use(hpp());

// Session Middleware
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || 'sessionsecret',
  })
);

// CORS Middleware
app.use(allowedOriginAndMethodMiddleware);

// Security Middleware with CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'sha256-QEvPYBVC4/elBmqZMNgsmK/t4fbYlYlKFHMNgtbQhug='",
          "'sha256-s3awwLVKIlkpRfkaaj52BR2uN8hCzlzb6MchVuAUdaM='",
          "'sha256-aX5nyihpLRVEXOfytKLTyKNbLUXABeXuSnb8+Y6MbxE='",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: [
          "'self'",
          "https://horizon-amber-xi.vercel.app",
          "http://localhost:3000",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Debug response headers
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`Response Headers for ${req.path}:`, res.getHeaders());
    return originalSend.call(this, body);
  };
  next();
});

// Logging Middleware
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
logStream.on('error', (err) => console.error('Failed to write to access.log:', err));
app.use(morgan('combined', { stream: logStream }));
app.use(morgan('dev'));

// Swagger Setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// App Initialization
async function initializeApp() {
  try {
    await connectDB();
    console.log('MongoDB connection established');

    const { adminJs, adminRouter } = await setupAdminJS(app);
    app.use(adminJs.options.rootPath, adminRouter);
    console.log(`AdminJS successfully mounted at ${adminJs.options.rootPath}`);

    app.get('/', (req, res) => {
      res.send('Welcome to The Horizon - Your journey starts here!');
    });

    // API routes
    app.use(userRoutes);
    app.use(authController);
    app.use(verification);
    app.use(transaction);
    app.use(company);
    app.use(security);
    app.use(paymentDetail);
    app.use(withdrawal);
    app.use(brokersFee);
    app.use(paymentAccount);
    app.use(recoveryEmail);

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

// Optional for testing import elsewhere
export default app;
