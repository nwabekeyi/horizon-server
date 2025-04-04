const express = require('express');
const authorize = require('../middlewares/authorizationMiddleware');
const {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUser,
} = require('../controllers/usersController');
const { apiVersion } = require('../utils/constants');

const router = express.Router();

// Log apiVersion for debugging
console.log('User Routes - API Version:', apiVersion);

// Public route to create a user
/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     description: This endpoint allows you to create a new user with email, password, and role.
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
 *                     dateJoined:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *     description: Admin or the user themselves can update their user data by ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User's unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *               role:
 *                 type: string
 *                 enum: [user, admin, instructor, superadmin]
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
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
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