FROM oven/bun

WORKDIR /app

COPY package*.json bun*.lock ./

