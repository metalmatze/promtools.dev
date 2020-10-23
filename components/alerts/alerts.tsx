import * as React from "react";
import {useRouter} from "next/router";
import Link from "next/link";

const SLO_ALERTS_ERRORS = '/slo/alerts/errors';
const SLO_ALERTS_LATENCIES = '/slo/alerts/latencies'

const Alerts = ({children}) => {
    const router = useRouter();
    const tab = router.pathname;

    return (
        <div className="container">
            <div className="columns my-3">
                <div className="column is-one-third">
                    <h1 className="title">SLOs with Prometheus</h1>
                    <h2 className="subtitle">Multiple Burn Rate Alerts</h2>
                    <p>
                        This page will generate, with the data you provide in the form, the necessary Prometheus
                        alerting and recording rules for <a
                        href="https://landing.google.com/sre/workbook/chapters/alerting-on-slos/#5-multiple-burn-rate-alerts">Multiple
                        Burn Rate</a>
                        which you might know from <a href="https://landing.google.com/sre/workbook/toc/">The Site
                        Reliability Workbook</a>.
                        These rules will evaluate based on the available metrics in the last <strong>30 days</strong>.
                    </p>

                    <div className="tabs is-boxed mt-5 mb-0">
                        <ul>
                            <li className={tab == SLO_ALERTS_ERRORS ? 'is-active' : ''}>
                                <Link href={SLO_ALERTS_ERRORS}>
                                    <a>
                                        <span className="icon is-small">
                                            <svg style={{height: 16}} aria-hidden="true" focusable="false"
                                                 data-icon="bug" className="svg-inline--fa fa-bug fa-w-16" role="img"
                                                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path
                                                fill="currentColor"
                                                d="M511.988 288.9c-.478 17.43-15.217 31.1-32.653 31.1H424v16c0 21.864-4.882 42.584-13.6 61.145l60.228 60.228c12.496 12.497 12.496 32.758 0 45.255-12.498 12.497-32.759 12.496-45.256 0l-54.736-54.736C345.886 467.965 314.351 480 280 480V236c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v244c-34.351 0-65.886-12.035-90.636-32.108l-54.736 54.736c-12.498 12.497-32.759 12.496-45.256 0-12.496-12.497-12.496-32.758 0-45.255l60.228-60.228C92.882 378.584 88 357.864 88 336v-16H32.666C15.23 320 .491 306.33.013 288.9-.484 270.816 14.028 256 32 256h56v-58.745l-46.628-46.628c-12.496-12.497-12.496-32.758 0-45.255 12.498-12.497 32.758-12.497 45.256 0L141.255 160h229.489l54.627-54.627c12.498-12.497 32.758-12.497 45.256 0 12.496 12.497 12.496 32.758 0 45.255L424 197.255V256h56c17.972 0 32.484 14.816 31.988 32.9zM257 0c-61.856 0-112 50.144-112 112h224C369 50.144 318.856 0 257 0z"></path></svg>
                                        </span>
                                        <span>Errors</span>
                                    </a>
                                </Link>
                            </li>
                            <li className={tab == SLO_ALERTS_LATENCIES ? 'is-active' : ''}>
                                <Link href={SLO_ALERTS_LATENCIES}>
                                    <a>
                                        <span className="icon is-small">
                                            <svg style={{height: 16}} aria-hidden="true" focusable="false"
                                                 data-prefix="fas"
                                                 data-icon="hourglass" className="svg-inline--fa fa-hourglass fa-w-12"
                                                 role="img"
                                                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path
                                                fill="currentColor"
                                                d="M360 64c13.255 0 24-10.745 24-24V24c0-13.255-10.745-24-24-24H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24 0 90.965 51.016 167.734 120.842 192C75.016 280.266 24 357.035 24 448c-13.255 0-24 10.745-24 24v16c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24 0-90.965-51.016-167.734-120.842-192C308.984 231.734 360 154.965 360 64z"></path></svg>
                                        </span>
                                        <span>Latencies</span>
                                    </a>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {children}

                </div>
                <div className="column is-two-thirds">
                    <pre></pre>
                </div>
            </div>
        </div>
    )
}

export default Alerts
