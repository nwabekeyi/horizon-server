const express = require('express');
const { loginUser, registerUser } = require('../controllers/authContoller'); // Fixed typo: authContoller -> authController
const { apiVersion } = require('../utils/constants');

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

module.exports = router;