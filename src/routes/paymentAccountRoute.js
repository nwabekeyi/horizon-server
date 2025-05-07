import express from 'express';
import { check } from 'express-validator';
import {
  createPaymentAccount,
  getAllPaymentAccounts,
  getPaymentAccountById,
  updatePaymentAccount,
  deletePaymentAccount,
  createFiatAccount,
  createCryptoAccount,
} from '../controllers/paymentAccountController';
import { apiVersion } from '../utils/constants';

const router = express.Router();

// Validation rules for createPaymentAccount
const paymentAccountValidation = [
  check('accountNumber').notEmpty().withMessage('Account number is required'),
  check('bankName').notEmpty().withMessage('Bank name is required'),
  check('accountType').optional().isString().withMessage('Account type must be a string'),
];

// Validation rules for createFiatAccount
const fiatAccountValidation = [
  check('currency')
    .notEmpty()
    .withMessage('Currency is required')
    .equals('usd')
    .withMessage('Currency must be USD for fiat account'),
  check('bankName').notEmpty().withMessage('Bank name is required'),
  check('accountNumber').notEmpty().withMessage('Account number is required'),
  check('accountName').notEmpty().withMessage('Account name is required'),
  check('bankSwiftCode').optional().isString().withMessage('Bank Swift Code must be a string'),
];

// Validation rules for createCryptoAccount
const cryptoAccountValidation = [
  check('currency')
    .notEmpty()
    .withMessage('Currency is required')
    .equals('usdt')
    .withMessage('Currency must be USDT for crypto account'),
  check('walletAddress').notEmpty().withMessage('Wallet address is required'),
  check('network').notEmpty().withMessage('Network is required'),
];

// Middleware to log incoming requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

/**
 * @swagger
 * /api/v1/payment-accounts/fiat:
 *   post:
 *     summary: Create a new fiat payment account
 *     tags:
 *       - PaymentAccounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *               - bankName
 *               - accountNumber
 *               - accountName
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [usd]
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               accountName:
 *                 type: string
 *               bankSwiftCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fiat account created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/payment-accounts/fiat`, fiatAccountValidation, (req, res, next) => {
  console.log(`POST ${apiVersion}/payment-accounts/fiat called`);
  createFiatAccount(req, res, next);
});

/**
 * @swagger
 * /api/v1/payment-accounts/crypto:
 *   post:
 *     summary: Create a new crypto payment account
 *     tags:
 *       - PaymentAccounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *               - walletAddress
 *               - network
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [usdt]
 *               walletAddress:
 *                 type: string
 *               network:
 *                 type: string
 *     responses:
 *       201:
 *         description: Crypto account created successfully
 *       400:
 */
router.post(`${apiVersion}/payment-accounts/crypto`, cryptoAccountValidation, (req, res, next) => {
  console.log(`POST ${apiVersion}/payment-accounts/crypto called`);
  createCryptoAccount(req, res, next);
});

/**
 * @swagger
 * /api/v1/paymentAccounts:
 *   post:
 *     summary: Create a new payment account
 *     tags:
 *       - PaymentAccounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountNumber
 *               - bankName
 *             properties:
 *               accountNumber:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment account created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/paymentAccounts`, paymentAccountValidation, (req, res, next) => {
  console.log(`POST ${apiVersion}/paymentAccounts called`);
  createPaymentAccount(req, res, next);
});

/**
 * @swagger
 * /api/v1/paymentAccounts:
 *   get:
 *     summary: Get all payment accounts
 *     tags:
 *       - PaymentAccounts
 *     responses:
 *       200:
 *         description: List of payment accounts
 *       500:
 *         description: Internal server error
 */
router.get(`${apiVersion}/paymentAccounts`, (req, res, next) => {
  console.log(`GET ${apiVersion}/paymentAccounts called`);
  getAllPaymentAccounts(req, res, next);
});

/**
 * @swagger
 * /api/v1/paymentAccounts/{id}:
 *   get:
 *     summary: Get a payment account by ID
 *     tags:
 *       - PaymentAccounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment account ID
 *     responses:
 *       200:
 *         description: Payment account found
 *       404:
 *         description: Payment account not found
 *       500:
 *         description: Internal server error
 */
router.get(`${apiVersion}/paymentAccounts/:id`, (req, res, next) => {
  console.log(`GET ${apiVersion}/paymentAccounts/:id called`);
  getPaymentAccountById(req, res, next);
});

/**
 * @swagger
 * /api/v1/paymentAccounts/{id}:
 *   put:
 *     summary: Update a payment account
 *     tags:
 *       - PaymentAccounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountNumber:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment account updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Payment account not found
 *       500:
 *         description: Internal server error
 */
router.put(`${apiVersion}/paymentAccounts/:id`, paymentAccountValidation, (req, res, next) => {
  console.log(`PUT ${apiVersion}/paymentAccounts/:id called`);
  updatePaymentAccount(req, res, next);
});

/**
 * @swagger
 * /api/v1/paymentAccounts/{id}:
 *   delete:
 *     summary: Delete a payment account
 *     tags:
 *       - PaymentAccounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment account ID
 *     responses:
 *       200:
 *         description: Payment account deleted
 *       404:
 *         description: Payment account not found
 *       500:
 *         description: Internal server error
 */
router.delete(`${apiVersion}/paymentAccounts/:id`, (req, res, next) => {
  console.log(`DELETE ${apiVersion}/paymentAccounts/:id called`);
  deletePaymentAccount(req, res, next);
});

export default router;