import { LitElement, html, css } from 'lit';
import './login-screen.js';
import './landing-page.js';

export class MQTTApp extends LitElement {
    static properties = {
        isLoggedIn: { type: Boolean },
        currentUser: { type: String }
    };

    static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `;

    constructor() {
        super();
        this.isLoggedIn = false;
        this.currentUser = '';
    }

    render() {
        return this.isLoggedIn ? html`
      <landing-page 
        .username=${this.currentUser}
        @logout=${this.handleLogout}>
      </landing-page>
    ` : html`
      <login-screen 
        @login-success=${this.handleLoginSuccess}>
      </login-screen>
    `;
    }

    handleLoginSuccess(e) {
        this.isLoggedIn = true;
        this.currentUser = e.detail.username;
    }

    handleLogout() {
        this.isLoggedIn = false;
        this.currentUser = '';
    }
}

customElements.define('mqtt-app', MQTTApp);
