// src/admin/resources/adminResource.js
import { Admin } from '../../models/userModel.js';

export const adminResource = {
  resource: Admin,
  options: {
    id: 'admin',
    properties: {
      _id: {
        isVisible: { list: false, show: true, edit: false, filter: false },
      },
      firstName: {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
      lastName: {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
      email: {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
      password: {
        isVisible: { list: false, edit: true, filter: false, show: false },
        type: 'password',
      },
      role: {
        isVisible: { list: true, edit: true, filter: true, show: true },
        availableValues: [
          { value: 'admin', label: 'Admin' },
          { value: 'superadmin', label: 'Superadmin' },
        ],
      },
      status: {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },

      'permissions.canManageUsers': {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
      'permissions.canManageKYC': {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
      'permissions.canViewTransactions': {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
      'permissions.canManageWallets': {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
      'permissions.canSendNotifications': {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
    },
    actions: {
      new: {
        isAccessible: ({ currentAdmin }) =>
          currentAdmin?.role === 'superadmin',
      },
      edit: {
        isAccessible: ({ currentAdmin }) =>
          currentAdmin?.role === 'superadmin',
      },
      delete: {
        isAccessible: ({ currentAdmin }) =>
          currentAdmin?.role === 'superadmin',
      },
      show: {
        isAccessible: ({ currentAdmin }) =>
          ['admin', 'superadmin'].includes(currentAdmin?.role),
      },
      list: {
        isAccessible: ({ currentAdmin }) =>
          ['admin', 'superadmin'].includes(currentAdmin?.role),
      },
    },
  },
};
