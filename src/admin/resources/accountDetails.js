const AccountDetails = require('../../models/accountDetails');

const accountDetailsResource = {
  resource: AccountDetails,
  options: {
    properties: {
      adminId: { isVisible: { list: true, edit: true, filter: true, show: true }, reference: 'Admin' },
      'wireTransfer.bankName': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'wireTransfer.accountNumber': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'wireTransfer.accountName': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'cryptoAccounts.eth': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'cryptoAccounts.btc': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'cryptoAccounts.usdt': { isVisible: { list: true, edit: true, filter: true, show: true } },
      updatedAt: { isVisible: { list: true, edit: false, filter: true, show: true } },
    },
    actions: {
      new: { isAccessible: ({ currentAdmin }) => currentAdmin.role === 'superadmin' },
      edit: { isAccessible: ({ currentAdmin }) => currentAdmin.role === 'superadmin' },
      delete: { isAccessible: ({ currentAdmin }) => currentAdmin.role === 'superadmin' },
    },
  },
};

module.exports = accountDetailsResource;