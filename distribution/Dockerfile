############# Builder image #############
FROM node:12.22.1-stretch-slim as builder

WORKDIR /source.tmp

COPY . .
RUN apk add --no-cache git

RUN npm install && \
  npm run build && \
  cd dist && \
  npm install --only=prod


############# Runner image #############
FROM node:12.22.1-stretch-slim

WORKDIR /opt/idlogiq/rpm-backend

COPY --from=builder /source.tmp/dist .

EXPOSE 3000

CMD [ "node", "index.js" ]
