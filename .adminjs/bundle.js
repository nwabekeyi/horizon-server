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

  // Debug imports
  console.log('Imported components:', {
    FormGroup: designSystem.FormGroup,
    Label: designSystem.Label,
    Input: designSystem.Input,
    Button: designSystem.Button,
    DrawerContent: designSystem.DrawerContent,
    Icon: designSystem.Icon,
    Box: designSystem.Box,
    Text: designSystem.Text,
    Badge: designSystem.Badge,
    useCurrentAdmin: adminjs.useCurrentAdmin,
    ApiClient: adminjs.ApiClient,
    useNotice: adminjs.useNotice
  });
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
    }])] : [{
      value: '',
      label: 'Select Currency'
    }];

    // Network options for USDT
    const networkOptions = formData.currency === 'usdt' ? [{
      value: '',
      label: 'Select Network'
    }, {
      value: 'erc20',
      label: 'ERC20'
    }, {
      value: 'trc20',
      label: 'TRC20'
    }, {
      value: 'bep20',
      label: 'BEP20'
    }] : [{
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
      if (Object.keys(validationErrors).length > 0) {
        console.log('Validation errors:', validationErrors);
        setErrors({
          ...validationErrors,
          form: 'Please fill all required fields.'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9JbWFnZVJlbmRlcmVyLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0hvbWVMaW5rQnV0dG9uLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1BheW1lbnRBY2NvdW50Rm9ybS5qc3giLCJlbnRyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzcmMvYWRtaW4vY29tcG9uZW50cy9JbWFnZVJlbmRlcmVyLmpzeFxuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuXG5jb25zdCBJbWFnZVJlbmRlcmVyID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVjb3JkLCBwcm9wZXJ0eSB9ID0gcHJvcHM7XG4gIGNvbnN0IGltYWdlVXJsID0gcmVjb3JkLnBhcmFtc1twcm9wZXJ0eS5uYW1lXTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcblxuICBjb25zdCBoYW5kbGVFcnJvciA9ICgpID0+IHtcbiAgICBzZXRFcnJvcignRmFpbGVkIHRvIGxvYWQgaW1hZ2UuIEl0IG1heSBiZSBibG9ja2VkIGJ5IHNlY3VyaXR5IHBvbGljaWVzIG9yIGludmFsaWQuJyk7XG4gIH07XG5cbiAgaWYgKCFpbWFnZVVybCkge1xuICAgIHJldHVybiA8c3Bhbj5ObyBpbWFnZSBhdmFpbGFibGU8L3NwYW4+O1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAge2Vycm9yID8gKFxuICAgICAgICA8c3BhbiBzdHlsZT17eyBjb2xvcjogJ3JlZCcgfX0+e2Vycm9yfTwvc3Bhbj5cbiAgICAgICkgOiAoXG4gICAgICAgIDxpbWdcbiAgICAgICAgICBzcmM9e2ltYWdlVXJsfVxuICAgICAgICAgIGFsdD1cIlByb29mXCJcbiAgICAgICAgICBzdHlsZT17eyBtYXhXaWR0aDogJzIwMHB4JyB9fVxuICAgICAgICAgIG9uRXJyb3I9e2hhbmRsZUVycm9yfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEltYWdlUmVuZGVyZXI7IiwiLy8gc3JjL2FkbWluL2NvbXBvbmVudHMvSG9tZUxpbmtCdXR0b24uanN4XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgSWNvbiwgQnV0dG9uIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmNvbnN0IEhvbWVMaW5rQnV0dG9uID0gKCkgPT4ge1xuICBjb25zdCBnb1RvSG9tZSA9ICgpID0+IHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nOyAvLyBOYXZpZ2F0ZSB0byBjdXN0b20gZGFzaGJvYXJkXG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8QnV0dG9uIHZhcmlhbnQ9XCJwcmltYXJ5XCIgb25DbGljaz17Z29Ub0hvbWV9IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIG1hcmdpbjogJzEwcHgnIH19PlxuICAgICAgPEljb24gaWNvbj1cIkFycm93TGVmdFwiIHN0eWxlPXt7IG1hcmdpblJpZ2h0OiAnOHB4JyB9fSAvPlxuICAgICAgQmFjayB0byBIb21lXG4gICAgPC9CdXR0b24+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBIb21lTGlua0J1dHRvbjsiLCJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gIEZvcm1Hcm91cCxcbiAgTGFiZWwsXG4gIElucHV0LFxuICBCdXR0b24sXG4gIERyYXdlckNvbnRlbnQsXG4gIEljb24sXG4gIEJveCxcbiAgVGV4dCxcbiAgQmFkZ2UsXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IHsgdXNlQ3VycmVudEFkbWluLCBBcGlDbGllbnQsIHVzZU5vdGljZSB9IGZyb20gJ2FkbWluanMnO1xuXG4vLyBEZWJ1ZyBpbXBvcnRzXG5jb25zb2xlLmxvZygnSW1wb3J0ZWQgY29tcG9uZW50czonLCB7XG4gIEZvcm1Hcm91cCxcbiAgTGFiZWwsXG4gIElucHV0LFxuICBCdXR0b24sXG4gIERyYXdlckNvbnRlbnQsXG4gIEljb24sXG4gIEJveCxcbiAgVGV4dCxcbiAgQmFkZ2UsXG4gIHVzZUN1cnJlbnRBZG1pbixcbiAgQXBpQ2xpZW50LFxuICB1c2VOb3RpY2UsXG59KTtcblxuY29uc3QgUGF5bWVudEFjY291bnRGb3JtID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVzb3VyY2UsIGFjdGlvbiB9ID0gcHJvcHM7XG4gIGNvbnN0IFtjdXJyZW50QWRtaW5dID0gdXNlQ3VycmVudEFkbWluKCk7XG4gIGNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcbiAgY29uc3Qgc2VuZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuXG4gIC8vIEZvcm0gc3RhdGVcbiAgY29uc3QgW2Zvcm1EYXRhLCBzZXRGb3JtRGF0YV0gPSB1c2VTdGF0ZSh7XG4gICAgdHlwZTogJycsXG4gICAgY3VycmVuY3k6ICcnLFxuICAgIGJhbmtOYW1lOiAnJyxcbiAgICBhY2NvdW50TnVtYmVyOiAnJyxcbiAgICBhY2NvdW50TmFtZTogJycsXG4gICAgYmFua1N3aWZ0Q29kZTogJycsXG4gICAgd2FsbGV0QWRkcmVzczogJycsXG4gICAgbmV0d29yazogJycsXG4gIH0pO1xuICBjb25zdCBbZXJyb3JzLCBzZXRFcnJvcnNdID0gdXNlU3RhdGUoe30pO1xuXG4gIC8vIFR5cGUgb3B0aW9uc1xuICBjb25zdCB0eXBlT3B0aW9ucyA9IFtcbiAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdTZWxlY3QgVHlwZScgfSxcbiAgICB7IHZhbHVlOiAnZmlhdCcsIGxhYmVsOiAnRmlhdCcgfSxcbiAgICB7IHZhbHVlOiAnY3J5cHRvJywgbGFiZWw6ICdDcnlwdG8nIH0sXG4gIF07XG5cbiAgLy8gQ3VycmVuY3kgb3B0aW9ucyBiYXNlZCBvbiB0eXBlXG4gIGNvbnN0IGN1cnJlbmN5T3B0aW9ucyA9IGZvcm1EYXRhLnR5cGVcbiAgICA/IFtcbiAgICAgICAgeyB2YWx1ZTogJycsIGxhYmVsOiAnU2VsZWN0IEN1cnJlbmN5JyB9LFxuICAgICAgICAuLi4oZm9ybURhdGEudHlwZSA9PT0gJ2ZpYXQnXG4gICAgICAgICAgPyBbeyB2YWx1ZTogJ3VzZCcsIGxhYmVsOiAnVVNEIChGaWF0KScgfV1cbiAgICAgICAgICA6IFt7IHZhbHVlOiAndXNkdCcsIGxhYmVsOiAnVVNEVCAoQ3J5cHRvKScgfV0pLFxuICAgICAgXVxuICAgIDogW3sgdmFsdWU6ICcnLCBsYWJlbDogJ1NlbGVjdCBDdXJyZW5jeScgfV07XG5cbiAgLy8gTmV0d29yayBvcHRpb25zIGZvciBVU0RUXG4gIGNvbnN0IG5ldHdvcmtPcHRpb25zID0gZm9ybURhdGEuY3VycmVuY3kgPT09ICd1c2R0J1xuICAgID8gW1xuICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdTZWxlY3QgTmV0d29yaycgfSxcbiAgICAgICAgeyB2YWx1ZTogJ2VyYzIwJywgbGFiZWw6ICdFUkMyMCcgfSxcbiAgICAgICAgeyB2YWx1ZTogJ3RyYzIwJywgbGFiZWw6ICdUUkMyMCcgfSxcbiAgICAgICAgeyB2YWx1ZTogJ2JlcDIwJywgbGFiZWw6ICdCRVAyMCcgfSxcbiAgICAgIF1cbiAgICA6IFt7IHZhbHVlOiAnJywgbGFiZWw6ICdTZWxlY3QgTmV0d29yaycgfV07XG5cbiAgLy8gRGVidWcgc3RhdGUgYW5kIG9wdGlvbnNcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnZm9ybURhdGE6JywgZm9ybURhdGEpO1xuICAgIGNvbnNvbGUubG9nKCd0eXBlT3B0aW9uczonLCB0eXBlT3B0aW9ucyk7XG4gICAgY29uc29sZS5sb2coJ2N1cnJlbmN5T3B0aW9uczonLCBjdXJyZW5jeU9wdGlvbnMpO1xuICAgIGNvbnNvbGUubG9nKCduZXR3b3JrT3B0aW9uczonLCBuZXR3b3JrT3B0aW9ucyk7XG4gICAgY29uc29sZS5sb2coJ1NlbGVjdGVkIHR5cGU6JywgZm9ybURhdGEudHlwZSA/IHR5cGVPcHRpb25zLmZpbmQob3B0ID0+IG9wdC52YWx1ZSA9PT0gZm9ybURhdGEudHlwZSk/LmxhYmVsIDogJycpO1xuICAgIGNvbnNvbGUubG9nKCdTZWxlY3RlZCBjdXJyZW5jeTonLCBmb3JtRGF0YS5jdXJyZW5jeSA/IGN1cnJlbmN5T3B0aW9ucy5maW5kKG9wdCA9PiBvcHQudmFsdWUgPT09IGZvcm1EYXRhLmN1cnJlbmN5KT8ubGFiZWwgOiAnJyk7XG4gICAgY29uc29sZS5sb2coJ1NlbGVjdGVkIG5ldHdvcms6JywgZm9ybURhdGEubmV0d29yayA/IG5ldHdvcmtPcHRpb25zLmZpbmQob3B0ID0+IG9wdC52YWx1ZSA9PT0gZm9ybURhdGEubmV0d29yayk/LmxhYmVsIDogJycpO1xuICB9LCBbZm9ybURhdGFdKTtcblxuICAvLyBIYW5kbGUgaW5wdXQgY2hhbmdlc1xuICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAobmFtZSkgPT4gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgY29uc29sZS5sb2coYENoYW5naW5nICR7bmFtZX0gdG8gJHt2YWx1ZX1gKTtcbiAgICBzZXRGb3JtRGF0YSgocHJldikgPT4gKHtcbiAgICAgIC4uLnByZXYsXG4gICAgICBbbmFtZV06IHZhbHVlLFxuICAgICAgLi4uKG5hbWUgPT09ICd0eXBlJ1xuICAgICAgICA/IHtcbiAgICAgICAgICAgIGN1cnJlbmN5OiAnJyxcbiAgICAgICAgICAgIGJhbmtOYW1lOiAnJyxcbiAgICAgICAgICAgIGFjY291bnROdW1iZXI6ICcnLFxuICAgICAgICAgICAgYWNjb3VudE5hbWU6ICcnLFxuICAgICAgICAgICAgYmFua1N3aWZ0Q29kZTogJycsXG4gICAgICAgICAgICB3YWxsZXRBZGRyZXNzOiAnJyxcbiAgICAgICAgICAgIG5ldHdvcms6ICcnLFxuICAgICAgICAgIH1cbiAgICAgICAgOiBuYW1lID09PSAnY3VycmVuY3knXG4gICAgICAgID8ge1xuICAgICAgICAgICAgYmFua05hbWU6ICcnLFxuICAgICAgICAgICAgYWNjb3VudE51bWJlcjogJycsXG4gICAgICAgICAgICBhY2NvdW50TmFtZTogJycsXG4gICAgICAgICAgICBiYW5rU3dpZnRDb2RlOiAnJyxcbiAgICAgICAgICAgIHdhbGxldEFkZHJlc3M6ICcnLFxuICAgICAgICAgICAgbmV0d29yazogJycsXG4gICAgICAgICAgfVxuICAgICAgICA6IHt9KSxcbiAgICB9KSk7XG4gICAgc2V0RXJyb3JzKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBbbmFtZV06ICcnIH0pKTtcbiAgfTtcblxuICAvLyBIYW5kbGUgZm9ybSBzdWJtaXNzaW9uXG4gIGNvbnN0IGhhbmRsZVN1Ym1pdCA9IGFzeW5jIChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHNldEVycm9ycyh7fSk7XG5cbiAgICBjb25zb2xlLmxvZygnRm9ybSBzdWJtaXR0ZWQsIGZvcm1EYXRhOicsIGZvcm1EYXRhKTtcblxuICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgIGNvbnN0IHJlcXVpcmVkRmllbGRzID0gZm9ybURhdGEudHlwZSA9PT0gJ2ZpYXQnXG4gICAgICA/IFsnY3VycmVuY3knLCAnYmFua05hbWUnLCAnYWNjb3VudE51bWJlcicsICdhY2NvdW50TmFtZSddXG4gICAgICA6IFsnY3VycmVuY3knLCAnd2FsbGV0QWRkcmVzcycsICduZXR3b3JrJ107XG4gICAgY29uc3QgdmFsaWRhdGlvbkVycm9ycyA9IHt9O1xuICAgIHJlcXVpcmVkRmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICBpZiAoIWZvcm1EYXRhW2ZpZWxkXSkge1xuICAgICAgICB2YWxpZGF0aW9uRXJyb3JzW2ZpZWxkXSA9IGAke2ZpZWxkfSBpcyByZXF1aXJlZC5gO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKE9iamVjdC5rZXlzKHZhbGlkYXRpb25FcnJvcnMpLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdWYWxpZGF0aW9uIGVycm9yczonLCB2YWxpZGF0aW9uRXJyb3JzKTtcbiAgICAgIHNldEVycm9ycyh7IC4uLnZhbGlkYXRpb25FcnJvcnMsIGZvcm06ICdQbGVhc2UgZmlsbCBhbGwgcmVxdWlyZWQgZmllbGRzLicgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICAgIGN1cnJlbmN5OiBmb3JtRGF0YS5jdXJyZW5jeSxcbiAgICAgICAgLi4uKGZvcm1EYXRhLnR5cGUgPT09ICdmaWF0J1xuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBiYW5rTmFtZTogZm9ybURhdGEuYmFua05hbWUsXG4gICAgICAgICAgICAgIGFjY291bnROdW1iZXI6IGZvcm1EYXRhLmFjY291bnROdW1iZXIsXG4gICAgICAgICAgICAgIGFjY291bnROYW1lOiBmb3JtRGF0YS5hY2NvdW50TmFtZSxcbiAgICAgICAgICAgICAgYmFua1N3aWZ0Q29kZTogZm9ybURhdGEuYmFua1N3aWZ0Q29kZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgd2FsbGV0QWRkcmVzczogZm9ybURhdGEud2FsbGV0QWRkcmVzcyxcbiAgICAgICAgICAgICAgbmV0d29yazogZm9ybURhdGEubmV0d29yayxcbiAgICAgICAgICAgIH0pLFxuICAgICAgfTtcblxuICAgICAgY29uc29sZS5sb2coJ0NvbnN0cnVjdGVkIHBheWxvYWQ6JywgcGF5bG9hZCk7XG5cbiAgICAgIC8vIERldGVybWluZSBlbmRwb2ludCBiYXNlZCBvbiB0eXBlXG4gICAgICBjb25zdCBlbmRwb2ludCA9IGZvcm1EYXRhLnR5cGUgPT09ICdmaWF0J1xuICAgICAgICA/ICcvYXBpL3YxL3BheW1lbnQtYWNjb3VudHMvZmlhdCdcbiAgICAgICAgOiAnL2FwaS92MS9wYXltZW50LWFjY291bnRzL2NyeXB0byc7XG4gICAgICBjb25zb2xlLmxvZyhgU2VuZGluZyByZXF1ZXN0IHRvOiAke2VuZHBvaW50fWApO1xuXG4gICAgICAvLyBGZXRjaCB3aXRoIHRpbWVvdXRcbiAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgMTAwMDApOyAvLyAxMHMgdGltZW91dFxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChlbmRwb2ludCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgJ1gtQ1NSRi1Ub2tlbic6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKT8uY29udGVudCB8fCAnJyxcbiAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICB9LFxuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSxcbiAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgIH0pO1xuXG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcblxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJvckRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvciEgU3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c30sIE1lc3NhZ2U6ICR7ZXJyb3JEYXRhLm1lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InfWApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICBjb25zb2xlLmxvZygnU3VibWlzc2lvbiByZXNwb25zZTonLCByZXNwb25zZURhdGEpO1xuXG4gICAgICBpZiAocmVzcG9uc2VEYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgc2VuZE5vdGljZSh7XG4gICAgICAgICAgbWVzc2FnZTogcmVzcG9uc2VEYXRhLm1lc3NhZ2UgfHwgJ1BheW1lbnQgYWNjb3VudCBjcmVhdGVkIHN1Y2Nlc3NmdWxseScsXG4gICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gUmVkaXJlY3QgdG8gdGhlIHBheW1lbnQgYWNjb3VudHMgbGlzdCBwYWdlXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbi9yZXNvdXJjZXMvUGF5bWVudEFjY291bnQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0RXJyb3JzKHsgZm9ybTogcmVzcG9uc2VEYXRhLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBjcmVhdGUgcGF5bWVudCBhY2NvdW50LicgfSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdTdWJtaXNzaW9uIGVycm9yOicsIGVyci5tZXNzYWdlLCBlcnIuc3RhY2spO1xuICAgICAgc2V0RXJyb3JzKHsgZm9ybTogYEZhaWxlZCB0byBjcmVhdGUgcGF5bWVudCBhY2NvdW50OiAke2Vyci5tZXNzYWdlfWAgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIEhhbmRsZSBjbG9zZSBidXR0b24gY2xpY2tcbiAgY29uc3QgaGFuZGxlQ2xvc2UgPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ0Nsb3NpbmcgZm9ybScpO1xuICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKTtcbiAgfTtcblxuICAvLyBWYWxpZGF0ZSByZXF1aXJlZCBmaWVsZHMgb24gYmx1clxuICBjb25zdCB2YWxpZGF0ZUZpZWxkID0gKG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgaWYgKG5hbWUgPT09ICd0eXBlJyAmJiAhdmFsdWUpIHtcbiAgICAgIHJldHVybiAnUGxlYXNlIHNlbGVjdCBhbiBhY2NvdW50IHR5cGUuJztcbiAgICB9XG4gICAgaWYgKG5hbWUgPT09ICdjdXJyZW5jeScgJiYgIXZhbHVlKSB7XG4gICAgICByZXR1cm4gJ1BsZWFzZSBzZWxlY3QgYSBjdXJyZW5jeS4nO1xuICAgIH1cbiAgICBpZiAoZm9ybURhdGEudHlwZSA9PT0gJ2ZpYXQnKSB7XG4gICAgICBpZiAoWydiYW5rTmFtZScsICdhY2NvdW50TnVtYmVyJywgJ2FjY291bnROYW1lJ10uaW5jbHVkZXMobmFtZSkgJiYgIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiBgJHtuYW1lfSBpcyByZXF1aXJlZCBmb3IgZmlhdCBhY2NvdW50cy5gO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZm9ybURhdGEudHlwZSA9PT0gJ2NyeXB0bycpIHtcbiAgICAgIGlmIChbJ3dhbGxldEFkZHJlc3MnLCAnbmV0d29yayddLmluY2x1ZGVzKG5hbWUpICYmICF2YWx1ZSkge1xuICAgICAgICByZXR1cm4gYCR7bmFtZX0gaXMgcmVxdWlyZWQgZm9yIGNyeXB0byBhY2NvdW50cy5gO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlQmx1ciA9IChlKSA9PiB7XG4gICAgY29uc3QgeyBuYW1lLCB2YWx1ZSB9ID0gZS50YXJnZXQ7XG4gICAgY29uc3QgZXJyb3IgPSB2YWxpZGF0ZUZpZWxkKG5hbWUsIHZhbHVlKTtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHNldEVycm9ycygocHJldikgPT4gKHsgLi4ucHJldiwgW25hbWVdOiBlcnJvciB9KSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPERyYXdlckNvbnRlbnQgc3R5bGU9e3sgYmFja2dyb3VuZDogJyNmOGZhZmMnLCBwYWRkaW5nOiAnMjRweCcsIGJveFNoYWRvdzogJzAgNHB4IDEycHggcmdiYSgwLCAwLCAwLCAwLjEpJyB9fT5cbiAgICAgIDxmb3JtIG9uU3VibWl0PXtoYW5kbGVTdWJtaXR9PlxuICAgICAgICA8Qm94XG4gICAgICAgICAgZmxleFxuICAgICAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAgICAgIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiXG4gICAgICAgICAgbWFyZ2luQm90dG9tPVwiMjRweFwiXG4gICAgICAgICAgcGFkZGluZ0JvdHRvbT1cIjE2cHhcIlxuICAgICAgICAgIGJvcmRlckJvdHRvbT1cIjFweCBzb2xpZCAjZTJlOGYwXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxUZXh0IGFzPVwiaDJcIiBmb250U2l6ZT1cIjI0cHhcIiBmb250V2VpZ2h0PVwiNjAwXCIgY29sb3I9XCIjMWEyMDJjXCI+XG4gICAgICAgICAgICBDcmVhdGUgUGF5bWVudCBBY2NvdW50XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIDxJY29uXG4gICAgICAgICAgICBpY29uPVwiQ2xvc2VcIlxuICAgICAgICAgICAgc2l6ZT17Mjh9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgICAgICAgY29sb3I6ICcjNGE1NTY4JyxcbiAgICAgICAgICAgICAgcGFkZGluZzogJzhweCcsXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXG4gICAgICAgICAgICAgIHRyYW5zaXRpb246ICdiYWNrZ3JvdW5kIDAuMnMnLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUNsb3NlfVxuICAgICAgICAgICAgdGl0bGU9XCJDbG9zZSBmb3JtXCJcbiAgICAgICAgICAgIGhvdmVyU3R5bGU9e3sgYmFja2dyb3VuZDogJyNlZGYyZjcnIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Cb3g+XG4gICAgICAgIHtlcnJvcnMuZm9ybSAmJiAoXG4gICAgICAgICAgPEZvcm1Hcm91cD5cbiAgICAgICAgICAgIDxCYWRnZSB2YXJpYW50PVwiZGFuZ2VyXCIgc3R5bGU9e3sgcGFkZGluZzogJzhweCAxMnB4JywgbWFyZ2luQm90dG9tOiAnMTZweCcsIGRpc3BsYXk6ICdibG9jaycgfX0+XG4gICAgICAgICAgICAgIHtlcnJvcnMuZm9ybX1cbiAgICAgICAgICAgIDwvQmFkZ2U+XG4gICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIFR5cGUgU2VsZWN0aW9uICovfVxuICAgICAgICA8Rm9ybUdyb3VwIG1hcmdpbkJvdHRvbT1cIjIwcHhcIj5cbiAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+QWNjb3VudCBUeXBlPC9MYWJlbD5cbiAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICBuYW1lPVwidHlwZVwiXG4gICAgICAgICAgICB2YWx1ZT17Zm9ybURhdGEudHlwZX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2UoJ3R5cGUnKX1cbiAgICAgICAgICAgIG9uQmx1cj17aGFuZGxlQmx1cn1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgIG1heFdpZHRoOiAnNDAwcHgnLFxuICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXG4gICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjY2JkNWUwJyxcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmYnLFxuICAgICAgICAgICAgICBjb2xvcjogJyMyZDM3NDgnLFxuICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXG4gICAgICAgICAgICAgIHRyYW5zaXRpb246ICdib3JkZXItY29sb3IgMC4ycywgYm94LXNoYWRvdyAwLjJzJyxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbkZvY3VzPXsoZSkgPT4gKGUudGFyZ2V0LnN0eWxlLmJvcmRlckNvbG9yID0gJyMzMTgyY2UnKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7dHlwZU9wdGlvbnMubWFwKChvcHRpb24pID0+IChcbiAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e29wdGlvbi52YWx1ZX0gdmFsdWU9e29wdGlvbi52YWx1ZX0+XG4gICAgICAgICAgICAgICAge29wdGlvbi5sYWJlbH1cbiAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICB7ZXJyb3JzLnR5cGUgJiYgKFxuICAgICAgICAgICAgPFRleHQgY29sb3I9XCIjZTUzZTNlXCIgZm9udFNpemU9XCIxNHB4XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICAgIHtlcnJvcnMudHlwZX1cbiAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICApfVxuICAgICAgICAgIDxUZXh0IGZvbnRTaXplPVwiMTRweFwiIGNvbG9yPVwiIzcxODA5NlwiIG1hcmdpblRvcD1cIjhweFwiPlxuICAgICAgICAgICAgU2VsZWN0ZWQ6IHtmb3JtRGF0YS50eXBlID8gdHlwZU9wdGlvbnMuZmluZChvcHQgPT4gb3B0LnZhbHVlID09PSBmb3JtRGF0YS50eXBlKT8ubGFiZWwgOiAnTm9uZSd9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0Zvcm1Hcm91cD5cblxuICAgICAgICB7LyogQ3VycmVuY3kgU2VsZWN0aW9uICovfVxuICAgICAgICB7Zm9ybURhdGEudHlwZSAmJiAoXG4gICAgICAgICAgPEZvcm1Hcm91cCBtYXJnaW5Cb3R0b209XCIyMHB4XCI+XG4gICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+Q3VycmVuY3k8L0xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICBuYW1lPVwiY3VycmVuY3lcIlxuICAgICAgICAgICAgICB2YWx1ZT17Zm9ybURhdGEuY3VycmVuY3l9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2UoJ2N1cnJlbmN5Jyl9XG4gICAgICAgICAgICAgIG9uQmx1cj17aGFuZGxlQmx1cn1cbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnNDAwcHgnLFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2NiZDVlMCcsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICBjb2xvcjogJyMyZDM3NDgnLFxuICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYm9yZGVyLWNvbG9yIDAuMnMsIGJveC1zaGFkb3cgMC4ycycsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIG9uRm9jdXM9eyhlKSA9PiAoZS50YXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnIzMxODJjZScpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7Y3VycmVuY3lPcHRpb25zLm1hcCgob3B0aW9uKSA9PiAoXG4gICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e29wdGlvbi52YWx1ZX0gdmFsdWU9e29wdGlvbi52YWx1ZX0+XG4gICAgICAgICAgICAgICAgICB7b3B0aW9uLmxhYmVsfVxuICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAge2Vycm9ycy5jdXJyZW5jeSAmJiAoXG4gICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiI2U1M2UzZVwiIGZvbnRTaXplPVwiMTRweFwiIG1hcmdpblRvcD1cIjhweFwiPlxuICAgICAgICAgICAgICAgIHtlcnJvcnMuY3VycmVuY3l9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8VGV4dCBmb250U2l6ZT1cIjE0cHhcIiBjb2xvcj1cIiM3MTgwOTZcIiBtYXJnaW5Ub3A9XCI4cHhcIj5cbiAgICAgICAgICAgICAgU2VsZWN0ZWQ6IHtmb3JtRGF0YS5jdXJyZW5jeSA/IGN1cnJlbmN5T3B0aW9ucy5maW5kKG9wdCA9PiBvcHQudmFsdWUgPT09IGZvcm1EYXRhLmN1cnJlbmN5KT8ubGFiZWwgOiAnTm9uZSd9XG4gICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIEZpYXQgRmllbGRzICovfVxuICAgICAgICB7Zm9ybURhdGEudHlwZSA9PT0gJ2ZpYXQnICYmIGZvcm1EYXRhLmN1cnJlbmN5ICYmIChcbiAgICAgICAgICA8Qm94IGJvcmRlcj1cIjFweCBzb2xpZCAjZTJlOGYwXCIgYm9yZGVyUmFkaXVzPVwiOHB4XCIgcGFkZGluZz1cIjE2cHhcIiBtYXJnaW5Cb3R0b209XCIyMHB4XCIgYmFja2dyb3VuZD1cIiNmZmZcIj5cbiAgICAgICAgICAgIDxGb3JtR3JvdXAgbWFyZ2luQm90dG9tPVwiMTZweFwiPlxuICAgICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+QmFuayBOYW1lPC9MYWJlbD5cbiAgICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgICAgbmFtZT1cImJhbmtOYW1lXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17Zm9ybURhdGEuYmFua05hbWV9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZSgnYmFua05hbWUnKX1cbiAgICAgICAgICAgICAgICBvbkJsdXI9e2hhbmRsZUJsdXJ9XG4gICAgICAgICAgICAgICAgaW52YWxpZD17ISFlcnJvcnMuYmFua05hbWV9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICBtYXhXaWR0aDogJzQwMHB4JyxcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjY2JkNWUwJyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMmQzNzQ4JyxcbiAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcbiAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdib3JkZXItY29sb3IgMC4ycywgYm94LXNoYWRvdyAwLjJzJyxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uRm9jdXM9eyhlKSA9PiAoZS50YXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnIzMxODJjZScpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7ZXJyb3JzLmJhbmtOYW1lICYmIChcbiAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cIiNlNTNlM2VcIiBmb250U2l6ZT1cIjE0cHhcIiBtYXJnaW5Ub3A9XCI4cHhcIj5cbiAgICAgICAgICAgICAgICAgIHtlcnJvcnMuYmFua05hbWV9XG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICAgICA8Rm9ybUdyb3VwIG1hcmdpbkJvdHRvbT1cIjE2cHhcIj5cbiAgICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPkFjY291bnQgTnVtYmVyPC9MYWJlbD5cbiAgICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgICAgbmFtZT1cImFjY291bnROdW1iZXJcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtmb3JtRGF0YS5hY2NvdW50TnVtYmVyfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2UoJ2FjY291bnROdW1iZXInKX1cbiAgICAgICAgICAgICAgICBvbkJsdXI9e2hhbmRsZUJsdXJ9XG4gICAgICAgICAgICAgICAgaW52YWxpZD17ISFlcnJvcnMuYWNjb3VudE51bWJlcn1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnNDAwcHgnLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNjYmQ1ZTAnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyMyZDM3NDgnLFxuICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzLCBib3gtc2hhZG93IDAuMnMnLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Gb2N1cz17KGUpID0+IChlLnRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9ICcjMzE4MmNlJyl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIHtlcnJvcnMuYWNjb3VudE51bWJlciAmJiAoXG4gICAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCIjZTUzZTNlXCIgZm9udFNpemU9XCIxNHB4XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICAgICAgICB7ZXJyb3JzLmFjY291bnROdW1iZXJ9XG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICAgICA8Rm9ybUdyb3VwIG1hcmdpbkJvdHRvbT1cIjE2cHhcIj5cbiAgICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPkFjY291bnQgTmFtZTwvTGFiZWw+XG4gICAgICAgICAgICAgIDxJbnB1dFxuICAgICAgICAgICAgICAgIG5hbWU9XCJhY2NvdW50TmFtZVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2Zvcm1EYXRhLmFjY291bnROYW1lfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2UoJ2FjY291bnROYW1lJyl9XG4gICAgICAgICAgICAgICAgb25CbHVyPXtoYW5kbGVCbHVyfVxuICAgICAgICAgICAgICAgIGludmFsaWQ9eyEhZXJyb3JzLmFjY291bnROYW1lfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgbWF4V2lkdGg6ICc0MDBweCcsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2NiZDVlMCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzJkMzc0OCcsXG4gICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYm9yZGVyLWNvbG9yIDAuMnMsIGJveC1zaGFkb3cgMC4ycycsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkZvY3VzPXsoZSkgPT4gKGUudGFyZ2V0LnN0eWxlLmJvcmRlckNvbG9yID0gJyMzMTgyY2UnKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAge2Vycm9ycy5hY2NvdW50TmFtZSAmJiAoXG4gICAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCIjZTUzZTNlXCIgZm9udFNpemU9XCIxNHB4XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICAgICAgICB7ZXJyb3JzLmFjY291bnROYW1lfVxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvRm9ybUdyb3VwPlxuICAgICAgICAgICAgPEZvcm1Hcm91cD5cbiAgICAgICAgICAgICAgPExhYmVsPkJhbmsgU3dpZnQgQ29kZSAoT3B0aW9uYWwpPC9MYWJlbD5cbiAgICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgICAgbmFtZT1cImJhbmtTd2lmdENvZGVcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtmb3JtRGF0YS5iYW5rU3dpZnRDb2RlfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2UoJ2JhbmtTd2lmdENvZGUnKX1cbiAgICAgICAgICAgICAgICBvbkJsdXI9e2hhbmRsZUJsdXJ9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICBtYXhXaWR0aDogJzQwMHB4JyxcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjY2JkNWUwJyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMmQzNzQ4JyxcbiAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcbiAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdib3JkZXItY29sb3IgMC4ycywgYm94LXNoYWRvdyAwLjJzJyxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uRm9jdXM9eyhlKSA9PiAoZS50YXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnIzMxODJjZScpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIENyeXB0byBGaWVsZHMgKi99XG4gICAgICAgIHtmb3JtRGF0YS50eXBlID09PSAnY3J5cHRvJyAmJiBmb3JtRGF0YS5jdXJyZW5jeSAmJiAoXG4gICAgICAgICAgPEJveCBib3JkZXI9XCIxcHggc29saWQgI2UyZThmMFwiIGJvcmRlclJhZGl1cz1cIjhweFwiIHBhZGRpbmc9XCIxNnB4XCIgbWFyZ2luQm90dG9tPVwiMjBweFwiIGJhY2tncm91bmQ9XCIjZmZmXCI+XG4gICAgICAgICAgICA8Rm9ybUdyb3VwIG1hcmdpbkJvdHRvbT1cIjE2cHhcIj5cbiAgICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPldhbGxldCBBZGRyZXNzPC9MYWJlbD5cbiAgICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgICAgbmFtZT1cIndhbGxldEFkZHJlc3NcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtmb3JtRGF0YS53YWxsZXRBZGRyZXNzfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2UoJ3dhbGxldEFkZHJlc3MnKX1cbiAgICAgICAgICAgICAgICBvbkJsdXI9e2hhbmRsZUJsdXJ9XG4gICAgICAgICAgICAgICAgaW52YWxpZD17ISFlcnJvcnMud2FsbGV0QWRkcmVzc31cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnNDAwcHgnLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNjYmQ1ZTAnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyMyZDM3NDgnLFxuICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzLCBib3gtc2hhZG93IDAuMnMnLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Gb2N1cz17KGUpID0+IChlLnRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9ICcjMzE4MmNlJyl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIHtlcnJvcnMud2FsbGV0QWRkcmVzcyAmJiAoXG4gICAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCIjZTUzZTNlXCIgZm9udFNpemU9XCIxNHB4XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICAgICAgICB7ZXJyb3JzLndhbGxldEFkZHJlc3N9XG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICAgICA8Rm9ybUdyb3VwPlxuICAgICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+TmV0d29yazwvTGFiZWw+XG4gICAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgICBuYW1lPVwibmV0d29ya1wiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2Zvcm1EYXRhLm5ldHdvcmt9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZSgnbmV0d29yaycpfVxuICAgICAgICAgICAgICAgIG9uQmx1cj17aGFuZGxlQmx1cn1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnNDAwcHgnLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNjYmQ1ZTAnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyMyZDM3NDgnLFxuICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzLCBib3gtc2hhZG93IDAuMnMnLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Gb2N1cz17KGUpID0+IChlLnRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9ICcjMzE4MmNlJyl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7bmV0d29ya09wdGlvbnMubWFwKChvcHRpb24pID0+IChcbiAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtvcHRpb24udmFsdWV9IHZhbHVlPXtvcHRpb24udmFsdWV9PlxuICAgICAgICAgICAgICAgICAgICB7b3B0aW9uLmxhYmVsfVxuICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICB7ZXJyb3JzLm5ldHdvcmsgJiYgKFxuICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiI2U1M2UzZVwiIGZvbnRTaXplPVwiMTRweFwiIG1hcmdpblRvcD1cIjhweFwiPlxuICAgICAgICAgICAgICAgICAge2Vycm9ycy5uZXR3b3JrfVxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPFRleHQgZm9udFNpemU9XCIxNHB4XCIgY29sb3I9XCIjNzE4MDk2XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICAgICAgU2VsZWN0ZWQ6IHtmb3JtRGF0YS5uZXR3b3JrID8gbmV0d29ya09wdGlvbnMuZmluZChvcHQgPT4gb3B0LnZhbHVlID09PSBmb3JtRGF0YS5uZXR3b3JrKT8ubGFiZWwgOiAnTm9uZSd9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgIDwvRm9ybUdyb3VwPlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApfVxuXG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICB2YXJpYW50PVwicHJpbWFyeVwiXG4gICAgICAgICAgZGlzYWJsZWQ9eyFmb3JtRGF0YS50eXBlIHx8ICFmb3JtRGF0YS5jdXJyZW5jeX1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcGFkZGluZzogJzEycHggMjRweCcsXG4gICAgICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxuICAgICAgICAgICAgZm9udFdlaWdodDogJzYwMCcsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgICAgICAgICAgYmFja2dyb3VuZDogIWZvcm1EYXRhLnR5cGUgfHwgIWZvcm1EYXRhLmN1cnJlbmN5ID8gJyNhMGFlYzAnIDogJyMzMTgyY2UnLFxuICAgICAgICAgICAgY29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxuICAgICAgICAgICAgY3Vyc29yOiAhZm9ybURhdGEudHlwZSB8fCAhZm9ybURhdGEuY3VycmVuY3kgPyAnbm90LWFsbG93ZWQnIDogJ3BvaW50ZXInLFxuICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JhY2tncm91bmQgMC4ycywgdHJhbnNmb3JtIDAuMnMnLFxuICAgICAgICAgIH19XG4gICAgICAgICAgaG92ZXJTdHlsZT17e1xuICAgICAgICAgICAgYmFja2dyb3VuZDogIWZvcm1EYXRhLnR5cGUgfHwgIWZvcm1EYXRhLmN1cnJlbmN5ID8gJyNhMGFlYzAnIDogJyMyYjZjYjAnLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiAnc2NhbGUoMS4wMiknLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBDcmVhdGUgQWNjb3VudFxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvZm9ybT5cbiAgICA8L0RyYXdlckNvbnRlbnQ+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBQYXltZW50QWNjb3VudEZvcm07IiwiQWRtaW5KUy5Vc2VyQ29tcG9uZW50cyA9IHt9XG5pbXBvcnQgSW1hZ2VSZW5kZXJlciBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9JbWFnZVJlbmRlcmVyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5JbWFnZVJlbmRlcmVyID0gSW1hZ2VSZW5kZXJlclxuaW1wb3J0IEhvbWVMaW5rQnV0dG9uIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0hvbWVMaW5rQnV0dG9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Ib21lTGlua0J1dHRvbiA9IEhvbWVMaW5rQnV0dG9uXG5pbXBvcnQgUGF5bWVudEFjY291bnRGb3JtIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1BheW1lbnRBY2NvdW50Rm9ybSdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUGF5bWVudEFjY291bnRGb3JtID0gUGF5bWVudEFjY291bnRGb3JtIl0sIm5hbWVzIjpbIkltYWdlUmVuZGVyZXIiLCJwcm9wcyIsInJlY29yZCIsInByb3BlcnR5IiwiaW1hZ2VVcmwiLCJwYXJhbXMiLCJuYW1lIiwiZXJyb3IiLCJzZXRFcnJvciIsInVzZVN0YXRlIiwiaGFuZGxlRXJyb3IiLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImNvbG9yIiwic3JjIiwiYWx0IiwibWF4V2lkdGgiLCJvbkVycm9yIiwiSG9tZUxpbmtCdXR0b24iLCJnb1RvSG9tZSIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsIkJ1dHRvbiIsInZhcmlhbnQiLCJvbkNsaWNrIiwiZGlzcGxheSIsImFsaWduSXRlbXMiLCJtYXJnaW4iLCJJY29uIiwiaWNvbiIsIm1hcmdpblJpZ2h0IiwiY29uc29sZSIsImxvZyIsIkZvcm1Hcm91cCIsIkxhYmVsIiwiSW5wdXQiLCJEcmF3ZXJDb250ZW50IiwiQm94IiwiVGV4dCIsIkJhZGdlIiwidXNlQ3VycmVudEFkbWluIiwiQXBpQ2xpZW50IiwidXNlTm90aWNlIiwiUGF5bWVudEFjY291bnRGb3JtIiwicmVzb3VyY2UiLCJhY3Rpb24iLCJjdXJyZW50QWRtaW4iLCJzZW5kTm90aWNlIiwiZm9ybURhdGEiLCJzZXRGb3JtRGF0YSIsInR5cGUiLCJjdXJyZW5jeSIsImJhbmtOYW1lIiwiYWNjb3VudE51bWJlciIsImFjY291bnROYW1lIiwiYmFua1N3aWZ0Q29kZSIsIndhbGxldEFkZHJlc3MiLCJuZXR3b3JrIiwiZXJyb3JzIiwic2V0RXJyb3JzIiwidHlwZU9wdGlvbnMiLCJ2YWx1ZSIsImxhYmVsIiwiY3VycmVuY3lPcHRpb25zIiwibmV0d29ya09wdGlvbnMiLCJ1c2VFZmZlY3QiLCJmaW5kIiwib3B0IiwiaGFuZGxlQ2hhbmdlIiwiZXZlbnQiLCJ0YXJnZXQiLCJwcmV2IiwiaGFuZGxlU3VibWl0IiwiZSIsInByZXZlbnREZWZhdWx0IiwicmVxdWlyZWRGaWVsZHMiLCJ2YWxpZGF0aW9uRXJyb3JzIiwiZm9yRWFjaCIsImZpZWxkIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsImZvcm0iLCJwYXlsb2FkIiwiZW5kcG9pbnQiLCJjb250cm9sbGVyIiwiQWJvcnRDb250cm9sbGVyIiwidGltZW91dElkIiwic2V0VGltZW91dCIsImFib3J0IiwicmVzcG9uc2UiLCJmZXRjaCIsIm1ldGhvZCIsImhlYWRlcnMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJjb250ZW50IiwiY3JlZGVudGlhbHMiLCJib2R5IiwiSlNPTiIsInN0cmluZ2lmeSIsInNpZ25hbCIsImNsZWFyVGltZW91dCIsIm9rIiwiZXJyb3JEYXRhIiwianNvbiIsImNhdGNoIiwiRXJyb3IiLCJzdGF0dXMiLCJtZXNzYWdlIiwicmVzcG9uc2VEYXRhIiwic3VjY2VzcyIsImVyciIsInN0YWNrIiwiaGFuZGxlQ2xvc2UiLCJoaXN0b3J5IiwiYmFjayIsInZhbGlkYXRlRmllbGQiLCJpbmNsdWRlcyIsImhhbmRsZUJsdXIiLCJiYWNrZ3JvdW5kIiwicGFkZGluZyIsImJveFNoYWRvdyIsIm9uU3VibWl0IiwiZmxleCIsImp1c3RpZnlDb250ZW50IiwibWFyZ2luQm90dG9tIiwicGFkZGluZ0JvdHRvbSIsImJvcmRlckJvdHRvbSIsImFzIiwiZm9udFNpemUiLCJmb250V2VpZ2h0Iiwic2l6ZSIsImN1cnNvciIsImJvcmRlclJhZGl1cyIsInRyYW5zaXRpb24iLCJ0aXRsZSIsImhvdmVyU3R5bGUiLCJyZXF1aXJlZCIsIm9uQ2hhbmdlIiwib25CbHVyIiwid2lkdGgiLCJib3JkZXIiLCJvdXRsaW5lIiwib25Gb2N1cyIsImJvcmRlckNvbG9yIiwibWFwIiwib3B0aW9uIiwia2V5IiwibWFyZ2luVG9wIiwiaW52YWxpZCIsImRpc2FibGVk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
