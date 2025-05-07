import express from 'express';
import {
  getRecoveryEmail,
  setRecoveryEmail,
  removeRecoveryEmail,
  initiateAccountRecovery 
} from '../controllers/recoveryEmailController.js'; // Adjust path if needed
import { apiVersion } from '../utils/constants.js';

const router = express.Router();

console.log('Recovery Email Routes - API Version:', apiVersion);

/**
 * @swagger
 * /api/v1/users/{userId}/recovery-email:
 *   get:
 *     summary: Get recovery email
 *     description: Fetch the recovery email for a specific user.
 *     tags:
 *       - Recovery Email
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Recovery email fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recoveryEmail:
 *                   type: string
 *                   example: example@email.com
 *       400:
 *         description: Invalid user ID format
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(`${apiVersion}/users/:userId/recovery-email`, (req, res, next) => {
  console.log(`GET ${apiVersion}/users/:userId/recovery-email called`);
  console.log('Params:', req.params);
  getRecoveryEmail(req, res, next);
});

/**
 * @swagger
 * /api/v1/users/{userId}/recovery-email:
 *   put:
 *     summary: Set or update recovery email
 *     description: Set or update a recovery email for a specific user.
 *     tags:
 *       - Recovery Email
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recoveryEmail
 *             properties:
 *               recoveryEmail:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Recovery email updated successfully
 *       400:
 *         description: Invalid user ID or email format
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put(`${apiVersion}/users/:userId/recovery-email`, (req, res, next) => {
  console.log(`PUT ${apiVersion}/users/:userId/recovery-email called`);
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  setRecoveryEmail(req, res, next);
});

/**
 * @swagger
 * /api/v1/users/{userId}/recovery-email:
 *   delete:
 *     summary: Remove recovery email
 *     description: Deletes the recovery email from the user's profile.
 *     tags:
 *       - Recovery Email
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Recovery email removed successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete(`${apiVersion}/users/:userId/recovery-email`, (req, res, next) => {
  console.log(`DELETE ${apiVersion}/users/:userId/recovery-email called`);
  console.log('Params:', req.params);
  removeRecoveryEmail(req, res, next);
});

/**
 * @swagger
 * /api/v1/auth/recover-account:
 *   post:
 *     summary: Initiate account recovery
 *     description: Sends recovery information (temporary password and 2FA secret) to the user's recovery email.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Recovery information sent successfully
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
 *                   example: Recovery information sent to your recovery email
 *       400:
 *         description: Invalid email or recovery email not set
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Recovery email not set
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/auth/recover-account`, (req, res, next) => {
  console.log(`POST ${apiVersion}/auth/recover-account called`);
  console.log('Body:', req.body);
  initiateAccountRecovery(req, res, next);
});

export default router;