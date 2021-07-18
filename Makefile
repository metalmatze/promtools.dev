REVISION ?= $(shell git rev-parse --short=7 HEAD)

all: build

build: promtools.dev

promtools.dev: $(shell find . -name '*.go')
	CGO_ENABLED=0 go build -v -ldflags '-w -extldflags '-static''

kubernetes.yaml: kubernetes.jsonnet
	jsonnet -J vendor --ext-str tag=$(REVISION) kubernetes.jsonnet | gojsontoyaml > kubernetes.yaml

node_modules: package.json package-lock.json
	npm install
	touch $@

web/bundle.js: node_modules $(shell find ./web -iname '*.js' | grep -v ./web/bundle.js)
	npm run build
