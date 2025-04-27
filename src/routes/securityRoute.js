// routes/twoFARoutes.js
import express from 'express';
import {
  setupTwoFA,
  verifyTwoFASecret,
  requestTwoFAUpdate,
  confirmTwoFAUpdate,
  disableTwoFA,
} from '../securities/twoFactorAuth';
import { apiVersion } from '../utils/constants';

const router = express.Router();

/**
 * @swagger
 * /api/v1/twofa/setup:
 *   post:
 *     summary: Enable two-factor authentication (2FA)
 *     description: Sets up 2FA for the user by providing a secret.
 *     tags:
 *       - Two-Factor Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - secret
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 67f1407f0ebe023c867e0396
 *               secret:
 *                 type: string
 *                 example: mySecret2FA
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Missing fields or already enabled
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/twofa/setup`, (req, res, next) => {
  if (!req.user) req.user = {};
  req.user.userId = req.body.userId;
  setupTwoFA(req, res, next);
});

/**
 * @swagger
 * /api/v1/twofa/verify:
 *   post:
 *     summary: Verify 2FA secret
 *     description: Verifies the provided 2FA secret.
 *     tags:
 *       - Two-Factor Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - secret
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 67f1407f0ebe023c867e0396
 *               secret:
 *                 type: string
 *                 example: mySecret2FA
 *     responses:
 *       200:
 *         description: 2FA verified
 *       400:
 *         description: 2FA not enabled or missing info
 *       401:
 *         description: Invalid 2FA secret
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/twofa/verify`, (req, res, next) => {
  if (!req.user) req.user = {};
  req.user.userId = req.body.userId;
  verifyTwoFASecret(req, res, next);
});

/**
 * @swagger
 * /api/v1/twofa/request-update:
 *   post:
 *     summary: Request 2FA update
 *     description: Sends email to confirm 2FA secret update.
 *     tags:
 *       - Two-Factor Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *                 userId:
 *                  type: string
 *                  example: 67f1407f0ebe023c867e0396
 *     responses:
 *       200:
 *         description: Confirmation email sent
 *       500:
 *         description: Error sending confirmation
 */
router.post(`${apiVersion}/twofa/request-update`, (req, res, next) => {
  if (!req.user) req.user = {};
  req.user.userId = req.body.userId;
  requestTwoFAUpdate(req, res, next);
});

/**
 * @swagger
 * /api/v1/twofa/confirm-update/{token}:
 *   put:
 *     summary: Confirm 2FA secret update
 *     description: Confirms the secret update using token and sets the new 2FA secret.
 *     tags:
 *       - Two-Factor Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The token sent via email to verify the 2FA secret update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newSecret
 *             properties:
 *               newSecret:
 *                 type: string
 *                 description: The new 2FA secret to set
 *     responses:
 *       200:
 *         description: 2FA updated successfully
 *       400:
 *         description: Invalid token or bad request
 *       500:
 *         description: Internal server error
 */
router.put(`${apiVersion}/twofa/confirm-update/:token`, confirmTwoFAUpdate);

/**
 * @swagger
 * /api/v1/twofa/disable:
 *   delete:
 *     summary: Disable 2FA
 *     description: Disables 2FA and removes secret.
 *     tags:
 *       - Two-Factor Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *                userId:
 *                 type: string
 *                 example: 67f1407f0ebe023c867e0396
 *     responses:
 *       200:
 *         description: 2FA disabled
 *       500:
 *         description: Internal server error
 */
router.delete(`${apiVersion}/twofa/disable`, (req, res, next) => {
  if (!req.user) req.user = {};
  req.user.userId = req.body.userId;
  disableTwoFA(req, res, next);
});

export default router;
