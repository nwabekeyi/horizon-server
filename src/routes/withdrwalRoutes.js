const express = require('express');
const { 
  getAllWithdrawals, 
  getWithdrawalById, 
  updateWithdrawal, 
  deleteWithdrawal, 
  approveWithdrawal, 
  declineWithdrawal, 
  requestWithdrawal 
} = require('../controllers/withdrawalController'); // Adjust path if needed
const { apiVersion } = require('../utils/constants');

const router = express.Router();

console.log('Withdrawal Routes - API Version:', apiVersion);

/**
 * @swagger
 * /api/v1/withdrawals:
 *   post:
 *     summary: Request a withdrawal
 *     description: Request a new withdrawal with specified amount and currency.
 *     tags:
 *       - Withdrawals
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Withdrawal request created successfully
 *       400:
 *         description: Insufficient balance
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/withdrawals`, (req, res, next) => {
  console.log(`POST ${apiVersion}/withdrawals called`);
  requestWithdrawal(req, res, next);
});

/**
 * @swagger
 * /api/v1/withdrawals:
 *   get:
 *     summary: Get all withdrawals
 *     description: Retrieve a list of all withdrawal requests.
 *     tags:
 *       - Withdrawals
 *     responses:
 *       200:
 *         description: List of withdrawals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.get(`${apiVersion}/withdrawals`, (req, res, next) => {
  console.log(`GET ${apiVersion}/withdrawals called`);
  getAllWithdrawals(req, res, next);
});

/**
 * @swagger
 * /api/v1/withdrawals/{id}:
 *   get:
 *     summary: Get a withdrawal by ID
 *     description: Retrieve a single withdrawal request by its ID.
 *     tags:
 *       - Withdrawals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the withdrawal.
 *     responses:
 *       200:
 *         description: Withdrawal details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Withdrawal not found
 *       500:
 *         description: Internal server error
 */
router.get(`${apiVersion}/withdrawals/:id`, (req, res, next) => {
  console.log(`GET ${apiVersion}/withdrawals/:id called`);
  getWithdrawalById(req, res, next);
});

/**
 * @swagger
 * /api/v1/withdrawals/{id}:
 *   patch:
 *     summary: Update a withdrawal
 *     description: Update the details of an existing withdrawal (e.g., amount, method, etc.).
 *     tags:
 *       - Withdrawals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the withdrawal.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal updated successfully
 *       404:
 *         description: Withdrawal not found
 *       500:
 *         description: Internal server error
 */
router.patch(`${apiVersion}/withdrawals/:id`, (req, res, next) => {
  console.log(`PATCH ${apiVersion}/withdrawals/:id called`);
  updateWithdrawal(req, res, next);
});

/**
 * @swagger
 * /api/v1/withdrawals/{id}:
 *   delete:
 *     summary: Delete a withdrawal
 *     description: Delete a withdrawal request by its ID.
 *     tags:
 *       - Withdrawals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the withdrawal.
 *     responses:
 *       200:
 *         description: Withdrawal deleted successfully
 *       404:
 *         description: Withdrawal not found
 *       500:
 *         description: Internal server error
 */
router.delete(`${apiVersion}/withdrawals/:id`, (req, res, next) => {
  console.log(`DELETE ${apiVersion}/withdrawals/:id called`);
  deleteWithdrawal(req, res, next);
});

/**
 * @swagger
 * /api/v1/withdrawals/{id}/approve:
 *   patch:
 *     summary: Approve a withdrawal
 *     description: Approve the withdrawal request, deduct balance from user, and update the status.
 *     tags:
 *       - Withdrawals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the withdrawal.
 *     responses:
 *       200:
 *         description: Withdrawal approved and balance updated
 *       404:
 *         description: Withdrawal not found
 *       400:
 *         description: Insufficient balance to approve withdrawal
 *       500:
 *         description: Internal server error
 */
router.patch(`${apiVersion}/withdrawals/:id/approve`, (req, res, next) => {
  console.log(`PATCH ${apiVersion}/withdrawals/:id/approve called`);
  approveWithdrawal(req, res, next);
});

/**
 * @swagger
 * /api/v1/withdrawals/{id}/decline:
 *   patch:
 *     summary: Decline a withdrawal
 *     description: Decline the withdrawal request and update the status to "declined".
 *     tags:
 *       - Withdrawals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the withdrawal.
 *     responses:
 *       200:
 *         description: Withdrawal declined
 *       404:
 *         description: Withdrawal not found
 *       500:
 *         description: Internal server error
 */
router.patch(`${apiVersion}/withdrawals/:id/decline`, (req, res, next) => {
  console.log(`PATCH ${apiVersion}/withdrawals/:id/decline called`);
  declineWithdrawal(req, res, next);
});

module.exports = router;
