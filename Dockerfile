# Use the official Node.js image
FROM node:20-alpine3.18 as builder

# Set environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including dev dependencies temporarily)
RUN npm install --legacy-peer-deps

# Remove dev dependencies after installation
RUN npm prune --omit=dev

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
