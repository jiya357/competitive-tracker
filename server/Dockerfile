FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy server code
COPY server.js .
COPY .env* ./

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
