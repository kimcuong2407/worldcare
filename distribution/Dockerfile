############# Builder image #############
FROM 399008899479.dkr.ecr.us-west-2.amazonaws.com/idlogiq/nodejs:10.16.0 as builder

WORKDIR /source.tmp

COPY . .

RUN npm install && \
  npm run build && \
  cd dist && \
  npm install --only=prod


############# Runner image #############
FROM 399008899479.dkr.ecr.us-west-2.amazonaws.com/idlogiq/nodejs:10.16.0

WORKDIR /opt/idlogiq/rpm-backend

COPY --from=builder /source.tmp/dist .

EXPOSE 3700

CMD [ "node", "index.js" ]
