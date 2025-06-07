FROM node:18.20.1-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --silent
COPY . .
RUN npm run build
EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000
RUN chown -R node:node /usr/src/app
USER node
CMD ["npm", "start"]

