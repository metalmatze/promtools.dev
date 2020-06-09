import {css, html, LitElement} from 'https://unpkg.com/lit-element@2.3.1/lit-element.js?module';

class Output extends LitElement {
    static get properties() {
        return {
            output: {type: String},
        }
    }

    static get styles() {
        return css`
            pre {
                padding: 1.25rem 1.5rem;
                background-color: #f5f5f5;
                border:1px solid #ddd;
                border-left: 4px solid #e6522c;
                overflow-x: auto;
            }
        `;
    }

    render() {
        return html`
            ${this.output === '' ? html`` : html`
                <pre id="output">${this.output}</pre>`
            }
        `;
    }
}

customElements.define('promtools-output', Output);
