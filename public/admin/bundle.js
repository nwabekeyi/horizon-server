(function (React, designSystem, adminjs) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  // src/admin/components/ImageRenderer.jsx
  const ImageRenderer = props => {
    const {
      record,
      property
    } = props;
    const imageUrl = record.params[property.name];
    const [error, setError] = React.useState(null);
    const handleError = () => {
      setError('Failed to load image. It may be blocked by security policies or invalid.');
    };
    if (!imageUrl) {
      return /*#__PURE__*/React__default.default.createElement("span", null, "No image available");
    }
    return /*#__PURE__*/React__default.default.createElement("div", null, error ? /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        color: 'red'
      }
    }, error) : /*#__PURE__*/React__default.default.createElement("img", {
      src: imageUrl,
      alt: "Proof",
      style: {
        maxWidth: '200px'
      },
      onError: handleError
    }));
  };

  // src/admin/components/HomeLinkButton.jsx
  const HomeLinkButton = () => {
    const goToHome = () => {
      window.location.href = '/admin'; // Navigate to custom dashboard
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      onClick: goToHome,
      style: {
        display: 'flex',
        alignItems: 'center',
        margin: '10px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "ArrowLeft",
      style: {
        marginRight: '8px'
      }
    }), "Back to Home");
  };

  const PaymentAccountForm = props => {
    const {
      resource,
      action
    } = props;
    const [currentAdmin] = adminjs.useCurrentAdmin();
    new adminjs.ApiClient();
    const sendNotice = adminjs.useNotice();

    // Form state
    const [formData, setFormData] = React.useState({
      type: '',
      currency: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
      bankSwiftCode: '',
      walletAddress: '',
      network: ''
    });
    const [errors, setErrors] = React.useState({});

    // Type options
    const typeOptions = [{
      value: '',
      label: 'Select Type'
    }, {
      value: 'fiat',
      label: 'Fiat'
    }, {
      value: 'crypto',
      label: 'Crypto'
    }];

    // Currency options based on type
    const currencyOptions = formData.type ? [{
      value: '',
      label: 'Select Currency'
    }, ...(formData.type === 'fiat' ? [{
      value: 'usd',
      label: 'USD (Fiat)'
    }] : [{
      value: 'usdt',
      label: 'USDT (Crypto)'
    }, {
      value: 'btc',
      label: 'BTC (Crypto)'
    }, {
      value: 'eth',
      label: 'ETH (Crypto)'
    }])] : [{
      value: '',
      label: 'Select Currency'
    }];

    // Network options based on currency
    const networkOptions = formData.currency ? [{
      value: '',
      label: 'Select Network'
    }, ...(formData.currency === 'usdt' ? [{
      value: 'erc20',
      label: 'ERC20'
    }, {
      value: 'trc20',
      label: 'TRC20'
    }, {
      value: 'bep20',
      label: 'BEP20'
    }] : formData.currency === 'btc' ? [{
      value: 'btc',
      label: 'BTC Mainnet'
    }] : formData.currency === 'eth' ? [{
      value: 'erc20',
      label: 'ERC20 (Ethereum)'
    }] : [])] : [{
      value: '',
      label: 'Select Network'
    }];

    // Debug state and options
    React.useEffect(() => {
      console.log('formData:', formData);
      console.log('typeOptions:', typeOptions);
      console.log('currencyOptions:', currencyOptions);
      console.log('networkOptions:', networkOptions);
      console.log('Selected type:', formData.type ? typeOptions.find(opt => opt.value === formData.type)?.label : '');
      console.log('Selected currency:', formData.currency ? currencyOptions.find(opt => opt.value === formData.currency)?.label : '');
      console.log('Selected network:', formData.network ? networkOptions.find(opt => opt.value === formData.network)?.label : '');
    }, [formData]);

    // Handle input changes
    const handleChange = name => event => {
      const value = event.target.value;
      console.log(`Changing ${name} to ${value}`);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...(name === 'type' ? {
          currency: '',
          bankName: '',
          accountNumber: '',
          accountName: '',
          bankSwiftCode: '',
          walletAddress: '',
          network: ''
        } : name === 'currency' ? {
          bankName: '',
          accountNumber: '',
          accountName: '',
          bankSwiftCode: '',
          walletAddress: '',
          network: ''
        } : {})
      }));
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    };

    // Handle form submission
    const handleSubmit = async e => {
      e.preventDefault();
      setErrors({});
      console.log('Form submitted, formData:', formData);

      // Validate required fields
      const requiredFields = formData.type === 'fiat' ? ['currency', 'bankName', 'accountNumber', 'accountName'] : ['currency', 'walletAddress', 'network'];
      const validationErrors = {};
      requiredFields.forEach(field => {
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
        setErrors({
          ...validationErrors,
          form: 'Please fill all required fields correctly.'
        });
        return;
      }
      try {
        const payload = {
          currency: formData.currency,
          ...(formData.type === 'fiat' ? {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            accountName: formData.accountName,
            bankSwiftCode: formData.bankSwiftCode
          } : {
            walletAddress: formData.walletAddress,
            network: formData.network
          })
        };
        console.log('Constructed payload:', payload);

        // Determine endpoint based on type
        const endpoint = formData.type === 'fiat' ? '/api/v1/payment-accounts/fiat' : '/api/v1/payment-accounts/crypto';
        console.log(`Sending request to: ${endpoint}`);

        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(payload),
          signal: controller.signal
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
            type: 'success'
          });
          // Redirect to the payment accounts list page
          window.location.href = '/admin/resources/PaymentAccount';
        } else {
          setErrors({
            form: responseData.message || 'Failed to create payment account.'
          });
        }
      } catch (err) {
        console.error('Submission error:', err.message, err.stack);
        setErrors({
          form: `Failed to create payment account: ${err.message}`
        });
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
    const handleBlur = e => {
      const {
        name,
        value
      } = e.target;
      const error = validateField(name, value);
      if (error) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.DrawerContent, {
      style: {
        background: '#f8fafc',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }
    }, /*#__PURE__*/React__default.default.createElement("form", {
      onSubmit: handleSubmit
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "24px",
      paddingBottom: "16px",
      borderBottom: "1px solid #e2e8f0"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      as: "h2",
      fontSize: "24px",
      fontWeight: "600",
      color: "#1a202c"
    }, "Create Payment Account"), /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Close",
      size: 28,
      style: {
        cursor: 'pointer',
        color: '#4a5568',
        padding: '8px',
        borderRadius: '50%',
        transition: 'background 0.2s'
      },
      onClick: handleClose,
      title: "Close form",
      hoverStyle: {
        background: '#edf2f7'
      }
    })), errors.form && /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, null, /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      variant: "danger",
      style: {
        padding: '8px 12px',
        marginBottom: '16px',
        display: 'block'
      }
    }, errors.form)), /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, {
      marginBottom: "20px"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Account Type"), /*#__PURE__*/React__default.default.createElement("select", {
      name: "type",
      value: formData.type,
      onChange: handleChange('type'),
      onBlur: handleBlur,
      style: {
        width: '100%',
        maxWidth: '400px',
        padding: '10px',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        fontSize: '16px',
        background: '#fff',
        color: '#2d3748',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      },
      onFocus: e => e.target.style.borderColor = '#3182ce'
    }, typeOptions.map(option => /*#__PURE__*/React__default.default.createElement("option", {
      key: option.value,
      value: option.value
    }, option.label))), errors.type && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "#e53e3e",
      fontSize: "14px",
      marginTop: "8px"
    }, errors.type), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontSize: "14px",
      color: "#718096",
      marginTop: "8px"
    }, "Selected: ", formData.type ? typeOptions.find(opt => opt.value === formData.type)?.label : 'None')), formData.type && /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, {
      marginBottom: "20px"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Currency"), /*#__PURE__*/React__default.default.createElement("select", {
      name: "currency",
      value: formData.currency,
      onChange: handleChange('currency'),
      onBlur: handleBlur,
      style: {
        width: '100%',
        maxWidth: '400px',
        padding: '10px',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        fontSize: '16px',
        background: '#fff',
        color: '#2d3748',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      },
      onFocus: e => e.target.style.borderColor = '#3182ce'
    }, currencyOptions.map(option => /*#__PURE__*/React__default.default.createElement("option", {
      key: option.value,
      value: option.value
    }, option.label))), errors.currency && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "#e53e3e",
      fontSize: "14px",
      marginTop: "8px"
    }, errors.currency), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontSize: "14px",
      color: "#718096",
      marginTop: "8px"
    }, "Selected: ", formData.currency ? currencyOptions.find(opt => opt.value === formData.currency)?.label : 'None')), formData.type === 'fiat' && formData.currency && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "20px",
      background: "#fff"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, {
      marginBottom: "16px"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Bank Name"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "bankName",
      value: formData.bankName,
      onChange: handleChange('bankName'),
      onBlur: handleBlur,
      invalid: !!errors.bankName,
      style: {
        width: '100%',
        maxWidth: '400px',
        padding: '10px',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        fontSize: '16px',
        background: '#fff',
        color: '#2d3748',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      },
      onFocus: e => e.target.style.borderColor = '#3182ce'
    }), errors.bankName && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "#e53e3e",
      fontSize: "14px",
      marginTop: "8px"
    }, errors.bankName)), /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, {
      marginBottom: "16px"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Account Number"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "accountNumber",
      value: formData.accountNumber,
      onChange: handleChange('accountNumber'),
      onBlur: handleBlur,
      invalid: !!errors.accountNumber,
      style: {
        width: '100%',
        maxWidth: '400px',
        padding: '10px',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        fontSize: '16px',
        background: '#fff',
        color: '#2d3748',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      },
      onFocus: e => e.target.style.borderColor = '#3182ce'
    }), errors.accountNumber && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "#e53e3e",
      fontSize: "14px",
      marginTop: "8px"
    }, errors.accountNumber)), /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, {
      marginBottom: "16px"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Account Name"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "accountName",
      value: formData.accountName,
      onChange: handleChange('accountName'),
      onBlur: handleBlur,
      invalid: !!errors.accountName,
      style: {
        width: '100%',
        maxWidth: '400px',
        padding: '10px',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        fontSize: '16px',
        background: '#fff',
        color: '#2d3748',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      },
      onFocus: e => e.target.style.borderColor = '#3182ce'
    }), errors.accountName && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "#e53e3e",
      fontSize: "14px",
      marginTop: "8px"
    }, errors.accountName)), /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, null, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, "Bank Swift Code (Optional)"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "bankSwiftCode",
      value: formData.bankSwiftCode,
      onChange: handleChange('bankSwiftCode'),
      onBlur: handleBlur,
      style: {
        width: '100%',
        maxWidth: '400px',
        padding: '10px',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        fontSize: '16px',
        background: '#fff',
        color: '#2d3748',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      },
      onFocus: e => e.target.style.borderColor = '#3182ce'
    }))), formData.type === 'crypto' && formData.currency && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "20px",
      background: "#fff"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, {
      marginBottom: "16px"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Wallet Address"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "walletAddress",
      value: formData.walletAddress,
      onChange: handleChange('walletAddress'),
      onBlur: handleBlur,
      invalid: !!errors.walletAddress,
      style: {
        width: '100%',
        maxWidth: '400px',
        padding: '10px',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        fontSize: '16px',
        background: '#fff',
        color: '#2d3748',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      },
      onFocus: e => e.target.style.borderColor = '#3182ce'
    }), errors.walletAddress && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "#e53e3e",
      fontSize: "14px",
      marginTop: "8px"
    }, errors.walletAddress)), /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, null, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Network"), /*#__PURE__*/React__default.default.createElement("select", {
      name: "network",
      value: formData.network,
      onChange: handleChange('network'),
      onBlur: handleBlur,
      style: {
        width: '100%',
        maxWidth: '400px',
        padding: '10px',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        fontSize: '16px',
        background: '#fff',
        color: '#2d3748',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      },
      onFocus: e => e.target.style.borderColor = '#3182ce'
    }, networkOptions.map(option => /*#__PURE__*/React__default.default.createElement("option", {
      key: option.value,
      value: option.value
    }, option.label))), errors.network && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "#e53e3e",
      fontSize: "14px",
      marginTop: "8px"
    }, errors.network), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontSize: "14px",
      color: "#718096",
      marginTop: "8px"
    }, "Selected: ", formData.network ? networkOptions.find(opt => opt.value === formData.network)?.label : 'None'))), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      type: "submit",
      variant: "primary",
      disabled: !formData.type || !formData.currency,
      style: {
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '6px',
        background: !formData.type || !formData.currency ? '#a0aec0' : '#3182ce',
        color: '#fff',
        border: 'none',
        cursor: !formData.type || !formData.currency ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s, transform 0.2s'
      },
      hoverStyle: {
        background: !formData.type || !formData.currency ? '#a0aec0' : '#2b6cb0',
        transform: 'scale(1.02)'
      }
    }, "Create Account")));
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.ImageRenderer = ImageRenderer;
  AdminJS.UserComponents.HomeLinkButton = HomeLinkButton;
  AdminJS.UserComponents.PaymentAccountForm = PaymentAccountForm;

})(React, AdminJSDesignSystem, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9JbWFnZVJlbmRlcmVyLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0hvbWVMaW5rQnV0dG9uLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1BheW1lbnRBY2NvdW50Rm9ybS5qc3giLCJlbnRyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzcmMvYWRtaW4vY29tcG9uZW50cy9JbWFnZVJlbmRlcmVyLmpzeFxuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuXG5jb25zdCBJbWFnZVJlbmRlcmVyID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkLCBwcm9wZXJ0eSB9ID0gcHJvcHM7XG4gIGNvbnN0IGltYWdlVXJsID0gcmVjb3JkLnBhcmFtc1twcm9wZXJ0eS5uYW1lXTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcblxuICBjb25zdCBoYW5kbGVFcnJvciA9ICgpID0+IHtcbiAgICBzZXRFcnJvcignRmFpbGVkIHRvIGxvYWQgaW1hZ2UuIEl0IG1heSBiZSBibG9ja2VkIGJ5IHNlY3VyaXR5IHBvbGljaWVzIG9yIGludmFsaWQuJyk7XG4gIH07XG5cbiAgaWYgKCFpbWFnZVVybCkge1xuICAgIHJldHVybiA8c3Bhbj5ObyBpbWFnZSBhdmFpbGFibGU8L3NwYW4+O1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAge2Vycm9yID8gKFxuICAgICAgICA8c3BhbiBzdHlsZT17eyBjb2xvcjogJ3JlZCcgfX0+e2Vycm9yfTwvc3Bhbj5cbiAgICAgICkgOiAoXG4gICAgICAgIDxpbWdcbiAgICAgICAgICBzcmM9e2ltYWdlVXJsfVxuICAgICAgICAgIGFsdD1cIlByb29mXCJcbiAgICAgICAgICBzdHlsZT17eyBtYXhXaWR0aDogJzIwMHB4JyB9fVxuICAgICAgICAgIG9uRXJyb3I9e2hhbmRsZUVycm9yfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEltYWdlUmVuZGVyZXI7IiwiLy8gc3JjL2FkbWluL2NvbXBvbmVudHMvSG9tZUxpbmtCdXR0b24uanN4XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgSWNvbiwgQnV0dG9uIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmNvbnN0IEhvbWVMaW5rQnV0dG9uID0gKCkgPT4ge1xuICBjb25zdCBnb1RvSG9tZSA9ICgpID0+IHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nOyAvLyBOYXZpZ2F0ZSB0byBjdXN0b20gZGFzaGJvYXJkXG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8QnV0dG9uIHZhcmlhbnQ9XCJwcmltYXJ5XCIgb25DbGljaz17Z29Ub0hvbWV9IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIG1hcmdpbjogJzEwcHgnIH19PlxuICAgICAgPEljb24gaWNvbj1cIkFycm93TGVmdFwiIHN0eWxlPXt7IG1hcmdpblJpZ2h0OiAnOHB4JyB9fSAvPlxuICAgICAgQmFjayB0byBIb21lXG4gICAgPC9CdXR0b24+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBIb21lTGlua0J1dHRvbjsiLCJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gIEZvcm1Hcm91cCxcbiAgTGFiZWwsXG4gIElucHV0LFxuICBCdXR0b24sXG4gIERyYXdlckNvbnRlbnQsXG4gIEljb24sXG4gIEJveCxcbiAgVGV4dCxcbiAgQmFkZ2UsXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IHsgdXNlQ3VycmVudEFkbWluLCBBcGlDbGllbnQsIHVzZU5vdGljZSB9IGZyb20gJ2FkbWluanMnO1xuXG5jb25zdCBQYXltZW50QWNjb3VudEZvcm0gPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZXNvdXJjZSwgYWN0aW9uIH0gPSBwcm9wcztcbiAgY29uc3QgW2N1cnJlbnRBZG1pbl0gPSB1c2VDdXJyZW50QWRtaW4oKTtcbiAgY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuICBjb25zdCBzZW5kTm90aWNlID0gdXNlTm90aWNlKCk7XG5cbiAgLy8gRm9ybSBzdGF0ZVxuICBjb25zdCBbZm9ybURhdGEsIHNldEZvcm1EYXRhXSA9IHVzZVN0YXRlKHtcbiAgICB0eXBlOiAnJyxcbiAgICBjdXJyZW5jeTogJycsXG4gICAgYmFua05hbWU6ICcnLFxuICAgIGFjY291bnROdW1iZXI6ICcnLFxuICAgIGFjY291bnROYW1lOiAnJyxcbiAgICBiYW5rU3dpZnRDb2RlOiAnJyxcbiAgICB3YWxsZXRBZGRyZXNzOiAnJyxcbiAgICBuZXR3b3JrOiAnJyxcbiAgfSk7XG4gIGNvbnN0IFtlcnJvcnMsIHNldEVycm9yc10gPSB1c2VTdGF0ZSh7fSk7XG5cbiAgLy8gVHlwZSBvcHRpb25zXG4gIGNvbnN0IHR5cGVPcHRpb25zID0gW1xuICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ1NlbGVjdCBUeXBlJyB9LFxuICAgIHsgdmFsdWU6ICdmaWF0JywgbGFiZWw6ICdGaWF0JyB9LFxuICAgIHsgdmFsdWU6ICdjcnlwdG8nLCBsYWJlbDogJ0NyeXB0bycgfSxcbiAgXTtcblxuICAvLyBDdXJyZW5jeSBvcHRpb25zIGJhc2VkIG9uIHR5cGVcbiAgY29uc3QgY3VycmVuY3lPcHRpb25zID0gZm9ybURhdGEudHlwZVxuICAgID8gW1xuICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdTZWxlY3QgQ3VycmVuY3knIH0sXG4gICAgICAgIC4uLihmb3JtRGF0YS50eXBlID09PSAnZmlhdCdcbiAgICAgICAgICA/IFt7IHZhbHVlOiAndXNkJywgbGFiZWw6ICdVU0QgKEZpYXQpJyB9XVxuICAgICAgICAgIDogW1xuICAgICAgICAgICAgICB7IHZhbHVlOiAndXNkdCcsIGxhYmVsOiAnVVNEVCAoQ3J5cHRvKScgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogJ2J0YycsIGxhYmVsOiAnQlRDIChDcnlwdG8pJyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAnZXRoJywgbGFiZWw6ICdFVEggKENyeXB0byknIH0sXG4gICAgICAgICAgICBdKSxcbiAgICAgIF1cbiAgICA6IFt7IHZhbHVlOiAnJywgbGFiZWw6ICdTZWxlY3QgQ3VycmVuY3knIH1dO1xuXG4gIC8vIE5ldHdvcmsgb3B0aW9ucyBiYXNlZCBvbiBjdXJyZW5jeVxuICBjb25zdCBuZXR3b3JrT3B0aW9ucyA9IGZvcm1EYXRhLmN1cnJlbmN5XG4gICAgPyBbXG4gICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ1NlbGVjdCBOZXR3b3JrJyB9LFxuICAgICAgICAuLi4oZm9ybURhdGEuY3VycmVuY3kgPT09ICd1c2R0J1xuICAgICAgICAgID8gW1xuICAgICAgICAgICAgICB7IHZhbHVlOiAnZXJjMjAnLCBsYWJlbDogJ0VSQzIwJyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAndHJjMjAnLCBsYWJlbDogJ1RSQzIwJyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAnYmVwMjAnLCBsYWJlbDogJ0JFUDIwJyB9LFxuICAgICAgICAgICAgXVxuICAgICAgICAgIDogZm9ybURhdGEuY3VycmVuY3kgPT09ICdidGMnXG4gICAgICAgICAgPyBbeyB2YWx1ZTogJ2J0YycsIGxhYmVsOiAnQlRDIE1haW5uZXQnIH1dXG4gICAgICAgICAgOiBmb3JtRGF0YS5jdXJyZW5jeSA9PT0gJ2V0aCdcbiAgICAgICAgICA/IFt7IHZhbHVlOiAnZXJjMjAnLCBsYWJlbDogJ0VSQzIwIChFdGhlcmV1bSknIH1dXG4gICAgICAgICAgOiBbXSksXG4gICAgICBdXG4gICAgOiBbeyB2YWx1ZTogJycsIGxhYmVsOiAnU2VsZWN0IE5ldHdvcmsnIH1dO1xuXG4gIC8vIERlYnVnIHN0YXRlIGFuZCBvcHRpb25zXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ2Zvcm1EYXRhOicsIGZvcm1EYXRhKTtcbiAgICBjb25zb2xlLmxvZygndHlwZU9wdGlvbnM6JywgdHlwZU9wdGlvbnMpO1xuICAgIGNvbnNvbGUubG9nKCdjdXJyZW5jeU9wdGlvbnM6JywgY3VycmVuY3lPcHRpb25zKTtcbiAgICBjb25zb2xlLmxvZygnbmV0d29ya09wdGlvbnM6JywgbmV0d29ya09wdGlvbnMpO1xuICAgIGNvbnNvbGUubG9nKCdTZWxlY3RlZCB0eXBlOicsIGZvcm1EYXRhLnR5cGUgPyB0eXBlT3B0aW9ucy5maW5kKChvcHQpID0+IG9wdC52YWx1ZSA9PT0gZm9ybURhdGEudHlwZSk/LmxhYmVsIDogJycpO1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgJ1NlbGVjdGVkIGN1cnJlbmN5OicsXG4gICAgICBmb3JtRGF0YS5jdXJyZW5jeSA/IGN1cnJlbmN5T3B0aW9ucy5maW5kKChvcHQpID0+IG9wdC52YWx1ZSA9PT0gZm9ybURhdGEuY3VycmVuY3kpPy5sYWJlbCA6ICcnXG4gICAgKTtcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgICdTZWxlY3RlZCBuZXR3b3JrOicsXG4gICAgICBmb3JtRGF0YS5uZXR3b3JrID8gbmV0d29ya09wdGlvbnMuZmluZCgob3B0KSA9PiBvcHQudmFsdWUgPT09IGZvcm1EYXRhLm5ldHdvcmspPy5sYWJlbCA6ICcnXG4gICAgKTtcbiAgfSwgW2Zvcm1EYXRhXSk7XG5cbiAgLy8gSGFuZGxlIGlucHV0IGNoYW5nZXNcbiAgY29uc3QgaGFuZGxlQ2hhbmdlID0gKG5hbWUpID0+IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgIGNvbnNvbGUubG9nKGBDaGFuZ2luZyAke25hbWV9IHRvICR7dmFsdWV9YCk7XG4gICAgc2V0Rm9ybURhdGEoKHByZXYpID0+ICh7XG4gICAgICAuLi5wcmV2LFxuICAgICAgW25hbWVdOiB2YWx1ZSxcbiAgICAgIC4uLihuYW1lID09PSAndHlwZSdcbiAgICAgICAgPyB7XG4gICAgICAgICAgICBjdXJyZW5jeTogJycsXG4gICAgICAgICAgICBiYW5rTmFtZTogJycsXG4gICAgICAgICAgICBhY2NvdW50TnVtYmVyOiAnJyxcbiAgICAgICAgICAgIGFjY291bnROYW1lOiAnJyxcbiAgICAgICAgICAgIGJhbmtTd2lmdENvZGU6ICcnLFxuICAgICAgICAgICAgd2FsbGV0QWRkcmVzczogJycsXG4gICAgICAgICAgICBuZXR3b3JrOiAnJyxcbiAgICAgICAgICB9XG4gICAgICAgIDogbmFtZSA9PT0gJ2N1cnJlbmN5J1xuICAgICAgICA/IHtcbiAgICAgICAgICAgIGJhbmtOYW1lOiAnJyxcbiAgICAgICAgICAgIGFjY291bnROdW1iZXI6ICcnLFxuICAgICAgICAgICAgYWNjb3VudE5hbWU6ICcnLFxuICAgICAgICAgICAgYmFua1N3aWZ0Q29kZTogJycsXG4gICAgICAgICAgICB3YWxsZXRBZGRyZXNzOiAnJyxcbiAgICAgICAgICAgIG5ldHdvcms6ICcnLFxuICAgICAgICAgIH1cbiAgICAgICAgOiB7fSksXG4gICAgfSkpO1xuICAgIHNldEVycm9ycygocHJldikgPT4gKHsgLi4ucHJldiwgW25hbWVdOiAnJyB9KSk7XG4gIH07XG5cbiAgLy8gSGFuZGxlIGZvcm0gc3VibWlzc2lvblxuICBjb25zdCBoYW5kbGVTdWJtaXQgPSBhc3luYyAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZXRFcnJvcnMoe30pO1xuXG4gICAgY29uc29sZS5sb2coJ0Zvcm0gc3VibWl0dGVkLCBmb3JtRGF0YTonLCBmb3JtRGF0YSk7XG5cbiAgICAvLyBWYWxpZGF0ZSByZXF1aXJlZCBmaWVsZHNcbiAgICBjb25zdCByZXF1aXJlZEZpZWxkcyA9IGZvcm1EYXRhLnR5cGUgPT09ICdmaWF0J1xuICAgICAgPyBbJ2N1cnJlbmN5JywgJ2JhbmtOYW1lJywgJ2FjY291bnROdW1iZXInLCAnYWNjb3VudE5hbWUnXVxuICAgICAgOiBbJ2N1cnJlbmN5JywgJ3dhbGxldEFkZHJlc3MnLCAnbmV0d29yayddO1xuICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvcnMgPSB7fTtcbiAgICByZXF1aXJlZEZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgaWYgKCFmb3JtRGF0YVtmaWVsZF0pIHtcbiAgICAgICAgdmFsaWRhdGlvbkVycm9yc1tmaWVsZF0gPSBgJHtmaWVsZH0gaXMgcmVxdWlyZWQuYDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFZhbGlkYXRlIG5ldHdvcmsgZm9yIGNyeXB0byBjdXJyZW5jaWVzXG4gICAgaWYgKGZvcm1EYXRhLnR5cGUgPT09ICdjcnlwdG8nICYmIGZvcm1EYXRhLmN1cnJlbmN5ICYmIGZvcm1EYXRhLm5ldHdvcmspIHtcbiAgICAgIGlmIChmb3JtRGF0YS5jdXJyZW5jeSA9PT0gJ3VzZHQnICYmICFbJ2VyYzIwJywgJ3RyYzIwJywgJ2JlcDIwJ10uaW5jbHVkZXMoZm9ybURhdGEubmV0d29yaykpIHtcbiAgICAgICAgdmFsaWRhdGlvbkVycm9ycy5uZXR3b3JrID0gJ05ldHdvcmsgbXVzdCBiZSBvbmUgb2Y6IEVSQzIwLCBUUkMyMCwgQkVQMjAgZm9yIFVTRFQuJztcbiAgICAgIH1cbiAgICAgIGlmIChmb3JtRGF0YS5jdXJyZW5jeSA9PT0gJ2J0YycgJiYgZm9ybURhdGEubmV0d29yayAhPT0gJ2J0YycpIHtcbiAgICAgICAgdmFsaWRhdGlvbkVycm9ycy5uZXR3b3JrID0gJ05ldHdvcmsgbXVzdCBiZSBCVEMgTWFpbm5ldCBmb3IgQlRDLic7XG4gICAgICB9XG4gICAgICBpZiAoZm9ybURhdGEuY3VycmVuY3kgPT09ICdldGgnICYmIGZvcm1EYXRhLm5ldHdvcmsgIT09ICdlcmMyMCcpIHtcbiAgICAgICAgdmFsaWRhdGlvbkVycm9ycy5uZXR3b3JrID0gJ05ldHdvcmsgbXVzdCBiZSBFUkMyMCBmb3IgRVRILic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5rZXlzKHZhbGlkYXRpb25FcnJvcnMpLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdWYWxpZGF0aW9uIGVycm9yczonLCB2YWxpZGF0aW9uRXJyb3JzKTtcbiAgICAgIHNldEVycm9ycyh7IC4uLnZhbGlkYXRpb25FcnJvcnMsIGZvcm06ICdQbGVhc2UgZmlsbCBhbGwgcmVxdWlyZWQgZmllbGRzIGNvcnJlY3RseS4nIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICBjdXJyZW5jeTogZm9ybURhdGEuY3VycmVuY3ksXG4gICAgICAgIC4uLihmb3JtRGF0YS50eXBlID09PSAnZmlhdCdcbiAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgYmFua05hbWU6IGZvcm1EYXRhLmJhbmtOYW1lLFxuICAgICAgICAgICAgICBhY2NvdW50TnVtYmVyOiBmb3JtRGF0YS5hY2NvdW50TnVtYmVyLFxuICAgICAgICAgICAgICBhY2NvdW50TmFtZTogZm9ybURhdGEuYWNjb3VudE5hbWUsXG4gICAgICAgICAgICAgIGJhbmtTd2lmdENvZGU6IGZvcm1EYXRhLmJhbmtTd2lmdENvZGUsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiB7XG4gICAgICAgICAgICAgIHdhbGxldEFkZHJlc3M6IGZvcm1EYXRhLndhbGxldEFkZHJlc3MsXG4gICAgICAgICAgICAgIG5ldHdvcms6IGZvcm1EYXRhLm5ldHdvcmssXG4gICAgICAgICAgICB9KSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnNvbGUubG9nKCdDb25zdHJ1Y3RlZCBwYXlsb2FkOicsIHBheWxvYWQpO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgZW5kcG9pbnQgYmFzZWQgb24gdHlwZVxuICAgICAgY29uc3QgZW5kcG9pbnQgPSBmb3JtRGF0YS50eXBlID09PSAnZmlhdCdcbiAgICAgICAgPyAnL2FwaS92MS9wYXltZW50LWFjY291bnRzL2ZpYXQnXG4gICAgICAgIDogJy9hcGkvdjEvcGF5bWVudC1hY2NvdW50cy9jcnlwdG8nO1xuICAgICAgY29uc29sZS5sb2coYFNlbmRpbmcgcmVxdWVzdCB0bzogJHtlbmRwb2ludH1gKTtcblxuICAgICAgLy8gRmV0Y2ggd2l0aCB0aW1lb3V0XG4gICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIDEwMDAwKTsgLy8gMTBzIHRpbWVvdXRcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZW5kcG9pbnQsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICdYLUNTUkYtVG9rZW4nOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJyk/LmNvbnRlbnQgfHwgJycsXG4gICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgfSxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICB9KTtcblxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3JEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3IhIFN0YXR1czogJHtyZXNwb25zZS5zdGF0dXN9LCBNZXNzYWdlOiAke2Vycm9yRGF0YS5tZXNzYWdlIHx8ICdVbmtub3duIGVycm9yJ31gKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgY29uc29sZS5sb2coJ1N1Ym1pc3Npb24gcmVzcG9uc2U6JywgcmVzcG9uc2VEYXRhKTtcblxuICAgICAgaWYgKHJlc3BvbnNlRGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIHNlbmROb3RpY2Uoe1xuICAgICAgICAgIG1lc3NhZ2U6IHJlc3BvbnNlRGF0YS5tZXNzYWdlIHx8ICdQYXltZW50IGFjY291bnQgY3JlYXRlZCBzdWNjZXNzZnVsbHknLFxuICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFJlZGlyZWN0IHRvIHRoZSBwYXltZW50IGFjY291bnRzIGxpc3QgcGFnZVxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4vcmVzb3VyY2VzL1BheW1lbnRBY2NvdW50JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldEVycm9ycyh7IGZvcm06IHJlc3BvbnNlRGF0YS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gY3JlYXRlIHBheW1lbnQgYWNjb3VudC4nIH0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignU3VibWlzc2lvbiBlcnJvcjonLCBlcnIubWVzc2FnZSwgZXJyLnN0YWNrKTtcbiAgICAgIHNldEVycm9ycyh7IGZvcm06IGBGYWlsZWQgdG8gY3JlYXRlIHBheW1lbnQgYWNjb3VudDogJHtlcnIubWVzc2FnZX1gIH0pO1xuICAgIH1cbiAgfTtcblxuICAvLyBIYW5kbGUgY2xvc2UgYnV0dG9uIGNsaWNrXG4gIGNvbnN0IGhhbmRsZUNsb3NlID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdDbG9zaW5nIGZvcm0nKTtcbiAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKCk7XG4gIH07XG5cbiAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzIG9uIGJsdXJcbiAgY29uc3QgdmFsaWRhdGVGaWVsZCA9IChuYW1lLCB2YWx1ZSkgPT4ge1xuICAgIGlmIChuYW1lID09PSAndHlwZScgJiYgIXZhbHVlKSB7XG4gICAgICByZXR1cm4gJ1BsZWFzZSBzZWxlY3QgYW4gYWNjb3VudCB0eXBlLic7XG4gICAgfVxuICAgIGlmIChuYW1lID09PSAnY3VycmVuY3knICYmICF2YWx1ZSkge1xuICAgICAgcmV0dXJuICdQbGVhc2Ugc2VsZWN0IGEgY3VycmVuY3kuJztcbiAgICB9XG4gICAgaWYgKGZvcm1EYXRhLnR5cGUgPT09ICdmaWF0Jykge1xuICAgICAgaWYgKFsnYmFua05hbWUnLCAnYWNjb3VudE51bWJlcicsICdhY2NvdW50TmFtZSddLmluY2x1ZGVzKG5hbWUpICYmICF2YWx1ZSkge1xuICAgICAgICByZXR1cm4gYCR7bmFtZX0gaXMgcmVxdWlyZWQgZm9yIGZpYXQgYWNjb3VudHMuYDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGZvcm1EYXRhLnR5cGUgPT09ICdjcnlwdG8nKSB7XG4gICAgICBpZiAoWyd3YWxsZXRBZGRyZXNzJywgJ25ldHdvcmsnXS5pbmNsdWRlcyhuYW1lKSAmJiAhdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGAke25hbWV9IGlzIHJlcXVpcmVkIGZvciBjcnlwdG8gYWNjb3VudHMuYDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUJsdXIgPSAoZSkgPT4ge1xuICAgIGNvbnN0IHsgbmFtZSwgdmFsdWUgfSA9IGUudGFyZ2V0O1xuICAgIGNvbnN0IGVycm9yID0gdmFsaWRhdGVGaWVsZChuYW1lLCB2YWx1ZSk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBzZXRFcnJvcnMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtuYW1lXTogZXJyb3IgfSkpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxEcmF3ZXJDb250ZW50IHN0eWxlPXt7IGJhY2tncm91bmQ6ICcjZjhmYWZjJywgcGFkZGluZzogJzI0cHgnLCBib3hTaGFkb3c6ICcwIDRweCAxMnB4IHJnYmEoMCwgMCwgMCwgMC4xKScgfX0+XG4gICAgICA8Zm9ybSBvblN1Ym1pdD17aGFuZGxlU3VibWl0fT5cbiAgICAgICAgPEJveFxuICAgICAgICAgIGZsZXhcbiAgICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIlxuICAgICAgICAgIG1hcmdpbkJvdHRvbT1cIjI0cHhcIlxuICAgICAgICAgIHBhZGRpbmdCb3R0b209XCIxNnB4XCJcbiAgICAgICAgICBib3JkZXJCb3R0b209XCIxcHggc29saWQgI2UyZThmMFwiXG4gICAgICAgID5cbiAgICAgICAgICA8VGV4dCBhcz1cImgyXCIgZm9udFNpemU9XCIyNHB4XCIgZm9udFdlaWdodD1cIjYwMFwiIGNvbG9yPVwiIzFhMjAyY1wiPlxuICAgICAgICAgICAgQ3JlYXRlIFBheW1lbnQgQWNjb3VudFxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8SWNvblxuICAgICAgICAgICAgaWNvbj1cIkNsb3NlXCJcbiAgICAgICAgICAgIHNpemU9ezI4fVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgICAgICAgIGNvbG9yOiAnIzRhNTU2OCcsXG4gICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHgnLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxuICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYmFja2dyb3VuZCAwLjJzJyxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVDbG9zZX1cbiAgICAgICAgICAgIHRpdGxlPVwiQ2xvc2UgZm9ybVwiXG4gICAgICAgICAgICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmQ6ICcjZWRmMmY3JyB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvQm94PlxuICAgICAgICB7ZXJyb3JzLmZvcm0gJiYgKFxuICAgICAgICAgIDxGb3JtR3JvdXA+XG4gICAgICAgICAgICA8QmFkZ2UgdmFyaWFudD1cImRhbmdlclwiIHN0eWxlPXt7IHBhZGRpbmc6ICc4cHggMTJweCcsIG1hcmdpbkJvdHRvbTogJzE2cHgnLCBkaXNwbGF5OiAnYmxvY2snIH19PlxuICAgICAgICAgICAgICB7ZXJyb3JzLmZvcm19XG4gICAgICAgICAgICA8L0JhZGdlPlxuICAgICAgICAgIDwvRm9ybUdyb3VwPlxuICAgICAgICApfVxuXG4gICAgICAgIHsvKiBUeXBlIFNlbGVjdGlvbiAqL31cbiAgICAgICAgPEZvcm1Hcm91cCBtYXJnaW5Cb3R0b209XCIyMHB4XCI+XG4gICAgICAgICAgPExhYmVsIHJlcXVpcmVkPkFjY291bnQgVHlwZTwvTGFiZWw+XG4gICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgbmFtZT1cInR5cGVcIlxuICAgICAgICAgICAgdmFsdWU9e2Zvcm1EYXRhLnR5cGV9XG4gICAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlKCd0eXBlJyl9XG4gICAgICAgICAgICBvbkJsdXI9e2hhbmRsZUJsdXJ9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICBtYXhXaWR0aDogJzQwMHB4JyxcbiAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2NiZDVlMCcsXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmZmJyxcbiAgICAgICAgICAgICAgY29sb3I6ICcjMmQzNzQ4JyxcbiAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYm9yZGVyLWNvbG9yIDAuMnMsIGJveC1zaGFkb3cgMC4ycycsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25Gb2N1cz17KGUpID0+IChlLnRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9ICcjMzE4MmNlJyl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge3R5cGVPcHRpb25zLm1hcCgob3B0aW9uKSA9PiAoXG4gICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtvcHRpb24udmFsdWV9IHZhbHVlPXtvcHRpb24udmFsdWV9PlxuICAgICAgICAgICAgICAgIHtvcHRpb24ubGFiZWx9XG4gICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAge2Vycm9ycy50eXBlICYmIChcbiAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiI2U1M2UzZVwiIGZvbnRTaXplPVwiMTRweFwiIG1hcmdpblRvcD1cIjhweFwiPlxuICAgICAgICAgICAgICB7ZXJyb3JzLnR5cGV9XG4gICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8VGV4dCBmb250U2l6ZT1cIjE0cHhcIiBjb2xvcj1cIiM3MTgwOTZcIiBtYXJnaW5Ub3A9XCI4cHhcIj5cbiAgICAgICAgICAgIFNlbGVjdGVkOiB7Zm9ybURhdGEudHlwZSA/IHR5cGVPcHRpb25zLmZpbmQoKG9wdCkgPT4gb3B0LnZhbHVlID09PSBmb3JtRGF0YS50eXBlKT8ubGFiZWwgOiAnTm9uZSd9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0Zvcm1Hcm91cD5cblxuICAgICAgICB7LyogQ3VycmVuY3kgU2VsZWN0aW9uICovfVxuICAgICAgICB7Zm9ybURhdGEudHlwZSAmJiAoXG4gICAgICAgICAgPEZvcm1Hcm91cCBtYXJnaW5Cb3R0b209XCIyMHB4XCI+XG4gICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+Q3VycmVuY3k8L0xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICBuYW1lPVwiY3VycmVuY3lcIlxuICAgICAgICAgICAgICB2YWx1ZT17Zm9ybURhdGEuY3VycmVuY3l9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2UoJ2N1cnJlbmN5Jyl9XG4gICAgICAgICAgICAgIG9uQmx1cj17aGFuZGxlQmx1cn1cbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnNDAwcHgnLFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2NiZDVlMCcsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICBjb2xvcjogJyMyZDM3NDgnLFxuICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYm9yZGVyLWNvbG9yIDAuMnMsIGJveC1zaGFkb3cgMC4ycycsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIG9uRm9jdXM9eyhlKSA9PiAoZS50YXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnIzMxODJjZScpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7Y3VycmVuY3lPcHRpb25zLm1hcCgob3B0aW9uKSA9PiAoXG4gICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e29wdGlvbi52YWx1ZX0gdmFsdWU9e29wdGlvbi52YWx1ZX0+XG4gICAgICAgICAgICAgICAgICB7b3B0aW9uLmxhYmVsfVxuICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAge2Vycm9ycy5jdXJyZW5jeSAmJiAoXG4gICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiI2U1M2UzZVwiIGZvbnRTaXplPVwiMTRweFwiIG1hcmdpblRvcD1cIjhweFwiPlxuICAgICAgICAgICAgICAgIHtlcnJvcnMuY3VycmVuY3l9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8VGV4dCBmb250U2l6ZT1cIjE0cHhcIiBjb2xvcj1cIiM3MTgwOTZcIiBtYXJnaW5Ub3A9XCI4cHhcIj5cbiAgICAgICAgICAgICAgU2VsZWN0ZWQ6IHtmb3JtRGF0YS5jdXJyZW5jeSA/IGN1cnJlbmN5T3B0aW9ucy5maW5kKChvcHQpID0+IG9wdC52YWx1ZSA9PT0gZm9ybURhdGEuY3VycmVuY3kpPy5sYWJlbCA6ICdOb25lJ31cbiAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8L0Zvcm1Hcm91cD5cbiAgICAgICAgKX1cblxuICAgICAgICB7LyogRmlhdCBGaWVsZHMgKi99XG4gICAgICAgIHtmb3JtRGF0YS50eXBlID09PSAnZmlhdCcgJiYgZm9ybURhdGEuY3VycmVuY3kgJiYgKFxuICAgICAgICAgIDxCb3ggYm9yZGVyPVwiMXB4IHNvbGlkICNlMmU4ZjBcIiBib3JkZXJSYWRpdXM9XCI4cHhcIiBwYWRkaW5nPVwiMTZweFwiIG1hcmdpbkJvdHRvbT1cIjIwcHhcIiBiYWNrZ3JvdW5kPVwiI2ZmZlwiPlxuICAgICAgICAgICAgPEZvcm1Hcm91cCBtYXJnaW5Cb3R0b209XCIxNnB4XCI+XG4gICAgICAgICAgICAgIDxMYWJlbCByZXF1aXJlZD5CYW5rIE5hbWU8L0xhYmVsPlxuICAgICAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgICAgICBuYW1lPVwiYmFua05hbWVcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtmb3JtRGF0YS5iYW5rTmFtZX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlKCdiYW5rTmFtZScpfVxuICAgICAgICAgICAgICAgIG9uQmx1cj17aGFuZGxlQmx1cn1cbiAgICAgICAgICAgICAgICBpbnZhbGlkPXshIWVycm9ycy5iYW5rTmFtZX1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnNDAwcHgnLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNjYmQ1ZTAnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyMyZDM3NDgnLFxuICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzLCBib3gtc2hhZG93IDAuMnMnLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Gb2N1cz17KGUpID0+IChlLnRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9ICcjMzE4MmNlJyl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIHtlcnJvcnMuYmFua05hbWUgJiYgKFxuICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiI2U1M2UzZVwiIGZvbnRTaXplPVwiMTRweFwiIG1hcmdpblRvcD1cIjhweFwiPlxuICAgICAgICAgICAgICAgICAge2Vycm9ycy5iYW5rTmFtZX1cbiAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L0Zvcm1Hcm91cD5cbiAgICAgICAgICAgIDxGb3JtR3JvdXAgbWFyZ2luQm90dG9tPVwiMTZweFwiPlxuICAgICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+QWNjb3VudCBOdW1iZXI8L0xhYmVsPlxuICAgICAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgICAgICBuYW1lPVwiYWNjb3VudE51bWJlclwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2Zvcm1EYXRhLmFjY291bnROdW1iZXJ9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZSgnYWNjb3VudE51bWJlcicpfVxuICAgICAgICAgICAgICAgIG9uQmx1cj17aGFuZGxlQmx1cn1cbiAgICAgICAgICAgICAgICBpbnZhbGlkPXshIWVycm9ycy5hY2NvdW50TnVtYmVyfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgbWF4V2lkdGg6ICc0MDBweCcsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2NiZDVlMCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzJkMzc0OCcsXG4gICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYm9yZGVyLWNvbG9yIDAuMnMsIGJveC1zaGFkb3cgMC4ycycsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkZvY3VzPXsoZSkgPT4gKGUudGFyZ2V0LnN0eWxlLmJvcmRlckNvbG9yID0gJyMzMTgyY2UnKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAge2Vycm9ycy5hY2NvdW50TnVtYmVyICYmIChcbiAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cIiNlNTNlM2VcIiBmb250U2l6ZT1cIjE0cHhcIiBtYXJnaW5Ub3A9XCI4cHhcIj5cbiAgICAgICAgICAgICAgICAgIHtlcnJvcnMuYWNjb3VudE51bWJlcn1cbiAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L0Zvcm1Hcm91cD5cbiAgICAgICAgICAgIDxGb3JtR3JvdXAgbWFyZ2luQm90dG9tPVwiMTZweFwiPlxuICAgICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+QWNjb3VudCBOYW1lPC9MYWJlbD5cbiAgICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgICAgbmFtZT1cImFjY291bnROYW1lXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17Zm9ybURhdGEuYWNjb3VudE5hbWV9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZSgnYWNjb3VudE5hbWUnKX1cbiAgICAgICAgICAgICAgICBvbkJsdXI9e2hhbmRsZUJsdXJ9XG4gICAgICAgICAgICAgICAgaW52YWxpZD17ISFlcnJvcnMuYWNjb3VudE5hbWV9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICBtYXhXaWR0aDogJzQwMHB4JyxcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjY2JkNWUwJyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMmQzNzQ4JyxcbiAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcbiAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdib3JkZXItY29sb3IgMC4ycywgYm94LXNoYWRvdyAwLjJzJyxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uRm9jdXM9eyhlKSA9PiAoZS50YXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnIzMxODJjZScpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7ZXJyb3JzLmFjY291bnROYW1lICYmIChcbiAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cIiNlNTNlM2VcIiBmb250U2l6ZT1cIjE0cHhcIiBtYXJnaW5Ub3A9XCI4cHhcIj5cbiAgICAgICAgICAgICAgICAgIHtlcnJvcnMuYWNjb3VudE5hbWV9XG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICAgICA8Rm9ybUdyb3VwPlxuICAgICAgICAgICAgICA8TGFiZWw+QmFuayBTd2lmdCBDb2RlIChPcHRpb25hbCk8L0xhYmVsPlxuICAgICAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgICAgICBuYW1lPVwiYmFua1N3aWZ0Q29kZVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2Zvcm1EYXRhLmJhbmtTd2lmdENvZGV9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZSgnYmFua1N3aWZ0Q29kZScpfVxuICAgICAgICAgICAgICAgIG9uQmx1cj17aGFuZGxlQmx1cn1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnNDAwcHgnLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNjYmQ1ZTAnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyMyZDM3NDgnLFxuICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzLCBib3gtc2hhZG93IDAuMnMnLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Gb2N1cz17KGUpID0+IChlLnRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9ICcjMzE4MmNlJyl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0Zvcm1Hcm91cD5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgKX1cblxuICAgICAgICB7LyogQ3J5cHRvIEZpZWxkcyAqL31cbiAgICAgICAge2Zvcm1EYXRhLnR5cGUgPT09ICdjcnlwdG8nICYmIGZvcm1EYXRhLmN1cnJlbmN5ICYmIChcbiAgICAgICAgICA8Qm94IGJvcmRlcj1cIjFweCBzb2xpZCAjZTJlOGYwXCIgYm9yZGVyUmFkaXVzPVwiOHB4XCIgcGFkZGluZz1cIjE2cHhcIiBtYXJnaW5Cb3R0b209XCIyMHB4XCIgYmFja2dyb3VuZD1cIiNmZmZcIj5cbiAgICAgICAgICAgIDxGb3JtR3JvdXAgbWFyZ2luQm90dG9tPVwiMTZweFwiPlxuICAgICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+V2FsbGV0IEFkZHJlc3M8L0xhYmVsPlxuICAgICAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgICAgICBuYW1lPVwid2FsbGV0QWRkcmVzc1wiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2Zvcm1EYXRhLndhbGxldEFkZHJlc3N9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZSgnd2FsbGV0QWRkcmVzcycpfVxuICAgICAgICAgICAgICAgIG9uQmx1cj17aGFuZGxlQmx1cn1cbiAgICAgICAgICAgICAgICBpbnZhbGlkPXshIWVycm9ycy53YWxsZXRBZGRyZXNzfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgbWF4V2lkdGg6ICc0MDBweCcsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2NiZDVlMCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzJkMzc0OCcsXG4gICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYm9yZGVyLWNvbG9yIDAuMnMsIGJveC1zaGFkb3cgMC4ycycsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkZvY3VzPXsoZSkgPT4gKGUudGFyZ2V0LnN0eWxlLmJvcmRlckNvbG9yID0gJyMzMTgyY2UnKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAge2Vycm9ycy53YWxsZXRBZGRyZXNzICYmIChcbiAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cIiNlNTNlM2VcIiBmb250U2l6ZT1cIjE0cHhcIiBtYXJnaW5Ub3A9XCI4cHhcIj5cbiAgICAgICAgICAgICAgICAgIHtlcnJvcnMud2FsbGV0QWRkcmVzc31cbiAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L0Zvcm1Hcm91cD5cbiAgICAgICAgICAgIDxGb3JtR3JvdXA+XG4gICAgICAgICAgICAgIDxMYWJlbCByZXF1aXJlZD5OZXR3b3JrPC9MYWJlbD5cbiAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgIG5hbWU9XCJuZXR3b3JrXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17Zm9ybURhdGEubmV0d29ya31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlKCduZXR3b3JrJyl9XG4gICAgICAgICAgICAgICAgb25CbHVyPXtoYW5kbGVCbHVyfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgbWF4V2lkdGg6ICc0MDBweCcsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2NiZDVlMCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzJkMzc0OCcsXG4gICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYm9yZGVyLWNvbG9yIDAuMnMsIGJveC1zaGFkb3cgMC4ycycsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkZvY3VzPXsoZSkgPT4gKGUudGFyZ2V0LnN0eWxlLmJvcmRlckNvbG9yID0gJyMzMTgyY2UnKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtuZXR3b3JrT3B0aW9ucy5tYXAoKG9wdGlvbikgPT4gKFxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e29wdGlvbi52YWx1ZX0gdmFsdWU9e29wdGlvbi52YWx1ZX0+XG4gICAgICAgICAgICAgICAgICAgIHtvcHRpb24ubGFiZWx9XG4gICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIHtlcnJvcnMubmV0d29yayAmJiAoXG4gICAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCIjZTUzZTNlXCIgZm9udFNpemU9XCIxNHB4XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICAgICAgICB7ZXJyb3JzLm5ldHdvcmt9XG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8VGV4dCBmb250U2l6ZT1cIjE0cHhcIiBjb2xvcj1cIiM3MTgwOTZcIiBtYXJnaW5Ub3A9XCI4cHhcIj5cbiAgICAgICAgICAgICAgICBTZWxlY3RlZDoge2Zvcm1EYXRhLm5ldHdvcmsgPyBuZXR3b3JrT3B0aW9ucy5maW5kKChvcHQpID0+IG9wdC52YWx1ZSA9PT0gZm9ybURhdGEubmV0d29yayk/LmxhYmVsIDogJ05vbmUnfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L0Zvcm1Hcm91cD5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgKX1cblxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgdmFyaWFudD1cInByaW1hcnlcIlxuICAgICAgICAgIGRpc2FibGVkPXshZm9ybURhdGEudHlwZSB8fCAhZm9ybURhdGEuY3VycmVuY3l9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4IDI0cHgnLFxuICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICFmb3JtRGF0YS50eXBlIHx8ICFmb3JtRGF0YS5jdXJyZW5jeSA/ICcjYTBhZWMwJyA6ICcjMzE4MmNlJyxcbiAgICAgICAgICAgIGNvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICBib3JkZXI6ICdub25lJyxcbiAgICAgICAgICAgIGN1cnNvcjogIWZvcm1EYXRhLnR5cGUgfHwgIWZvcm1EYXRhLmN1cnJlbmN5ID8gJ25vdC1hbGxvd2VkJyA6ICdwb2ludGVyJyxcbiAgICAgICAgICAgIHRyYW5zaXRpb246ICdiYWNrZ3JvdW5kIDAuMnMsIHRyYW5zZm9ybSAwLjJzJyxcbiAgICAgICAgICB9fVxuICAgICAgICAgIGhvdmVyU3R5bGU9e3tcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICFmb3JtRGF0YS50eXBlIHx8ICFmb3JtRGF0YS5jdXJyZW5jeSA/ICcjYTBhZWMwJyA6ICcjMmI2Y2IwJyxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3NjYWxlKDEuMDIpJyxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgQ3JlYXRlIEFjY291bnRcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L2Zvcm0+XG4gICAgPC9EcmF3ZXJDb250ZW50PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGF5bWVudEFjY291bnRGb3JtOyIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IEltYWdlUmVuZGVyZXIgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvSW1hZ2VSZW5kZXJlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuSW1hZ2VSZW5kZXJlciA9IEltYWdlUmVuZGVyZXJcbmltcG9ydCBIb21lTGlua0J1dHRvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Ib21lTGlua0J1dHRvbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuSG9tZUxpbmtCdXR0b24gPSBIb21lTGlua0J1dHRvblxuaW1wb3J0IFBheW1lbnRBY2NvdW50Rm9ybSBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9QYXltZW50QWNjb3VudEZvcm0nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlBheW1lbnRBY2NvdW50Rm9ybSA9IFBheW1lbnRBY2NvdW50Rm9ybSJdLCJuYW1lcyI6WyJJbWFnZVJlbmRlcmVyIiwicHJvcHMiLCJyZWNvcmQiLCJwcm9wZXJ0eSIsImltYWdlVXJsIiwicGFyYW1zIiwibmFtZSIsImVycm9yIiwic2V0RXJyb3IiLCJ1c2VTdGF0ZSIsImhhbmRsZUVycm9yIiwiUmVhY3QiLCJjcmVhdGVFbGVtZW50Iiwic3R5bGUiLCJjb2xvciIsInNyYyIsImFsdCIsIm1heFdpZHRoIiwib25FcnJvciIsIkhvbWVMaW5rQnV0dG9uIiwiZ29Ub0hvbWUiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhyZWYiLCJCdXR0b24iLCJ2YXJpYW50Iiwib25DbGljayIsImRpc3BsYXkiLCJhbGlnbkl0ZW1zIiwibWFyZ2luIiwiSWNvbiIsImljb24iLCJtYXJnaW5SaWdodCIsIlBheW1lbnRBY2NvdW50Rm9ybSIsInJlc291cmNlIiwiYWN0aW9uIiwiY3VycmVudEFkbWluIiwidXNlQ3VycmVudEFkbWluIiwiQXBpQ2xpZW50Iiwic2VuZE5vdGljZSIsInVzZU5vdGljZSIsImZvcm1EYXRhIiwic2V0Rm9ybURhdGEiLCJ0eXBlIiwiY3VycmVuY3kiLCJiYW5rTmFtZSIsImFjY291bnROdW1iZXIiLCJhY2NvdW50TmFtZSIsImJhbmtTd2lmdENvZGUiLCJ3YWxsZXRBZGRyZXNzIiwibmV0d29yayIsImVycm9ycyIsInNldEVycm9ycyIsInR5cGVPcHRpb25zIiwidmFsdWUiLCJsYWJlbCIsImN1cnJlbmN5T3B0aW9ucyIsIm5ldHdvcmtPcHRpb25zIiwidXNlRWZmZWN0IiwiY29uc29sZSIsImxvZyIsImZpbmQiLCJvcHQiLCJoYW5kbGVDaGFuZ2UiLCJldmVudCIsInRhcmdldCIsInByZXYiLCJoYW5kbGVTdWJtaXQiLCJlIiwicHJldmVudERlZmF1bHQiLCJyZXF1aXJlZEZpZWxkcyIsInZhbGlkYXRpb25FcnJvcnMiLCJmb3JFYWNoIiwiZmllbGQiLCJpbmNsdWRlcyIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJmb3JtIiwicGF5bG9hZCIsImVuZHBvaW50IiwiY29udHJvbGxlciIsIkFib3J0Q29udHJvbGxlciIsInRpbWVvdXRJZCIsInNldFRpbWVvdXQiLCJhYm9ydCIsInJlc3BvbnNlIiwiZmV0Y2giLCJtZXRob2QiLCJoZWFkZXJzIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiY29udGVudCIsImNyZWRlbnRpYWxzIiwiYm9keSIsIkpTT04iLCJzdHJpbmdpZnkiLCJzaWduYWwiLCJjbGVhclRpbWVvdXQiLCJvayIsImVycm9yRGF0YSIsImpzb24iLCJjYXRjaCIsIkVycm9yIiwic3RhdHVzIiwibWVzc2FnZSIsInJlc3BvbnNlRGF0YSIsInN1Y2Nlc3MiLCJlcnIiLCJzdGFjayIsImhhbmRsZUNsb3NlIiwiaGlzdG9yeSIsImJhY2siLCJ2YWxpZGF0ZUZpZWxkIiwiaGFuZGxlQmx1ciIsIkRyYXdlckNvbnRlbnQiLCJiYWNrZ3JvdW5kIiwicGFkZGluZyIsImJveFNoYWRvdyIsIm9uU3VibWl0IiwiQm94IiwiZmxleCIsImp1c3RpZnlDb250ZW50IiwibWFyZ2luQm90dG9tIiwicGFkZGluZ0JvdHRvbSIsImJvcmRlckJvdHRvbSIsIlRleHQiLCJhcyIsImZvbnRTaXplIiwiZm9udFdlaWdodCIsInNpemUiLCJjdXJzb3IiLCJib3JkZXJSYWRpdXMiLCJ0cmFuc2l0aW9uIiwidGl0bGUiLCJob3ZlclN0eWxlIiwiRm9ybUdyb3VwIiwiQmFkZ2UiLCJMYWJlbCIsInJlcXVpcmVkIiwib25DaGFuZ2UiLCJvbkJsdXIiLCJ3aWR0aCIsImJvcmRlciIsIm91dGxpbmUiLCJvbkZvY3VzIiwiYm9yZGVyQ29sb3IiLCJtYXAiLCJvcHRpb24iLCJrZXkiLCJtYXJnaW5Ub3AiLCJJbnB1dCIsImludmFsaWQiLCJkaXNhYmxlZCIsInRyYW5zZm9ybSIsIkFkbWluSlMiLCJVc2VyQ29tcG9uZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztFQUFBO0VBR0EsTUFBTUEsYUFBYSxHQUFJQyxLQUFLLElBQUs7SUFDL0IsTUFBTTtNQUFFQyxNQUFNO0VBQUVDLElBQUFBO0VBQVMsR0FBQyxHQUFHRixLQUFLO0lBQ2xDLE1BQU1HLFFBQVEsR0FBR0YsTUFBTSxDQUFDRyxNQUFNLENBQUNGLFFBQVEsQ0FBQ0csSUFBSSxDQUFDO0lBQzdDLE1BQU0sQ0FBQ0MsS0FBSyxFQUFFQyxRQUFRLENBQUMsR0FBR0MsY0FBUSxDQUFDLElBQUksQ0FBQztJQUV4QyxNQUFNQyxXQUFXLEdBQUdBLE1BQU07TUFDeEJGLFFBQVEsQ0FBQywwRUFBMEUsQ0FBQztLQUNyRjtJQUVELElBQUksQ0FBQ0osUUFBUSxFQUFFO0VBQ2IsSUFBQSxvQkFBT08sc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE1BQUEsRUFBQSxJQUFBLEVBQU0sb0JBQXdCLENBQUM7RUFDeEM7SUFFQSxvQkFDRUQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLEVBQ0dMLEtBQUssZ0JBQ0pJLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxNQUFBLEVBQUE7RUFBTUMsSUFBQUEsS0FBSyxFQUFFO0VBQUVDLE1BQUFBLEtBQUssRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUFFUCxLQUFZLENBQUMsZ0JBRTdDSSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQ0VHLElBQUFBLEdBQUcsRUFBRVgsUUFBUztFQUNkWSxJQUFBQSxHQUFHLEVBQUMsT0FBTztFQUNYSCxJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsUUFBUSxFQUFFO09BQVU7RUFDN0JDLElBQUFBLE9BQU8sRUFBRVI7RUFBWSxHQUN0QixDQUVBLENBQUM7RUFFVixDQUFDOztFQzlCRDtFQUlBLE1BQU1TLGNBQWMsR0FBR0Es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
