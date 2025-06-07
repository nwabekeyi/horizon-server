import { ComponentLoader } from 'adminjs';

const componentLoader = new ComponentLoader();

const Components = {
  ImageRenderer: componentLoader.add('ImageRenderer', './components/ImageRenderer.jsx'),
  HomeLinkButton: componentLoader.add('HomeLinkButton', './components/HomeLinkButton.jsx'),
  PaymentAccountForm: componentLoader.add('PaymentAccountForm', './components/PaymentAccountForm.jsx'),
  IndustrySelect: componentLoader.add('IndustrySelect', './components/IndustrySelect.jsx'),
  IndustryDisplay: componentLoader.add('IndustryDisplay', './components/IndustryDisplay.jsx'),
};

// Debug: Log component registrations
const originalAdd = componentLoader.add;
componentLoader.add = (name, path, caller) => {
  console.log(`Registering component: ${name} at path: ${path} (caller: ${caller || 'direct'})`);
  return originalAdd.call(componentLoader, name, path);
};

export { componentLoader, Components };