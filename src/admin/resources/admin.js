const { Admin } = require('../../models/userModel');

const adminResource = {
  resource: Admin,
  options: {
    properties: {
      firstName: { isVisible: { list: true, edit: true, filter: true, show: true } },
      lastName: { isVisible: { list: true, edit: true, filter: true, show: true } },
      email: { isVisible: { list: true, edit: true, filter: true, show: true } },
      password: { isVisible: { list: false, edit: true, filter: false, show: false }, type: 'password' },
      role: {
        isVisible: { list: true, edit: true, filter: true, show: true },
        availableValues: [
          { value: 'admin', label: 'Admin' },
          { value: 'superadmin', label: 'Superadmin' },
        ],
      },
      status: { isVisible: { list: true, edit: true, filter: true, show: true } },
      'permissions.canManageUsers': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'permissions.canManageKYC': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'permissions.canViewTransactions': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'permissions.canManageWallets': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'permissions.canSendNotifications': { isVisible: { list: true, edit: true, filter: true, show: true } },
    },
    actions: {
      new: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'superadmin',  // Added check for undefined
      },
      edit: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'superadmin',  // Added check for undefined
      },
      delete: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'superadmin',  // Added check for undefined
      },
    },
  },
};

module.exports = adminResource;
