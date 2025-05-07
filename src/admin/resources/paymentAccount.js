import PaymentAccount from '../../models/paymentAccount';
import { Components } from '../components';

// Before hook: Log action
const beforeHook = async (request, context) => {
  const { currentAdmin, action } = context;
  console.log(`Before ${action.name} for PaymentAccount by admin: ${currentAdmin?.email}`);
  console.log('Request body:', request.body);
  console.log('Request payload:', request.payload);
  return request;
};

// After hook: Customize success/error messages
const afterHook = async (originalResponse, request, context) => {
  const { currentAdmin, action } = context;
  console.log(`After ${action.name} for PaymentAccount`, {
    response: originalResponse,
    admin: currentAdmin?.email,
  });
  if (originalResponse.notice?.type === 'success') {
    const message = action.name === 'delete'
      ? `Payment account deleted successfully by ${currentAdmin?.email}`
      : `Payment account created successfully by ${currentAdmin?.email}`;
    originalResponse.notice.message = message;
  }
  return originalResponse;
};

export const paymentAccountResource = {
  resource: PaymentAccount,
  options: {
    id: 'PaymentAccount',
    properties: {
      _id: { isVisible: { list: false, show: true, edit: false, filter: false } },
      userId: {
        reference: 'User',
        isVisible: { list: true, show: true, edit: true, filter: true },
      },
      currency: {
        isVisible: { list: true, show: true, edit: true, filter: true },
        availableValues: [
          { value: 'usd', label: 'USD (Fiat)' },
          { value: 'usdt', label: 'USDT (Crypto)' },
        ],
      },
      bankName: {
        isVisible: { list: true, show: ({ record }) => record?.params?.currency === 'usd', edit: false, filter: false },
      },
      accountNumber: {
        isVisible: { list: false, show: ({ record }) => record?.params?.currency === 'usd', edit: false, filter: false },
      },
      accountName: {
        isVisible: { list: false, show: ({ record }) => record?.params?.currency === 'usd', edit: false, filter: false },
      },
      bankSwiftCode: {
        isVisible: { list: false, show: ({ record }) => record?.params?.currency === 'usd', edit: false, filter: false },
      },
      walletAddress: {
        isVisible: { list: true, show: ({ record }) => record?.params?.currency === 'usdt', edit: false, filter: false },
      },
      network: {
        isVisible: { list: false, show: ({ record }) => record?.params?.currency === 'usdt', edit: false, filter: false },
      },
      createdAt: { isVisible: { list: true, show: true, edit: false, filter: true } },
      updatedAt: { isVisible: { list: false, show: true, edit: false, filter: true } },
    },
    listProperties: ['userId', 'currency', 'bankName', 'walletAddress', 'createdAt'],
    filterProperties: ['currency', 'userId', 'createdAt'],
    showProperties: [
      'userId',
      'currency',
      'bankName',
      'accountNumber',
      'accountName',
      'bankSwiftCode',
      'walletAddress',
      'network',
      'createdAt',
      'updatedAt',
    ],
    editProperties: [
      'userId',
      'currency',
      'bankName',
      'accountNumber',
      'accountName',
      'bankSwiftCode',
      'walletAddress',
      'network',
    ],
    actions: {
      new: { isVisible: false },
      newPaymentAccount: {
        actionType: 'resource',
        icon: 'Add',
        isVisible: true,
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
        component: Components.PaymentAccountForm,
        showInDrawer: true,
        before: [beforeHook],
        after: [afterHook],
        handler: async (request, response, context) => {
          const { currentAdmin, h } = context;
          try {
            console.log('Creating payment account, payload:', request.payload);
            console.log('Raw request body:', request.body);
            if (!currentAdmin || !['admin', 'superadmin'].includes(currentAdmin.role)) {
              throw new Error('Unauthorized - Admin or Superadmin access required');
            }
            return {
              notice: {
                message: 'Please use the form to create a payment account.',
                type: 'info',
              },
            };
          } catch (err) {
            console.error('Payment account creation error:', err.message, err.stack);
            return {
              notice: {
                message: err.message || 'Failed to process request.',
                type: 'error',
              },
            };
          }
        },
      },
      delete: {
        isVisible: true,
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
        before: [beforeHook],
        after: [afterHook],
      },
      edit: {
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
      },
      show: {
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
      },
      list: {
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
      },
    },
  },
};

export default paymentAccountResource;