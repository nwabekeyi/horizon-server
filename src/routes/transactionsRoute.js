const express = require('express');
const { createTransaction, getUserTransactions, getTransactions, updateTransaction, deleteTransaction } = require('../controllers/transantionsController');
const { apiVersion } = require('../utils/constants');

const router = express.Router();

console.log('Transaction Routes - API Version:', apiVersion);

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new transaction record for a user.
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - userId
 *               - amount
 *               - currencyType
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: "TechCorp"
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed]
 *                 example: "pending"
 *               amount:
 *                 type: number
 *                 example: 100
 *               currencyType:
 *                 type: string
 *                 enum: [fiat, crypto]
 *                 example: "fiat"
 *               cryptoCurrency:
 *                 type: string
 *                 enum: [usdt, btc, eth]
 *                 example: "usdt"
 *               transactionDetails:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-04-08T12:00:00Z"
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-04-08T12:00:00Z"
 *     responses:
 *       201:
 *         description: Transaction successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     companyName:
 *                       type: string
 *                     transactionId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currencyType:
 *                       type: string
 *                     cryptoCurrency:
 *                       type: string
 *                     transactionDetails:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *       400:
 *         description: Validation error (e.g., missing fields, invalid data)
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/transactions`, (req, res, next) => {
  console.log(`POST ${apiVersion}/transactions called`);
  console.log('Request Body:', req.body);
  createTransaction(req, res, next);
});

/**
 * @swagger
 * /api/v1/transactions/user/{userId}:
 *   get:
 *     summary: Get all transactions for a user
 *     description: Retrieves all transactions associated with a specific user by their user ID.
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User's unique ID
 *     responses:
 *       200:
 *         description: List of transactions for the specified user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       companyName:
 *                         type: string
 *                       transactionId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       currencyType:
 *                         type: string
 *                       cryptoCurrency:
 *                         type: string
 *                       transactionDetails:
 *                         type: object
 *                         additionalProperties:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: User not found or no transactions found for the user
 *       500:
 *         description: Internal server error
 */
router.get(`${apiVersion}/transactions/user/:userId`, (req, res, next) => {
  console.log(`GET ${apiVersion}/transactions/user/${req.params.userId} called`);
  getUserTransactions(req, res, next);
});

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Allows an admin to retrieve a list of all transactions.
 *     tags:
 *       - Transactions
 *     responses:
 *       200:
 *         description: List of all transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       companyName:
 *                         type: string
 *                       transactionId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       currencyType:
 *                         type: string
 *                       cryptoCurrency:
 *                         type: string
 *                       transactionDetails:
 *                         type: object
 *                         additionalProperties:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(`${apiVersion}/transactions`, (req, res, next) => {
  console.log(`GET ${apiVersion}/transactions called`);
  getTransactions(req, res, next);
});

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     description: Updates the details of a specific transaction by its ID.
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction's unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed]
 *                 example: "completed"
 *               amount:
 *                 type: number
 *               currencyType:
 *                 type: string
 *                 enum: [fiat, crypto]
 *                 example: "crypto"
 *               cryptoCurrency:
 *                 type: string
 *                 enum: [usdt, btc, eth]
 *                 example: "btc"
 *               transactionDetails:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *     responses:
 *       200:
 *         description: Transaction successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     companyName:
 *                       type: string
 *                     transactionId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currencyType:
 *                       type: string
 *                     cryptoCurrency:
 *                       type: string
 *                     transactionDetails:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.put(`${apiVersion}/transactions/:id`, (req, res, next) => {
  console.log(`PUT ${apiVersion}/transactions/${req.params.id} called`);
  console.log('Request Body:', req.body);
  updateTransaction(req, res, next);
});

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     description: Deletes a specific transaction by its ID.
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction's unique ID
 *     responses:
 *       200:
 *         description: Transaction successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.delete(`${apiVersion}/transactions/:id`, (req, res, next) => {
  console.log(`DELETE ${apiVersion}/transactions/${req.params.id} called`);
  deleteTransaction(req, res, next);
});

module.exports = router;
