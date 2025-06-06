import Company from '../../models/companyModel.js';
import { componentLoader, Components } from '../components.js';

const companyResource = {
  resource: Company,
  options: {
    properties: {
      name: { isVisible: { list: true, edit: true, filter: true, show: true } },
      description: { isVisible: { list: false, edit: true, filter: false, show: true } },
      industry: {
        isVisible: { list: true, edit: true, filter: true, show: true },
        type: 'string', // Treat as string since it stores the industry name
        components: {
          edit: Components.IndustrySelect, // Custom component for edit view
          filter: Components.IndustrySelect, // Custom component for filter view
          show: Components.IndustryDisplay, // Custom component for show view
        },
      },
      location: { isVisible: { list: true, edit: true, filter: true, show: true } },
      logoUrl: { isVisible: { list: false, edit: true, filter: false, show: true } },
      establishedYear: { isVisible: { list: true, edit: true, filter: true, show: true } },
      totalFiatInvestment: { isVisible: { list: true, edit: false, filter: true, show: true } },
      totalCryptoInvestment: { isVisible: { list: true, edit: false, filter: true, show: true } },
      'subscribers.userId': {
        isVisible: { list: true, edit: true, filter: true, show: true },
        reference: 'User',
      },
      'subscribers.fiatAmount': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'subscribers.cryptoAmount': { isVisible: { list: true, edit: true, filter: true, show: true } },
    },
  },
};

export default companyResource;