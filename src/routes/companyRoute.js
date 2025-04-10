const express = require('express');
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  subscribeToCompany,
} = require('../controllers/companyController');
const { apiVersion } = require('../utils/constants');
const { check } = require('express-validator');
const router = express.Router();

console.log('Company Routes - API Version:', apiVersion);

const companyValidation = [
  check('name').notEmpty().withMessage('Name is required'),
  check('establishedYear').optional().isNumeric().withMessage('Must be a number'),
  check('totalFiatInvestment').optional().isNumeric().withMessage('Must be a number'),
  check('totalCryptoInvestment').optional().isNumeric().withMessage('Must be a number'),
];

/**
 * @swagger
 * /api/v1/companies:
 *   post:
 *     summary: Create a new company
 *     tags:
 *       - Companies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               industry:
 *                 type: string
 *               location:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               establishedYear:
 *                 type: number
 *               totalFiatInvestment:
 *                 type: number
 *               totalCryptoInvestment:
 *                 type: number
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(`${apiVersion}/companies`, companyValidation, (req, res, next) => {
  console.log(`POST ${apiVersion}/companies called`);
  createCompany(req, res, next);
});

/**
 * @swagger
 * /api/v1/companies:
 *   get:
 *     summary: Get all companies
 *     tags:
 *       - Companies
 *     responses:
 *       200:
 *         description: List of companies
 *       500:
 *         description: Internal server error
 */
router.get(`${apiVersion}/companies`, (req, res, next) => {
  console.log(`GET ${apiVersion}/companies called`);
  getAllCompanies(req, res, next);
});

/**
 * @swagger
 * /api/v1/companies/{id}:
 *   get:
 *     summary: Get a single company by ID
 *     tags:
 *       - Companies
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company found
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.get(`${apiVersion}/companies/:id`, (req, res, next) => {
  console.log(`GET ${apiVersion}/companies/:id called`);
  getCompanyById(req, res, next);
});

/**
 * @swagger
 * /api/v1/companies/{id}:
 *   put:
 *     summary: Update a company
 *     tags:
 *       - Companies
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               industry:
 *                 type: string
 *               location:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               establishedYear:
 *                 type: number
 *               totalFiatInvestment:
 *                 type: number
 *               totalCryptoInvestment:
 *                 type: number
 *     responses:
 *       200:
 *         description: Company updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.put(`${apiVersion}/companies/:id`, companyValidation, (req, res, next) => {
  console.log(`PUT ${apiVersion}/companies/:id called`);
  updateCompany(req, res, next);
});

/**
 * @swagger
 * /api/v1/companies/{id}:
 *   delete:
 *     summary: Delete a company
 *     tags:
 *       - Companies
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company deleted
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.delete(`${apiVersion}/companies/:id`, (req, res, next) => {
  console.log(`DELETE ${apiVersion}/companies/:id called`);
  deleteCompany(req, res, next);
});


/**
 * @swagger
 * /api/v1/companies/subscribe:
 *   post:
 *     summary: Subscribe a user to a company and update user investments
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - userId
 *               - amount
 *               - currencyType
 *             properties:
 *               companyId:
 *                 type: string
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currencyType:
 *                 type: string
 *                 enum: [crypto, fiat]
 *     responses:
 *       200:
 *         description: Subscription successful
 *       404:
 *         description: Company or user not found
 *       500:
 *         description: Server error
 */
router.post(`${apiVersion}/companies/subscribe`, (req, res, next) => {
    console.log(`POST ${apiVersion}/companies/subscribe called`);
    subscribeToCompany(req, res, next);
  });
  

module.exports = router;
