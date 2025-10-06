# server/Dockerfile
FROM node:22.12.0

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install all dependencies (including dev ones, since nodemon is inside dependencies)
RUN npm install

# Copy the rest of the source code
COPY . .

EXPOSE 5000

# Use nodemon to auto-reload server
CMD ["npx", "nodemon", "server.js"]
