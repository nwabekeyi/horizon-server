const express = require('express');
const authorize = require('../middlewares/authorizationMiddleware');
const { createUser, updateUser, deleteUser, getUsers, getUser } = require('../controllers/usersController');
const { apiVersion } = require('../utils/constants');

const router = express.Router();

console.log('User Routes - API Version:', apiVersion);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     description: Registers a new user after verifying the registration PIN sent to their email.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - pin
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: horizon
 *               lastName:
 *                 type: string
 *                 example: user
 *               email:
 *                 type: string
 *                 example: horizon.user@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *               pin:
 *                 type: string
 *                 example: 1234
 *               role:
 *                 type: string
 *                 enum: [user, admin, instructor, superadmin]
 *                 default: user
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     firstName: { type: string }
 *                     lastName: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 *                     dateJoined: { type: string, format: date-time }
 *                 message: { type: string }
 *       400:
 *         description: Validation error or invalid PIN
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/users`, (req, res, next) => {
  console.log(`POST ${apiVersion}/users called`);
  console.log('Request Body:', req.body);
  createUser(req, res, next);
});

// Protected routes (Require JWT Token)
// router.use(authorize);

// Get all users (Admin only)
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     description: This endpoint allows admin to retrieve a list of all users.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(`${apiVersion}/users`, (req, res, next) => {
  console.log(`GET ${apiVersion}/users called`);
  getUsers(req, res, next);
});

// Get a user by ID (Admin or the user themselves)
/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Admin or the user themselves can retrieve their details by ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User's unique ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(`${apiVersion}/users/:id`, (req, res, next) => {
  console.log(`GET ${apiVersion}/users/${req.params.id} called`);
  getUser(req, res, next);
});

// Update a user (Admin or the user themselves)
/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Allows an admin or the user themselves to update their user information, including uploading a profile picture. The request should be multipart/form-data, containing fields such as `firstName`, `lastName`, `email`, `password`, etc., as well as an optional profile picture.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Horizon
 *               lastName:
 *                 type: string
 *                 example: User
 *               email:
 *                 type: string
 *                 example: horizon.user@gmail.com
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               role:
 *                 type: string
 *                 enum: [user, admin, instructor, superadmin]
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file upload (required for updating profile)
 *               wallets:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "wallet123"
 *               twoFA:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     example: true
 *                   method:
 *                     type: string
 *                     enum: [email, sms]
 *                     example: email
 *               referralCode:
 *                 type: string
 *                 example: "REFERRAL123"
 *               referredBy:
 *                 type: string
 *                 example: "REFERRER123"
 *               isBanned:
 *                 type: boolean
 *                 example: false
 *               transactions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "transaction123"
 *     responses:
 *       200:
 *         description: User successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     profilePicture:
 *                       type: string
 *                       description: URL or path to the uploaded profile picture
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error (e.g., missing fields, invalid data format)
 *       404:
 *         description: User not found (The user ID does not exist)
 *       500:
 *         description: Internal server error (Unexpected server issue)
 */
router.put(`${apiVersion}/users/:id`, (req, res, next) => {
  console.log(`PUT ${apiVersion}/users/${req.params.id} called`);
  console.log('Request Body:', req.body);
  updateUser(req, res, next);
});


// Delete a user (Admin only)
/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: This endpoint allows admin to delete a user by ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User's unique ID
 *     responses:
 *       200:
 *         description: User successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete(`${apiVersion}/users/:id`, (req, res, next) => {
  console.log(`DELETE ${apiVersion}/users/${req.params.id} called`);
  deleteUser(req, res, next);
});

module.exports = router;
