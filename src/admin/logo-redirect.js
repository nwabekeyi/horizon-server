// src/public/admin/logo-redirect.js
document.addEventListener('DOMContentLoaded', () => {
    const maxAttempts = 50; // Try for 5 seconds (50 * 100ms)
    let attempts = 0;
  
    const interval = setInterval(() => {
      const logoLink = document.querySelector('.branding a'); // The <a> wrapping the logo
      const logoImg = document.querySelector('.branding img'); // The logo image
  
      if (logoLink && logoImg) {
        // Override the link behavior
        logoLink.href = '/admin';
        logoLink.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation(); // Prevent AdminJS default behavior
          window.location.href = '/admin';
        };
  
        // Handle direct logo image clicks
        logoImg.style.cursor = 'pointer';
        logoImg.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          window.location.href = '/admin';
        };
  
        clearInterval(interval);
        console.log('Logo redirect set up successfully');
      } else if (attempts >= maxAttempts) {
        console.error('Logo redirect: Could not find .branding a or img after', maxAttempts, 'attempts');
        clearInterval(interval);
      }
  
      attempts++;
    }, 100);
  });