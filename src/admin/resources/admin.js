import bcrypt from 'bcrypt'
import { Admin } from '../../models/userModel.js'

const SALT_ROUNDS = 10

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
        before: async (request) => {
          if (request.payload?.password) {
            const hashed = await bcrypt.hash(request.payload.password, SALT_ROUNDS)
            request.payload = {
              ...request.payload,
              password: hashed,
            }
          }
          return request
        },
      },
      edit: {
        before: async (request) => {
          if (request.payload?.password) {
            const hashed = await bcrypt.hash(request.payload.password, SALT_ROUNDS)
            request.payload = {
              ...request.payload,
              password: hashed,
            }
          }
          return request
        },
      },
      delete: {},
      show: {},
      list: {},
    },
  },
}
