import React, {FormEvent, useState} from "react"
import {Col, Container, Row, Tab, Tabs} from "react-bootstrap";
import AlertsErrors from "../components/alerts/Errors";

const Alerts = () => {
    const [target, setTarget] = useState(99.9)
    const [metric, setMetric] = useState('http_requests_total')
    const [tab, setTab] = useState('errors')

    const generate = (event: FormEvent) => {
        event.preventDefault()

        const detail = {
            function: 'errorburn',
            metric: metric,
            availability: target,
            // selectors: selectors,
        };

        fetch('https://promtools.dev/generate', {
                method: 'POST',
                cache: 'no-cache',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(detail)
            }
        ).then((resp) => console.log(resp))
    }

    function selectTab(t: string | null) {
        if (t != null) {
            setTab(t)
        }
    }

    return (
        <Container fluid="xl">
            <Row>
                <Col xl={6}>
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
                            <AlertsErrors/>
                        </Tab>
                        <Tab eventKey="profile" title="Latency">
                            <div>latency</div>
                        </Tab>
                    </Tabs>

                    <hr/>

                    <p>
                        This project is based on the <a
                        href="https://github.com/metalmatze/slo-libsonnet">SLO-libsonnet</a>
                        {' '}project to generate the YAML with jsonnet.<br/>
                        The Web UI is built with{' '}
                        <a href="https://lit-element.polymer-project.org/">LitElement</a>
                        {' '}and{' '}
                        <a href="https://golang.org">Go</a>
                        {' '}and the <a href="https://github.com/metalmatze/promtools.dev">source is on GitHub</a> too.
                    </p>
                    <p>
                        Built by <a href="https://twitter.com/metalmatze">MetalMatze</a>.
                        Feel free to reach out for feedback or questions.
                    </p>
                </Col>
                <Col xl={6}>generated</Col>
            </Row>
        </Container>
    );
}

export default Alerts
