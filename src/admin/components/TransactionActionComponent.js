// src/admin/components/TransactionActionComponent.js
import React, { useState } from 'react';
import { useAction, useRecord, useNotice, useActionParams } from 'adminjs';
import { Box, Button, Label, Loader, Modal, Text } from '@adminjs/design-system';

const TransactionActionComponent = (props) => {
  const { actionName } = props;
  const record = useRecord();
  const notice = useNotice();
  const { performAction, loading } = useAction(actionName);
  const [showModal, setShowModal] = useState(false);
  const actionParams = useActionParams(); // Get action configuration, including guard

  if (!record) {
    return <Box>No record found</Box>;
  }

  const guardMessage = actionParams?.guard || `Are you sure you want to ${actionName} this transaction?`;

  const handleButtonClick = () => {
    setShowModal(true); // Open modal
  };

  const handleConfirm = async () => {
    try {
      setShowModal(false); // Close modal
      console.log(`Performing ${actionName} for record:`, record.id);
      const response = await performAction({ recordId: record.id });
      console.log('Action response:', response);

      if (response?.notice?.type === 'success') {
        notice({ message: response.notice.message, type: 'success' });
      } else {
        notice({ message: response?.notice?.message || 'Action failed', type: 'error' });
      }
    } catch (err) {
      console.error('Action error:', err);
      notice({ message: 'Failed to perform action', type: 'error' });
    }
  };

  const handleCancel = () => {
    setShowModal(false); // Close modal without API call
  };

  return (
    <Box p="lg">
      <Label>Transaction Details</Label>
      <Box mb="lg">
        <p><strong>ID:</strong> {record.params.transactionId}</p>
        <p><strong>Amount:</strong> {record.params.amount} {record.params.fiatCurrency || record.params.cryptoCurrency}</p>
        <p><strong>Status:</strong> {record.params.status}</p>
        {record.params.proofUrl && (
          <p><strong>Proof:</strong> <a href={record.params.proofUrl} target="_blank" rel="noopener noreferrer">View Proof</a></p>
        )}
      </Box>
      {loading ? (
        <Loader />
      ) : (
        <Button variant="primary" onClick={handleButtonClick}>
          {actionName === 'approve' ? 'Approve Transaction' : 'Decline Transaction'}
        </Button>
      )}

      {showModal && (
        <Modal
          title={`Confirm ${actionName === 'approve' ? 'Approval' : 'Decline'}`}
          onClose={handleCancel}
          variant="primary"
          buttons={[
            {
              label: 'Cancel',
              onClick: handleCancel,
              variant: 'secondary',
            },
            {
              label: 'Confirm',
              onClick: handleConfirm,
              variant: 'primary',
            },
          ]}
        >
          <Text>{guardMessage}</Text>
        </Modal>
      )}
    </Box>
  );
};

export default TransactionActionComponent;