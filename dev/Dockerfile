
FROM node:latest

WORKDIR /usr/src/incidents

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["node", "index.js"]