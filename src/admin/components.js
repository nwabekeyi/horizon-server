import { ComponentLoader } from 'adminjs';

const componentLoader = new ComponentLoader();

const Components = {
  ImageRenderer: componentLoader.add('ImageRenderer', './components/ImageRenderer'),
  HomeLinkButton: componentLoader.add('HomeLinkButton', './components/HomeLinkButton'),
  PaymentAccountForm: componentLoader.add('PaymentAccountForm', './components/PaymentAccountForm'),
};

// Debug: Log component registrations
const originalAdd = componentLoader.add;
componentLoader.add = (name, path, caller) => {
  console.log(`Registering component: ${name} at path: ${path} (caller: ${caller || 'direct'})`);
  return originalAdd.call(componentLoader, name, path, caller);
};

export { componentLoader, Components };