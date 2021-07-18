import React, { useState } from "react"
import { Alert, Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import "./Alerts.scss";
import AlertsErrors from "./alerts/Errors";
import AlertsLatency from './alerts/Latency'

const Alerts = () => {
  const history = useHistory();
  const location = useLocation();
  const tab = location.pathname.split('/')[2]

  const selectTab = (t: string | null) => history.push(`/alerts/${t}`)

  const [generated, setGenerated] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleGenerated = (body: string, err: string) => {
    setGenerated(body)
    setError(err)
  }

  return (
    <Container fluid="xl">
      <Row>
        <Col md={6} xl={5}>
          <h1 className="mb-0">SLOs with Prometheus</h1>
          <h4 className="text-secondary mb-4">Multiple Burn Rate Alerts</h4>
          <p>
            This page will generate, with the data you provide in the form,
            the necessary Prometheus alerting and recording rules for&nbsp;
            <a href="https://landing.google.com/sre/workbook/chapters/alerting-on-slos/#5-multiple-burn-rate-alerts">
              Multiple Burn Rate
            </a>
            &nbsp; which you might know from&nbsp;
            <a href="https://landing.google.com/sre/workbook/toc/">The Site Reliability Workbook</a>.
            These rules will evaluate based on the available metrics in the last <strong>30 days</strong>.
          </p>

          <Tabs activeKey={tab} onSelect={selectTab} transition={false}>
            <Tab eventKey="errors" title="Errors">
              <AlertsErrors generated={handleGenerated}/>
            </Tab>
            <Tab eventKey="latency" title="Latency">
              <AlertsLatency generated={handleGenerated}/>
            </Tab>
          </Tabs>

          <hr/>

          <p>
            This project is based on the <a
            href="https://github.com/metalmatze/slo-libsonnet">SLO-libsonnet</a>
            {' '}project to generate the YAML with jsonnet.<br/>
            The Web UI is built with{' '}
            <a href="https://reactjs.org/">React</a>
            {' '}and{' '}
            <a href="https://golang.org">Go</a>.
            {' '}The <a href="https://github.com/metalmatze/promtools.dev">source is on GitHub</a>.
          </p>
          <p>
            Built by <a href="https://twitter.com/metalmatze">MetalMatze</a>.
            Feel free to reach out for feedback or questions.
          </p>
        </Col>
        <Col md={6} xl={7}>
          {error !== '' ? (
            <Alert variant="danger">{error}</Alert>
          ) : (<></>)}
          {generated !== '' ? (
            <pre className="output">{generated}</pre>
          ) : (<></>)}
        </Col>
      </Row>
    </Container>
  );
}

export default Alerts
