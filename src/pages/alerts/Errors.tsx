import React, { ChangeEvent, FormEvent, useState } from "react";
import { Accordion, Button, Col, Form, Row } from "react-bootstrap";
import './Errors.scss';
import Selectors, { Selector } from '../../components/Selectors'

interface AlertErrorsProps {
  generated: (body: string, err: string) => void
}

const AlertsErrors = (props: AlertErrorsProps) => {
  const [target, setTarget] = useState<number>(99.9);
  const [unavailability, setUnavailability] = useState('');
  const [metric, setMetric] = useState('http_requests_total');
  const [selectors, setSelectors] = useState<Selector[]>([])
  const [alertName, setAlertName] = useState<string | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [errorSelector, setErrorSelector] = useState<string | null>(null)

  const [loading, setLoading] = useState<boolean>(false)

  const updateTarget = (value: string) => {
    const target = Number(value)
    setTarget(target);
    updateUnavailabilityMinutes(target)
  };

  const updateUnavailabilityMinutes = (target: number) => {
    if (target === 100.0) {
      setUnavailability("HAHAHAHAHA, THAT'S FUNNY!");
      return;
    }

    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;

    let seconds = (30 * day) * ((100 - target) / 100);

    if (seconds >= day) {
      setUnavailability(`${Math.floor(seconds / day)}days ${Math.floor((seconds / hour) % 24)}hours`);
      return;
    }
    if (seconds >= hour) {
      setUnavailability(`${Math.floor(seconds / hour)}hours ${Math.floor((seconds / minute) % 60)}min`);
      return;
    }
    if (seconds >= minute) {
      setUnavailability(`${Math.floor(seconds / minute)}min ${Math.floor(seconds % 60)}s`);
      return;
    }
    setUnavailability(`${Math.floor(seconds)}s`);
  }

  const generate = (e: FormEvent) => {
    e.preventDefault()

    setLoading(true)

    const detail = {
      function: 'errorburn',
      metric: metric,
      availability: target,
      selectors: selectors
    };

    fetch('http://localhost:9099/generate', {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detail)
      }
    )
      .then((resp) => resp.text())
      .then((body: string) => props.generated(body, ''))
      .catch((err) => props.generated('', err.message))
      .finally(() => setLoading(false))
  }

  const handleSelectorChange = (selectors: Selector[]) => setSelectors(selectors)

  return (
    <Row>
      <Col>
        <Form onSubmit={generate}>
          <Form.Group controlId="target">
            <Form.Label>Availability Target (Unavailability in 30 days: {unavailability})</Form.Label>
            <input className="form-control" type="number" placeholder="0-100" autoFocus
                   step="0.001" min="0" max="100" id="target"
                   value={target}
                   onChange={(e: ChangeEvent<HTMLInputElement>) => updateTarget(e.currentTarget.value)}
            />
            <Form.Text className="text-muted">
              <a href="https://landing.google.com/sre/sre-book/chapters/availability-table/">Availability</a>
              &nbsp;is generally calculated based on how long a service was unavailable over some period.
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="metric">
            <Form.Label>Metric</Form.Label>
            <Form.Control
              type="text"
              value={metric}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMetric(e.currentTarget.value)}
            />
            <Form.Text className="text=muted">
              The metric name to base the SLO on.<br/>
              In the beginning it's best to base this on metrics coming from a LoadBalancer or Ingress.
            </Form.Text>
          </Form.Group>

          <Selectors onSelectorsChange={handleSelectorChange}/>

          <Accordion defaultActiveKey="1">
            <Accordion.Toggle as={Button} variant="link" eventKey="0">
              Advanced
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
              <>
                <Form.Group controlId="alertName">
                  <Form.Label>Alert Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={alertName == null ? '' : alertName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAlertName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="alertMessage">
                  <Form.Label>Alert Message</Form.Label>
                  <Form.Control
                    type="text"
                    value={alertMessage == null ? '' : alertMessage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAlertMessage(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="errorSelector">
                  <Form.Label>Error Selector</Form.Label>
                  <Form.Control
                    type="text"
                    value={errorSelector == null ? '' : errorSelector}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setErrorSelector(e.target.value)}
                    placeholder={`code=~"5.."`}
                  />
                </Form.Group>
              </>
            </Accordion.Collapse>
          </Accordion>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Generating…' : 'Generate'}
          </Button>
        </Form>
      </Col>
    </Row>
  );
}

export default AlertsErrors;
