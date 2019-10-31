REVISION ?= $(shell git rev-parse --short=7 HEAD)

all: build

build: slo-libsonnet-web

slo-libsonnet-web:
	go build -v -ldflags '-w -extldflags '-static''

kubernetes.yaml: kubernetes.jsonnet
	jsonnet -J vendor --ext-str tag=$(REVISION) kubernetes.jsonnet | gojsontoyaml > kubernetes.yaml
