#FROM node:alpine
#WORKDIR /app
#COPY package.json ./
#COPY package-lock.json ./
#COPY ./ ./
#RUN npm i
#CMD ["npm", "run", "start"]
FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
CMD	["npm", "run", "start"]