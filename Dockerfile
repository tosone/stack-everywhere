FROM node:lts-alpine AS build

WORKDIR /app

RUN apk update && apk upgrade && apk add autoconf automake \
  gcc g++ make libffi-dev openssl-dev gawk file nasm zlib-dev

COPY $PWD /app

RUN npm i && npm run build

FROM httpd:alpine AS release

COPY --from=build /app/public /usr/local/apache2/htdocs/
