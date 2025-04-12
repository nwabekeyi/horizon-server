const Transaction = require('../../models/transactionModel');

const transactionResource = {
  resource: Transaction,
  options: {
    properties: {
      companyName: { isVisible: { list: true, edit: true, filter: true, show: true } },
      transactionId: { isVisible: { list: true, edit: false, filter: true, show: true } },
      userId: { isVisible: { list: true, edit: true, filter: true, show: true }, reference: 'User' },
      status: {
        isVisible: { list: true, edit: true, filter: true, show: true },
        availableValues: [
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
          { value: 'failed', label: 'Failed' },
        ],
      },
      amount: { isVisible: { list: true, edit: true, filter: true, show: true } },
      currencyType: {
        isVisible: { list: true, edit: true, filter: true, show: true },
        availableValues: [
          { value: 'fiat', label: 'Fiat' },
          { value: 'crypto', label: 'Crypto' },
        ],
      },
      cryptoCurrency: {
        isVisible: { list: true, edit: true, filter: true, show: true },
        availableValues: [
          { value: 'usdt', label: 'USDT' },
          { value: 'btc', label: 'BTC' },
          { value: 'eth', label: 'ETH' },
        ],
      },
      transactionDetails: { isVisible: { list: false, edit: true, filter: false, show: true } },
      proofUrl: { isVisible: { list: true, edit: true, filter: true, show: true } },
    },
  },
};

module.exports = transactionResource;