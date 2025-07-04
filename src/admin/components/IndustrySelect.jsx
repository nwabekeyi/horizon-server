// src/components/IndustrySelect.js
import React, { useState, useEffect } from 'react';
import { FormGroup, Label, Select, Text } from '@adminjs/design-system';

const IndustrySelect = ({ property, record, onChange }) => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentValue, setCurrentValue] = useState('');

  // Initialize currentValue from record when component mounts or record changes
  useEffect(() => {
    const raw = record?.params?.[property.name] || '';
    const initialValue = raw.trim().toLowerCase();
    setCurrentValue(initialValue);
    console.log('Initial industry value from record:', initialValue);
  }, [record, property.name]);

  // Fetch industry options from Express API
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/v1/admin/industries', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include credentials if authentication is needed
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setIndustries(data); // API returns [{ value, label }]
        console.log('Fetched industries from localhost:5000:', data);
      } catch (err) {
        console.error('Error fetching industries:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  // Log industries when they update
  useEffect(() => {
    if (industries.length > 0) {
      console.log('Updated industries state:', industries);
    }
  }, [industries]);

  const isValueValid = industries.some((option) => option.value === currentValue);

  const handleChange = (value) => {
    let selectedValue;
    if (typeof value === 'string') {
      selectedValue = value;
    } else if (value?.value) {
      selectedValue = value.value;
    } else if (value?.target?.value) {
      selectedValue = value.target.value;
    } else {
      console.warn('Unexpected onChange value format:', value);
      return;
    }
    console.log('Selected industry:', selectedValue);
    setCurrentValue(selectedValue);
    onChange(property.name, selectedValue);
  };

  if (loading) {
    return (
      <FormGroup>
        <Label>{property.label}</Label>
        <div>Loading industries...</div>
      </FormGroup>
    );
  }

  if (error) {
    return (
      <FormGroup>
        <Label>{property.label}</Label>
        <div style={{ color: 'red' }}>Error: {error}</div>
      </FormGroup>
    );
  }

  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <Select
        key={industries.length} // Force rerender when industry list updates
        value={isValueValid ? currentValue : ''} // Ensure valid value
        onChange={handleChange}
        options={industries}
        placeholder="Select an industry"
      />
      {currentValue && isValueValid && (
        <Text mt="sm">Selected industry: {currentValue}</Text>
      )}
    </FormGroup>
  );
};

export default IndustrySelect;