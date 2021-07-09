local k = import 'github.com/ksonnet/ksonnet-lib/ksonnet.beta.4/k.libsonnet';
local service = k.core.v1.service;
local servicePort = service.mixin.spec.portsType;
local deployment = k.apps.v1.deployment;
local container = deployment.mixin.spec.template.spec.containersType;
local containerPort = container.portsType;

local name = 'promtools';
local image = 'quay.io/metalmatze/slo-libsonnet-web:%s' % std.extVar('tag');
local labels = { 'app.kubernetes.io/name': name };

k.core.v1.list.new([
  service.new(
    name,
    labels,
    [servicePort.newNamed('http', 9099, 9099)]
  ),
  deployment.new(
    name,
    1,
    container.new(
      name,
      image,
    ) +
    container.withPorts(containerPort.newNamed(9099, 'http')) +
    container.mixin.resources.withRequests({ cpu: '100m', memory: '64Mi' }) +
    container.mixin.resources.withLimits({ cpu: '250m', memory: '256Mi' }),
    labels,
  ) +
  deployment.mixin.spec.selector.withMatchLabels(labels),
])
