import {css, html, LitElement} from 'https://unpkg.com/lit-element@2.3.1/lit-element.js?module';
import './ui-button.js';

class Form extends LitElement {
    static get properties() {
        return {
            target: {type: Number},
            unavailability: {type: String},
            metric: {type: String},
            selectors: {type: Array},
            loading: {type: Boolean},
        };
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

            .field {
                margin-bottom: 0.75rem;
            }
            .field.group {
                display: flex;
            }
            .field.group .label {
                padding: 0 0.25rem;
            }
            .field.group .label:first-child {
                padding-left: 0;
            }
            .field.group .label:last-child {
                padding-right: 0;
            }
            .field h3 {
                margin: 0;
            }
            .label {
                width: 100%;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 700;
            }
            .control {
                box-sizing: border-box;
                clear:both;
                font-size: 1rem;
                position: relative;
                text-align: left;
            }
            .help {
                font-size: 0.75rem;
                margin-top: 0.25rem;
            }
            .input {
                width: calc(100% - 2*(0.75rem + 1px));
                max-width: 100%;
                padding: 0.5rem 0.75rem;
                box-shadow: inset 0 0.0625em 0.125em var(--border-color);
                border: 1px solid var(--border-color);
                border-radius: 0.25rem;
                color: var(--text-color);
                font-size: 1rem;
                height: 1.5rem;
                line-height: 1.5;
            }
            .input:hover {
                border-color: var(--border-color-hover);
            }
            .input:focus {
                outline: 0;
                border-color: var(--primary-color);
            }
        `;
    }

    constructor() {
        super();
        this.target = 99.9;
        this.metric = 'http_requests_total';
        this.selectors = [{name: 'job', value: 'prometheus'}];

        this.unavailabilityMinutes(this.target);
    }

    render() {
        return html`
            <form @submit="${this.generate}">
                <div class="field">
                    <label class="label" for="target">
                        <h3>Availability (Unavailability in 30 days: ${this.unavailability})</h3>
                        <div class="control">
                            <input class="input" type="number" step="0.001" min="0" max="100" id="target"
                                autofocus
                                .value="${this.target}"
                                @change="${(event) => this.unavailabilityMinutes(parseFloat(event.target.value))}"
                                @keyup="${(event) => this.unavailabilityMinutes(parseFloat(event.target.value))}"
                                ?disabled=${this.loading}
                            />
                        </div>
                    </label>
                    <p class="help">
                        <a href="https://landing.google.com/sre/sre-book/chapters/availability-table/">Availability</a>
                        is generally calculated based on how long a service was unavailable over some period.
                    </p>
                </div>
                <div class="field">
                    <label for="metric" class="label">
                        <h3>Metric</h3>
                        <div class="control">
                            <input class="input" type="text" placeholder="http_requests_total" id="metric"
                                autofocus
                                .value="${this.metric}"
                                @change="${(event) => this.metric = event.target.value}"
                                ?disabled=${this.loading}
                            />
                        </div>
                    </label>
                    <p class="help">
                        The metric name to base the SLO on.<br>
                        It's best to base this on metrics coming from a LoadBalancer or Ingress.
                    </p>
                </div>

                <div class="field group">
                    <div style="flex: 1">
                        <h3>Selectors</h3>
                    </div>
                    <div>
                        <ui-button @click="${() => this.addSelector()}">+</ui-button>
                    </div>
                </div>

                ${this.selectors.map((selector, i) => html`
                    <div class="field group">
                        <label class="label">Name
                            <div class="control">
                                <input type="text" class="input" .value="${selector.name}"
                                    ?disabled="${this.loading}"
                                    @change="${(event) => this.updateSelector('name', i, event.target.value)}"
                                    @keyup="${(event) => this.updateSelector('name', i, event.target.value)}"
                                />
                            </div>
                        </label>
                        <label class="label">Value
                            <div class="control">
                                <input type="text" class="input" .value="${selector.value}"
                                    ?disabled="${this.loading}"
                                    @change="${(event) => this.updateSelector('value', i, event.target.value)}"
                                    @keyup="${(event) => this.updateSelector('value', i, event.target.value)}"
                                />
                            </div>
                        </label>
                        <label class="label" style="flex: 1">&nbsp;
                            <div class="control">
                                <ui-button @click="${() => this.deleteSelector(i)}">–</ui-button>
                            </div>
                        </label>
                    </div>
                `)}

                <div class="field">
                    <label class="label">
                        <div class="control">
                            <ui-button type="submit" primary ?disabled="${this.loading}" @click="${this.generate}">
                                ${this.loading ? 'Generating...' : 'Generate'}
                            </ui-button>
                        </div>
                    </label>
                </div>
            </form>
        `;
    }

    unavailabilityMinutes(target) {
        this.target = target;

        if (target === 100.0) {
            this.unavailability = "HAHAHAHAHA, THAT'S FUNNY!";
            return;
        }

        const day = 24 * 60 * 60;
        const hour = 60 * 60;
        const minute = 60;

        let seconds = (30 * day) * ((100 - target) / 100);

        if (seconds >= day) {
            this.unavailability = `${Math.floor(seconds / day)}days ${Math.floor((seconds / hour) % 24)}hours`;
            return;
        }
        if (seconds >= hour) {
            this.unavailability = `${Math.floor(seconds / hour)}hours ${Math.floor((seconds / minute) % 60)}min`;
            return;
        }
        if (seconds >= minute) {
            this.unavailability = `${Math.floor(seconds / minute)}min ${Math.floor(seconds % 60)}s`;
            return;
        }
        this.unavailability = `${Math.floor(seconds)}s`;
    }

    generate(event) {
        event.preventDefault();

        console.log("generate");

        let selectors = {};
        this.selectors.forEach((s) => selectors[s.name] = s.value);

        this.dispatchEvent(new CustomEvent('generate', {
            detail: {
                metric: this.metric,
                availability: this.target,
                selectors: selectors,
            },
        }));
    }

    addSelector() {
        // Create new array with old array and new selector object
        this.selectors = [...this.selectors, {name: '', value: ''}];
    }

    deleteSelector(index) {
        if (this.selectors.length === 1) {
            return;
        }

        // Delete at the index and create a new (immutable) array
        this.selectors = [
            ...this.selectors.slice(0, index),
            ...this.selectors.slice(index + 1)
        ]
    }

    updateSelector(field, i, value) {
        if (field === 'name') {
            this.selectors[i].name = value;
        }
        if (field === 'value') {
            this.selectors[i].value = value;
        }
    }
}

customElements.define('promtools-form', Form);
