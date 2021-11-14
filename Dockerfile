FROM node:14.14.0-alpine3.12

COPY . ./app

WORKDIR /app

RUN npm i -g nodemon

RUN npm install

EXPOSE 8000

CMD npm run dev