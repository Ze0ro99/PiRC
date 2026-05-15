FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
RUN npm install
COPY apps/frontend ./apps/frontend
RUN npm run build --workspace=apps/frontend

FROM nginx:alpine
COPY --from=frontend-builder /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
