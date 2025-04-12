const RegistrationPin = require('../../models/registrationPinModel');

const registrationPinResource = {
  resource: RegistrationPin,
  options: {
    properties: {
      email: { isVisible: { list: true, edit: true, filter: true, show: true } },
      pin: { isVisible: { list: true, edit: true, filter: true, show: true } },
      expiresAt: { isVisible: { list: true, edit: true, filter: true, show: true } },
    },
    actions: {
      edit: { isAccessible: ({ currentAdmin }) => currentAdmin.role === 'superadmin' },
      delete: { isAccessible: ({ currentAdmin }) => currentAdmin.role === 'superadmin' },
    },
  },
};

module.exports = registrationPinResource;