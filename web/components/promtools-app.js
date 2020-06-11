import {css, html, LitElement} from 'https://unpkg.com/lit-element@2.3.1/lit-element.js?module';
import './promtools-form.js';
import './promtools-output.js';

class App extends LitElement {
    static get properties() {
        return {
            loading: {type: Boolean, attribute: false},
            output: {type: String},
        }
    }

    static get styles() {
        return css`
            a {
                color: var(--primary-color);
                text-decoration: none;
            }

            a:hover {
                text-decoration: underline;
            }

            h1, h2 {
                margin: 0;
                padding: 0;
            }

            .title {
                font-size: 2rem;
                font-weight: 700;
                line-height: 1.125;
            }

            .subtitle {
                font-size: 1.25rem;
                font-weight: 400;
                line-height: 1.25;
                color: var(--text-color-light);
            }

            .section {
                padding: 3rem 1.5rem;
            }

            hr {
                display: block;
                height: 2px;
                margin: 1.5rem 0;
                border: none;
                background-color: var(--border-color);
            }

            .row {
                box-sizing: border-box;
                display: flex;
                flex: 0 1 auto;
                flex-direction: row;
                flex-wrap: wrap;
                margin-right: var(--gutter-compensation, -0.5rem);
                margin-left: var(--gutter-compensation, -0.5rem);
            }

            @media screen and (min-width: 48em) {
                .container {
                    width: var(--container-sm, 46rem);
                }
                .col-sm-4 {
                    flex-basis: calc(4 / 12 * 100%);
                    max-width: calc(4 / 12 * 100%);
                }
                .col-sm-8 {
                    flex-basis: calc(8 / 12 * 100%);
                    max-width: calc(8 / 12 * 100%);
                }
            }
        `;
    }

    constructor() {
        super();
        this.loading = false;
        this.output = '';
    }

    render() {
        return html`
            <div class="row">
                <div class="col-sm-4">
                    <section class="section">
        
                        <h1 class="title">SLOs with Prometheus</h1>
        
                        <h2 class="subtitle">Multiple Burn Rate Alerts</h2>
        
                        <p>
                            This page will generate, with the data you provide in the form, the necessary Prometheus alerting
                            and recording rules for
                            <a href="https://landing.google.com/sre/workbook/chapters/alerting-on-slos/#5-multiple-burn-rate-alerts">Multiple
                                Burn Rate</a> which you might know from
                            <a href="https://landing.google.com/sre/workbook/toc/">The Site Reliability Workbook</a>.
                            These rules will evaluate based on the available metrics in the last <strong>30 days</strong>.
                        </p>
                        <br>
                        <promtools-form ?loading="${this.loading}" @generate="${this.generate}"></promtools-form>
                        <hr>
                        <p>
                            This project is based on the <a href="https://github.com/metalmatze/slo-libsonnet">SLO-libsonnet</a>
                            project to generate the YAML with jsonnet.<br>
                            The Web UI is built with 
                            <a href="https://lit-element.polymer-project.org/">LitElement</a>
                            and 
                            <a href="https://golang.org">Go</a> 
                            and the <a href="https://github.com/metalmatze/promtools.dev">source is on GitHub</a> too.
                        </p>
                        <p>
                            Built by <a href="https://twitter.com/metalmatze">MetalMatze</a>.
                            Feel free to reach out for feedback or questions.
                        </p>
                    </section>
                </div>
                <div class="col-sm-8">
                    <section class="section">
                        <promtools-output .output="${this.output}"></promtools-output>
                    </section>
                </div>
            </div>`;
    };

    async generate(event) {
        this.loading = true;

        await fetch('/generate', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                metric: event.detail.metric,
                availability: event.detail.availability,
                selectors: event.detail.selectors,
            })
        })
            .then((resp) => resp.text())
            .then((text) => this.output = text)
            .catch((err) => console.log(err))
            .finally(() => this.loading = false);
    }
}

customElements.define('promtools-app', App);
