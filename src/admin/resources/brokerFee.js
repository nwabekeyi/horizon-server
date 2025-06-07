// src/admin/resources/brokerFeeResource.js
import BrokerFee from '../../models/brokersFeeModel.js';

export const brokerFeeResource = {
  resource: BrokerFee,
  options: {
    id: 'BrokerFee',
    properties: {
      _id: { isVisible: { list: false, show: true, edit: false, filter: false } },
      fee: {
        isVisible: { list: true, show: true, edit: true, filter: true },
        type: 'number',
        props: { min: 0, max: 100, step: 0.1 },
      },
      createdAt: { isVisible: { list: true, show: true, edit: false, filter: true } },
      updatedAt: { isVisible: { list: true, show: true, edit: false, filter: true } },
    },
    actions: {
      new: { isVisible: false }, // Disable creating new records
      delete: { isVisible: false }, // Disable deletion
      edit: {
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
        before: async (request, context) => {
          const count = await BrokerFee.countDocuments();
          if (count === 0) {
            throw new Error('No broker fee record exists. Contact support to initialize.');
          }
          return request;
        },
      },
      show: {
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
      },
      list: {
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
        before: async (request, context) => {
          // Ensure only one record is shown
          const count = await BrokerFee.countDocuments();
          if (count === 0) {
            await BrokerFee.createSingle({ fee: 5 });
            console.log('Created default broker fee: 5%');
          }
          return request;
        },
      },
    },
  },
};