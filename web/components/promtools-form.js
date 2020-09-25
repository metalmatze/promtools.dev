import {css, html, LitElement} from 'lit-element';
import './ui-tabs.js';
import './promtools-form-errors.js';
import './promtools-form-latency.js';

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
        this.active = 'errors';
    }

    render() {
        return html`
            <ui-tabs @tab-activated="${(event) => this.active = event.detail.tab}"></ui-tabs>
            <div class="form">
                <promtools-form-errors class="${this.active === 'errors' ? '' : 'hide'}"></promtools-form-errors>
                <promtools-form-latency class="${this.active === 'latency' ? '' : 'hide'}"></promtools-form-latency>
            </div> 
        `;
    }
}

customElements.define('promtools-form', Form);
