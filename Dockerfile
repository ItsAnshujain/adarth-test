# Stage 1: Build
FROM node:20-alpine3.18 as builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Run the build process (if applicable)
RUN npm run build

# Stage 2: Production
FROM node:20-alpine3.18

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app ./

# Start the application without pruning
CMD ["npm", "run", "start"]
