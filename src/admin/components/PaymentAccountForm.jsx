import React, { useState, useEffect } from 'react';
import {
  FormGroup,
  Label,
  Input,
  Button,
  DrawerContent,
  Icon,
  Box,
  Text,
  Badge,
} from '@adminjs/design-system';
import { useCurrentAdmin, ApiClient, useNotice } from 'adminjs';

const PaymentAccountForm = (props) => {
  const { resource, action } = props;
  const [currentAdmin] = useCurrentAdmin();
  const api = new ApiClient();
  const sendNotice = useNotice();

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    currency: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    bankSwiftCode: '',
    walletAddress: '',
    network: '',
  });
  const [errors, setErrors] = useState({});

  // Type options
  const typeOptions = [
    { value: '', label: 'Select Type' },
    { value: 'fiat', label: 'Fiat' },
    { value: 'crypto', label: 'Crypto' },
  ];

  // Currency options based on type
  const currencyOptions = formData.type
    ? [
        { value: '', label: 'Select Currency' },
        ...(formData.type === 'fiat'
          ? [{ value: 'usd', label: 'USD (Fiat)' }]
          : [
              { value: 'usdt', label: 'USDT (Crypto)' },
              { value: 'btc', label: 'BTC (Crypto)' },
              { value: 'eth', label: 'ETH (Crypto)' },
            ]),
      ]
    : [{ value: '', label: 'Select Currency' }];

  // Network options based on currency
  const networkOptions = formData.currency
    ? [
        { value: '', label: 'Select Network' },
        ...(formData.currency === 'usdt'
          ? [
              { value: 'erc20', label: 'ERC20' },
              { value: 'trc20', label: 'TRC20' },
              { value: 'bep20', label: 'BEP20' },
            ]
          : formData.currency === 'btc'
          ? [{ value: 'btc', label: 'BTC Mainnet' }]
          : formData.currency === 'eth'
          ? [{ value: 'erc20', label: 'ERC20 (Ethereum)' }]
          : []),
      ]
    : [{ value: '', label: 'Select Network' }];

  // Debug state and options
  useEffect(() => {
    console.log('formData:', formData);
    console.log('typeOptions:', typeOptions);
    console.log('currencyOptions:', currencyOptions);
    console.log('networkOptions:', networkOptions);
    console.log('Selected type:', formData.type ? typeOptions.find((opt) => opt.value === formData.type)?.label : '');
    console.log(
      'Selected currency:',
      formData.currency ? currencyOptions.find((opt) => opt.value === formData.currency)?.label : ''
    );
    console.log(
      'Selected network:',
      formData.network ? networkOptions.find((opt) => opt.value === formData.network)?.label : ''
    );
  }, [formData]);

  // Handle input changes
  const handleChange = (name) => (event) => {
    const value = event.target.value;
    console.log(`Changing ${name} to ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'type'
        ? {
            currency: '',
            bankName: '',
            accountNumber: '',
            accountName: '',
            bankSwiftCode: '',
            walletAddress: '',
            network: '',
          }
        : name === 'currency'
        ? {
            bankName: '',
            accountNumber: '',
            accountName: '',
            bankSwiftCode: '',
            walletAddress: '',
            network: '',
          }
        : {}),
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    console.log('Form submitted, formData:', formData);

    // Validate required fields
    const requiredFields = formData.type === 'fiat'
      ? ['currency', 'bankName', 'accountNumber', 'accountName']
      : ['currency', 'walletAddress', 'network'];
    const validationErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        validationErrors[field] = `${field} is required.`;
      }
    });

    // Validate network for crypto currencies
    if (formData.type === 'crypto' && formData.currency && formData.network) {
      if (formData.currency === 'usdt' && !['erc20', 'trc20', 'bep20'].includes(formData.network)) {
        validationErrors.network = 'Network must be one of: ERC20, TRC20, BEP20 for USDT.';
      }
      if (formData.currency === 'btc' && formData.network !== 'btc') {
        validationErrors.network = 'Network must be BTC Mainnet for BTC.';
      }
      if (formData.currency === 'eth' && formData.network !== 'erc20') {
        validationErrors.network = 'Network must be ERC20 for ETH.';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation errors:', validationErrors);
      setErrors({ ...validationErrors, form: 'Please fill all required fields correctly.' });
      return;
    }

    try {
      const payload = {
        currency: formData.currency,
        ...(formData.type === 'fiat'
          ? {
              bankName: formData.bankName,
              accountNumber: formData.accountNumber,
              accountName: formData.accountName,
              bankSwiftCode: formData.bankSwiftCode,
            }
          : {
              walletAddress: formData.walletAddress,
              network: formData.network,
            }),
      };

      console.log('Constructed payload:', payload);

      // Determine endpoint based on type
      const endpoint = formData.type === 'fiat'
        ? '/api/v1/payment-accounts/fiat'
        : '/api/v1/payment-accounts/crypto';
      console.log(`Sending request to: ${endpoint}`);

      // Fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
      }

      const responseData = await response.json();
      console.log('Submission response:', responseData);

      if (responseData.success) {
        sendNotice({
          message: responseData.message || 'Payment account created successfully',
          type: 'success',
        });
        // Redirect to the payment accounts list page
        window.location.href = '/admin/resources/PaymentAccount';
      } else {
        setErrors({ form: responseData.message || 'Failed to create payment account.' });
      }
    } catch (err) {
      console.error('Submission error:', err.message, err.stack);
      setErrors({ form: `Failed to create payment account: ${err.message}` });
    }
  };

  // Handle close button click
  const handleClose = () => {
    console.log('Closing form');
    window.history.back();
  };

  // Validate required fields on blur
  const validateField = (name, value) => {
    if (name === 'type' && !value) {
      return 'Please select an account type.';
    }
    if (name === 'currency' && !value) {
      return 'Please select a currency.';
    }
    if (formData.type === 'fiat') {
      if (['bankName', 'accountNumber', 'accountName'].includes(name) && !value) {
        return `${name} is required for fiat accounts.`;
      }
    } else if (formData.type === 'crypto') {
      if (['walletAddress', 'network'].includes(name) && !value) {
        return `${name} is required for crypto accounts.`;
      }
    }
    return '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  return (
    <DrawerContent style={{ background: '#f8fafc', padding: '24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
      <form onSubmit={handleSubmit}>
        <Box
          flex
          alignItems="center"
          justifyContent="space-between"
          marginBottom="24px"
          paddingBottom="16px"
          borderBottom="1px solid #e2e8f0"
        >
          <Text as="h2" fontSize="24px" fontWeight="600" color="#1a202c">
            Create Payment Account
          </Text>
          <Icon
            icon="Close"
            size={28}
            style={{
              cursor: 'pointer',
              color: '#4a5568',
              padding: '8px',
              borderRadius: '50%',
              transition: 'background 0.2s',
            }}
            onClick={handleClose}
            title="Close form"
            hoverStyle={{ background: '#edf2f7' }}
          />
        </Box>
        {errors.form && (
          <FormGroup>
            <Badge variant="danger" style={{ padding: '8px 12px', marginBottom: '16px', display: 'block' }}>
              {errors.form}
            </Badge>
          </FormGroup>
        )}

        {/* Type Selection */}
        <FormGroup marginBottom="20px">
          <Label required>Account Type</Label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange('type')}
            onBlur={handleBlur}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              fontSize: '16px',
              background: '#fff',
              color: '#2d3748',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3182ce')}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <Text color="#e53e3e" fontSize="14px" marginTop="8px">
              {errors.type}
            </Text>
          )}
          <Text fontSize="14px" color="#718096" marginTop="8px">
            Selected: {formData.type ? typeOptions.find((opt) => opt.value === formData.type)?.label : 'None'}
          </Text>
        </FormGroup>

        {/* Currency Selection */}
        {formData.type && (
          <FormGroup marginBottom="20px">
            <Label required>Currency</Label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange('currency')}
              onBlur={handleBlur}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '10px',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
                fontSize: '16px',
                background: '#fff',
                color: '#2d3748',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3182ce')}
            >
              {currencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.currency && (
              <Text color="#e53e3e" fontSize="14px" marginTop="8px">
                {errors.currency}
              </Text>
            )}
            <Text fontSize="14px" color="#718096" marginTop="8px">
              Selected: {formData.currency ? currencyOptions.find((opt) => opt.value === formData.currency)?.label : 'None'}
            </Text>
          </FormGroup>
        )}

        {/* Fiat Fields */}
        {formData.type === 'fiat' && formData.currency && (
          <Box border="1px solid #e2e8f0" borderRadius="8px" padding="16px" marginBottom="20px" background="#fff">
            <FormGroup marginBottom="16px">
              <Label required>Bank Name</Label>
              <Input
                name="bankName"
                value={formData.bankName}
                onChange={handleChange('bankName')}
                onBlur={handleBlur}
                invalid={!!errors.bankName}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '10px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '16px',
                  background: '#fff',
                  color: '#2d3748',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3182ce')}
              />
              {errors.bankName && (
                <Text color="#e53e3e" fontSize="14px" marginTop="8px">
                  {errors.bankName}
                </Text>
              )}
            </FormGroup>
            <FormGroup marginBottom="16px">
              <Label required>Account Number</Label>
              <Input
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange('accountNumber')}
                onBlur={handleBlur}
                invalid={!!errors.accountNumber}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '10px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '16px',
                  background: '#fff',
                  color: '#2d3748',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3182ce')}
              />
              {errors.accountNumber && (
                <Text color="#e53e3e" fontSize="14px" marginTop="8px">
                  {errors.accountNumber}
                </Text>
              )}
            </FormGroup>
            <FormGroup marginBottom="16px">
              <Label required>Account Name</Label>
              <Input
                name="accountName"
                value={formData.accountName}
                onChange={handleChange('accountName')}
                onBlur={handleBlur}
                invalid={!!errors.accountName}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '10px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '16px',
                  background: '#fff',
                  color: '#2d3748',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3182ce')}
              />
              {errors.accountName && (
                <Text color="#e53e3e" fontSize="14px" marginTop="8px">
                  {errors.accountName}
                </Text>
              )}
            </FormGroup>
            <FormGroup>
              <Label>Bank Swift Code (Optional)</Label>
              <Input
                name="bankSwiftCode"
                value={formData.bankSwiftCode}
                onChange={handleChange('bankSwiftCode')}
                onBlur={handleBlur}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '10px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '16px',
                  background: '#fff',
                  color: '#2d3748',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3182ce')}
              />
            </FormGroup>
          </Box>
        )}

        {/* Crypto Fields */}
        {formData.type === 'crypto' && formData.currency && (
          <Box border="1px solid #e2e8f0" borderRadius="8px" padding="16px" marginBottom="20px" background="#fff">
            <FormGroup marginBottom="16px">
              <Label required>Wallet Address</Label>
              <Input
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange('walletAddress')}
                onBlur={handleBlur}
                invalid={!!errors.walletAddress}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '10px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '16px',
                  background: '#fff',
                  color: '#2d3748',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3182ce')}
              />
              {errors.walletAddress && (
                <Text color="#e53e3e" fontSize="14px" marginTop="8px">
                  {errors.walletAddress}
                </Text>
              )}
            </FormGroup>
            <FormGroup>
              <Label required>Network</Label>
              <select
                name="network"
                value={formData.network}
                onChange={handleChange('network')}
                onBlur={handleBlur}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '10px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '16px',
                  background: '#fff',
                  color: '#2d3748',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3182ce')}
              >
                {networkOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.network && (
                <Text color="#e53e3e" fontSize="14px" marginTop="8px">
                  {errors.network}
                </Text>
              )}
              <Text fontSize="14px" color="#718096" marginTop="8px">
                Selected: {formData.network ? networkOptions.find((opt) => opt.value === formData.network)?.label : 'None'}
              </Text>
            </FormGroup>
          </Box>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={!formData.type || !formData.currency}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '6px',
            background: !formData.type || !formData.currency ? '#a0aec0' : '#3182ce',
            color: '#fff',
            border: 'none',
            cursor: !formData.type || !formData.currency ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, transform 0.2s',
          }}
          hoverStyle={{
            background: !formData.type || !formData.currency ? '#a0aec0' : '#2b6cb0',
            transform: 'scale(1.02)',
          }}
        >
          Create Account
        </Button>
      </form>
    </DrawerContent>
  );
};

export default PaymentAccountForm;