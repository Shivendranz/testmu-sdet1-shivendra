# Use the official Playwright image — browsers and system deps are pre-installed.
FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json package-lock.json* ./
RUN npm ci

# Copy framework source.
COPY . .

# Ensure headless execution in containers.
ENV HEADLESS=true
ENV CI=true

# Run the full test suite and exit with Playwright's status code.
CMD ["npx", "playwright", "test"]
