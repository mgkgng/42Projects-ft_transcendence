FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV PORT 3002
EXPOSE 3002 
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
RUN npm run build
CMD ["/entrypoint.sh"]