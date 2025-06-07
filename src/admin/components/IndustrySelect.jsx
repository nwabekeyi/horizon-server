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
    setCurrentValue(raw.trim().toLowerCase());
  }, [record, property.name]);

  // Fetch industry options
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoading(true);
        const res = await fetch('/admin/api/resources/Industry/actions/list', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const industryOptions = data.records.map((record) => ({
          value: record.params.industry.trim().toLowerCase(),
          label: record.params.industry,
        }));
        setIndustries(industryOptions);
      } catch (err) {
        console.error('Error fetching industries:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  const isValueValid = industries.some(option => option.value === currentValue);

  const handleChange = (value) => {
    let selectedValue;
    if (typeof value === 'string') {
      selectedValue = value;
      console.log(selectedValue);
    } else if (value?.value) {
      selectedValue = value.value;
      console.log(selectedValue);
    } else if (value?.target?.value) {
      selectedValue = value.target.value;
      console.log(selectedValue);
    } else {
      console.warn('Unexpected onChange value format:', value);
      return;
    }
    setCurrentValue(selectedValue);
    console.log(currentValue)
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
        key={industries.length} // force rerender when industry list updates
        value={currentValue}
        onChange={handleChange}
        options={industries}
        placeholder="Select an industry"
      />
      {currentValue && (
        <Text mt="sm">
          Selected industry: {currentValue}
        </Text>
      )}
    </FormGroup>
  );
};

export default IndustrySelect;
