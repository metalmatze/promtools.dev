import React, {ChangeEvent, useState} from "react";

import Layout from "../../../components/Layout";
import Alerts from "../../../components/alerts/alerts";

const Latencies = () => {
    const [target, setTarget] = useState(100);
    const [metric, setMetric] = useState('http_request_duration_seconds');

    return (
        <Layout>
            <Alerts>
                <form style={{border: '1px solid #dbdbdb', borderTop: 'none'}} className="p-4">
                    <div className="field">
                        <label htmlFor="" className="label">Latency Target (in ms)</label>
                        <input className="input" type="number" min="0" id="target" placeholder="100" autoFocus
                               value={target} onChange={(e: ChangeEvent) => setTarget(e.target.value)}/>
                        <small>99% of your requests are expected to be faster than this.</small>
                    </div>
                    <div className="field">
                        <label htmlFor="" className="label">Metric</label>
                        <input className="input" type="text" placeholder="http_requests_total" id="metric" autoFocus
                               value={metric} onChange={(e: ChangeEvent) => setMetric(e.target.value)}/>
                        <small>
                            The metric name to base the SLO on.<br/>
                            It's best to base this on metrics coming from a LoadBalancer or Ingress.
                        </small>
                    </div>
                    <button className="button is-promtools is-fullwidth">Generate</button>
                </form>
            </Alerts>
        </Layout>

    )
}

export default Latencies

