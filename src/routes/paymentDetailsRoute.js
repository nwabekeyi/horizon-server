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
 *   patch:
 *     summary: Add a new payment detail
 *     description: Adds a new payment detail (fiat or crypto) to the user's payment details array.
 *     tags:
 *       - Payment Details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *               - accountDetails
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [fiat, crypto]
 *                 example: fiat
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
 *         description: Payment detail added successfully
 */
router.patch(`${apiVersion}/payment-details/add`, (req, res, next) => {
  console.log(`PATCH ${apiVersion}/payment-details/add called`);
  addPaymentDetail(req, res, next);
});

/**
 * @swagger
 * /api/v1/payment-details/delete/{paymentDetailId}:
 *   patch:
 *     summary: Delete a payment detail
 *     description: Deletes a payment detail from the user's array by its ID.
 *     tags:
 *       - Payment Details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentDetailId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment detail deleted successfully
 */
router.patch(`${apiVersion}/payment-details/delete/:paymentDetailId`, (req, res, next) => {
  console.log(`PATCH ${apiVersion}/payment-details/delete/${req.params.paymentDetailId} called`);
  deletePaymentDetail(req, res, next);
});

/**
 * @swagger
 * /api/v1/payment-details/update/{paymentDetailId}:
 *   patch:
 *     summary: Update a payment detail
 *     description: Updates an existing payment detail by its ID.
 *     tags:
 *       - Payment Details
 *     security:
 *       - bearerAuth: []
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
 *               - currency
 *               - accountDetails
 *             properties:
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
router.patch(`${apiVersion}/payment-details/update/:paymentDetailId`, (req, res, next) => {
  console.log(`PATCH ${apiVersion}/payment-details/update/${req.params.paymentDetailId} called`);
  updatePaymentDetail(req, res, next);
});

module.exports = router;
