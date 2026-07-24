FROM oven/bun AS builder

WORKDIR /app

COPY package*.json bun*.lock ./
RUN bun ci

COPY . .

RUN bun run build

#----------------------------------------------
FROM nginx:alpine

RUN apk update
RUN apk add --no-cache curl iputils-ping


COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]