// src/admin/components.js
import { ComponentLoader } from 'adminjs';
import path from 'path';

const componentLoader = new ComponentLoader();

// Register components
const Components = {
  ImageRenderer: componentLoader.add('ImageRenderer', path.resolve('src/admin/components/ImageRenderer.jsx')),
};

// Debug: Log component registrations
const originalAdd = componentLoader.add;
componentLoader.add = (name, path, caller) => {
  console.log(`Registering component: ${name} at path: ${path} (caller: ${caller || 'direct'})`);
  return originalAdd.call(componentLoader, name, path, caller);
};

export { componentLoader, Components };