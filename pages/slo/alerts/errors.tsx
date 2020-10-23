import * as React from "react";
import {ChangeEvent, FormEvent, useState} from "react";

import Layout from "../../../components/Layout";
import Alerts from "../../../components/alerts/alerts";

const AlertErrors = () => {
    const [target, setTarget] = useState(99.9)
    const [metric, setMetric] = useState('http_requests_total')

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
        ).then((resp) => console.log(resp)).catch()
    }

    return (
        <Layout>
            <Alerts>
                {/*<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-right" className="svg-inline--fa fa-chevron-right fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path></svg>*/}
                {/*<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-down" className="svg-inline--fa fa-chevron-down fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>*/}

                <form style={{border: '1px solid #dbdbdb', borderTop: 'none'}} className="p-4"
                      onSubmit={(e: FormEvent) => generate(e)}>
                    <div className="field">
                        <label className="label" htmlFor="target">Availability Target (Unavailability in 30 days: 43min 11s)</label>
                        <div className="control">
                            <input className="input" type="number" placeholder="0-100" autoFocus
                                   step="0.001" min="0" max="100" id="target"
                                   value={target} onChange={(e: ChangeEvent) => setTarget(e.target.value)}/>
                            <small>
                                <a href="https://landing.google.com/sre/sre-book/chapters/availability-table/">Availability</a> is
                                generally calculated based on how long a service was unavailable over some
                                period.
                            </small>
                        </div>
                    </div>
                    <div className="field">
                        <label className="label" htmlFor="metric">Metric</label>
                        <div className="control">
                            <input className="input" type="text" placeholder="http_requests_total"
                                   id="metric"
                                   autoFocus value={metric}
                                   onChange={(e: ChangeEvent) => setMetric(e.target.value)}/>
                            <small>
                                The metric name to base the SLO on.<br/>
                                It's best to base this on metrics coming from a LoadBalancer or Ingress.
                            </small>
                        </div>
                    </div>
                    <button className="button is-promtools is-fullwidth">Generate</button>
                </form>
            </Alerts>
        </Layout>
    )
}

export default AlertErrors
