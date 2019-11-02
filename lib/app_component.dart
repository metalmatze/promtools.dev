import 'package:angular/angular.dart';
import 'package:angular_forms/angular_forms.dart';

@Component(
  selector: 'my-app',
  templateUrl: 'app_component.html',
  directives: [formDirectives],
)
class AppComponent implements OnInit {
  SLO slo = SLO(availability: 99.9, metric: 'http_requests_total');

  String unavailability = '';
  bool loading = false;

  @override
  void ngOnInit() {
    unavailabilityMinutes();
  }

  void generate() {
    print('${slo.availability} - ${slo.metric} - ${slo.selectors}');
  }

// TODO: Something funny when 100% availability

  void unavailabilityMinutes() {
    Duration thirtydays = Duration(days: 30);
    double unavailabilitySeconds =
        thirtydays.inSeconds * ((100 - slo.availability) / 100);
    Duration unavailability = Duration(seconds: unavailabilitySeconds.toInt());

    if (unavailability.compareTo(Duration(days: 1)) >= 0) {
      this.unavailability = '${unavailability.inDays}days ${unavailability.inHours % 24}h';
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
}
