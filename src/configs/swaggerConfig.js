const swaggerJSDoc = require("swagger-jsdoc");
const { port } = require("./envConfig"); // Import port from envConfig

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Horizon project",
      version: "1.0.0",
      description: "API documentation for my Horizon crypto app",
    },
    servers: [
      {
        url: `http://localhost:${port}`, // Use the imported port
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to API routes for auto-doc generation
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;