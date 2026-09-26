FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (only production)
RUN npm ci --only=production

# Copy application files
COPY scripts/ scripts/
COPY scratch/ scratch/

# Create a non-root user for security
RUN addgroup -S botgroup && adduser -S botuser -G botgroup
RUN chown -R botuser:botgroup /usr/src/app

USER botuser

# Run the bot
CMD ["node", "scripts/telegram_bot.js"]
