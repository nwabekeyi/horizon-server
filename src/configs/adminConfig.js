const mongoose = require('mongoose');
const { adminEmail, adminPassword, adminCookie, dbUrl } = require('./envConfig');

// Import your Mongoose models
const User = require('../models/userModel');
const AccountDetails = require('../models/accountDetails');
const companyModel = require('../models/companyModel');
const transactionModel = require('../models/transactionModel');

const setupAdmin = async (app) => {
  // Dynamically import AdminJS and related modules
  const { default: AdminJS } = await import('adminjs');
  const { default: AdminJSExpress } = await import('@adminjs/express');
  const AdminJSMongoose = await import('@adminjs/mongoose');

//   // Check if the correct properties are available in AdminJSMongoose
//   if (!AdminJSMongoose.Resource || !AdminJSMongoose.Database) {
//     console.error("Error: AdminJSMongoose does not have Resource or Database properties.");
//     return;
//   }

  // Register AdminJS Mongoose adapter
  AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
  });

  // Wait for MongoDB connection
  await mongoose.connect(dbUrl); // Replace with your MongoDB connection URL

  // Initialize AdminJS with your Mongoose models
  const adminJs = new AdminJS({
    rootPath: '/admin',
    resources: [
      { resource: User },
      { resource: AccountDetails },
      { resource: companyModel },
      { resource: transactionModel },
    ],
    database: mongoose.connection, // Pass mongoose connection directly
  });

  // Set up the authentication route for the Admin panel
  const router = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate: async (email, password) => {
      if (email === adminEmail && password === adminPassword) {
        return { email };
      }
      return null;
    },
    cookiePassword: adminCookie,
  });

  // Use the AdminJS route
  app.use(adminJs.options.rootPath, router);
};

module.exports = setupAdmin;
