# Use the official Node.js image
FROM node:22.7.0-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --ignore-platform

# Copy the rest of the application files
COPY . .

# Expose the port that Next.js will run on
EXPOSE 3000

# Start the Next.js app in development mode
# CMD ["yarn", "dev"]
CMD ["yarn", "vite", "--host"]

