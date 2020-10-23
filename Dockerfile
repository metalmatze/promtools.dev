FROM golang:1.14 AS build
WORKDIR /go/src/github.com/metalmatze/promtools.dev
COPY . .
RUN make build

FROM alpine

RUN mkdir -p /app/web/
COPY --from=build /go/src/github.com/metalmatze/promtools.dev/promtools.dev /app

WORKDIR /app
ENTRYPOINT ["/app/promtools.dev"]
