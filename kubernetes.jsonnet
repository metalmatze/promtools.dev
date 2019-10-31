local k = import 'ksonnet/ksonnet.beta.4/k.libsonnet';
local deployment = k.apps.v1.deployment;
local container = deployment.mixin.spec.template.spec.containersType;

local tag = std.extVar('tag');

k.core.v1.list.new([
  deployment.new(
    'slo-libsonnet-web',
    1,
    container.new(
      'slo-libsonnet-web',
      'metalmatze/slo-libsonnet-web:%s' % tag,
    ),
  )
])
