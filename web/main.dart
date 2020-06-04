import 'package:angular/angular.dart';
import 'package:http/browser_client.dart';
import 'package:http/http.dart';
import 'package:promtools/app_component.template.dart' as ng;

import 'main.template.dart' as self;

@GenerateInjector([
  ClassProvider(Client, useClass: BrowserClient),
])
final InjectorFactory injector = self.injector$Injector;

void main() {
  runApp(ng.AppComponentNgFactory, createInjector: injector);
}
