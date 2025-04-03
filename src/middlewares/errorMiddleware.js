// errorMiddleware.js

const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
  
    // Set default error status code to 500 (Internal Server Error)
    const statusCode = err.statusCode || 500;
    
    // Set default error message
    const message = err.message || 'Something went wrong on the server.';
  
    // Send error response
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack trace in production
    });

  };
  
  module.exports = errorMiddleware;
  