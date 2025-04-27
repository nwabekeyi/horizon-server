import AdminJS from 'adminjs';
import Transaction from '../../models/transactionModel';
import { Components } from '../components.js';
import { approveTransaction, declineTransaction, deleteTransaction } from '../../controllers/transactionsController';

// Before hook: Validate transaction and log action start
const beforeHook = async (request, context) => {
  const { record, currentAdmin, action } = context;
  console.log(`Before ${action.name} for transaction: ${record.params.transactionId} by admin: ${currentAdmin?.email}`);

  if (action.name === 'delete') {
    // Optional: Add restrictions, e.g., prevent deletion of completed transactions
    // if (record.params.status === 'completed') {
    //   throw new Error('Cannot delete completed transactions');
    // }
  } else if (action.name === 'approve' || action.name === 'decline') {
    if (record.params.status !== 'pending') {
      throw new Error('Transaction is not pending');
    }
  }

  return request;
};

// After hook: Log response and customize success message
const afterHook = async (originalResponse, request, context) => {
  const { record, currentAdmin, action } = context;
  console.log(`After ${action.name} for transaction: ${record.params.transactionId}`, {
    response: originalResponse,
    admin: currentAdmin?.email,
  });

  if (originalResponse.notice?.type === 'success') {
    originalResponse.notice.message = `Transaction ${action.name}d successfully by ${currentAdmin?.email}`;
  }

  return originalResponse;
};

export const transactionResource = {
  resource: Transaction,
  options: {
    id: 'Transaction',
    properties: {
      _id: { isVisible: { list: false, show: true, edit: false, filter: false } },
      companyName: { isVisible: { list: true, show: true, edit: true, filter: true } },
      transactionId: { isVisible: { list: true, show: true, edit: false, filter: true } },
      userId: {
        isVisible: { list: true, show: true, edit: true, filter: true },
        reference: 'User',
      },
      amount: { isVisible: { list: true, show: true, edit: true, filter: true } },
      currencyType: {
        isVisible: { list: true, show: true, edit: true, filter: true },
        availableValues: [
          { value: 'fiat', label: 'Fiat' },
          { value: 'crypto', label: 'Crypto' },
        ],
      },
      fiatCurrency: {
        isVisible: { list: true, show: true, edit: true, filter: true },
        availableValues: [
          { value: 'USD', label: 'USD' },
          { value: 'CAD', label: 'CAD' },
          { value: 'EUR', label: 'EUR' },
          { value: 'GBP', label: 'GBP' },
        ],
      },
      cryptoCurrency: {
        isVisible: { list: true, show: true, edit: true, filter: true },
        availableValues: [
          { value: 'usdt', label: 'USDT' },
          { value: 'btc', label: 'BTC' },
          { value: 'eth', label: 'ETH' },
        ],
      },
      transactionDetails: { isVisible: { list: false, show: true, edit: true, filter: false } },
      proofUrl: {
        isVisible: { list: true, show: true, edit: true, filter: false },
        components: {
          list: Components.ImageRenderer,
          show: Components.ImageRenderer,
        },
      },
      status: {
        isVisible: { list: true, show: true, edit: true, filter: true },
        availableValues: [
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
          { value: 'failed', label: 'Failed' },
        ],
      },
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
        isVisible: true, // Visible for all transactions; can restrict with: (context) => context.record?.params.status !== 'completed'
        isAccessible: (context) => ['admin', 'superadmin'].includes(context.currentAdmin?.role),
        component: false,
        showInDrawer: false,
        guard: 'confirmDeleteTransaction',
        before: [beforeHook],
        after: [afterHook],
        handler: async (request, response, context) => {
          const { record, currentAdmin, h } = context;
          try {
            console.log('Delete handler called for transaction:', record.params.transactionId);

            // Authorization check
            if (!currentAdmin || !['admin', 'superadmin'].includes(currentAdmin.role)) {
              throw new Error('Unauthorized - Admin or Superadmin access required');
            }

            // Create mock req object
            const req = {
              params: { transactionId: record.params.transactionId },
            };

            // Call controller directly
            const result = await deleteTransaction(req);

            if (!result.success) {
              throw new Error(result.message || 'Failed to delete transaction');
            }

            const response = {
              record: record.toJSON(currentAdmin),
              notice: {
                message: result.message || 'Transaction deleted successfully',
                type: 'success',
              },
              redirectUrl: h.resourceActionUrl({
                resourceId: 'Transaction',
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
                message: err.message || 'Failed to delete transaction',
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
        guard: 'confirmApproveTransaction',
        before: [beforeHook],
        after: [afterHook],
        handler: async (request, response, context) => {
          const { record, currentAdmin, h } = context;
          try {
            console.log('Approve handler called for transaction:', record.params.transactionId);

            if (!currentAdmin || !['admin', 'superadmin'].includes(currentAdmin.role)) {
              throw new Error('Unauthorized - Admin or Superadmin access required');
            }

            const req = {
              params: { transactionId: record.params.transactionId },
              session: { adminUser: currentAdmin },
            };
            const res = {
              status: (code) => ({
                json: (data) => ({ code, data }),
              }),
            };

            const result = await new Promise((resolve, reject) => {
              approveTransaction[0](req, res, (err) => {
                if (err) reject(err);
                else resolve(res.status(200).json);
              });
            });

            if (!result.data.success) {
              throw new Error(result.data.message || 'Failed to approve transaction');
            }

            record.params.status = 'completed';
            await record.save();

            const response = {
              record: record.toJSON(currentAdmin),
              notice: {
                message: result.data.message || 'Transaction approved successfully',
                type: 'success',
              },
              redirectUrl: h.recordActionUrl({
                resourceId: 'Transaction',
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
                message: err.message || 'Failed to approve transaction',
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
        guard: 'confirmDeclineTransaction',
        before: [beforeHook],
        after: [afterHook],
        handler: async (request, response, context) => {
          const { record, currentAdmin, h } = context;
          try {
            console.log('Decline handler called for transaction:', record.params.transactionId);

            if (!currentAdmin || !['admin', 'superadmin'].includes(currentAdmin.role)) {
              throw new Error('Unauthorized - Admin or Superadmin access required');
            }

            const req = {
              params: { transactionId: record.params.transactionId },
              session: { adminUser: currentAdmin },
            };
            const res = {
              status: (code) => ({
                json: (data) => ({ code, data }),
              }),
            };

            const result = await new Promise((resolve, reject) => {
              declineTransaction[0](req, res, (err) => {
                if (err) reject(err);
                else resolve(res.status(200).json);
              });
            });

            if (!result.data.success) {
              throw new Error(result.data.message || 'Failed to decline transaction');
            }

            record.params.status = 'failed';
            await record.save();

            const response = {
              record: record.toJSON(currentAdmin),
              notice: {
                message: result.data.message || 'Transaction declined successfully',
                type: 'success',
              },
              redirectUrl: h.recordActionUrl({
                resourceId: 'Transaction',
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
                message: err.message || 'Failed to decline transaction',
                type: 'error',
              },
            };
          }
        },
      },
    },
  },
};