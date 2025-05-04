// src/admin/index.js
import mongoose from 'mongoose';
import path from 'path';
import express from 'express';
import session from 'express-session';
import { adminEmail, adminPassword, adminCookie } from '../configs/envConfig';
import { Admin } from '../models/userModel';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/mongoose';
import { transactionResource } from './resources/transactions.js';
import { adminResource } from './resources/admin.js';
import { userResource } from './resources/user.js';
import { brokerFeeResource } from './resources/brokerFee.js';
import { withdrawalResource } from './resources/withdrawal.js';
import { componentLoader } from './components.js';
import paymentAccountResources from './resources/paymentAccount.js'
export { componentLoader };

export default async function setupAdminJS(app) {
  try {
    console.log('Starting AdminJS setup...');

    AdminJS.registerAdapter({ Database, Resource });

    const adminJsOptions = {
      databases: [],
      rootPath: '/admin',
      resources: [paymentAccountResources, transactionResource, adminResource, userResource, brokerFeeResource, withdrawalResource],
      componentLoader,
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
      locale: {
        language: 'en',
        translations: {
          en: {
            labels: {
              Transactions: 'Transactions',
              admin: 'Admins',
              user: 'Users',
              BrokerFee: 'Broker Fee',
              Withdrawals: 'Withdrawals',
            },
            resources: {
              Transactions: {
                properties: {
                  _id: 'ID',
                  companyName: 'Company Name',
                  transactionId: 'Transaction ID',
                  userId: 'User',
                  amount: 'Amount',
                  currencyType: 'Currency Type',
                  fiatCurrency: 'Fiat Currency',
                  cryptoCurrency: 'Crypto Currency',
                  transactionDetails: 'Transaction Details',
                  proofUrl: 'Proof Image',
                  status: 'Status',
                  createdAt: 'Created At',
                  updatedAt: 'Updated At',
                },
                actions: {
                  approve: 'Approve Transaction',
                  decline: 'Decline Transaction',
                },
                messages: {
                  confirmApproveTransaction: 'Are you sure you want to approve this transaction?',
                  confirmDeclineTransaction: 'Are you sure you want to decline this transaction?',
                  noImageAvailable: 'No image available',
                  invalidImageUrl: 'Invalid image URL',
                },
              },
              admin: {
                properties: {
                  _id: 'ID',
                  firstName: 'First Name',
                  lastName: 'Last Name',
                  email: 'Email',
                  password: 'Password',
                  role: 'Role',
                  status: 'Status',
                  'permissions.canManageUsers': 'Can Manage Users',
                  'permissions.canManageKYC': 'Can Manage KYC',
                  'permissions.canViewTransactions': 'Can View Transactions',
                  'permissions.canManageWallets': 'Can Manage Wallets',
                  'permissions.canSendNotifications': 'Can Send Notifications',
                },
                actions: {
                  new: 'Create New Admin',
                  edit: 'Edit Admin',
                  delete: 'Delete Admin',
                },
              },
              user: {
                properties: {
                  _id: 'ID',
                  firstName: 'First Name',
                  lastName: 'Last Name',
                  email: 'Email',
                  password: 'Password',
                  phone: 'Phone',
                  role: 'Role',
                  status: 'Status',
                  'kyc.status': 'KYC Status',
                  'kyc.documentType': 'KYC Document Type',
                  'wallets.currency': 'Wallet Currency',
                  'wallets.address': 'Wallet Address',
                  'wallets.balance': 'Wallet Balance',
                  'paymentDetails.currency': 'Payment Currency',
                  'paymentDetails.accountDetails.bankName': 'Bank Name',
                  'paymentDetails.accountDetails.accountNumber': 'Account Number',
                  'paymentDetails.accountDetails.accountName': 'Account Name',
                  'paymentDetails.accountDetails.address': 'Account Address',
                  'investments.companyName': 'Company Name',
                  'investments.amountInvested': 'Amount Invested',
                  'investments.currencyType': 'Investment Currency Type',
                  'investments.roi': 'ROI',
                },
                actions: {
                  new: 'Create New User',
                  edit: 'Edit User',
                  delete: 'Delete User',
                },
              },
              BrokerFee: {
                properties: {
                  _id: 'ID',
                  fee: 'Broker Fee (%)',
                  createdAt: 'Created At',
                  updatedAt: 'Updated At',
                },
                actions: {
                  edit: 'Edit Broker Fee',
                  show: 'View Broker Fee',
                  list: 'List Broker Fee',
                },
              },
              Withdrawals: {
                properties: {
                  _id: 'ID',
                  user: 'User',
                  amount: 'Amount',
                  status: 'Status',
                  'paymentAccountDetails.type': 'Account Type',
                  'paymentAccountDetails.currency': 'Currency',
                  'paymentAccountDetails.accountDetails.bankName': 'Bank Name',
                  'paymentAccountDetails.accountDetails.accountNumber': 'Account Number',
                  'paymentAccountDetails.accountDetails.accountName': 'Account Name',
                  'paymentAccountDetails.accountDetails.address': 'Crypto Address',
                  'paymentAccountDetails.accountDetails.network': 'Network',
                  withdrawalPin: 'Withdrawal PIN',
                  brokerFeeProof: 'Broker Fee Proof Image',
                  brokerFee: 'Broker Fee',
                  remarks: 'Remarks',
                  createdAt: 'Created At',
                  updatedAt: 'Updated At',
                },
                actions: {
                  new: 'Create New Withdrawal',
                  edit: 'Edit Withdrawal',
                  delete: 'Delete Withdrawal',
                  approve: 'Approve Withdrawal',
                  decline: 'Decline Withdrawal',
                },
                messages: {
                  confirmApproveWithdrawal: 'Are you sure you want to approve this withdrawal?',
                  confirmDeclineWithdrawal: 'Are you sure you want to decline this withdrawal?',
                  noImageAvailable: 'No image available',
                  invalidImageUrl: 'Invalid image URL',
                },
              },
            },
          },
        },
      },
    };

    const adminJs = new AdminJS(adminJsOptions);
    console.log('AdminJS instance created');

    // Enable watch in development to build frontend code
    if (process.env.NODE_ENV !== 'production') {
      console.log('Starting AdminJS watch for frontend bundling...');
      await adminJs.watch();
    }

    const authenticate = async (email, password) => {
      console.log('Authenticating email:', email);
      try {
        const admin = await Admin.findOne({ email }).maxTimeMS(5000);
        if (!admin || password !== admin.password) {
          console.log('Authentication failed: Invalid email or password');
          return null;
        }
        console.log('Authentication successful for:', email);
        return { email: admin.email, role: admin.role, id: admin._id };
      } catch (err) {
        console.error('Authentication error:', err.message);
        return null;
      }
    };

    const existingAdmin = await Admin.findOne({ email: adminEmail }).maxTimeMS(5000);
    if (!existingAdmin) {
      await Admin.create({
        firstName: 'Default',
        lastName: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'superadmin',
        status: 'verified',
        permissions: {
          canManageUsers: true,
          canManageKYC: true,
          canViewTransactions: true,
          canManageWallets: true,
          canSendNotifications: true,
        },
      });
      console.log('Default admin user created');
    } else if (existingAdmin.password !== adminPassword) {
      await Admin.updateOne({ email: adminEmail }, { password: adminPassword });
      console.log('Updated existing admin password');
    }

    app.set('view engine', 'ejs');
    app.set('views', path.join(path.dirname(import.meta.url), '../public/view').replace('file:', ''));

    app.get('/admin/login', (req, res) => {
      console.log('Rendering login page, session:', req.session);
      res.render('admin/login', {
        errorMessage: req.query.error || '',
        action: '/admin/login',
        companyName: '247AT',
        currentYear: new Date().getYear(),
      });
    });

    app.use(
      session({
        secret: adminCookie || 'fallback-secret-247at',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production' ? true : false,
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
        name: 'adminjs',
      })
    );

    app.use((req, res, next) => {
      console.log('Incoming request:', req.url, 'Session:', req.session);
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https://res.cloudinary.com; " +
        "connect-src 'self' http://localhost:5000; " +
        "frame-src 'none'; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'"
      );
      next();
    });

    app.post('/admin/login', async (req, res) => {
      const { email, password } = req.body;
      console.log('Login attempt:', email);
      const admin = await authenticate(email, password);
      if (admin) {
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
      console.log('Login failed, redirecting to /admin/login');
      res.redirect('/admin/login?error=Invalid%20email%20or%20password');
    });

    app.use('/admin/assets', express.static(path.join(path.dirname(import.meta.url), '../../node_modules/adminjs/lib/frontend/assets').replace('file:', '')));
    app.use('/admin/custom-assets', express.static(path.join(path.dirname(import.meta.url), '../../public').replace('file:', '')));

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
      adminJs,
      {
        authenticate,
        cookieName: 'adminjs',
        cookiePassword: adminCookie || 'fallback-secret-247at',
        loginPath: '/admin/login',
        logoutPath: '/admin/logout',
      },
      null,
      {
        secret: adminCookie || 'fallback-secret-247at',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production' ? true : false,
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
      }
    );

    app.get('/admin/logout', (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          res.status(500).send('Logout error');
          return;
        }
        console.log('Logged out, redirecting to /admin/login');
        res.redirect('/admin/login');
      });
    });

    app.use('/admin', adminRouter);
    console.log('AdminJS routes mounted at /admin');

    return { adminJs, adminRouter };
  } catch (err) {
    console.error('Error in setupAdminJS:', err);
    throw err;
  }
}