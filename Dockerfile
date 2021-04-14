FROM alpine:3.10

COPY action/dist/index.js /index.js

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    git jq curl bash tar nodejs nodejs-npm
    
    
RUN curl -sL https://github.com/Kong/deck/releases/download/v1.6.0/deck_1.6.0_linux_amd64.tar.gz -o deck.tar.gz
RUN tar -xf deck.tar.gz -C /tmp
RUN cp /tmp/deck /usr/local/bin/

ENTRYPOINT [ "node", "/index.js" ]
