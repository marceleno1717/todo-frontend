FROM oven/bun AS builder

WORKDIR /app

COPY package*.json bun*.lock ./
RUN bun ci

COPY . .

RUN bun run build

#----------------------------------------------
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]