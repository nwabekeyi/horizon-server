import React from 'react';
import { Text } from '@adminjs/design-system';

const IndustryDisplay = (props) => {
  const { record, property } = props;
  return <Text>{record.params[property.name] || 'N/A'}</Text>;
};

export default IndustryDisplay;