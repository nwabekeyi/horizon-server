// src/admin/components/HomeLinkButton.jsx
import React from 'react';
import { Icon, Button } from '@adminjs/design-system';

const HomeLinkButton = () => {
  const goToHome = () => {
    window.location.href = '/admin'; // Navigate to custom dashboard
  };

  return (
    <Button variant="primary" onClick={goToHome} style={{ display: 'flex', alignItems: 'center', margin: '10px' }}>
      <Icon icon="ArrowLeft" style={{ marginRight: '8px' }} />
      Back to Home
    </Button>
  );
};

export default HomeLinkButton;