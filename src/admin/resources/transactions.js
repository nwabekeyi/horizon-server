const Transaction = require('../../models/transactionModel');
const { User } = require('../../models/userModel');

// Dynamically import ESM modules
const getAdminJS = async () => (await import('adminjs')).default;
const getAxios = async () => (await import('axios')).default;

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
      transactionDetails: {
        isVisible: { list: false, edit: true, filter: false, show: true },
        type: 'string', // Treat as string in AdminJS UI
        components: {
          edit: async () => (await getAdminJS()).bundle('./components/TransactionDetailsEdit.jsx'),
          show: async () => (await getAdminJS()).bundle('./components/TransactionDetailsShow.jsx'),
        },
      },
      proofUrl: { isVisible: { list: true, edit: true, filter: true, show: true } },
    },
    actions: {
      approve: {
        actionType: 'record',
        icon: 'Check',
        isVisible: (context) => {
          const record = context.record;
          const user = context._admin;
          return (
            record?.params?.status === 'pending' &&
            (user?.role === 'admin' || user?.role === 'superadmin') &&
            user?.permissions?.canViewTransactions
          );
        },
        handler: async (request, response, context) => {
          const axios = await getAxios();
          const { record, currentAdmin } = context;
          const transactionId = record.params.transactionId;

          try {
            const apiResponse = await axios.patch(
              `http://localhost:5000/api/v1/transactions/approve/${transactionId}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${currentAdmin.token}`, // Adjust based on your auth setup
                },
              }
            );

            if (apiResponse.data.success) {
              record.params.status = 'completed';
              return {
                record: record.toJSON(currentAdmin),
                notice: {
                  message: 'Transaction approved successfully',
                  type: 'success',
                },
              };
            } else {
              throw new Error(apiResponse.data.message);
            }
          } catch (error) {
            return {
              record: record.toJSON(currentAdmin),
              notice: {
                message: error.message || 'Failed to approve transaction',
                type: 'error',
              },
            };
          }
        },
      },
      decline: {
        actionType: 'record',
        icon: 'X',
        isVisible: (context) => {
          const record = context.record;
          const user = context._admin;
          return (
            record?.params?.status === 'pending' &&
            (user?.role === 'admin' || user?.role === 'superadmin') &&
            user?.permissions?.canViewTransactions
          );
        },
        handler: async (request, response, context) => {
          const axios = await getAxios();
          const { record, currentAdmin } = context;
          const transactionId = record.params.transactionId;

          try {
            const apiResponse = await axios.patch(
              `http://localhost:5000/api/v1/transactions/decline/${transactionId}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${currentAdmin.token}`, // Adjust based on your auth setup
                },
              }
            );

            if (apiResponse.data.success) {
              record.params.status = 'failed';
              return {
                record: record.toJSON(currentAdmin),
                notice: {
                  message: 'Transaction declined successfully',
                  type: 'success',
                },
              };
            } else {
              throw new Error(apiResponse.data.message);
            }
          } catch (error) {
            return {
              record: record.toJSON(currentAdmin),
              notice: {
                message: error.message || 'Failed to decline transaction',
                type: 'error',
              },
            };
          }
        },
      },
    },
  },
};

module.exports = transactionResource;