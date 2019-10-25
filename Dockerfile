FROM alpine

COPY ./slo-libsonnet-web /app
COPY ./vendor /app

ENTRYPOINT ["/app/slo-libsonnet-web"]
