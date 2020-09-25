import {css, html, LitElement} from 'lit-element';

class Container extends LitElement {
    static get styles() {
        return css`
            .container {
                flex-grow: 1;
                margin: 0 auto;
                position: relative;
            }

            @media screen and (min-width: 768px) {
                .container {
                    max-width: calc(768px - 2 * 32px);
                }
            }

            @media screen and (min-width: 992px) {
                .container {
                    max-width: calc(992px - 2 * 32px);
                }
            }

            @media screen and (min-width: 1200px) {
                .container {
                    max-width: calc(1200px - 2 * 32px);
                }
            }

            @media screen and (min-width: 1600px) {
                .container {
                    max-width: calc(1600px - 2 * 32px);
                }
            }`;
    }

    render() {
        return html`<div class="container"><slot></slot></div>`;
    }
}

customElements.define('ui-container', Container);
