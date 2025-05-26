import { LitElement, html, css } from 'lit';
import { mqttService } from './mqtt-service.js';

export class LoginScreen extends LitElement {
    static properties = {
        isLoading: { type: Boolean },
        errorMessage: { type: String },
        brokerUrl: { type: String },
        username: { type: String },
        password: { type: String }
    };

    static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .login-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-title {
      color: #333;
      font-size: 2rem;
      margin: 0;
      font-weight: 300;
    }

    .login-subtitle {
      color: #666;
      margin: 0.5rem 0 0 0;
      font-size: 0.9rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e1e5e9;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    .login-button {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
      position: relative;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .login-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid #ffffff40;
      border-radius: 50%;
      border-top-color: #ffffff;
      animation: spin 1s ease-in-out infinite;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      background: #fee;
      color: #c33;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      border: 1px solid #fcc;
      font-size: 0.9rem;
    }
  `;

    constructor() {
        super();
        this.isLoading = false;
        this.errorMessage = '';
        this.brokerUrl = 'wss://mqtt.uvucs.org:8443/mqtt'; // Default WebSocket MQTT broker
        this.username = '';
        this.password = '';
    }

    render() {
        return html`
      <div class="login-container">
        <div class="login-header">
          <h1 class="login-title">MQTT Login</h1>
          <p class="login-subtitle">Connect to your MQTT broker</p>
        </div>

        ${this.errorMessage ? html`
          <div class="error-message">
            ${this.errorMessage}
          </div>
        ` : ''}

        <form @submit=${this.handleLogin}>
          <div class="form-group">
            <label for="brokerUrl">Broker URL</label>
            <input
              id="brokerUrl"
              type="text"
              placeholder="ws://localhost:8083/mqtt"
              .value=${this.brokerUrl}
              @input=${e => this.brokerUrl = e.target.value}
              ?disabled=${this.isLoading}
              required
            />
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              .value=${this.username}
              @input=${e => this.username = e.target.value}
              ?disabled=${this.isLoading}
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              .value=${this.password}
              @input=${e => this.password = e.target.value}
              ?disabled=${this.isLoading}
              required
            />
          </div>

          <button
            type="submit"
            class="login-button"
            ?disabled=${this.isLoading}
          >
            ${this.isLoading ? html`
              <span class="loading-spinner"></span>
              Connecting...
            ` : 'Login'}
          </button>
        </form>
      </div>
    `;
    }

    async handleLogin(e) {
        e.preventDefault();

        if (this.isLoading) return;

        this.isLoading = true;
        this.errorMessage = '';

        try {
            await mqttService.connect(this.brokerUrl, this.username, this.password);

            // Dispatch success event
            this.dispatchEvent(new CustomEvent('login-success', {
                detail: { username: this.username },
                bubbles: true,
                composed: true
            }));

        } catch (error) {
            this.errorMessage = `Connection failed: ${error.message}`;
        } finally {
            this.isLoading = false;
        }
    }
}

customElements.define('login-screen', LoginScreen);
