const express = require('express');
const {
  createTransaction,
  getUserTransactions,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  processPayment,
  approveTransaction,
  declineTransaction,
} = require('../controllers/transantionsController');
const { apiVersion } = require('../utils/constants');

const router = express.Router();

console.log('Transaction Routes - API Version:', apiVersion);

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new transaction record for a user with a proof of payment upload.
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - userId
 *               - amount
 *               - currencyType
 *               - proof
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
 *                 type: string
 *                 description: JSON string of additional transaction details
 *                 example: "{\"bankName\": \"Bank A\"}"
 *               proof:
 *                 type: string
 *                 format: binary
 *                 description: Proof of payment file (JPEG, PNG, WEBP)
 *     responses:
 *       201:
 *         description: Transaction successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     companyName:
 *                       type: string
 *                       example: "TechCorp"
 *                     transactionId:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     userId:
 *                       type: string
 *                       example: "user123"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     amount:
 *                       type: number
 *                       example: 100
 *                     currencyType:
 *                       type: string
 *                       example: "fiat"
 *                     cryptoCurrency:
 *                       type: string
 *                       example: null
 *                     transactionDetails:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                       example: {"bankName": "Bank A"}
 *                     proofUrl:
 *                       type: string
 *                       example: "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/proof.jpg"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-08T12:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-08T12:00:00Z"
 *       400:
 *         description: Validation error (e.g., missing fields, invalid data, no proof file)
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       companyName:
 *                         type: string
 *                         example: "TechCorp"
 *                       transactionId:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       userId:
 *                         type: string
 *                         example: "user123"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       amount:
 *                         type: number
 *                         example: 100
 *                       currencyType:
 *                         type: string
 *                         example: "fiat"
 *                       cryptoCurrency:
 *                         type: string
 *                         example: null
 *                       transactionDetails:
 *                         type: object
 *                         additionalProperties:
 *                           type: string
 *                         example: {"bankName": "Bank A"}
 *                       proofUrl:
 *                         type: string
 *                         example: "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/proof.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: No transactions found for the user
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       companyName:
 *                         type: string
 *                         example: "TechCorp"
 *                       transactionId:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       userId:
 *                         type: string
 *                         example: "user123"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       amount:
 *                         type: number
 *                         example: 100
 *                       currencyType:
 *                         type: string
 *                         example: "fiat"
 *                       cryptoCurrency:
 *                         type: string
 *                         example: null
 *                       transactionDetails:
 *                         type: object
 *                         additionalProperties:
 *                           type: string
 *                         example: {"bankName": "Bank A"}
 *                       proofUrl:
 *                         type: string
 *                         example: "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/proof.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
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
 *     description: Updates the details of a specific transaction by its ID, with an optional proof of payment upload.
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
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed]
 *                 example: "completed"
 *               amount:
 *                 type: number
 *                 example: 150
 *               currencyType:
 *                 type: string
 *                 enum: [fiat, crypto]
 *                 example: "crypto"
 *               cryptoCurrency:
 *                 type: string
 *                 enum: [usdt, btc, eth]
 *                 example: "btc"
 *               transactionDetails:
 *                 type: string
 *                 description: JSON string of additional transaction details
 *                 example: "{\"bankName\": \"Bank B\"}"
 *               proof:
 *                 type: string
 *                 format: binary
 *                 description: New proof of payment file (JPEG, PNG, WEBP)
 *     responses:
 *       200:
 *         description: Transaction successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     companyName:
 *                       type: string
 *                       example: "TechCorp"
 *                     transactionId:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     userId:
 *                       type: string
 *                       example: "user123"
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     amount:
 *                       type: number
 *                       example: 150
 *                     currencyType:
 *                       type: string
 *                       example: "crypto"
 *                     cryptoCurrency:
 *                       type: string
 *                       example: "btc"
 *                     transactionDetails:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                       example: {"bankName": "Bank B"}
 *                     proofUrl:
 *                       type: string
 *                       example: "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/new-proof.jpg"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error (e.g., invalid status)
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
 * /api/v1/transactions/process/{id}:
 *   post:
 *     summary: Process a transaction payment
 *     description: Updates the payment status of a transaction and optionally uploads a new proof of payment.
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [completed, failed]
 *                 example: "completed"
 *               proof:
 *                 type: string
 *                 format: binary
 *                 description: New proof of payment file (JPEG, PNG, WEBP)
 *     responses:
 *       200:
 *         description: Transaction payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     companyName:
 *                       type: string
 *                       example: "TechCorp"
 *                     transactionId:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     userId:
 *                       type: string
 *                       example: "user123"
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     amount:
 *                       type: number
 *                       example: 100
 *                     currencyType:
 *                       type: string
 *                       example: "fiat"
 *                     cryptoCurrency:
 *                       type: string
 *                       example: null
 *                     transactionDetails:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                       example: {"bankName": "Bank A"}
 *                     proofUrl:
 *                       type: string
 *                       example: "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/proof.jpg"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error (e.g., invalid payment status, non-pending transaction)
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/transactions/process/:id`, (req, res, next) => {
  console.log(`POST ${apiVersion}/transactions/${req.params.id}/process called`);
  console.log('Request Body:', req.body);
  processPayment(req, res, next);
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction deleted successfully"
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.delete(`${apiVersion}/transactions/:id`, (req, res, next) => {
  console.log(`DELETE ${apiVersion}/transactions/${req.params.id} called`);
  deleteTransaction(req, res, next);
});

/**
 * @swagger
 * /api/v1/transactions/approve/{transactionId}:
 *   patch:
 *     summary: Approve a transaction
 *     description: Updates the status of a pending transaction to 'completed' and adds it to the user's investments array. Restricted to admins with appropriate permissions.
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction's unique ID
 *     responses:
 *       200:
 *         description: Transaction successfully approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction approved"
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     companyName:
 *                       type: string
 *                       example: "TechCorp"
 *                     transactionId:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     userId:
 *                       type: string
 *                       example: "user123"
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     amount:
 *                       type: number
 *                       example: 100
 *                     currencyType:
 *                       type: string
 *                       example: "fiat"
 *                     cryptoCurrency:
 *                       type: string
 *                       example: null
 *                     transactionDetails:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                       example: {"bankName": "Bank A"}
 *                     proofUrl:
 *                       type: string
 *                       example: "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/proof.jpg"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Transaction is not pending
 *       403:
 *         description: Unauthorized - Insufficient permissions
 *       404:
 *         description: Transaction or user not found
 *       500:
 *         description: Internal server error
 */
router.patch(`${apiVersion}/transactions/approve/:transactionId`, ...approveTransaction);

/**
 * @swagger
 * /api/v1/transactions/decline/{transactionId}:
 *   patch:
 *     summary: Decline a transaction
 *     description: Updates the status of a pending transaction to 'failed'. Restricted to admins with appropriate permissions.
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction's unique ID
 *     responses:
 *       200:
 *         description: Transaction successfully declined
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction declined"
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     companyName:
 *                       type: string
 *                       example: "TechCorp"
 *                     transactionId:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     userId:
 *                       type: string
 *                       example: "user123"
 *                     status:
 *                       type: string
 *                       example: "failed"
 *                     amount:
 *                       type: number
 *                       example: 100
 *                     currencyType:
 *                       type: string
 *                       example: "fiat"
 *                     cryptoCurrency:
 *                       type: string
 *                       example: null
 *                     transactionDetails:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                       example: {"bankName": "Bank A"}
 *                     proofUrl:
 *                       type: string
 *                       example: "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/proof.jpg"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Transaction is not pending
 *       403:
 *         description: Unauthorized - Insufficient permissions
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.patch(`${apiVersion}/transactions/decline/:transactionId`, ...declineTransaction);

module.exports = router;