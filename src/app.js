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
import session from 'express-session';
import { prodUrl } from './configs/envConfig.js';

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
          "'unsafe-inline'", // For React dev builds; replace with hashes in production
          "https://unpkg.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
        connectSrc: [
          "'self'",
          prodUrl,
          "http://localhost:3000",
          "http://localhost:5000",
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

// Serve static files from public/home and public/dist
app.use(express.static(path.join(__dirname, '../public', 'home')));
app.use(express.static(path.join(__dirname, '../public', 'dist')));

// Swagger Setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Main app initialization
async function initializeApp() {
  try {
    await connectDB();
    console.log('MongoDB connection established');

    // Define root route to serve public/home/index.html
    app.get('/', (req, res) => {
      const indexPath = path.join(__dirname, 'public', 'home', 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving home/index.html:', err);
          res.status(500).send('Internal Server Error: Unable to load the homepage');
        }
      });
    });

    // Routes for authentication to serve public/dist/index.html
    app.get('/authentication/sign-in', (req, res) => {
      const indexPath = path.join(__dirname, '../public', 'dist', 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving dist/index.html for sign-in:', err);
          res.status(500).send('Internal Server Error: Unable to load the application');
        }
      });
    });

    app.get('/authentication/sign-up', (req, res) => {
      const indexPath = path.join(__dirname, '../public', 'dist', 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving dist/index.html for sign-up:', err);
          res.status(500).send('Internal Server Error: Unable to load the application');
        }
      });
    });

    // Lazy import API routes and mount immediately
    const [
      userRoutes,
      authController,
      verification,
      transaction,
      company,
      security,
      paymentDetail,
      withdrawal,
      brokersFee,
      paymentAccount,
      recoveryEmail,
    ] = await Promise.all([
      import('./routes/userRoutes.js'),
      import('./routes/authRoute.js'),
      import('./routes/verification.js'),
      import('./routes/transactionsRoute.js'),
      import('./routes/companyRoute.js'),
      import('./routes/securityRoute.js'),
      import('./routes/paymentDetailsRoute.js'),
      import('./routes/withdrwalRoutes.js'),
      import('./routes/brokerFeeRoute.js'),
      import('./routes/paymentAccountRoute.js'),
      import('./routes/recoveryEmailRoute.js'),
    ]);

    app.use(userRoutes.default);
    app.use(authController.default);
    app.use(verification.default);
    app.use(transaction.default);
    app.use(company.default);
    app.use(security.default);
    app.use(paymentDetail.default);
    app.use(withdrawal.default);
    app.use(brokersFee.default);
    app.use(paymentAccount.default);
    app.use(recoveryEmail.default);

    // Catch-all route for React app (SPA) to handle other client-side routes
    app.get('/', (req, res) => {
      const indexPath = path.join(__dirname, '../public', 'home', 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving dist/index.html:', err);
          res.status(500).send('Internal Server Error: Unable to load the application');
        }
      });
    });

    // Error handler middleware
    app.use(errorMiddleware);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Delay AdminJS setup by 1 minute (60000 ms)
      setTimeout(async () => {
        try {
          const { default: setupAdminJS } = await import('./admin/index.js');
          const { adminJs, adminRouter } = await setupAdminJS(app);
          app.use(adminJs.options.rootPath, adminRouter);
          console.log(`AdminJS successfully mounted at ${adminJs.options.rootPath}`);
        } catch (adminErr) {
          console.error('Failed to initialize AdminJS after delay:', adminErr);
        }
      }, 5000); // 60 seconds
    });
  } catch (err) {
    console.error('Failed to initialize app:', err);
    process.exit(1);
  }
}


//clear log file 
function trimAccessLog() {
  const logPath = path.join(__dirname, 'access.log');

  fs.readFile(logPath, 'utf8', (err, data) => {
    if (err) return console.error('Error reading access.log:', err);

    const lines = data.trim().split('\n');
    const last20 = lines.slice(-20).join('\n') + '\n';

    fs.writeFile(logPath, last20, (err) => {
      if (err) console.error('Error writing trimmed access.log:', err);
    });
  });
}
setInterval(trimAccessLog, 24 * 60 * 60 * 1000); // every 24 hours

initializeApp();

export default app;