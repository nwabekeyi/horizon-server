import express from 'express';
import { submitKYC, updateKYCStatus } from '../controllers/verificationController'; // Adjust path to your actual controller
import { apiVersion } from '../utils/constants';

const router = express.Router();

console.log('KYC Routes - API Version:', apiVersion);

/**
 * @swagger
 * /api/v1/kyc/submit:
 *   put:
 *     summary: Submit KYC documents
 *     description: Allows a user to submit KYC documents for verification.
 *     tags:
 *       - KYC
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - documentFront
 *               - documentBack
 *               - addressProof
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [passport, driver_license, national_id]
 *                 example: passport
 *               documentFront:
 *                 type: string
 *                 format: binary
 *               documentBack:
 *                 type: string
 *                 format: binary
 *               addressProof:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: KYC submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input or missing KYC documents
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.put(`${apiVersion}/kyc/submit`, (req, res, next) => {
  console.log(`POST ${apiVersion}/kyc/submit called`);
  console.log('Request Body:', req.body);
  submitKYC(req, res, next);
});

/**
 * @swagger
 * /api/v1/kyc/update-status:
 *   patch:
 *     summary: Update KYC status
 *     description: Allows an admin to update the KYC status of a user.
 *     tags:
 *       - KYC
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - status
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 60b8b0d0f8f8b8a8b8f8b8b8
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: approved
 *     responses:
 *       200:
 *         description: KYC status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid status or missing user ID
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.patch(`${apiVersion}/kyc/update-status`, (req, res, next) => {
  console.log(`PATCH ${apiVersion}/kyc/update-status called`);
  console.log('Request Body:', req.body);
  updateKYCStatus(req, res, next);
});

export default router;