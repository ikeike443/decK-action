FROM alpine:3.10

COPY entrypoint.sh /entrypoint.sh

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    jq curl bash tar

RUN curl -sL https://github.com/hbagdi/deck/releases/download/v1.0.3/deck_1.0.3_linux_amd64.tar.gz -o deck.tar.gz
RUN tar -xf deck.tar.gz -C /tmp
RUN cp /tmp/deck /usr/local/bin/

ENTRYPOINT [ "/entrypoint.sh" ]