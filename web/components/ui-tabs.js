import {css, html, LitElement, svg} from 'https://unpkg.com/lit-element@2.3.1/lit-element.js?module';

class Tabs extends LitElement {
    static get styles() {
        return css`
            .tabs {
                display: flex;
                justify-content: space-between;
                padding: calc(0.5rem - 2px) 0;
            }
            .tabs ul {
                list-style: none;
                margin: 0;
                padding: 0;
                align-items: center;
                display: flex;
                flex-grow: 1;
                flex-shrink: 0;
                justify-content: flex-start;
            }
            .tabs ul li {
                display: block;
                margin: 0;
                padding: 0;
            }
            .tabs ul li a {
                padding: 0.5rem 1rem;
                color: var(--text-color);
                text-decoration: none;
                border: 1px solid transparent;
            }
            .tabs ul li a.active {
                color: var(--primary-color);
                border: 1px solid var(--border-color);
                border-bottom: 1px solid white;
                border-top-left-radius: 0.25rem;
                border-top-right-radius: 0.25rem;
            }
            .tabs ul li a svg {
                width: 14px;
                height: 14px;
            }
        `;
    }

    static get properties() {
        return {
            active: {type: String},
        };
    }

    constructor() {
        super();
        this.active = 'errors';
    }

    render() {
        const errors = svg`<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bug" class="svg-inline--fa fa-bug fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M511.988 288.9c-.478 17.43-15.217 31.1-32.653 31.1H424v16c0 21.864-4.882 42.584-13.6 61.145l60.228 60.228c12.496 12.497 12.496 32.758 0 45.255-12.498 12.497-32.759 12.496-45.256 0l-54.736-54.736C345.886 467.965 314.351 480 280 480V236c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v244c-34.351 0-65.886-12.035-90.636-32.108l-54.736 54.736c-12.498 12.497-32.759 12.496-45.256 0-12.496-12.497-12.496-32.758 0-45.255l60.228-60.228C92.882 378.584 88 357.864 88 336v-16H32.666C15.23 320 .491 306.33.013 288.9-.484 270.816 14.028 256 32 256h56v-58.745l-46.628-46.628c-12.496-12.497-12.496-32.758 0-45.255 12.498-12.497 32.758-12.497 45.256 0L141.255 160h229.489l54.627-54.627c12.498-12.497 32.758-12.497 45.256 0 12.496 12.497 12.496 32.758 0 45.255L424 197.255V256h56c17.972 0 32.484 14.816 31.988 32.9zM257 0c-61.856 0-112 50.144-112 112h224C369 50.144 318.856 0 257 0z"></path></svg>`;
        const latency = svg`<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="hourglass" class="svg-inline--fa fa-hourglass fa-w-12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M360 64c13.255 0 24-10.745 24-24V24c0-13.255-10.745-24-24-24H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24 0 90.965 51.016 167.734 120.842 192C75.016 280.266 24 357.035 24 448c-13.255 0-24 10.745-24 24v16c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24 0-90.965-51.016-167.734-120.842-192C308.984 231.734 360 154.965 360 64z"></path></svg>`;

        return html`
            <div class="tabs">
                <ul>
                    <li>
                        <a href="#errors" class="${this.active === 'errors' ? 'active' : ''}" @click="${() => this.activate('errors')}">
                            ${errors}
                            Errors
                        </a>
                    </li>
                    <li>
                        <a href="#latency" class="${this.active === 'latency' ? 'active' : ''}" @click="${() => this.activate('latency')}">
                            ${latency}
                            Latency
                        </a>
                    </li>
                </ul>
            </div>
        `;
    }

    activate(name) {
        this.active = name;

        this.dispatchEvent(new CustomEvent(
            'tab-activated', {
                detail: {
                    tab: name,
                },
            },
        ));
    }
}

customElements.define('ui-tabs', Tabs);
