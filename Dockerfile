FROM alpine

RUN mkdir -p /app/vendor/slo-libsonnet
RUN mkdir -p /app/build

COPY ./slo-libsonnet-web /app
COPY ./vendor/slo-libsonnet /app/vendor/slo-libsonnet
COPY ./build/index.html /app/build
COPY ./build/main.dart.js /app/build

WORKDIR /app
ENTRYPOINT ["/app/slo-libsonnet-web"]
