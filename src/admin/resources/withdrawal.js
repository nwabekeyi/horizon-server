import AdminJS from 'adminjs';
import Withdrawal from '../../models/withdrawalModel';
import { Components } from '../components.js';
import { approveWithdrawal, declineWithdrawal, markWithdrawalAsPaid, deleteWithdrawal } from '../../controllers/withdrawalController.js';

// Before hook: Validate withdrawal status based on action
const beforeHook = async (request, context) => {
  const { record, currentAdmin, action } = context;
  console.log(`Before ${action.name} for withdrawal: ${record.params._id} by admin: ${currentAdmin?.email}`);

  if (action.name === 'markAsPaid') {
    if (record.params.status !== 'processing') {
      throw new Error('Withdrawal is not in processing state');
    }
  } else if (action.name === 'approve' || action.name === 'decline') {
    if (record.params.status !== 'pending') {
      throw new Error('Withdrawal is not pending');
    }
  } else if (action.name === 'delete') {
    // Optional: Add restrictions, e.g., prevent deletion of successful withdrawals
    // if (record.params.status === 'successful') {
    //   throw new Error('Cannot delete successful withdrawals');
    // }
  }

  return request;
};

// After hook: Log response and customize message
const afterHook = async (originalResponse, request, context) => {
  const { record, currentAdmin, action } = context;
  console.log(`After ${action.name} for withdrawal: ${record.params._id}`, {
    response: originalResponse,
    admin: currentAdmin?.email,
  });
  if (originalResponse.notice?.type === 'success') {
    originalResponse.notice.message = `Withdrawal ${action.name}d successfully by ${currentAdmin?.email}`;
  }
  return originalResponse;
};

export const withdrawalResource = {
  resource: Withdrawal,
  options: {
    id: 'Withdrawals',
    properties: {
      _id: { isVisible: { list: false, show: true, edit: false, filter: false } },
      user: {
        isVisible: { list: true, show: true, edit: true, filter: true },
        reference: 'User',
      },
      amount: { isVisible: { list: true, show: true, edit: true, filter: true } },
      status: {
        isVisible: { list: true, show: true, edit: true, filter: true },
        availableValues: [
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'failed', label: 'Failed' },
          { value: 'processing', label: 'Processing' },
          { value: 'successful', label: 'Successful' },
        ],
      },
      'paymentAccountDetails.type': { isVisible: { list: true, show: true, edit: true, filter: true } },
      'paymentAccountDetails.currency': { isVisible: { list: true, show: true, edit: true, filter: true } },
      'paymentAccountDetails.accountDetails.bankName': { isVisible: { list: false, show: true, edit: true, filter: false } },
      'paymentAccountDetails.accountDetails.accountNumber': { isVisible: { list: false, show: true, edit: true, filter: false } },
      'paymentAccountDetails.accountDetails.accountName': { isVisible: { list: false, show: true, edit: true, filter: false } },
      'paymentAccountDetails.accountDetails.address': { isVisible: { list: false, show: true, edit: true, filter: false } },
      'paymentAccountDetails.accountDetails.network': { isVisible: { list: false, show: true, edit: true, filter: false } },
      withdrawalPin: { isVisible: { list: false, show: true, edit: true, filter: false } },
      brokerFeeProof: {
        isVisible: { list: true, show: true, edit: true, filter: false },
        components: {
          list: Components.ImageRenderer,
          show: Components.ImageRenderer,
        },
      },
      brokerFee: { isVisible: { list: true, show: true, edit: true, filter: true } },
      remarks: { isVisible: { list: false, show: true, edit: true, filter: false } },
      createdAt: { isVisible: { list: true, show: true, edit: false, filter: true } },
      updatedAt: { isVisible: { list: true, show: true, edit: false, filter: true } },
    },
    actions: {
      list: {
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
      },
      show: {
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
      },
      edit: {
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
      },
      new: {
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
      },
      delete: {
        actionType: 'record',
        icon: 'Trash',
        isVisible: true, // Visible for all withdrawals; can restrict with: (context) => context.record?.params.status !== 'successful'
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
        component: false,
        showInDrawer: false,
        guard: 'confirmDeleteWithdrawal',
        before: [beforeHook],
        after: [afterHook],
        handler: async (request, response, context) => {
          const { record, currentAdmin, h } = context;
          try {
            console.log('Delete handler called for withdrawal:', record.params._id);

            // Authorization check
            if (!currentAdmin || !['admin', 'superadmin'].includes(currentAdmin.role)) {
              throw new Error('Unauthorized - Admin or Superadmin access required');
            }

            // Create mock req object
            const req = {
              params: { withdrawalId: record.params._id },
            };

            // Call controller directly
            const result = await deleteWithdrawal(req);

            if (!result.success) {
              throw new Error(result.message || 'Failed to delete withdrawal');
            }

            const response = {
              record: record.toJSON(currentAdmin),
              notice: {
                message: result.message || 'Withdrawal deleted successfully',
                type: 'success',
              },
              redirectUrl: h.resourceActionUrl({
                resourceId: 'Withdrawals',
                actionName: 'list',
              }),
            };
            console.log('Delete response:', response);
            return response;
          } catch (err) {
            console.error('Delete handler error:', err.message);
            return {
              record: record.toJSON(currentAdmin),
              notice: {
                message: err.message || 'Failed to delete withdrawal',
                type: 'error',
              },
            };
          }
        },
      },
      approve: {
        actionType: 'record',
        icon: 'Check',
        isVisible: (context) => context.record?.params.status === 'pending',
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
        component: false,
        showInDrawer: false,
        guard: 'confirmApproveWithdrawal',
        before: [beforeHook],
        after: [afterHook],
        handler: async (request, response, context) => {
          const { record, currentAdmin, h } = context;
          try {
            console.log('Approve handler called for withdrawal:', record.params._id);

            // Authorization check
            if (!currentAdmin || !['admin', 'superadmin'].includes(currentAdmin.role)) {
              throw new Error('Unauthorized - Admin or Superadmin access required');
            }

            // Create mock req object
            const req = {
              params: { withdrawalId: record.params._id },
            };

            // Call controller directly
            const result = await approveWithdrawal(req);

            if (!result.success) {
              throw new Error(result.message || 'Failed to approve withdrawal');
            }

            // Update the record to reflect the new status
            record.params.status = 'approved';
            await record.save();

            const response = {
              record: record.toJSON(currentAdmin),
              notice: {
                message: 'Withdrawal approved successfully',
                type: 'success',
              },
              redirectUrl: h.recordActionUrl({
                resourceId: 'Withdrawals',
                recordId: record.id(),
                actionName: 'show',
              }),
            };
            console.log('Approve response:', response);
            return response;
          } catch (err) {
            console.error('Approve handler error:', err.message);
            return {
              record: record.toJSON(currentAdmin),
              notice: {
                message: err.message || 'Failed to approve withdrawal',
                type: 'error',
              },
            };
          }
        },
      },
      decline: {
        actionType: 'record',
        icon: 'X',
        isVisible: (context) => context.record?.params.status === 'pending',
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
        component: false,
        showInDrawer: false,
        guard: 'confirmDeclineWithdrawal',
        before: [beforeHook],
        after: [afterHook],
        handler: async (request, response, context) => {
          const { record, currentAdmin, h } = context;
          try {
            console.log('Decline handler called for withdrawal:', record.params._id);

            // Authorization check
            if (!currentAdmin || !['admin', 'superadmin'].includes(currentAdmin.role)) {
              throw new Error('Unauthorized - Admin or Superadmin access required');
            }

            // Create mock req object with optional reason
            const req = {
              params: { withdrawalId: record.params._id },
              body: { reason: request.payload?.reason || '' },
            };

            // Call controller directly
            const result = await declineWithdrawal(req);

            if (!result.success) {
              throw new Error(result.message || 'Failed to decline withdrawal');
            }

            // Update the record to reflect the new status
            record.params.status = 'failed';
            await record.save();

            const response = {
              record: record.toJSON(currentAdmin),
              notice: {
                message: 'Withdrawal declined successfully',
                type: 'success',
              },
              redirectUrl: h.recordActionUrl({
                resourceId: 'Withdrawals',
                recordId: record.id(),
                actionName: 'show',
              }),
            };
            console.log('Decline response:', response);
            return response;
          } catch (err) {
            console.error('Decline handler error:', err.message);
            return {
              record: record.toJSON(currentAdmin),
              notice: {
                message: err.message || 'Failed to decline withdrawal',
                type: 'error',
              },
            };
          }
        },
      },
      markAsPaid: {
        actionType: 'record',
        icon: 'DollarSign',
        isVisible: (context) => context.record?.params.status === 'processing',
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
        component: false,
        showInDrawer: false,
        guard: 'confirmMarkWithdrawalAsPaid',
        before: [beforeHook],
        after: [afterHook],
        handler: async (request, response, context) => {
          const { record, currentAdmin, h } = context;
          try {
            console.log('MarkAsPaid handler called for withdrawal:', record.params._id);

            // Authorization check
            if (!currentAdmin || !['admin', 'superadmin'].includes(currentAdmin.role)) {
              throw new Error('Unauthorized - Admin or Superadmin access required');
            }

            // Create mock req object
            const req = {
              params: { withdrawalId: record.params._id },
            };

            // Call controller directly
            const result = await markWithdrawalAsPaid(req);

            if (!result.success) {
              throw new Error(result.message || 'Failed to mark withdrawal as paid');
            }

            // Update the record to reflect the new status
            record.params.status = 'successful';
            await record.save();

            const response = {
              record: record.toJSON(currentAdmin),
              notice: {
                message: 'Withdrawal marked as paid successfully',
                type: 'success',
              },
              redirectUrl: h.recordActionUrl({
                resourceId: 'Withdrawals',
                recordId: record.id(),
                actionName: 'show',
              }),
            };
            console.log('MarkAsPaid response:', response);
            return response;
          } catch (err) {
            console.error('MarkAsPaid handler error:', err.message);
            return {
              record: record.toJSON(currentAdmin),
              notice: {
                message: err.message || 'Failed to mark withdrawal as paid',
                type: 'error',
              },
            };
          }
        },
      },
    },
  },
};