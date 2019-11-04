import 'dart:async';
import 'dart:convert';

import 'package:angular/angular.dart';
import 'package:angular_forms/angular_forms.dart';
import 'package:http/http.dart';

@Component(
  selector: 'my-app',
  templateUrl: 'app_component.html',
  directives: [coreDirectives, formDirectives],
  providers: [SLOService],
)
class AppComponent implements OnInit {
  final SLOService _sloService;

  AppComponent(this._sloService);

  SLO slo = SLO(
    availability: 99.9,
    metric: 'http_requests_total',
  );
  String generated = '';

  List<List<String>> selectors = [
    ['job', ''],
  ];
  String unavailability = '';
  bool loading = false;

  @override
  void ngOnInit() {
    unavailabilityMinutes();
  }

  void addSelector() => selectors.add(['', '']);

  void removeSelector(int i) => selectors.removeAt(i);

  Future generate() async {
    Map<String, String> selectorMap = Map<String, String>();
    selectors.forEach((selector) => selectorMap[selector[0]] = selector[1]);

    this.loading = true;

    _sloService
        .generate(SLO(
          availability: slo.availability,
          metric: slo.metric,
          selectors: selectorMap,
        ))
        .then((generated) => this.generated = generated)
        .whenComplete(() => loading = false);
  }

  void unavailabilityMinutes() {
    if (slo.availability == 100) {
      this.unavailability = "HAHAHAHAHA, THAT'S FUNNY!";
    }

    Duration thirtydays = Duration(days: 30);
    double unavailabilitySeconds =
        thirtydays.inSeconds * ((100 - slo.availability) / 100);
    Duration unavailability = Duration(seconds: unavailabilitySeconds.toInt());

    if (unavailability.compareTo(Duration(days: 1)) >= 0) {
      this.unavailability =
          '${unavailability.inDays}days ${unavailability.inHours % 24}h';
    } else if (unavailability.compareTo(Duration(hours: 1)) >= 0) {
      this.unavailability =
          '${unavailability.inHours}h ${unavailability.inMinutes % 60}min';
    } else if (unavailability.compareTo(Duration(minutes: 1)) >= 0) {
      this.unavailability = '${unavailability.inMinutes}min';
    }
  }
}

class SLO {
  SLO({this.availability, this.metric, this.selectors});

  double availability;
  String metric;
  Map<String, String> selectors;

  Map toJson() => {
        'availability': availability,
        'metric': metric,
        'selectors': selectors,
      };
}

class SLOService {
  final Client _http;

  SLOService(this._http);

  Future<String> generate(SLO slo) async {
    final response = await _http.post('/generate', body: json.encode(slo));
    if (response.statusCode == 200) {
      return response.body;
    }

    return '';
  }
}
