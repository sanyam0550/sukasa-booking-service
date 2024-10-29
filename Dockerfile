# Base image
FROM node:22-bullseye-slim

# Set environment variables
ENV NODE_ENV=production \
    PROJECT_HOME=/usr/app/

# Create project home directory
RUN mkdir -p ${PROJECT_HOME}

# Set working directory
WORKDIR ${PROJECT_HOME}

# Install latest version of npm
RUN npm install -g npm@latest


# Copy package.json and package-lock.json to install dependencies
COPY package*.json ${PROJECT_HOME}

# Install npm dependencies
RUN npm install --quiet

# Clear npm cache
RUN npm cache clean --force

# Copy application source code to the container
COPY . ${PROJECT_HOME}

# Build the Node.js application (optional step if your app has a build process)
RUN npm run build

# Expose necessary port (adjust based on your application)
EXPOSE 3000

# Start the application directly using Node.js in production mode
CMD ["npm", "run", "start:prod"]