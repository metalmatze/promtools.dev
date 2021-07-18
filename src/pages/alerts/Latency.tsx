import { Accordion, Button, Col, Form, Row } from 'react-bootstrap'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import Selectors, { Selector } from '../../components/Selectors'

interface AlertsLatencyProps {
  generated: (body: string, err: string) => void
}

const AlertsLatency = (props: AlertsLatencyProps): JSX.Element => {
  const [target, setTarget] = useState<number>(100)
  const [metric, setMetric] = useState('http_request_duration_seconds');
  const [selectors, setSelectors] = useState<Selector[]>([])
  const [alertName, setAlertName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSelectorChange = (selectors: Selector[]) => setSelectors(selectors)

  const generate = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const details = {
      function: 'latencyburn',
      metric: metric,
      availability: target,
      selectors: selectors
    }

    fetch('http://localhost:9099/generate', {
      method: 'POST',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    })
      .then((resp: Response) => resp.text())
      .then((body: string) => props.generated(body, ''))
      .catch((err) => props.generated('', err.message))
      .finally(() => setLoading(false))
  }

  return (
    <Row>
      <Col>
        <Form onSubmit={generate}>
          <Form.Group controlId="target">
            <Form.Label>Latency Target (in ms)</Form.Label>
            <Form.Control
              type="number"
              value={target}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTarget(parseFloat(e.currentTarget.value))}
            />
            <Form.Text className="text-muted">
              99% of your requests are expected to be faster than this.
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
              </>
            </Accordion.Collapse>
          </Accordion>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Generating…' : 'Generate'}
          </Button>
        </Form>
      </Col>
    </Row>
  )
}

export default AlertsLatency;
