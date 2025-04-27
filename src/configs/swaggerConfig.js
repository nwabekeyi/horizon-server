// swaggerConfig
import swaggerJSDoc from 'swagger-jsdoc';
import { port, nodeEnv, prodUrl } from './envConfig';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Determine the server URL based on NODE_ENV
const isProduction = nodeEnv === 'production';
const serverUrl = isProduction
  ? prodUrl
  : `http://localhost:${port}`;

console.log('Node Environment:', nodeEnv);
console.log('Swagger Server URL:', serverUrl);

const baseDir = __dirname; // e.g., /home/nwabekeyi/horizon-server/src/configs
const routesDir = path.resolve(baseDir, '../routes');
const apisPattern = `${routesDir}/*.js`;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Horizon project',
      version: '1.0.0',
      description: 'API documentation for my Horizon crypto app',
    },
    servers: [
      {
        url: serverUrl, // Dynamically set based on environment
      },
    ],
  },
  apis: [apisPattern],
};

let swaggerSpec;

try {
  const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

  if (routeFiles.length === 0) {
    console.error('No route files found. Swagger docs will be empty.');
  } else {
    console.log('Route files detected. Processing:', routeFiles);
  }

  swaggerSpec = swaggerJSDoc(swaggerOptions);

  if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
    console.warn('No paths in Swagger spec. Check annotations in:', routeFiles);
  }
} catch (error) {
  console.error('Swagger JSDoc Error:', error.message);
  console.error('Stack:', error.stack);
  swaggerSpec = { error: 'Swagger spec generation failed' };
}

export default swaggerSpec;