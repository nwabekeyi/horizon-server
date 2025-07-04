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

  // src/components/IndustrySelect.js
  const IndustrySelect = ({
    property,
    record,
    onChange
  }) => {
    const [industries, setIndustries] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [currentValue, setCurrentValue] = React.useState('');

    // Initialize currentValue from record when component mounts or record changes
    React.useEffect(() => {
      const raw = record?.params?.[property.name] || '';
      const initialValue = raw.trim().toLowerCase();
      setCurrentValue(initialValue);
      console.log('Initial industry value from record:', initialValue);
    }, [record, property.name]);

    // Fetch industry options from Express API
    React.useEffect(() => {
      const fetchIndustries = async () => {
        try {
          setLoading(true);
          const res = await fetch('http://localhost:5000/api/v1/admin/industries', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include' // Include credentials if authentication is needed
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
    React.useEffect(() => {
      if (industries.length > 0) {
        console.log('Updated industries state:', industries);
      }
    }, [industries]);
    const isValueValid = industries.some(option => option.value === currentValue);
    const handleChange = value => {
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
      return /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, null, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, property.label), /*#__PURE__*/React__default.default.createElement("div", null, "Loading industries..."));
    }
    if (error) {
      return /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, null, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, property.label), /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          color: 'red'
        }
      }, "Error: ", error));
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, null, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, property.label), /*#__PURE__*/React__default.default.createElement(designSystem.Select, {
      key: industries.length // Force rerender when industry list updates
      ,
      value: isValueValid ? currentValue : '' // Ensure valid value
      ,
      onChange: handleChange,
      options: industries,
      placeholder: "Select an industry"
    }), currentValue && isValueValid && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "sm"
    }, "Selected industry: ", currentValue));
  };

  const IndustryDisplay = props => {
    const {
      record,
      property
    } = props;
    return /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, record.params[property.name] || 'N/A');
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.ImageRenderer = ImageRenderer;
  AdminJS.UserComponents.HomeLinkButton = HomeLinkButton;
  AdminJS.UserComponents.PaymentAccountForm = PaymentAccountForm;
  AdminJS.UserComponents.IndustrySelect = IndustrySelect;
  AdminJS.UserComponents.IndustryDisplay = IndustryDisplay;

})(React, AdminJSDesignSystem, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9JbWFnZVJlbmRlcmVyLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0hvbWVMaW5rQnV0dG9uLmpzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1BheW1lbnRBY2NvdW50Rm9ybS5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9JbmR1c3RyeVNlbGVjdC5qc3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9JbmR1c3RyeURpc3BsYXkuanN4IiwiZW50cnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gc3JjL2FkbWluL2NvbXBvbmVudHMvSW1hZ2VSZW5kZXJlci5qc3hcbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcblxuY29uc3QgSW1hZ2VSZW5kZXJlciA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IHJlY29yZCwgcHJvcGVydHkgfSA9IHByb3BzO1xuICBjb25zdCBpbWFnZVVybCA9IHJlY29yZC5wYXJhbXNbcHJvcGVydHkubmFtZV07XG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG5cbiAgY29uc3QgaGFuZGxlRXJyb3IgPSAoKSA9PiB7XG4gICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGltYWdlLiBJdCBtYXkgYmUgYmxvY2tlZCBieSBzZWN1cml0eSBwb2xpY2llcyBvciBpbnZhbGlkLicpO1xuICB9O1xuXG4gIGlmICghaW1hZ2VVcmwpIHtcbiAgICByZXR1cm4gPHNwYW4+Tm8gaW1hZ2UgYXZhaWxhYmxlPC9zcGFuPjtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIHtlcnJvciA/IChcbiAgICAgICAgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICdyZWQnIH19PntlcnJvcn08L3NwYW4+XG4gICAgICApIDogKFxuICAgICAgICA8aW1nXG4gICAgICAgICAgc3JjPXtpbWFnZVVybH1cbiAgICAgICAgICBhbHQ9XCJQcm9vZlwiXG4gICAgICAgICAgc3R5bGU9e3sgbWF4V2lkdGg6ICcyMDBweCcgfX1cbiAgICAgICAgICBvbkVycm9yPXtoYW5kbGVFcnJvcn1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBJbWFnZVJlbmRlcmVyOyIsIi8vIHNyYy9hZG1pbi9jb21wb25lbnRzL0hvbWVMaW5rQnV0dG9uLmpzeFxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEljb24sIEJ1dHRvbiB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBIb21lTGlua0J1dHRvbiA9ICgpID0+IHtcbiAgY29uc3QgZ29Ub0hvbWUgPSAoKSA9PiB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJzsgLy8gTmF2aWdhdGUgdG8gY3VzdG9tIGRhc2hib2FyZFxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPEJ1dHRvbiB2YXJpYW50PVwicHJpbWFyeVwiIG9uQ2xpY2s9e2dvVG9Ib21lfSBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXJnaW46ICcxMHB4JyB9fT5cbiAgICAgIDxJY29uIGljb249XCJBcnJvd0xlZnRcIiBzdHlsZT17eyBtYXJnaW5SaWdodDogJzhweCcgfX0gLz5cbiAgICAgIEJhY2sgdG8gSG9tZVxuICAgIDwvQnV0dG9uPlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSG9tZUxpbmtCdXR0b247IiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1xuICBGb3JtR3JvdXAsXG4gIExhYmVsLFxuICBJbnB1dCxcbiAgQnV0dG9uLFxuICBEcmF3ZXJDb250ZW50LFxuICBJY29uLFxuICBCb3gsXG4gIFRleHQsXG4gIEJhZGdlLFxufSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCB7IHVzZUN1cnJlbnRBZG1pbiwgQXBpQ2xpZW50LCB1c2VOb3RpY2UgfSBmcm9tICdhZG1pbmpzJztcblxuY29uc3QgUGF5bWVudEFjY291bnRGb3JtID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcmVzb3VyY2UsIGFjdGlvbiB9ID0gcHJvcHM7XG4gIGNvbnN0IFtjdXJyZW50QWRtaW5dID0gdXNlQ3VycmVudEFkbWluKCk7XG4gIGNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcbiAgY29uc3Qgc2VuZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuXG4gIC8vIEZvcm0gc3RhdGVcbiAgY29uc3QgW2Zvcm1EYXRhLCBzZXRGb3JtRGF0YV0gPSB1c2VTdGF0ZSh7XG4gICAgdHlwZTogJycsXG4gICAgY3VycmVuY3k6ICcnLFxuICAgIGJhbmtOYW1lOiAnJyxcbiAgICBhY2NvdW50TnVtYmVyOiAnJyxcbiAgICBhY2NvdW50TmFtZTogJycsXG4gICAgYmFua1N3aWZ0Q29kZTogJycsXG4gICAgd2FsbGV0QWRkcmVzczogJycsXG4gICAgbmV0d29yazogJycsXG4gIH0pO1xuICBjb25zdCBbZXJyb3JzLCBzZXRFcnJvcnNdID0gdXNlU3RhdGUoe30pO1xuXG4gIC8vIFR5cGUgb3B0aW9uc1xuICBjb25zdCB0eXBlT3B0aW9ucyA9IFtcbiAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdTZWxlY3QgVHlwZScgfSxcbiAgICB7IHZhbHVlOiAnZmlhdCcsIGxhYmVsOiAnRmlhdCcgfSxcbiAgICB7IHZhbHVlOiAnY3J5cHRvJywgbGFiZWw6ICdDcnlwdG8nIH0sXG4gIF07XG5cbiAgLy8gQ3VycmVuY3kgb3B0aW9ucyBiYXNlZCBvbiB0eXBlXG4gIGNvbnN0IGN1cnJlbmN5T3B0aW9ucyA9IGZvcm1EYXRhLnR5cGVcbiAgICA/IFtcbiAgICAgICAgeyB2YWx1ZTogJycsIGxhYmVsOiAnU2VsZWN0IEN1cnJlbmN5JyB9LFxuICAgICAgICAuLi4oZm9ybURhdGEudHlwZSA9PT0gJ2ZpYXQnXG4gICAgICAgICAgPyBbeyB2YWx1ZTogJ3VzZCcsIGxhYmVsOiAnVVNEIChGaWF0KScgfV1cbiAgICAgICAgICA6IFtcbiAgICAgICAgICAgICAgeyB2YWx1ZTogJ3VzZHQnLCBsYWJlbDogJ1VTRFQgKENyeXB0byknIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6ICdidGMnLCBsYWJlbDogJ0JUQyAoQ3J5cHRvKScgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogJ2V0aCcsIGxhYmVsOiAnRVRIIChDcnlwdG8pJyB9LFxuICAgICAgICAgICAgXSksXG4gICAgICBdXG4gICAgOiBbeyB2YWx1ZTogJycsIGxhYmVsOiAnU2VsZWN0IEN1cnJlbmN5JyB9XTtcblxuICAvLyBOZXR3b3JrIG9wdGlvbnMgYmFzZWQgb24gY3VycmVuY3lcbiAgY29uc3QgbmV0d29ya09wdGlvbnMgPSBmb3JtRGF0YS5jdXJyZW5jeVxuICAgID8gW1xuICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdTZWxlY3QgTmV0d29yaycgfSxcbiAgICAgICAgLi4uKGZvcm1EYXRhLmN1cnJlbmN5ID09PSAndXNkdCdcbiAgICAgICAgICA/IFtcbiAgICAgICAgICAgICAgeyB2YWx1ZTogJ2VyYzIwJywgbGFiZWw6ICdFUkMyMCcgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogJ3RyYzIwJywgbGFiZWw6ICdUUkMyMCcgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogJ2JlcDIwJywgbGFiZWw6ICdCRVAyMCcgfSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICA6IGZvcm1EYXRhLmN1cnJlbmN5ID09PSAnYnRjJ1xuICAgICAgICAgID8gW3sgdmFsdWU6ICdidGMnLCBsYWJlbDogJ0JUQyBNYWlubmV0JyB9XVxuICAgICAgICAgIDogZm9ybURhdGEuY3VycmVuY3kgPT09ICdldGgnXG4gICAgICAgICAgPyBbeyB2YWx1ZTogJ2VyYzIwJywgbGFiZWw6ICdFUkMyMCAoRXRoZXJldW0pJyB9XVxuICAgICAgICAgIDogW10pLFxuICAgICAgXVxuICAgIDogW3sgdmFsdWU6ICcnLCBsYWJlbDogJ1NlbGVjdCBOZXR3b3JrJyB9XTtcblxuICAvLyBEZWJ1ZyBzdGF0ZSBhbmQgb3B0aW9uc1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdmb3JtRGF0YTonLCBmb3JtRGF0YSk7XG4gICAgY29uc29sZS5sb2coJ3R5cGVPcHRpb25zOicsIHR5cGVPcHRpb25zKTtcbiAgICBjb25zb2xlLmxvZygnY3VycmVuY3lPcHRpb25zOicsIGN1cnJlbmN5T3B0aW9ucyk7XG4gICAgY29uc29sZS5sb2coJ25ldHdvcmtPcHRpb25zOicsIG5ldHdvcmtPcHRpb25zKTtcbiAgICBjb25zb2xlLmxvZygnU2VsZWN0ZWQgdHlwZTonLCBmb3JtRGF0YS50eXBlID8gdHlwZU9wdGlvbnMuZmluZCgob3B0KSA9PiBvcHQudmFsdWUgPT09IGZvcm1EYXRhLnR5cGUpPy5sYWJlbCA6ICcnKTtcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgICdTZWxlY3RlZCBjdXJyZW5jeTonLFxuICAgICAgZm9ybURhdGEuY3VycmVuY3kgPyBjdXJyZW5jeU9wdGlvbnMuZmluZCgob3B0KSA9PiBvcHQudmFsdWUgPT09IGZvcm1EYXRhLmN1cnJlbmN5KT8ubGFiZWwgOiAnJ1xuICAgICk7XG4gICAgY29uc29sZS5sb2coXG4gICAgICAnU2VsZWN0ZWQgbmV0d29yazonLFxuICAgICAgZm9ybURhdGEubmV0d29yayA/IG5ldHdvcmtPcHRpb25zLmZpbmQoKG9wdCkgPT4gb3B0LnZhbHVlID09PSBmb3JtRGF0YS5uZXR3b3JrKT8ubGFiZWwgOiAnJ1xuICAgICk7XG4gIH0sIFtmb3JtRGF0YV0pO1xuXG4gIC8vIEhhbmRsZSBpbnB1dCBjaGFuZ2VzXG4gIGNvbnN0IGhhbmRsZUNoYW5nZSA9IChuYW1lKSA9PiAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICBjb25zb2xlLmxvZyhgQ2hhbmdpbmcgJHtuYW1lfSB0byAke3ZhbHVlfWApO1xuICAgIHNldEZvcm1EYXRhKChwcmV2KSA9PiAoe1xuICAgICAgLi4ucHJldixcbiAgICAgIFtuYW1lXTogdmFsdWUsXG4gICAgICAuLi4obmFtZSA9PT0gJ3R5cGUnXG4gICAgICAgID8ge1xuICAgICAgICAgICAgY3VycmVuY3k6ICcnLFxuICAgICAgICAgICAgYmFua05hbWU6ICcnLFxuICAgICAgICAgICAgYWNjb3VudE51bWJlcjogJycsXG4gICAgICAgICAgICBhY2NvdW50TmFtZTogJycsXG4gICAgICAgICAgICBiYW5rU3dpZnRDb2RlOiAnJyxcbiAgICAgICAgICAgIHdhbGxldEFkZHJlc3M6ICcnLFxuICAgICAgICAgICAgbmV0d29yazogJycsXG4gICAgICAgICAgfVxuICAgICAgICA6IG5hbWUgPT09ICdjdXJyZW5jeSdcbiAgICAgICAgPyB7XG4gICAgICAgICAgICBiYW5rTmFtZTogJycsXG4gICAgICAgICAgICBhY2NvdW50TnVtYmVyOiAnJyxcbiAgICAgICAgICAgIGFjY291bnROYW1lOiAnJyxcbiAgICAgICAgICAgIGJhbmtTd2lmdENvZGU6ICcnLFxuICAgICAgICAgICAgd2FsbGV0QWRkcmVzczogJycsXG4gICAgICAgICAgICBuZXR3b3JrOiAnJyxcbiAgICAgICAgICB9XG4gICAgICAgIDoge30pLFxuICAgIH0pKTtcbiAgICBzZXRFcnJvcnMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtuYW1lXTogJycgfSkpO1xuICB9O1xuXG4gIC8vIEhhbmRsZSBmb3JtIHN1Ym1pc3Npb25cbiAgY29uc3QgaGFuZGxlU3VibWl0ID0gYXN5bmMgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgc2V0RXJyb3JzKHt9KTtcblxuICAgIGNvbnNvbGUubG9nKCdGb3JtIHN1Ym1pdHRlZCwgZm9ybURhdGE6JywgZm9ybURhdGEpO1xuXG4gICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzXG4gICAgY29uc3QgcmVxdWlyZWRGaWVsZHMgPSBmb3JtRGF0YS50eXBlID09PSAnZmlhdCdcbiAgICAgID8gWydjdXJyZW5jeScsICdiYW5rTmFtZScsICdhY2NvdW50TnVtYmVyJywgJ2FjY291bnROYW1lJ11cbiAgICAgIDogWydjdXJyZW5jeScsICd3YWxsZXRBZGRyZXNzJywgJ25ldHdvcmsnXTtcbiAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3JzID0ge307XG4gICAgcmVxdWlyZWRGaWVsZHMuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgIGlmICghZm9ybURhdGFbZmllbGRdKSB7XG4gICAgICAgIHZhbGlkYXRpb25FcnJvcnNbZmllbGRdID0gYCR7ZmllbGR9IGlzIHJlcXVpcmVkLmA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBWYWxpZGF0ZSBuZXR3b3JrIGZvciBjcnlwdG8gY3VycmVuY2llc1xuICAgIGlmIChmb3JtRGF0YS50eXBlID09PSAnY3J5cHRvJyAmJiBmb3JtRGF0YS5jdXJyZW5jeSAmJiBmb3JtRGF0YS5uZXR3b3JrKSB7XG4gICAgICBpZiAoZm9ybURhdGEuY3VycmVuY3kgPT09ICd1c2R0JyAmJiAhWydlcmMyMCcsICd0cmMyMCcsICdiZXAyMCddLmluY2x1ZGVzKGZvcm1EYXRhLm5ldHdvcmspKSB7XG4gICAgICAgIHZhbGlkYXRpb25FcnJvcnMubmV0d29yayA9ICdOZXR3b3JrIG11c3QgYmUgb25lIG9mOiBFUkMyMCwgVFJDMjAsIEJFUDIwIGZvciBVU0RULic7XG4gICAgICB9XG4gICAgICBpZiAoZm9ybURhdGEuY3VycmVuY3kgPT09ICdidGMnICYmIGZvcm1EYXRhLm5ldHdvcmsgIT09ICdidGMnKSB7XG4gICAgICAgIHZhbGlkYXRpb25FcnJvcnMubmV0d29yayA9ICdOZXR3b3JrIG11c3QgYmUgQlRDIE1haW5uZXQgZm9yIEJUQy4nO1xuICAgICAgfVxuICAgICAgaWYgKGZvcm1EYXRhLmN1cnJlbmN5ID09PSAnZXRoJyAmJiBmb3JtRGF0YS5uZXR3b3JrICE9PSAnZXJjMjAnKSB7XG4gICAgICAgIHZhbGlkYXRpb25FcnJvcnMubmV0d29yayA9ICdOZXR3b3JrIG11c3QgYmUgRVJDMjAgZm9yIEVUSC4nO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChPYmplY3Qua2V5cyh2YWxpZGF0aW9uRXJyb3JzKS5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zb2xlLmxvZygnVmFsaWRhdGlvbiBlcnJvcnM6JywgdmFsaWRhdGlvbkVycm9ycyk7XG4gICAgICBzZXRFcnJvcnMoeyAuLi52YWxpZGF0aW9uRXJyb3JzLCBmb3JtOiAnUGxlYXNlIGZpbGwgYWxsIHJlcXVpcmVkIGZpZWxkcyBjb3JyZWN0bHkuJyB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgY3VycmVuY3k6IGZvcm1EYXRhLmN1cnJlbmN5LFxuICAgICAgICAuLi4oZm9ybURhdGEudHlwZSA9PT0gJ2ZpYXQnXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGJhbmtOYW1lOiBmb3JtRGF0YS5iYW5rTmFtZSxcbiAgICAgICAgICAgICAgYWNjb3VudE51bWJlcjogZm9ybURhdGEuYWNjb3VudE51bWJlcixcbiAgICAgICAgICAgICAgYWNjb3VudE5hbWU6IGZvcm1EYXRhLmFjY291bnROYW1lLFxuICAgICAgICAgICAgICBiYW5rU3dpZnRDb2RlOiBmb3JtRGF0YS5iYW5rU3dpZnRDb2RlLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDoge1xuICAgICAgICAgICAgICB3YWxsZXRBZGRyZXNzOiBmb3JtRGF0YS53YWxsZXRBZGRyZXNzLFxuICAgICAgICAgICAgICBuZXR3b3JrOiBmb3JtRGF0YS5uZXR3b3JrLFxuICAgICAgICAgICAgfSksXG4gICAgICB9O1xuXG4gICAgICBjb25zb2xlLmxvZygnQ29uc3RydWN0ZWQgcGF5bG9hZDonLCBwYXlsb2FkKTtcblxuICAgICAgLy8gRGV0ZXJtaW5lIGVuZHBvaW50IGJhc2VkIG9uIHR5cGVcbiAgICAgIGNvbnN0IGVuZHBvaW50ID0gZm9ybURhdGEudHlwZSA9PT0gJ2ZpYXQnXG4gICAgICAgID8gJy9hcGkvdjEvcGF5bWVudC1hY2NvdW50cy9maWF0J1xuICAgICAgICA6ICcvYXBpL3YxL3BheW1lbnQtYWNjb3VudHMvY3J5cHRvJztcbiAgICAgIGNvbnNvbGUubG9nKGBTZW5kaW5nIHJlcXVlc3QgdG86ICR7ZW5kcG9pbnR9YCk7XG5cbiAgICAgIC8vIEZldGNoIHdpdGggdGltZW91dFxuICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCAxMDAwMCk7IC8vIDEwcyB0aW1lb3V0XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGVuZHBvaW50LCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAnWC1DU1JGLVRva2VuJzogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpPy5jb250ZW50IHx8ICcnLFxuICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yISBTdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfSwgTWVzc2FnZTogJHtlcnJvckRhdGEubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcid9YCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGNvbnNvbGUubG9nKCdTdWJtaXNzaW9uIHJlc3BvbnNlOicsIHJlc3BvbnNlRGF0YSk7XG5cbiAgICAgIGlmIChyZXNwb25zZURhdGEuc3VjY2Vzcykge1xuICAgICAgICBzZW5kTm90aWNlKHtcbiAgICAgICAgICBtZXNzYWdlOiByZXNwb25zZURhdGEubWVzc2FnZSB8fCAnUGF5bWVudCBhY2NvdW50IGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBSZWRpcmVjdCB0byB0aGUgcGF5bWVudCBhY2NvdW50cyBsaXN0IHBhZ2VcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluL3Jlc291cmNlcy9QYXltZW50QWNjb3VudCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRFcnJvcnMoeyBmb3JtOiByZXNwb25zZURhdGEubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGNyZWF0ZSBwYXltZW50IGFjY291bnQuJyB9KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1N1Ym1pc3Npb24gZXJyb3I6JywgZXJyLm1lc3NhZ2UsIGVyci5zdGFjayk7XG4gICAgICBzZXRFcnJvcnMoeyBmb3JtOiBgRmFpbGVkIHRvIGNyZWF0ZSBwYXltZW50IGFjY291bnQ6ICR7ZXJyLm1lc3NhZ2V9YCB9KTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSGFuZGxlIGNsb3NlIGJ1dHRvbiBjbGlja1xuICBjb25zdCBoYW5kbGVDbG9zZSA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnQ2xvc2luZyBmb3JtJyk7XG4gICAgd2luZG93Lmhpc3RvcnkuYmFjaygpO1xuICB9O1xuXG4gIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkcyBvbiBibHVyXG4gIGNvbnN0IHZhbGlkYXRlRmllbGQgPSAobmFtZSwgdmFsdWUpID0+IHtcbiAgICBpZiAobmFtZSA9PT0gJ3R5cGUnICYmICF2YWx1ZSkge1xuICAgICAgcmV0dXJuICdQbGVhc2Ugc2VsZWN0IGFuIGFjY291bnQgdHlwZS4nO1xuICAgIH1cbiAgICBpZiAobmFtZSA9PT0gJ2N1cnJlbmN5JyAmJiAhdmFsdWUpIHtcbiAgICAgIHJldHVybiAnUGxlYXNlIHNlbGVjdCBhIGN1cnJlbmN5Lic7XG4gICAgfVxuICAgIGlmIChmb3JtRGF0YS50eXBlID09PSAnZmlhdCcpIHtcbiAgICAgIGlmIChbJ2JhbmtOYW1lJywgJ2FjY291bnROdW1iZXInLCAnYWNjb3VudE5hbWUnXS5pbmNsdWRlcyhuYW1lKSAmJiAhdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGAke25hbWV9IGlzIHJlcXVpcmVkIGZvciBmaWF0IGFjY291bnRzLmA7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChmb3JtRGF0YS50eXBlID09PSAnY3J5cHRvJykge1xuICAgICAgaWYgKFsnd2FsbGV0QWRkcmVzcycsICduZXR3b3JrJ10uaW5jbHVkZXMobmFtZSkgJiYgIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiBgJHtuYW1lfSBpcyByZXF1aXJlZCBmb3IgY3J5cHRvIGFjY291bnRzLmA7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfTtcblxuICBjb25zdCBoYW5kbGVCbHVyID0gKGUpID0+IHtcbiAgICBjb25zdCB7IG5hbWUsIHZhbHVlIH0gPSBlLnRhcmdldDtcbiAgICBjb25zdCBlcnJvciA9IHZhbGlkYXRlRmllbGQobmFtZSwgdmFsdWUpO1xuICAgIGlmIChlcnJvcikge1xuICAgICAgc2V0RXJyb3JzKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBbbmFtZV06IGVycm9yIH0pKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8RHJhd2VyQ29udGVudCBzdHlsZT17eyBiYWNrZ3JvdW5kOiAnI2Y4ZmFmYycsIHBhZGRpbmc6ICcyNHB4JywgYm94U2hhZG93OiAnMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMSknIH19PlxuICAgICAgPGZvcm0gb25TdWJtaXQ9e2hhbmRsZVN1Ym1pdH0+XG4gICAgICAgIDxCb3hcbiAgICAgICAgICBmbGV4XG4gICAgICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCJcbiAgICAgICAgICBtYXJnaW5Cb3R0b209XCIyNHB4XCJcbiAgICAgICAgICBwYWRkaW5nQm90dG9tPVwiMTZweFwiXG4gICAgICAgICAgYm9yZGVyQm90dG9tPVwiMXB4IHNvbGlkICNlMmU4ZjBcIlxuICAgICAgICA+XG4gICAgICAgICAgPFRleHQgYXM9XCJoMlwiIGZvbnRTaXplPVwiMjRweFwiIGZvbnRXZWlnaHQ9XCI2MDBcIiBjb2xvcj1cIiMxYTIwMmNcIj5cbiAgICAgICAgICAgIENyZWF0ZSBQYXltZW50IEFjY291bnRcbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgPEljb25cbiAgICAgICAgICAgIGljb249XCJDbG9zZVwiXG4gICAgICAgICAgICBzaXplPXsyOH1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgICBjb2xvcjogJyM0YTU1NjgnLFxuICAgICAgICAgICAgICBwYWRkaW5nOiAnOHB4JyxcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNTAlJyxcbiAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JhY2tncm91bmQgMC4ycycsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25DbGljaz17aGFuZGxlQ2xvc2V9XG4gICAgICAgICAgICB0aXRsZT1cIkNsb3NlIGZvcm1cIlxuICAgICAgICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kOiAnI2VkZjJmNycgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L0JveD5cbiAgICAgICAge2Vycm9ycy5mb3JtICYmIChcbiAgICAgICAgICA8Rm9ybUdyb3VwPlxuICAgICAgICAgICAgPEJhZGdlIHZhcmlhbnQ9XCJkYW5nZXJcIiBzdHlsZT17eyBwYWRkaW5nOiAnOHB4IDEycHgnLCBtYXJnaW5Cb3R0b206ICcxNnB4JywgZGlzcGxheTogJ2Jsb2NrJyB9fT5cbiAgICAgICAgICAgICAge2Vycm9ycy5mb3JtfVxuICAgICAgICAgICAgPC9CYWRnZT5cbiAgICAgICAgICA8L0Zvcm1Hcm91cD5cbiAgICAgICAgKX1cblxuICAgICAgICB7LyogVHlwZSBTZWxlY3Rpb24gKi99XG4gICAgICAgIDxGb3JtR3JvdXAgbWFyZ2luQm90dG9tPVwiMjBweFwiPlxuICAgICAgICAgIDxMYWJlbCByZXF1aXJlZD5BY2NvdW50IFR5cGU8L0xhYmVsPlxuICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgIG5hbWU9XCJ0eXBlXCJcbiAgICAgICAgICAgIHZhbHVlPXtmb3JtRGF0YS50eXBlfVxuICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZSgndHlwZScpfVxuICAgICAgICAgICAgb25CbHVyPXtoYW5kbGVCbHVyfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgbWF4V2lkdGg6ICc0MDBweCcsXG4gICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcbiAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNjYmQ1ZTAnLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgICAgICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgICAgICAgICAgIGNvbG9yOiAnIzJkMzc0OCcsXG4gICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcbiAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzLCBib3gtc2hhZG93IDAuMnMnLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uRm9jdXM9eyhlKSA9PiAoZS50YXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnIzMxODJjZScpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt0eXBlT3B0aW9ucy5tYXAoKG9wdGlvbikgPT4gKFxuICAgICAgICAgICAgICA8b3B0aW9uIGtleT17b3B0aW9uLnZhbHVlfSB2YWx1ZT17b3B0aW9uLnZhbHVlfT5cbiAgICAgICAgICAgICAgICB7b3B0aW9uLmxhYmVsfVxuICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIHtlcnJvcnMudHlwZSAmJiAoXG4gICAgICAgICAgICA8VGV4dCBjb2xvcj1cIiNlNTNlM2VcIiBmb250U2l6ZT1cIjE0cHhcIiBtYXJnaW5Ub3A9XCI4cHhcIj5cbiAgICAgICAgICAgICAge2Vycm9ycy50eXBlfVxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICl9XG4gICAgICAgICAgPFRleHQgZm9udFNpemU9XCIxNHB4XCIgY29sb3I9XCIjNzE4MDk2XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICBTZWxlY3RlZDoge2Zvcm1EYXRhLnR5cGUgPyB0eXBlT3B0aW9ucy5maW5kKChvcHQpID0+IG9wdC52YWx1ZSA9PT0gZm9ybURhdGEudHlwZSk/LmxhYmVsIDogJ05vbmUnfVxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgPC9Gb3JtR3JvdXA+XG5cbiAgICAgICAgey8qIEN1cnJlbmN5IFNlbGVjdGlvbiAqL31cbiAgICAgICAge2Zvcm1EYXRhLnR5cGUgJiYgKFxuICAgICAgICAgIDxGb3JtR3JvdXAgbWFyZ2luQm90dG9tPVwiMjBweFwiPlxuICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPkN1cnJlbmN5PC9MYWJlbD5cbiAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgbmFtZT1cImN1cnJlbmN5XCJcbiAgICAgICAgICAgICAgdmFsdWU9e2Zvcm1EYXRhLmN1cnJlbmN5fVxuICAgICAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlKCdjdXJyZW5jeScpfVxuICAgICAgICAgICAgICBvbkJsdXI9e2hhbmRsZUJsdXJ9XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICBtYXhXaWR0aDogJzQwMHB4JyxcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNjYmQ1ZTAnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjMmQzNzQ4JyxcbiAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzLCBib3gtc2hhZG93IDAuMnMnLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBvbkZvY3VzPXsoZSkgPT4gKGUudGFyZ2V0LnN0eWxlLmJvcmRlckNvbG9yID0gJyMzMTgyY2UnKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2N1cnJlbmN5T3B0aW9ucy5tYXAoKG9wdGlvbikgPT4gKFxuICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtvcHRpb24udmFsdWV9IHZhbHVlPXtvcHRpb24udmFsdWV9PlxuICAgICAgICAgICAgICAgICAge29wdGlvbi5sYWJlbH1cbiAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgIHtlcnJvcnMuY3VycmVuY3kgJiYgKFxuICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cIiNlNTNlM2VcIiBmb250U2l6ZT1cIjE0cHhcIiBtYXJnaW5Ub3A9XCI4cHhcIj5cbiAgICAgICAgICAgICAgICB7ZXJyb3JzLmN1cnJlbmN5fVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPFRleHQgZm9udFNpemU9XCIxNHB4XCIgY29sb3I9XCIjNzE4MDk2XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICAgIFNlbGVjdGVkOiB7Zm9ybURhdGEuY3VycmVuY3kgPyBjdXJyZW5jeU9wdGlvbnMuZmluZCgob3B0KSA9PiBvcHQudmFsdWUgPT09IGZvcm1EYXRhLmN1cnJlbmN5KT8ubGFiZWwgOiAnTm9uZSd9XG4gICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIEZpYXQgRmllbGRzICovfVxuICAgICAgICB7Zm9ybURhdGEudHlwZSA9PT0gJ2ZpYXQnICYmIGZvcm1EYXRhLmN1cnJlbmN5ICYmIChcbiAgICAgICAgICA8Qm94IGJvcmRlcj1cIjFweCBzb2xpZCAjZTJlOGYwXCIgYm9yZGVyUmFkaXVzPVwiOHB4XCIgcGFkZGluZz1cIjE2cHhcIiBtYXJnaW5Cb3R0b209XCIyMHB4XCIgYmFja2dyb3VuZD1cIiNmZmZcIj5cbiAgICAgICAgICAgIDxGb3JtR3JvdXAgbWFyZ2luQm90dG9tPVwiMTZweFwiPlxuICAgICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+QmFuayBOYW1lPC9MYWJlbD5cbiAgICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgICAgbmFtZT1cImJhbmtOYW1lXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17Zm9ybURhdGEuYmFua05hbWV9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZSgnYmFua05hbWUnKX1cbiAgICAgICAgICAgICAgICBvbkJsdXI9e2hhbmRsZUJsdXJ9XG4gICAgICAgICAgICAgICAgaW52YWxpZD17ISFlcnJvcnMuYmFua05hbWV9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICBtYXhXaWR0aDogJzQwMHB4JyxcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjY2JkNWUwJyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMmQzNzQ4JyxcbiAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcbiAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdib3JkZXItY29sb3IgMC4ycywgYm94LXNoYWRvdyAwLjJzJyxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uRm9jdXM9eyhlKSA9PiAoZS50YXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnIzMxODJjZScpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7ZXJyb3JzLmJhbmtOYW1lICYmIChcbiAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cIiNlNTNlM2VcIiBmb250U2l6ZT1cIjE0cHhcIiBtYXJnaW5Ub3A9XCI4cHhcIj5cbiAgICAgICAgICAgICAgICAgIHtlcnJvcnMuYmFua05hbWV9XG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICAgICA8Rm9ybUdyb3VwIG1hcmdpbkJvdHRvbT1cIjE2cHhcIj5cbiAgICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPkFjY291bnQgTnVtYmVyPC9MYWJlbD5cbiAgICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgICAgbmFtZT1cImFjY291bnROdW1iZXJcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtmb3JtRGF0YS5hY2NvdW50TnVtYmVyfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2UoJ2FjY291bnROdW1iZXInKX1cbiAgICAgICAgICAgICAgICBvbkJsdXI9e2hhbmRsZUJsdXJ9XG4gICAgICAgICAgICAgICAgaW52YWxpZD17ISFlcnJvcnMuYWNjb3VudE51bWJlcn1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnNDAwcHgnLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNjYmQ1ZTAnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyMyZDM3NDgnLFxuICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzLCBib3gtc2hhZG93IDAuMnMnLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Gb2N1cz17KGUpID0+IChlLnRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9ICcjMzE4MmNlJyl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIHtlcnJvcnMuYWNjb3VudE51bWJlciAmJiAoXG4gICAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCIjZTUzZTNlXCIgZm9udFNpemU9XCIxNHB4XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICAgICAgICB7ZXJyb3JzLmFjY291bnROdW1iZXJ9XG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICAgICA8Rm9ybUdyb3VwIG1hcmdpbkJvdHRvbT1cIjE2cHhcIj5cbiAgICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPkFjY291bnQgTmFtZTwvTGFiZWw+XG4gICAgICAgICAgICAgIDxJbnB1dFxuICAgICAgICAgICAgICAgIG5hbWU9XCJhY2NvdW50TmFtZVwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2Zvcm1EYXRhLmFjY291bnROYW1lfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2UoJ2FjY291bnROYW1lJyl9XG4gICAgICAgICAgICAgICAgb25CbHVyPXtoYW5kbGVCbHVyfVxuICAgICAgICAgICAgICAgIGludmFsaWQ9eyEhZXJyb3JzLmFjY291bnROYW1lfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgbWF4V2lkdGg6ICc0MDBweCcsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2NiZDVlMCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzJkMzc0OCcsXG4gICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYm9yZGVyLWNvbG9yIDAuMnMsIGJveC1zaGFkb3cgMC4ycycsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkZvY3VzPXsoZSkgPT4gKGUudGFyZ2V0LnN0eWxlLmJvcmRlckNvbG9yID0gJyMzMTgyY2UnKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAge2Vycm9ycy5hY2NvdW50TmFtZSAmJiAoXG4gICAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCIjZTUzZTNlXCIgZm9udFNpemU9XCIxNHB4XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICAgICAgICB7ZXJyb3JzLmFjY291bnROYW1lfVxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvRm9ybUdyb3VwPlxuICAgICAgICAgICAgPEZvcm1Hcm91cD5cbiAgICAgICAgICAgICAgPExhYmVsPkJhbmsgU3dpZnQgQ29kZSAoT3B0aW9uYWwpPC9MYWJlbD5cbiAgICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgICAgbmFtZT1cImJhbmtTd2lmdENvZGVcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtmb3JtRGF0YS5iYW5rU3dpZnRDb2RlfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2UoJ2JhbmtTd2lmdENvZGUnKX1cbiAgICAgICAgICAgICAgICBvbkJsdXI9e2hhbmRsZUJsdXJ9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICBtYXhXaWR0aDogJzQwMHB4JyxcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjY2JkNWUwJyxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMmQzNzQ4JyxcbiAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcbiAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdib3JkZXItY29sb3IgMC4ycywgYm94LXNoYWRvdyAwLjJzJyxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uRm9jdXM9eyhlKSA9PiAoZS50YXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnIzMxODJjZScpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIENyeXB0byBGaWVsZHMgKi99XG4gICAgICAgIHtmb3JtRGF0YS50eXBlID09PSAnY3J5cHRvJyAmJiBmb3JtRGF0YS5jdXJyZW5jeSAmJiAoXG4gICAgICAgICAgPEJveCBib3JkZXI9XCIxcHggc29saWQgI2UyZThmMFwiIGJvcmRlclJhZGl1cz1cIjhweFwiIHBhZGRpbmc9XCIxNnB4XCIgbWFyZ2luQm90dG9tPVwiMjBweFwiIGJhY2tncm91bmQ9XCIjZmZmXCI+XG4gICAgICAgICAgICA8Rm9ybUdyb3VwIG1hcmdpbkJvdHRvbT1cIjE2cHhcIj5cbiAgICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPldhbGxldCBBZGRyZXNzPC9MYWJlbD5cbiAgICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgICAgbmFtZT1cIndhbGxldEFkZHJlc3NcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtmb3JtRGF0YS53YWxsZXRBZGRyZXNzfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2UoJ3dhbGxldEFkZHJlc3MnKX1cbiAgICAgICAgICAgICAgICBvbkJsdXI9e2hhbmRsZUJsdXJ9XG4gICAgICAgICAgICAgICAgaW52YWxpZD17ISFlcnJvcnMud2FsbGV0QWRkcmVzc31cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnNDAwcHgnLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNjYmQ1ZTAnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyMyZDM3NDgnLFxuICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzLCBib3gtc2hhZG93IDAuMnMnLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Gb2N1cz17KGUpID0+IChlLnRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9ICcjMzE4MmNlJyl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIHtlcnJvcnMud2FsbGV0QWRkcmVzcyAmJiAoXG4gICAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCIjZTUzZTNlXCIgZm9udFNpemU9XCIxNHB4XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICAgICAgICB7ZXJyb3JzLndhbGxldEFkZHJlc3N9XG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICAgICA8Rm9ybUdyb3VwPlxuICAgICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+TmV0d29yazwvTGFiZWw+XG4gICAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgICBuYW1lPVwibmV0d29ya1wiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2Zvcm1EYXRhLm5ldHdvcmt9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZSgnbmV0d29yaycpfVxuICAgICAgICAgICAgICAgIG9uQmx1cj17aGFuZGxlQmx1cn1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnNDAwcHgnLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNjYmQ1ZTAnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyMyZDM3NDgnLFxuICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzLCBib3gtc2hhZG93IDAuMnMnLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Gb2N1cz17KGUpID0+IChlLnRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9ICcjMzE4MmNlJyl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7bmV0d29ya09wdGlvbnMubWFwKChvcHRpb24pID0+IChcbiAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtvcHRpb24udmFsdWV9IHZhbHVlPXtvcHRpb24udmFsdWV9PlxuICAgICAgICAgICAgICAgICAgICB7b3B0aW9uLmxhYmVsfVxuICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICB7ZXJyb3JzLm5ldHdvcmsgJiYgKFxuICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiI2U1M2UzZVwiIGZvbnRTaXplPVwiMTRweFwiIG1hcmdpblRvcD1cIjhweFwiPlxuICAgICAgICAgICAgICAgICAge2Vycm9ycy5uZXR3b3JrfVxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPFRleHQgZm9udFNpemU9XCIxNHB4XCIgY29sb3I9XCIjNzE4MDk2XCIgbWFyZ2luVG9wPVwiOHB4XCI+XG4gICAgICAgICAgICAgICAgU2VsZWN0ZWQ6IHtmb3JtRGF0YS5uZXR3b3JrID8gbmV0d29ya09wdGlvbnMuZmluZCgob3B0KSA9PiBvcHQudmFsdWUgPT09IGZvcm1EYXRhLm5ldHdvcmspPy5sYWJlbCA6ICdOb25lJ31cbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICl9XG5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgIHZhcmlhbnQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICBkaXNhYmxlZD17IWZvcm1EYXRhLnR5cGUgfHwgIWZvcm1EYXRhLmN1cnJlbmN5fVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwYWRkaW5nOiAnMTJweCAyNHB4JyxcbiAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJyxcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAhZm9ybURhdGEudHlwZSB8fCAhZm9ybURhdGEuY3VycmVuY3kgPyAnI2EwYWVjMCcgOiAnIzMxODJjZScsXG4gICAgICAgICAgICBjb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXG4gICAgICAgICAgICBjdXJzb3I6ICFmb3JtRGF0YS50eXBlIHx8ICFmb3JtRGF0YS5jdXJyZW5jeSA/ICdub3QtYWxsb3dlZCcgOiAncG9pbnRlcicsXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiAnYmFja2dyb3VuZCAwLjJzLCB0cmFuc2Zvcm0gMC4ycycsXG4gICAgICAgICAgfX1cbiAgICAgICAgICBob3ZlclN0eWxlPXt7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAhZm9ybURhdGEudHlwZSB8fCAhZm9ybURhdGEuY3VycmVuY3kgPyAnI2EwYWVjMCcgOiAnIzJiNmNiMCcsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdzY2FsZSgxLjAyKScsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIENyZWF0ZSBBY2NvdW50XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9mb3JtPlxuICAgIDwvRHJhd2VyQ29udGVudD5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBheW1lbnRBY2NvdW50Rm9ybTsiLCIvLyBzcmMvY29tcG9uZW50cy9JbmR1c3RyeVNlbGVjdC5qc1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBGb3JtR3JvdXAsIExhYmVsLCBTZWxlY3QsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgSW5kdXN0cnlTZWxlY3QgPSAoeyBwcm9wZXJ0eSwgcmVjb3JkLCBvbkNoYW5nZSB9KSA9PiB7XG4gIGNvbnN0IFtpbmR1c3RyaWVzLCBzZXRJbmR1c3RyaWVzXSA9IHVzZVN0YXRlKFtdKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gIGNvbnN0IFtjdXJyZW50VmFsdWUsIHNldEN1cnJlbnRWYWx1ZV0gPSB1c2VTdGF0ZSgnJyk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBjdXJyZW50VmFsdWUgZnJvbSByZWNvcmQgd2hlbiBjb21wb25lbnQgbW91bnRzIG9yIHJlY29yZCBjaGFuZ2VzXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgcmF3ID0gcmVjb3JkPy5wYXJhbXM/Lltwcm9wZXJ0eS5uYW1lXSB8fCAnJztcbiAgICBjb25zdCBpbml0aWFsVmFsdWUgPSByYXcudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgc2V0Q3VycmVudFZhbHVlKGluaXRpYWxWYWx1ZSk7XG4gICAgY29uc29sZS5sb2coJ0luaXRpYWwgaW5kdXN0cnkgdmFsdWUgZnJvbSByZWNvcmQ6JywgaW5pdGlhbFZhbHVlKTtcbiAgfSwgW3JlY29yZCwgcHJvcGVydHkubmFtZV0pO1xuXG4gIC8vIEZldGNoIGluZHVzdHJ5IG9wdGlvbnMgZnJvbSBFeHByZXNzIEFQSVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGZldGNoSW5kdXN0cmllcyA9IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCdodHRwOi8vbG9jYWxob3N0OjUwMDAvYXBpL3YxL2FkbWluL2luZHVzdHJpZXMnLCB7XG4gICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLCAvLyBJbmNsdWRlIGNyZWRlbnRpYWxzIGlmIGF1dGhlbnRpY2F0aW9uIGlzIG5lZWRlZFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXMub2spIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvciEgc3RhdHVzOiAke3Jlcy5zdGF0dXN9YCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpO1xuICAgICAgICBzZXRJbmR1c3RyaWVzKGRhdGEpOyAvLyBBUEkgcmV0dXJucyBbeyB2YWx1ZSwgbGFiZWwgfV1cbiAgICAgICAgY29uc29sZS5sb2coJ0ZldGNoZWQgaW5kdXN0cmllcyBmcm9tIGxvY2FsaG9zdDo1MDAwOicsIGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGluZHVzdHJpZXM6JywgZXJyKTtcbiAgICAgICAgc2V0RXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZldGNoSW5kdXN0cmllcygpO1xuICB9LCBbXSk7XG5cbiAgLy8gTG9nIGluZHVzdHJpZXMgd2hlbiB0aGV5IHVwZGF0ZVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpbmR1c3RyaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdVcGRhdGVkIGluZHVzdHJpZXMgc3RhdGU6JywgaW5kdXN0cmllcyk7XG4gICAgfVxuICB9LCBbaW5kdXN0cmllc10pO1xuXG4gIGNvbnN0IGlzVmFsdWVWYWxpZCA9IGluZHVzdHJpZXMuc29tZSgob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IGN1cnJlbnRWYWx1ZSk7XG5cbiAgY29uc3QgaGFuZGxlQ2hhbmdlID0gKHZhbHVlKSA9PiB7XG4gICAgbGV0IHNlbGVjdGVkVmFsdWU7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHNlbGVjdGVkVmFsdWUgPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlPy52YWx1ZSkge1xuICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHZhbHVlLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAodmFsdWU/LnRhcmdldD8udmFsdWUpIHtcbiAgICAgIHNlbGVjdGVkVmFsdWUgPSB2YWx1ZS50YXJnZXQudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignVW5leHBlY3RlZCBvbkNoYW5nZSB2YWx1ZSBmb3JtYXQ6JywgdmFsdWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnU2VsZWN0ZWQgaW5kdXN0cnk6Jywgc2VsZWN0ZWRWYWx1ZSk7XG4gICAgc2V0Q3VycmVudFZhbHVlKHNlbGVjdGVkVmFsdWUpO1xuICAgIG9uQ2hhbmdlKHByb3BlcnR5Lm5hbWUsIHNlbGVjdGVkVmFsdWUpO1xuICB9O1xuXG4gIGlmIChsb2FkaW5nKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxGb3JtR3JvdXA+XG4gICAgICAgIDxMYWJlbD57cHJvcGVydHkubGFiZWx9PC9MYWJlbD5cbiAgICAgICAgPGRpdj5Mb2FkaW5nIGluZHVzdHJpZXMuLi48L2Rpdj5cbiAgICAgIDwvRm9ybUdyb3VwPlxuICAgICk7XG4gIH1cblxuICBpZiAoZXJyb3IpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEZvcm1Hcm91cD5cbiAgICAgICAgPExhYmVsPntwcm9wZXJ0eS5sYWJlbH08L0xhYmVsPlxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiAncmVkJyB9fT5FcnJvcjoge2Vycm9yfTwvZGl2PlxuICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEZvcm1Hcm91cD5cbiAgICAgIDxMYWJlbD57cHJvcGVydHkubGFiZWx9PC9MYWJlbD5cbiAgICAgIDxTZWxlY3RcbiAgICAgICAga2V5PXtpbmR1c3RyaWVzLmxlbmd0aH0gLy8gRm9yY2UgcmVyZW5kZXIgd2hlbiBpbmR1c3RyeSBsaXN0IHVwZGF0ZXNcbiAgICAgICAgdmFsdWU9e2lzVmFsdWVWYWxpZCA/IGN1cnJlbnRWYWx1ZSA6ICcnfSAvLyBFbnN1cmUgdmFsaWQgdmFsdWVcbiAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZX1cbiAgICAgICAgb3B0aW9ucz17aW5kdXN0cmllc31cbiAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWxlY3QgYW4gaW5kdXN0cnlcIlxuICAgICAgLz5cbiAgICAgIHtjdXJyZW50VmFsdWUgJiYgaXNWYWx1ZVZhbGlkICYmIChcbiAgICAgICAgPFRleHQgbXQ9XCJzbVwiPlNlbGVjdGVkIGluZHVzdHJ5OiB7Y3VycmVudFZhbHVlfTwvVGV4dD5cbiAgICAgICl9XG4gICAgPC9Gb3JtR3JvdXA+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBJbmR1c3RyeVNlbGVjdDsiLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBJbmR1c3RyeURpc3BsYXkgPSAocHJvcHMpID0+IHtcbiAgY29uc3QgeyByZWNvcmQsIHByb3BlcnR5IH0gPSBwcm9wcztcbiAgcmV0dXJuIDxUZXh0PntyZWNvcmQucGFyYW1zW3Byb3BlcnR5Lm5hbWVdIHx8ICdOL0EnfTwvVGV4dD47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBJbmR1c3RyeURpc3BsYXk7IiwiQWRtaW5KUy5Vc2VyQ29tcG9uZW50cyA9IHt9XG5pbXBvcnQgSW1hZ2VSZW5kZXJlciBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9JbWFnZVJlbmRlcmVyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5JbWFnZVJlbmRlcmVyID0gSW1hZ2VSZW5kZXJlclxuaW1wb3J0IEhvbWVMaW5rQnV0dG9uIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0hvbWVMaW5rQnV0dG9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Ib21lTGlua0J1dHRvbiA9IEhvbWVMaW5rQnV0dG9uXG5pbXBvcnQgUGF5bWVudEFjY291bnRGb3JtIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1BheW1lbnRBY2NvdW50Rm9ybSdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUGF5bWVudEFjY291bnRGb3JtID0gUGF5bWVudEFjY291bnRGb3JtXG5pbXBvcnQgSW5kdXN0cnlTZWxlY3QgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvSW5kdXN0cnlTZWxlY3QnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkluZHVzdHJ5U2VsZWN0ID0gSW5kdXN0cnlTZWxlY3RcbmltcG9ydCBJbmR1c3RyeURpc3BsYXkgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvSW5kdXN0cnlEaXNwbGF5J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5JbmR1c3RyeURpc3BsYXkgPSBJbmR1c3RyeURpc3BsYXkiXSwibmFtZXMiOlsiSW1hZ2VSZW5kZXJlciIsInByb3BzIiwicmVjb3JkIiwicHJvcGVydHkiLCJpbWFnZVVybCIsInBhcmFtcyIsIm5hbWUiLCJlcnJvciIsInNldEVycm9yIiwidXNlU3RhdGUiLCJoYW5kbGVFcnJvciIsIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsInN0eWxlIiwiY29sb3IiLCJzcmMiLCJhbHQiLCJtYXhXaWR0aCIsIm9uRXJyb3IiLCJIb21lTGlua0J1dHRvbiIsImdvVG9Ib21lIiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwiQnV0dG9uIiwidmFyaWFudCIsIm9uQ2xpY2siLCJkaXNwbGF5IiwiYWxpZ25JdGVtcyIsIm1hcmdpbiIsIkljb24iLCJpY29uIiwibWFyZ2luUmlnaHQiLCJQYXltZW50QWNjb3VudEZvcm0iLCJyZXNvdXJjZSIsImFjdGlvbiIsImN1cnJlbnRBZG1pbiIsInVzZUN1cnJlbnRBZG1pbiIsIkFwaUNsaWVudCIsInNlbmROb3RpY2UiLCJ1c2VOb3RpY2UiLCJmb3JtRGF0YSIsInNldEZvcm1EYXRhIiwidHlwZSIsImN1cnJlbmN5IiwiYmFua05hbWUiLCJhY2NvdW50TnVtYmVyIiwiYWNjb3VudE5hbWUiLCJiYW5rU3dpZnRDb2RlIiwid2FsbGV0QWRkcmVzcyIsIm5ldHdvcmsiLCJlcnJvcnMiLCJzZXRFcnJvcnMiLCJ0eXBlT3B0aW9ucyIsInZhbHVlIiwibGFiZWwiLCJjdXJyZW5jeU9wdGlvbnMiLCJuZXR3b3JrT3B0aW9ucyIsInVzZUVmZmVjdCIsImNvbnNvbGUiLCJsb2ciLCJmaW5kIiwib3B0IiwiaGFuZGxlQ2hhbmdlIiwiZXZlbnQiLCJ0YXJnZXQiLCJwcmV2IiwiaGFuZGxlU3VibWl0IiwiZSIsInByZXZlbnREZWZhdWx0IiwicmVxdWlyZWRGaWVsZHMiLCJ2YWxpZGF0aW9uRXJyb3JzIiwiZm9yRWFjaCIsImZpZWxkIiwiaW5jbHVkZXMiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwiZm9ybSIsInBheWxvYWQiLCJlbmRwb2ludCIsImNvbnRyb2xsZXIiLCJBYm9ydENvbnRyb2xsZXIiLCJ0aW1lb3V0SWQiLCJzZXRUaW1lb3V0IiwiYWJvcnQiLCJyZXNwb25zZSIsImZldGNoIiwibWV0aG9kIiwiaGVhZGVycyIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImNvbnRlbnQiLCJjcmVkZW50aWFscyIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5Iiwic2lnbmFsIiwiY2xlYXJUaW1lb3V0Iiwib2siLCJlcnJvckRhdGEiLCJqc29uIiwiY2F0Y2giLCJFcnJvciIsInN0YXR1cyIsIm1lc3NhZ2UiLCJyZXNwb25zZURhdGEiLCJzdWNjZXNzIiwiZXJyIiwic3RhY2siLCJoYW5kbGVDbG9zZSIsImhpc3RvcnkiLCJiYWNrIiwidmFsaWRhdGVGaWVsZCIsImhhbmRsZUJsdXIiLCJEcmF3ZXJDb250ZW50IiwiYmFja2dyb3VuZCIsInBhZGRpbmciLCJib3hTaGFkb3ciLCJvblN1Ym1pdCIsIkJveCIsImZsZXgiLCJqdXN0aWZ5Q29udGVudCIsIm1hcmdpbkJvdHRvbSIsInBhZGRpbmdCb3R0b20iLCJib3JkZXJCb3R0b20iLCJUZXh0IiwiYXMiLCJmb250U2l6ZSIsImZvbnRXZWlnaHQiLCJzaXplIiwiY3Vyc29yIiwiYm9yZGVyUmFkaXVzIiwidHJhbnNpdGlvbiIsInRpdGxlIiwiaG92ZXJTdHlsZSIsIkZvcm1Hcm91cCIsIkJhZGdlIiwiTGFiZWwiLCJyZXF1aXJlZCIsIm9uQ2hhbmdlIiwib25CbHVyIiwid2lkdGgiLCJib3JkZXIiLCJvdXRsaW5lIiwib25Gb2N1cyIsImJvcmRlckNvbG9yIiwibWFwIiwib3B0aW9uIiwia2V5IiwibWFyZ2luVG9wIiwiSW5wdXQiLCJpbnZhbGlkIiwiZGlzYWJsZWQiLCJ0cmFuc2Zvcm0iLCJJbmR1c3RyeVNlbGVjdCIsImluZHVzdHJpZXMiLCJzZXRJbmR1c3RyaWVzIiwibG9hZGluZyIsInNldExvYWRpbmciLCJjdXJyZW50VmFsdWUiLCJzZXRDdXJyZW50VmFsdWUiLCJyYXciLCJpbml0aWFsVmFsdWUiLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJmZXRjaEluZHVzdHJpZXMiLCJyZXMiLCJkYXRhIiwiaXNWYWx1ZVZhbGlkIiwic29tZSIsInNlbGVjdGVkVmFsdWUiLCJ3YXJuIiwiU2VsZWN0Iiwib3B0aW9ucyIsInBsYWNlaG9sZGVyIiwibXQiLCJJbmR1c3RyeURpc3BsYXkiLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFBQTtFQUdBLE1BQU1BLGFBQWEsR0FBSUMsS0FBSyxJQUFLO0lBQy9CLE1BQU07TUFBRUMsTUFBTTtFQUFFQyxJQUFBQTtFQUFTLEdBQUMsR0FBR0YsS0FBSztJQUNsQyxNQUFNRyxRQUFRLEdBQUdGLE1BQU0sQ0FBQ0csTUFBTSxDQUFDRixRQUFRLENBQUNHLElBQUksQ0FB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
