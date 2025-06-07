import express from 'express';
import { loginUser, confirmPassword, registerUser, sendPasswordResetLink, resetPassword } from '../controllers/authContoller.js'; // Fixed typo: authContoller -> authController
import { apiVersion } from '../utils/constants.js';
const router = express.Router();

console.log('Auth Routes - API Version:', apiVersion);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user (generate PIN)
 *     description: Generates a 4-digit PIN and sends it to the user's email for registration verification.
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
 *               - firstName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: horizon.user@gmail.com
 *               firstName:
 *                 type: string
 *                 example: horizon
 *     responses:
 *       200:
 *         description: PIN sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: A 4-digit PIN has been sent to horizon.user@gmail.com. Please use it to complete your registration.
 *       400:
 *         description: Missing email or firstName
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/auth/register`, (req, res, next) => {
  console.log(`POST ${apiVersion}/auth/register called`);
  console.log('Request Body:', req.body);
  registerUser(req, res, next);
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     description: This endpoint allows a user to log in using email and password and returns a JWT token.
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
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: horizon.user@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     firstName: { type: string }
 *                     lastName: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/auth/login`, (req, res, next) => {
  console.log(`POST ${apiVersion}/auth/login called`);
  console.log('Request Body:', req.body);
  loginUser(req, res, next);
});

/**
 * @swagger
 * /api/v1/auth/send-password-reset-link:
 *   post:
 *     summary: Send password reset link
 *     description: Sends a password reset link to the user's email address.
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
 *                 example: horizon.user@gmail.com
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Password reset link has been sent to horizon.user@gmail.com.
 *       400:
 *         description: Missing email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/auth/send-password-reset-link`, (req, res, next) => {
  console.log(`POST ${apiVersion}/auth/send-password-reset-link called`);
  console.log('Request Body:', req.body);
  sendPasswordResetLink(req, res, next);
});

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   patch:
 *     summary: Reset user password
 *     description: Resets the user's password using a password reset token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123xyz
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Password has been successfully reset.
 *       400:
 *         description: Missing token or newPassword
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.patch(`${apiVersion}/auth/reset-password`, (req, res, next) => {
  console.log(`PATCH ${apiVersion}/auth/reset-password called`);
  console.log('Request Body:', req.body);
  resetPassword(req, res, next);
});

/**
 * @swagger
 * /api/v1/auth/confirm-password:
 *   post:
 *     summary: Confirm password
 *     description: Disables 2FA and removes secret after verifying the password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - password
 *             properties:
 *                userId:
 *                  type: string
 *                  example: 67f1407f0ebe023c867e0396
 *                password:
 *                  type: string
 *                  example: "user_password_example"
 *     responses:
 *       200:
 *         description: password confirmed
 *       400:
 *         description: Invalid password or user not found
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/auth/confirm-password`, (req, res, next) => {
  if (!req.user) req.user = {};
  req.user.userId = req.body.userId;
  req.user.password = req.body.password;  // Now accepting password as well
  confirmPassword(req, res, next);
});

export default router;
