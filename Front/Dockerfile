FROM node:22-alpine 

WORKDIR /app

COPY ./TFG/package.json ./TFG/yarn.lock ./

RUN yarn install

EXPOSE 5173

ENTRYPOINT ["yarn", "dev", "--host"]
