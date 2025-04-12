const mongoose = require('mongoose');
const path = require('path');
const express = require('express');
const session = require('express-session');
const { Admin } = require('../models/userModel');
const { adminEmail, adminPassword, adminCookie } = require('../configs/envConfig');

async function setupAdminJS(app) {
  try {
    console.log('Starting AdminJS setup...');

    // Import AdminJS and related packages
    const AdminJS = (await import('adminjs')).default;
    console.log('AdminJS imported successfully');

    const AdminJSExpress = (await import('@adminjs/express')).default;
    console.log('AdminJSExpress imported successfully');

    const AdminJSMongoose = await import('@adminjs/mongoose');
    console.log('AdminJSMongoose:', AdminJSMongoose);

    const { Database, Resource } = AdminJSMongoose.default || AdminJSMongoose;
    console.log('AdminJSMongoose Database:', Database);
    console.log('AdminJSMongoose Resource:', Resource);

    // Register Mongoose adapter
    AdminJS.registerAdapter({ Resource, Database });
    console.log('Mongoose adapter registered');

    // Check MongoDB connection
    mongoose.connection.on('connected', () => console.log('Mongoose connected'));
    mongoose.connection.on('error', (err) => console.error('Mongoose error:', err));

    // Log environment variables for debugging
    console.log('Environment variables:', {
      adminEmail,
      adminPassword: '[REDACTED]',
      adminCookie: adminCookie ? '[REDACTED]' : 'undefined',
    });

    // Create default admin if not exists
    console.log('Checking for existing admin...');
    const existingAdmin = await Admin.findOne({ email: adminEmail }).maxTimeMS(5000);
    if (!existingAdmin) {
      console.log('No admin found, creating default admin...');
      await Admin.create({
        firstName: 'Default',
        lastName: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'superadmin',
        status: 'verified',
      });
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists:', existingAdmin.email);
      if (existingAdmin.password !== adminPassword) {
        await Admin.updateOne({ email: adminEmail }, { password: adminPassword });
        console.log('Updated existing admin password to plaintext');
      }
    }

    // AdminJS configuration
    const adminJsOptions = {
      databases: [mongoose],
      rootPath: '/admin',
      resources: [
        require('./resources/accountDetails'),
        require('./resources/company'),
        require('./resources/registrationPin'),
        require('./resources/transactions'),
        require('./resources/user'),
        require('./resources/admin'),
      ],
      dashboard: require('./dashboard').dashboard,
      branding: {
        companyName: '247AT',
        softwareBrothers: false,
        logo: false,
        favicon: false,
        theme: {
          colors: {
            primary100: '#2c3e50',
            accent: '#3498db',
            hoverBg: '#ecf0f1',
          },
        },
      },
    };

    // Initialize AdminJS
    const adminJs = new AdminJS(adminJsOptions);
    console.log('AdminJS instance created');

    // Authentication function
    const authenticate = async (email, password) => {
      console.log('Authenticating email:', email);
      try {
        const admin = await Admin.findOne({ email }).maxTimeMS(5000);
        if (!admin) {
          console.log('No admin found for email:', email);
          return null;
        }
        console.log('Admin found:', admin.email, 'Role:', admin.role);
        const passwordMatch = password === admin.password;
        console.log('Password match result:', passwordMatch);
        if (passwordMatch) {
          console.log('Authentication successful for:', email);
          return { email: admin.email, role: admin.role };
        }
        console.log('Password incorrect for:', email);
        return null;
      } catch (err) {
        console.error('Authentication error:', err.message);
        return null;
      }
    };

    // Set up EJS as the view engine
    const viewsPath = path.join(__dirname, '../public/view');
    console.log('Views path set to:', viewsPath);
    app.set('view engine', 'ejs');
    app.set('views', viewsPath);

    // Custom login page route
    app.get('/admin/login', (req, res) => {
      console.log('GET /admin/login - Rendering admin/login.ejs');
      console.log('Query params:', req.query);
      res.render('admin/login', {
        errorMessage: req.query.error || '',
        action: '/admin/login',
        companyName: '247AT',
        currentYear: new Date().getFullYear(),
      });
    });

    // Explicit session middleware
    app.use(
      session({
        secret: adminCookie || 'fallback-secret-247at',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
        name: 'adminjs',
      })
    );
    console.log('Session middleware configured');

    // CSP middleware
    app.use((req, res, next) => {
      console.log('Applying CSP for:', req.path);
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data:; " +
        "connect-src 'self'; " +
        "frame-src 'none'; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'"
      );
      next();
    });

    // Debug POST /admin/login
    app.post('/admin/login', async (req, res) => {
      console.log('POST /admin/login - Request received');
      console.log('Request body:', req.body);
      console.log('Session before auth:', req.session);
      const { email, password } = req.body;
      const admin = await authenticate(email, password);
      if (admin) {
        console.log('Setting session adminUser:', admin);
        req.session.adminUser = admin;
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            res.status(500).send('Session error');
            return;
          }
          console.log('Session saved, redirecting to /admin');
          res.redirect('/admin');
        });
        return;
      }
      console.log('Authentication failed, redirecting to /admin/login');
      res.redirect('/admin/login?error=Invalid%20email%20or%20password');
    });

    // Serve AdminJS frontend assets
    app.use('/admin/assets', (req, res, next) => {
      console.log('Serving AdminJS asset:', req.path);
      next();
    }, express.static(path.join(__dirname, '../../node_modules/adminjs/lib/frontend/assets')));

    // Serve custom static files
    app.use('/admin/custom-assets', (req, res, next) => {
      console.log('Serving custom asset:', req.path);
      next();
    }, express.static(path.join(__dirname, '../../public')));
    console.log('Static files configured');

    // Build AdminJS router with authentication
    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
      adminJs,
      {
        authenticate,
        cookieName: 'adminjs',
        cookiePassword: adminCookie || 'fallback-secret-247at',
      },
      null,
      {
        secret: adminCookie || 'fallback-secret-247at',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
      }
    );
    console.log('AdminJS router built with authentication');

    // Debug AdminJS routes
    adminRouter.use((req, res, next) => {
      console.log(`Admin router - Method: ${req.method}, Path: ${req.path}`);
      console.log('Session:', req.session);
      if (req.session && req.session.adminUser) {
        console.log('Session adminUser found:', req.session.adminUser);
      }
      next();
    });

    // Debug dashboard access
    adminRouter.get('/', (req, res, next) => {
      console.log('GET /admin - Dashboard access attempt');
      console.log('Session:', req.session);
      next();
    });

    // Add CORS support
    const cors = require('cors');
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Cookie'],
    }));
    console.log('CORS configured');

    // Mount AdminJS routes
    app.use('/admin', adminRouter);
    console.log('AdminJS routes mounted at /admin');

    return { adminJs, adminRouter };
  } catch (err) {
    console.error('Error in setupAdminJS:', err);
    throw err;
  }
}

module.exports = setupAdminJS;