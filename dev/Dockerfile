
FROM node:latest

WORKDIR /usr/src/incidents

COPY . .

RUN npm install && npm uninstall @types/core-js && npm run build && npm prune --production

RUN rm -r ./lib/

EXPOSE 8000

CMD ["npm", "start"]