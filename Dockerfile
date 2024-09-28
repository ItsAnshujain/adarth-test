# Use the official Node.js image
FROM node:20-alpine3.18 as builder

# Set environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies, including dev dependencies
RUN npm install --legacy-peer-deps

# Run the postinstall script after installing all dependencies
RUN npm run postinstall

# Remove dev dependencies after running postinstall
RUN npm prune --omit=dev

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
