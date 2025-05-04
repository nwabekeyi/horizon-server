// admin/resources/paymentAccountResource.js
import PaymentAccountModel from "../../models/paymentAccount";

const paymentAccountResource = {
  resource: PaymentAccountModel,
  options: {
    // navigation: {
    //   name: 'Payments',
    //   icon: 'Payment',
    // },
    properties: {
      _id: { isVisible: { list: false, filter: false, show: true, edit: false } },
      createdAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
      updatedAt: { isVisible: { list: false, filter: true, show: true, edit: false } },

      userId: {
        reference: 'User',
        isVisible: { list: true, filter: true, show: true, edit: true },
      },

      currency: {
        availableValues: [
          { value: 'usd', label: 'USD (Fiat)' },
          { value: 'usdt', label: 'USDT (Crypto)' },
        ],
      },

      // USD fields (only show if currency is 'usd')
      bankName: {
        isVisible: ({ record }) => record?.params?.currency === 'usd',
      },
      accountNumber: {
        isVisible: ({ record }) => record?.params?.currency === 'usd',
      },
      accountName: {
        isVisible: ({ record }) => record?.params?.currency === 'usd',
      },
      bankSwiftCode: {
        isVisible: ({ record }) => record?.params?.currency === 'usd',
      },

      // USDT fields (only show if currency is 'usdt')
      walletAddress: {
        isVisible: ({ record }) => record?.params?.currency === 'usdt',
      },
      network: {
        isVisible: ({ record }) => record?.params?.currency === 'usdt',
      },
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
  },
};

export default paymentAccountResource;

