# Use the official Node.js image
FROM node:20-alpine3.18 as builder

# Set environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only the `patch-package` tool first
RUN npm install patch-package --legacy-peer-deps

# Install the remaining dependencies (including dev dependencies)
RUN npm install --legacy-peer-deps

# Run the patch-package tool after it has been installed
RUN npm run postinstall

# Remove dev dependencies after postinstall and build
RUN npm prune --omit=dev

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
