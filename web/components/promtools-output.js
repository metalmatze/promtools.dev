import {css, html, LitElement} from 'lit-element';

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
            ${this.output === '' ? '' : html`
                <pre id="output">${this.output}</pre>`
            }
        `;
    }
}

customElements.define('promtools-output', Output);
