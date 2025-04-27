// src/admin/resources/userResource.js
import { User } from '../../models/userModel.js';

export const userResource = {
  resource: User,
  resourceId: 'Users',
  options: {
    properties: {
      _id: { isVisible: { list: false, show: true, edit: false, filter: false } },
      firstName: { isVisible: { list: true, edit: true, filter: true, show: true } },
      lastName: { isVisible: { list: true, edit: true, filter: true, show: true } },
      email: { isVisible: { list: true, edit: true, filter: true, show: true } },
      password: { isVisible: { list: false, edit: true, filter: false, show: false }, type: 'password' },
      phone: { isVisible: { list: true, edit: true, filter: true, show: true } },
      role: { isVisible: { list: true, edit: false, filter: true, show: true } },
      status: {
        isVisible: { list: true, edit: true, filter: true, show: true },
        availableValues: [
          { value: 'verified', label: 'Verified' },
          { value: 'unverified', label: 'Unverified' },
          { value: 'suspended', label: 'Suspended' },
        ],
      },
      'kyc.status': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'kyc.documentType': { isVisible: { list: false, edit: true, filter: false, show: true } },
      'wallets.currency': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'wallets.address': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'wallets.balance': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'paymentDetails.currency': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'paymentDetails.accountDetails.bankName': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'paymentDetails.accountDetails.accountNumber': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'paymentDetails.accountDetails.accountName': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'paymentDetails.accountDetails.address': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'investments.companyName': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'investments.amountInvested': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'investments.currencyType': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'investments.roi': { isVisible: { list: true, edit: false, filter: true, show: true } },
    },
  },
};