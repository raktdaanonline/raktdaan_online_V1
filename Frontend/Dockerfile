FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_APP_API_URL=https://bloodinfo.in/api
ARG VITE_SOCKET_URL=https://bloodinfo.in

ENV VITE_APP_API_URL=$VITE_APP_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

ARG SOURCE_COMMIT
ENV SOURCE_COMMIT=$SOURCE_COMMIT
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
