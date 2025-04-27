import mongoose from 'mongoose';
import { adminEmail, adminPassword, adminCookie, dbUrl } from './envConfig.js'; // Ensure this is using the correct path

// Dynamically import Mongoose models
import User from '../models/userModel.js';
import AccountDetails from '../models/accountDetails.js';
import companyModel from '../models/companyModel.js';
import transactionModel from '../models/transactionModel.js';

const setupAdmin = async (app) => {
  try {
    // Dynamically import AdminJS and related modules
    const { default: AdminJS } = await import('adminjs');
    const { default: AdminJSExpress } = await import('@adminjs/express');
    const AdminJSMongoose = await import('@adminjs/mongoose');

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

    console.log("AdminJS setup complete");

  } catch (error) {
    console.error('Error setting up AdminJS:', error);
  }
};

export default setupAdmin;
