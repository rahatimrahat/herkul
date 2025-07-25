# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
# This ensures that npm install uses the lock file if available.
COPY package*.json ./

# Install dependencies, including devDependencies needed for ts-node
# This command will install @fingerprintjs/fingerprintjs, express, typescript, ts-node, etc.
RUN npm install
RUN npm install --save-dev @types/node @types/express

# Copy the rest of the application code
COPY . .

# Expose the port the application will run on
EXPOSE 3000

# Command to run the application using ts-node
# This will execute index.ts directly.
CMD ["npm", "start"]
