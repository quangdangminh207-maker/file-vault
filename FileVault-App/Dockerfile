FROM node:20-alpine

WORKDIR /app

# Copy toàn bộ mã nguồn
COPY . .

# Cài đặt dependencies và build giao diện
RUN npm --prefix client install && npm --prefix client run build
RUN npm --prefix server install

EXPOSE 5000

CMD ["node", "server/src/server.js"]
