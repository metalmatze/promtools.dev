FROM alpine

RUN mkdir -p /app/vendor/slo-libsonnet

COPY ./slo-libsonnet-web /app
COPY ./vendor/slo-libsonnet /app/vendor/slo-libsonnet

WORKDIR /app
ENTRYPOINT ["/app/slo-libsonnet-web"]
