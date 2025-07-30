# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code and build the app
COPY . .
RUN npm run build

# Production stage - serve with nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remove default static assets
RUN rm -rf ./*

# Copy React build from previous stage
COPY --from=build /app/build ./

# (Recommended) Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
