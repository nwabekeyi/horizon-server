# Use exact Node.js version from local (18.20.1)
FROM node:18.20.1-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first to leverage Docker caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --silent

# Copy all application code (including server.js)
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables (optional - they can be set on Render's dashboard)
ENV NODE_ENV=production
ENV PORT=5000

# Set permissions to ensure correct user access
RUN chown -R node:node /usr/src/app

# Switch to the 'node' user
USER node

# Command to start the application
CMD ["npm", "start"]
