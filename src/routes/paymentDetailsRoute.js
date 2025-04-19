const express = require('express');
const {
  addPaymentDetail,
  deletePaymentDetail,
  updatePaymentDetail,
} = require('../controllers/paymentDetials');
const { apiVersion } = require('../utils/constants');

const router = express.Router();

console.log('Payment Details Routes - API Version:', apiVersion);

/**
 * @swagger
 * /api/v1/payment-details/add:
 *   post:
 *     summary: Add a new payment detail
 *     description: Adds a new payment detail (fiat or crypto) to the user's payment details array.
 *     tags:
 *       - Payment Details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - currency
 *               - accountDetails
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64ef3c2d45a1f3abcde12345"
 *               type:
 *                 type: string
 *                 enum: [fiat, crypto]
 *                 example: fiat
 *               currency:
 *                 type: string
 *                 example: usd
 *               accountDetails:
 *                 type: object
 *                 properties:
 *                   bankName:
 *                     type: string
 *                   accountNumber:
 *                     type: string
 *                   accountName:
 *                     type: string
 *                   address:
 *                     type: string
 *     responses:
 *       201:
 *         description: Payment detail added successfully
 */
router.post(`${apiVersion}/payment-details/add`, addPaymentDetail); // Changed to POST for adding a resource

/**
 * @swagger
 * /api/v1/payment-details/delete/{paymentDetailId}:
 *   delete:
 *     summary: Delete a payment detail
 *     description: Deletes a payment detail from the user's array by its ID.
 *     tags:
 *       - Payment Details
 *     parameters:
 *       - in: path
 *         name: paymentDetailId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64ef3c2d45a1f3abcde12345"
 *     responses:
 *       200:
 *         description: Payment detail deleted successfully
 */
router.delete(`${apiVersion}/payment-details/delete/:paymentDetailId`, deletePaymentDetail); // Changed to DELETE

/**
 * @swagger
 * /api/v1/payment-details/update/{paymentDetailId}:
 *   patch:
 *     summary: Update a payment detail
 *     description: Updates an existing payment detail by its ID.
 *     tags:
 *       - Payment Details
 *     parameters:
 *       - in: path
 *         name: paymentDetailId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - currency
 *               - accountDetails
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [fiat, crypto]
 *               currency:
 *                 type: string
 *               accountDetails:
 *                 type: object
 *                 properties:
 *                   bankName:
 *                     type: string
 *                   accountNumber:
 *                     type: string
 *                   accountName:
 *                     type: string
 *                   address:
 *                     type: string
 *     responses:
 *       200:
 *         description: Payment detail updated successfully
 */
router.patch(`${apiVersion}/payment-details/update/:paymentDetailId`, updatePaymentDetail);

module.exports = router;
