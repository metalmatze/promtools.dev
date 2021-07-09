import React, { ChangeEvent, FormEvent, useState } from "react";
import {Button, Col, Form, Row} from "react-bootstrap";
import './Errors.scss';
import Selectors from '../../components/Selectors'

const AlertsErrors = () => {
    const [target, setTarget] = useState(99.9);
    const [unavailability, setUnavailability] = useState('');
    const [metric, setMetric] = useState('http_requests_total');

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

    const generate = (event: FormEvent) => {
      event.preventDefault()

      const detail = {
        function: 'errorburn',
        metric: metric,
        availability: target
        // selectors: selectors,
      };

      fetch('https://promtools.dev/generate', {
          method: 'POST',
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(detail)
        }
      ).then((resp) => console.log(resp))
    }

    return (
        <Row>
            <Col>
                <Form onSubmit={generate}>
                    <Form.Group controlId="target">
                        <Form.Label>Availability Target (Unavailability in 30 days: {unavailability})</Form.Label>
                        <input className="form-control" type="number" placeholder="0-100" autoFocus
                               step="0.001" min="0" max="100" id="target"
                               value={target}
                               onChange={(e: ChangeEvent<HTMLInputElement>) => updateTarget(e.currentTarget.value)}/>

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

                    <Selectors/>

                    <Button variant="primary" type="submit">Generate</Button>
                </Form>
            </Col>
        </Row>
    );
}

export default AlertsErrors;
