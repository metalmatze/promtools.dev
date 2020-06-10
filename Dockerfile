FROM alpine

RUN mkdir -p /app/vendor/github.com/metalmatze/slo-libsonnet/
RUN mkdir -p /app/web/

COPY ./promtools.dev /app
COPY ./web /app/web
COPY ./vendor/github.com/metalmatze/slo-libsonnet/slo-libsonnet /app/vendor/github.com/metalmatze/slo-libsonnet/slo-libsonnet

WORKDIR /app
ENTRYPOINT ["/app/promtools.dev"]
