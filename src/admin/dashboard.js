import { Component } from '@adminjs/design-system.js';

const dashboardHandler = async (request, response) => {
  return {
    component: 'Dashboard',
    props: {
      message: 'Welcome to the Admin Panel!',
    },
  };
};

export default {
  dashboard: {
    handler: dashboardHandler,
    component: 'Dashboard',
  },
};
