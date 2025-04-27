import express from 'express';
import {
  getAllWithdrawals,
  getWithdrawalById,
  updateWithdrawal,
  deleteWithdrawal,
  approveWithdrawal,
  declineWithdrawal,
  requestWithdrawal,
  makeWithdrawal,
  markWithdrawalAsPaid,
  getWithdrawalsByUserId,
} from '../controllers/withdrawalController';
import { apiVersion } from '../utils/constants';

const router = express.Router();

console.log('Withdrawal Routes - API Version:', apiVersion);

/**
 * @swagger
 * /api/v1/withdrawals:
 *   post:
 *     summary: Request a withdrawal
 *     description: Request a new withdrawal with specified user, amount, broker fee, and broker fee proof. The brokerFee must match the percentage of the amount set in the BrokerFee model (amount * BrokerFee.fee / 100).
 *     tags:
 *       - Withdrawals
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: The ID of the user requesting the withdrawal
 *               amount:
 *                 type: number
 *                 description: The amount to withdraw (must be non-negative)
 *               brokerFee:
 *                 type: number
 *                 description: The broker fee amount, must equal (amount * BrokerFee.fee / 100) with a tolerance of 0.01
 *               brokerFeeProof:
 *                 type: string
 *                 format: binary
 *                 description: The broker fee proof file (e.g., PNG)
 *               remarks:
 *                 type: string
 *                 description: Optional remarks for the withdrawal
 *             required:
 *               - user
 *               - amount
 *               - brokerFee
 *               - brokerFeeProof
 *     responses:
 *       201:
 *         description: Withdrawal request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 withdrawalId:
 *                   type: string
 *                 brokerFeeProofUrl:
 *                   type: string
 *             example: { "message": "Withdrawal request created successfully.", "withdrawalId": "1234567890abcdef", "brokerFeeProofUrl": "/uploads/broker_fee_proofs/proof.png" }
 *       400:
 *         description: |
 *           Missing required fields, invalid data, or broker fee mismatch. Possible errors:
 *           - Missing required fields: user, amount, brokerFee, or brokerFeeProof
 *           - Amount and brokerFee must be valid numbers
 *           - Amount cannot be negative
 *           - Broker fee cannot be negative
 *           - Invalid broker fee (must match expected value)
 *           - Broker fee percentage not set
 *           - Broker fee proof upload failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Missing required fields: user, amount, brokerFee, or brokerFeeProof." }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Internal server error." }
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
 *                 withdrawals:
 *                   type: array
 *                   items:
 *                     type: object
 *             example: { "withdrawals": [] }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Internal server error." }
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
 *         description: The ID of the withdrawal
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
 *             example: { "success": true, "data": {} }
 *       404:
 *         description: Withdrawal not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Withdrawal not found." }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Internal server error." }
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
 *     description: Update the details of an existing withdrawal (e.g., amount, method).
 *     tags:
 *       - Withdrawals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the withdrawal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The updated withdrawal amount
 *               method:
 *                 type: string
 *                 description: The updated payment method
 *     responses:
 *       200:
 *         description: Withdrawal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *             example: { "message": "Withdrawal updated successfully.", "data": {} }
 *       404:
 *         description: Withdrawal not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Withdrawal not found." }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Internal server error." }
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
 *         description: The ID of the withdrawal
 *     responses:
 *       200:
 *         description: Withdrawal deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example: { "message": "Withdrawal deleted successfully." }
 *       404:
 *         description: Withdrawal not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Withdrawal not found." }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Internal server error." }
 */
router.delete(`${apiVersion}/withdrawals/:id`, (req, res, next) => {
  console.log(`DELETE ${apiVersion}/withdrawals/:id called`);
  deleteWithdrawal(req, res, next);
});

/**
 * @swagger
 * /api/v1/withdrawals/approve/{id}:
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
 *         description: The ID of the withdrawal
 *     responses:
 *       200:
 *         description: Withdrawal approved and balance updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 withdrawalId:
 *                   type: string
 *             example: { "message": "Withdrawal approved and balance updated.", "withdrawalId": "1234567890abcdef" }
 *       404:
 *         description: Withdrawal not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Withdrawal not found." }
 *       400:
 *         description: Invalid withdrawal request or already approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Withdrawal has already been approved." }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Internal server error." }
 */
router.patch(`${apiVersion}/withdrawals/approve/:id`, (req, res, next) => {
  console.log(`PATCH ${apiVersion}/withdrawals/approve/:id called`);
  approveWithdrawal(req, res, next);
});

/**
 * @swagger
 * /api/v1/withdrawals/decline/{id}:
 *   patch:
 *     summary: Decline a withdrawal
 *     description: Decline a withdrawal request, can add reason for decline.
 *     tags:
 *       - Withdrawals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the withdrawal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for declining the withdrawal
 *     responses:
 *       200:
 *         description: Withdrawal declined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 withdrawalId:
 *                   type: string
 *             example: { "message": "Withdrawal request declined.", "withdrawalId": "1234567890abcdef" }
 *       404:
 *         description: Withdrawal not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Withdrawal not found." }
 *       400:
 *         description: Invalid withdrawal request or already declined
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Withdrawal is already declined." }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Internal server error." }
 */
router.patch(`${apiVersion}/withdrawals/decline/:id`, (req, res, next) => {
  console.log(`PATCH ${apiVersion}/withdrawals/decline/:id called`);
  declineWithdrawal(req, res, next);
});

/**
 * @swagger
 * /api/v1/withdrawals/make:
 *   post:
 *     summary: Make a withdrawal
 *     description: Process a withdrawal with payment account details and PIN.
 *     tags:
 *       - Withdrawals
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               withdrawalId:
 *                 type: string
 *                 description: The ID of the withdrawal to process
 *               userId:
 *                 type: string
 *                 description: The ID of the user making the withdrawal
 *               paymentAccountDetails:
 *                 type: string
 *                 description: Payment account details for the withdrawal
 *               withdrawalPin:
 *                 type: string
 *                 description: PIN to authorize the withdrawal
 *     responses:
 *       200:
 *         description: Withdrawal is now processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 withdrawalId:
 *                   type: string
 *             example: { "message": "Withdrawal is now processing.", "withdrawalId": "1234567890abcdef" }
 *       400:
 *         description: Missing fields or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Missing required fields." }
 *       401:
 *         description: Invalid withdrawal PIN
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Invalid withdrawal PIN." }
 *       403:
 *         description: Unauthorized user mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Unauthorized: user mismatch." }
 *       404:
 *         description: Withdrawal or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Withdrawal not found." }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Internal server error." }
 */
router.post(`${apiVersion}/withdrawals/make`, (req, res, next) => {
  console.log(`POST ${apiVersion}/withdrawals/make called`);
  makeWithdrawal(req, res, next);
});

/**
 * @swagger
 * /api/v1/withdrawals/paid/{id}:
 *   patch:
 *     summary: Mark withdrawal as paid
 *     description: Mark a withdrawal as successful after payment.
 *     tags:
 *       - Withdrawals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the withdrawal
 *     responses:
 *       200:
 *         description: Withdrawal marked as successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 withdrawalId:
 *                   type: string
 *             example: { "message": "Withdrawal marked as successful.", "withdrawalId": "1234567890abcdef" }
 *       400:
 *         description: Missing payment details or already successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Withdrawal is already marked as successful." }
 *       404:
 *         description: Withdrawal not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Withdrawal not found." }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Internal server error." }
 */
router.patch(`${apiVersion}/withdrawals/paid/:id`, (req, res, next) => {
  console.log(`PATCH ${apiVersion}/withdrawals/paid/:id called`);
  markWithdrawalAsPaid(req, res, next);
});

/**
 * @swagger
 * /api/v1/withdrawals/user/{userId}:
 *   get:
 *     summary: Get withdrawals by user ID
 *     description: Retrieve all withdrawals for a specific user.
 *     tags:
 *       - Withdrawals
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: List of user withdrawals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 withdrawals:
 *                   type: array
 *                   items:
 *                     type: object
 *             example: { "withdrawals": [] }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example: { "error": "Internal server error." }
 */
router.get(`${apiVersion}/withdrawals/user/:userId`, (req, res, next) => {
  console.log(`GET ${apiVersion}/withdrawals/user/:userId called`);
  getWithdrawalsByUserId(req, res, next);
});

export default router;