import {css, html, LitElement} from 'lit-element';
import page from 'page';

import './ui-tabs.js';
import './promtools-form-errors.js';
import './promtools-form-latency.js';

const routeErrors = '/alerts/errors';
const routeLatency = '/alerts/latency';

class Form extends LitElement {
    static get styles() {
        return css`
            .form {
                padding: 1rem;
                border: 1px solid var(--border-color);
            }
            .hide {
                display: none;
            }
        `;
    }

    static get properties() {
        return {
            loading: {type: Boolean},
            active: {type: String},
        };
    }

    constructor() {
        super();
        this.active = '';
        page.redirect('/', routeErrors)
        page(routeErrors, this.errorsPage(this))
        page(routeLatency, this.latencyPage(this))
        page();
    }

    render() {
        return html`
            <ui-tabs @tab-activated="${(event) => page(event.detail.tab)}"></ui-tabs>
            <div class="form">
                <promtools-form-errors class="${this.active === routeErrors ? '' : 'hide'}"></promtools-form-errors>
                <promtools-form-latency class="${this.active === routeLatency ? '' : 'hide'}"></promtools-form-latency>
            </div> 
        `;
    }

    errorsPage(component) {
        return (context) => component.active = routeErrors;
    }

    latencyPage(component) {
        return (context) => component.active = routeLatency;
    }
}

customElements.define('promtools-form', Form);
