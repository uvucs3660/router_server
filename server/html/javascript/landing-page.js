import { LitElement, html, css } from 'lit';
import { mqttService } from './mqtt-service.js';

export class LandingPage extends LitElement {
    static properties = {
        username: { type: String },
        showMenu: { type: Boolean }
    };

    static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: #f5f7fa;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .header {
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }

    .user-section {
      display: flex;
      align-items: center;
      position: relative;
    }

    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .user-info:hover {
      background-color: #f8f9fa;
    }

    .user-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      margin-right: 0.75rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .username {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .connection-status {
      font-size: 0.75rem;
      color: #28a745;
    }

    .menu-trigger {
      margin-left: 0.5rem;
      color: #666;
      font-size: 0.8rem;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
      min-width: 180px;
      overflow: hidden;
      z-index: 1000;
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .menu-item {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s ease;
      font-size: 0.9rem;
      color: #333;
    }

    .menu-item:hover {
      background-color: #f8f9fa;
    }

    .menu-item.logout {
      color: #dc3545;
      border-top: 1px solid #eee;
    }

    .main-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      margin-bottom: 2rem;
    }

    .welcome-title {
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 2rem;
      font-weight: 300;
    }

    .welcome-text {
      color: #666;
      line-height: 1.6;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: transparent;
      z-index: 999;
    }
  `;

    constructor() {
        super();
        this.username = '';
        this.showMenu = false;
    }

    render() {
        return html`
      <div class="header">
        <div class="logo">MQTT Dashboard</div>
        
        <div class="user-section">
          <div class="user-info" @click=${this.toggleMenu}>
            <div class="user-icon">
              ${this.getInitials(this.username)}
            </div>
            <div class="user-details">
              <div class="username">${this.username}</div>
              <div class="connection-status">● Connected</div>
            </div>
            <div class="menu-trigger">▼</div>
          </div>

          ${this.showMenu ? html`
            <div class="dropdown-menu">
              <button class="menu-item" @click=${this.closeMenu}>
                Profile Settings
              </button>
              <button class="menu-item" @click=${this.closeMenu}>
                Preferences
              </button>
              <button class="menu-item logout" @click=${this.handleLogout}>
                Logout
              </button>
            </div>
          ` : ''}
        </div>
      </div>

      ${this.showMenu ? html`
        <div class="overlay" @click=${this.closeMenu}></div>
      ` : ''}

      <div class="main-content">
        <div class="welcome-card">
          <h1 class="welcome-title">Welcome back, ${this.username}!</h1>
          <p class="welcome-text">
            You are successfully connected to the MQTT broker. 
            Your dashboard is ready to monitor and control your IoT devices.
          </p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">Active</div>
            <div class="stat-label">Connection Status</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Subscribed Topics</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Messages Today</div>
          </div>
        </div>
      </div>
    `;
    }

    getInitials(username) {
        return username
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2) || username.charAt(0).toUpperCase();
    }

    toggleMenu() {
        this.showMenu = !this.showMenu;
    }

    closeMenu() {
        this.showMenu = false;
    }

    handleLogout() {
        mqttService.disconnect();

        this.dispatchEvent(new CustomEvent('logout', {
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('landing-page', LandingPage);
