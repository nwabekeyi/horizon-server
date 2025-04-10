const Company = require('../models/companyModel');
const { validationResult } = require('express-validator');
const User = require('../models/userModel'); // Adjust path if different

let investmentIdCounter = 1; // In-memory; for persistence, use a DB counter

const subscribeToCompany = async (req, res) => {
  const { companyId, userId, amount, currencyType } = req.body;

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check for existing subscriber
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

    // Add to user investments
    const newInvestment = {
      id: investmentIdCounter++,
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
    res.status(500).json({ message: 'Server error during subscription' });
  }
};

const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching companies' });
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
    res.status(500).json({ message: 'Error retrieving company' });
  }
};

const createCompany = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    description,
    industry,
    location,
    logoUrl,
    establishedYear
  } = req.body;

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
      establishedYear
    });

    const saved = await company.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating company' });
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
    res.status(500).json({ message: 'Error updating company' });
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
    res.status(500).json({ message: 'Error deleting company' });
  }
};

// Export all as an object
module.exports = {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    subscribeToCompany,
  };
  
