FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

ENV OUT_DIR="/out"

RUN yarn && yarn build

FROM nginx:alpine3.19-slim

COPY --from=builder /out /usr/share/nginx/html
