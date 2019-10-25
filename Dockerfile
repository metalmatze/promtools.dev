FROM alpine

COPY ./slo-libsonnet-web /app
COPY ./vendor /app/vendor

ENTRYPOINT ["/app/slo-libsonnet-web"]
