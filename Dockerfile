FROM oven/bun AS builder

WORKDIR /app

COPY package*.json bun*.lock ./
RUN bun ci

COPY . .

RUN bun run build

#----------------------------------------------
FROM nginx:alpine

RUN apk update
RUN apk add --no-cache curl iputils-ping openssl

RUN openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=DevOps/CN=localhost"


COPY --from=builder /app/dist /usr/share/nginx/html

# COPY default.conf /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/templates/default.conf.template

ENV BACKEND_URL=http://localhost:3000

EXPOSE 80 443

# ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
