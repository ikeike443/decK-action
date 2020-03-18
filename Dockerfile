FROM hbagdi/deck


COPY entrypoint.sh /entrypoint.sh
USER root
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    git



ENTRYPOINT [ "/entrypoint.sh" ]