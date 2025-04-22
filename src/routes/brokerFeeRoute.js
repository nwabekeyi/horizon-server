const express = require('express');
const {
  getBrokerFee,
  updateBrokerFee,
} = require('../controllers/brokersFeeController');
const { apiVersion } = require('../utils/constants');

const router = express.Router();

console.log('Broker Fee Routes - API Version:', apiVersion);

/**
 * @swagger
 * /api/v1/broker-fee:
 *   get:
 *     summary: Get broker fee
 *     description: Retrieves the current broker fee (percentage).
 *     tags:
 *       - Broker Fee
 *     responses:
 *       200:
 *         description: Broker fee retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brokerFee:
 *                   type: object
 *                   properties:
 *                     fee:
 *                       type: number
 *                       example: 5
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 */
router.get(`${apiVersion}/broker-fee`, getBrokerFee);

/**
 * @swagger
 * /api/v1/broker-fee:
 *   put:
 *     summary: Update broker fee
 *     description: Updates the broker fee (percentage). Only one fee can exist in the system.
 *     tags:
 *       - Broker Fee
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fee
 *             properties:
 *               fee:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 10
 *     responses:
 *       200:
 *         description: Broker fee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Broker fee updated successfully.
 *                 brokerFee:
 *                   type: object
 *                   properties:
 *                     fee:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 */
router.put(`${apiVersion}/broker-fee`, updateBrokerFee);

module.exports = router;
