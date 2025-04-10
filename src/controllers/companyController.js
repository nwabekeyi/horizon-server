const Company = require('../models/companyModel');
const { validationResult } = require('express-validator');
const User = require('../models/userModel'); // Adjust path if different

const subscribeToCompany = async (req, res) => {
  const { companyId, userId, amount, currencyType } = req.body;

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingSubscriber = company.subscribers.find(
      (sub) => sub.userId.toString() === userId
    );

    if (existingSubscriber) {
      if (currencyType === 'crypto') {
        existingSubscriber.cryptoAmount += amount;
        company.totalCryptoInvestment += amount;
      } else {
        existingSubscriber.fiatAmount += amount;
        company.totalFiatInvestment += amount;
      }
    } else {
      company.subscribers.push({
        userId,
        fiatAmount: currencyType === 'fiat' ? amount : 0,
        cryptoAmount: currencyType === 'crypto' ? amount : 0,
      });

      if (currencyType === 'crypto') {
        company.totalCryptoInvestment += amount;
      } else {
        company.totalFiatInvestment += amount;
      }
    }

    const investmentId = user.investments.length + 1;

    const newInvestment = {
      id: investmentId,
      companyName: company.name,
      amountInvested: amount,
      currencyType,
      investmentDate: new Date(),
      roi: 0,
    };

    user.investments.push(newInvestment);

    await company.save();
    await user.save();

    res.status(200).json({ message: 'Subscription successful', company, user });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Server error during subscription', error: error.message });
  }
};

const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({ message: 'Server error while fetching companies', error: error.message });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json(company);
  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({ message: 'Error retrieving company', error: error.message });
  }
};

const createCompany = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, industry, location, logoUrl, establishedYear } = req.body;

  try {
    const existing = await Company.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'Company name already exists' });
    }

    const company = new Company({
      name,
      description,
      industry,
      location,
      logoUrl,
      establishedYear,
    });

    const saved = await company.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Error creating company', error: error.message });
  }
};

const updateCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findByIdAndUpdate(id, req.body, { new: true });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Error updating company', error: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const deleted = await Company.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Error deleting company', error: error.message });
  }
};

// Get all unique industries from the companies without repetition
const getAllIndustries = async (req, res) => {
  console.log('GET /api/v1/companies/industries - Request received');
  try {
    // Fetch all companies, selecting only the 'industry' field
    const companies = await Company.find().select('industry');
    console.log('Companies fetched:', companies.length);

    // Check if companies exist
    if (!companies || companies.length === 0) {
      console.log('No companies found in the database');
      return res.status(404).json({ message: 'No companies found in the database' });
    }

    // Use Set to collect unique industries
    const industries = new Set();
    companies.forEach((company) => {
      if (company.industry) { // Check if industry exists and is not null/undefined
        industries.add(company.industry);
      }
    });

    console.log('Unique industries found:', industries.size);

    // If no industries found
    if (industries.size === 0) {
      console.log('No industries found in the companies');
      return res.status(404).json({ message: 'No industries found in the companies' });
    }

    // Convert Set to Array and respond
    res.status(200).json(Array.from(industries));
  } catch (error) {
    console.error('Error retrieving industries:', error.message, error.stack);
    res.status(500).json({ 
      message: 'Server error occurred while retrieving industries', 
      error: error.message 
    });
  }
};

// Get companies by a specific industry (case-insensitive)
const getCompaniesByIndustry = async (req, res) => {
  const { industry } = req.params;

  try {
    // Convert input to lowercase
    const normalizedIndustry = industry.toLowerCase();

    // Find companies with industry matched in lowercase
    const companies = await Company.find({
      industry: { $regex: new RegExp(`^${normalizedIndustry}$`, 'i') }
    });

    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: 'No companies found for this industry' });
    }

    res.status(200).json(companies);
  } catch (error) {
    console.error('Get companies by industry error:', error);
    res.status(500).json({ message: 'Error retrieving companies by industry', error: error.message });
  }
};


// Export all the controllers as an object
module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  subscribeToCompany,
  getAllIndustries, // Updated name
  getCompaniesByIndustry, // Updated name
};