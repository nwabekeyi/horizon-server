const dashboardHandler = async (request, response) => {
    const { Component } = await import('@adminjs/design-system');
    return {
      component: 'Dashboard',
      props: {
        message: 'Welcome to the Admin Panel!',
      },
    };
  };
  
  module.exports = {
    dashboard: {
      handler: dashboardHandler,
      component: 'Dashboard',
    },
  };