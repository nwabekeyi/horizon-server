import { User } from '../../models/userModel.js';
import { Components } from '../components.js';
import { approveKYC, declineKYC } from '../../controllers/verificationController.js';

// Edit before hook: Detect kyc.status changes and call appropriate KYC controller
const editBeforeHook = async (request, context) => {
  const { record, currentAdmin } = context;
  console.log(`Before edit for user: ${record.params._id} by admin: ${currentAdmin?.email}`);

  if (request.method === 'post' && request.payload) {
    const newKycStatus = request.payload['kyc.status'];
    const originalKycStatus = record.params.kyc.status;

    // Check if kyc.status changed
    if (newKycStatus && newKycStatus !== originalKycStatus) {
      console.log(`KYC status change detected: ${originalKycStatus} -> ${newKycStatus}`);
      const req = {
        params: { userId: record.params._id },
      };

      try {
        if (newKycStatus === 'verified') {
          const result = await approveKYC(req);
          if (!result.success) {
            throw new Error(result.message);
          }
        } else if (newKycStatus === 'rejected') {
          const result = await declineKYC(req);
          if (!result.success) {
            throw new Error(result.message);
          }
        }
        // No action for 'pending'
        // Ensure payload reflects the updated kyc.status
        request.payload['kyc.status'] = newKycStatus;
      } catch (err) {
        throw new Error(`KYC update failed: ${err.message}`);
      }
    }
  }

  return request;
};

// Edit after hook: Log changes and customize message
const editAfterHook = async (originalResponse, request, context) => {
  const { record, currentAdmin } = context;
  console.log(`After edit for user: ${record.params._id} by admin: ${currentAdmin?.email}`, {
    response: originalResponse,
  });

  if (originalResponse.notice?.type === 'success') {
    originalResponse.notice.message = `User updated successfully by ${currentAdmin?.email}`;
  }

  return originalResponse;
};

export const userResource = {
  resource: User,
  options: {
    id: 'User',
    parent: null,
    properties: {
      _id: { isVisible: { list: false, show: true, edit: false, filter: false } },
      firstName: { isVisible: { list: true, edit: true, filter: true, show: true } },
      lastName: { isVisible: { list: true, edit: true, filter: true, show: true } },
      email: { isVisible: { list: true, edit: true, filter: true, show: true } },
      password: {
        isVisible: { list: false, edit: true, filter: false, show: false },
        type: 'password',
      },
      phone: { isVisible: { list: true, edit: true, filter: true, show: true } },
      role: { isVisible: { list: true, edit: false, filter: true, show: true } },
      status: {
        isVisible: { list: true, edit: true, filter: true, show: true },
        availableValues: [
          { value: 'verified', label: 'Verified' },
          { value: 'unverified', label: 'Unverified' },
          { value: 'suspended', label: 'Suspended' },
        ],
      },
      profilePicture: {
        isVisible: { list: true, show: true, edit: true, filter: false },
        components: {
          list: Components.ImageRenderer,
          show: Components.ImageRenderer,
        },
      },
      'kyc.status': {
        isVisible: { list: true, edit: true, filter: true, show: true },
        availableValues: [
          { value: 'pending', label: 'Pending' },
          { value: 'verified', label: 'Verified' },
          { value: 'rejected', label: 'Rejected' },
        ],
      },
      'kyc.documentType': { isVisible: { list: false, edit: true, filter: false, show: true } },
      'kyc.documentFront': {
        isVisible: { list: true, show: true, edit: true, filter: false },
        components: {
          list: Components.ImageRenderer,
          show: Components.ImageRenderer,
        },
      },
      'kyc.documentBack': {
        isVisible: { list: true, show: true, edit: true, filter: false },
        components: {
          list: Components.ImageRenderer,
          show: Components.ImageRenderer,
        },
      },
      'kyc.addressProof': {
        isVisible: { list: true, show: true, edit: true, filter: false },
        components: {
          list: Components.ImageRenderer,
          show: Components.ImageRenderer,
        },
      },
      'wallets.currency': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'wallets.address': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'wallets.balance': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'paymentDetails.currency': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'paymentDetails.accountDetails.bankName': {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
      'paymentDetails.accountDetails.accountNumber': {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
      'paymentDetails.accountDetails.accountName': {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
      'paymentDetails.accountDetails.address': {
        isVisible: { list: true, edit: true, filter: true, show: true },
      },
      'investments.companyName': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'investments.amountInvested': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'investments.currencyType': { isVisible: { list: true, edit: true, filter: true, show: true } },
      'investments.roi': { isVisible: { list: true, edit: false, filter: true, show: true } },
    },
    actions: {
      delete: {
        isAccessible: ({ currentAdmin }) => ['admin', 'superadmin'].includes(currentAdmin?.role),
      },
      new: {
        isAccessible: ({ currentAdmin }) => ['admin', 'superadmin'].includes(currentAdmin?.role),
      },
      edit: {
        isAccessible: ({ currentAdmin }) => ['admin', 'superadmin'].includes(currentAdmin?.role),
        before: [editBeforeHook],
        after: [editAfterHook],
      },
      show: {
        isAccessible: ({ currentAdmin }) => ['admin', 'superadmin'].includes(currentAdmin?.role),
      },
      list: {
        isAccessible: ({ currentAdmin }) => ['admin', 'superadmin'].includes(currentAdmin?.role),
      },
    },
  },
};