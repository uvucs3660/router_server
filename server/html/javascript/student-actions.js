import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { mqttService } from './mqtt-service.js';
export class StudentActions extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .student-info {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 20px;
    }
    button {
      padding: 10px;
      background-color: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #357ae8;
    }
    .status {
      color: green;
      margin-top: 10px;
    }
    .error {
      color: red;
      margin-top: 10px;
    }
    .authenticated {
      color: green;
      font-weight: bold;
      padding: 5px 10px;
      background-color: #e6f7e6;
      border-radius: 4px;
      display: inline-block;
    }
    .logout-btn {
      background-color: #f44336;
      margin-top: 20px;
    }
    .logout-btn:hover {
      background-color: #d32f2f;
    }
  `;

  static properties = {
    studentData: { type: Object },
    statusMessage: { type: String },
    statusType: { type: String },
    mqttClient: { type: Object, state: true }
  };

  constructor() {
    super();
    this.studentData = {};
    this.statusMessage = '';
    this.statusType = '';
    this.mqttClient = null;
  }

  connectedCallback() {
    super.connectedCallback();

    // Parse the data attribute
    const dataAttr = this.getAttribute('data');
    if (dataAttr) {
      try {
        this.studentData = JSON.parse(dataAttr);
      } catch (e) {
        console.error('Error parsing data attribute:', e);
      }
    }

    // Initialize MQTT client
    this._initializeMqttClient();
  }

  async _initializeMqttClient() {
    if (this.studentData.authenticated) {
      this.mqttClient = await initializeMqttClient();

      if (!this.mqttClient && !window.location.pathname.includes('login.html')) {
        this._redirectToLogin();
      }
    } else if (!window.location.pathname.includes('login.html')) {
      this._redirectToLogin();
    }
  }

  _redirectToLogin() {
    const currentUrl = new URL(window.location.href);
    const loginUrl = new URL('/login.html', window.location.origin);

    // Transfer query parameters
    for (const [key, value] of currentUrl.searchParams.entries()) {
      loginUrl.searchParams.append(key, value);
    }

    window.location.href = loginUrl.toString();
  }

  render() {
    return html`
      <div class="student-info">
        <h2>Student Information</h2>
        <p><strong>ID:</strong> ${this.studentData.student || 'N/A'}</p>
        <p><strong>Name:</strong> ${this.studentData.first || 'N/A'} ${this.studentData.last || 'N/A'}</p>
        <p><strong>GitHub:</strong> ${this.studentData.github || 'N/A'}</p>
        <p><strong>Username:</strong> ${this.studentData.username || 'N/A'}</p>
        <p>
          <strong>Authentication Status:</strong> 
          <span class="authenticated">
            ${this.studentData.authenticated ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </p>
      </div>
      
      <div class="action-buttons">
        <button @click=${this._submitAttendance}>Submit Attendance</button>
        <button @click=${this._viewGrades}>View Grades</button>
        <button @click=${this._accessResources}>Access Resources</button>
      </div>
      
      ${this.statusMessage ? html`
        <div class="${this.statusType}">${this.statusMessage}</div>
      ` : ''}
    `;
  }

  _submitAttendance() {
    if (!this.mqttClient) {
      this.statusMessage = 'Not authenticated. Please login again.';
      this.statusType = 'error';
      return;
    }

    this.mqttClient.publish('attendance/submit', JSON.stringify({
      studentId: this.studentData.student,
      timestamp: new Date().toISOString()
    }));

    this.statusMessage = 'Attendance submitted successfully!';
    this.statusType = 'status';
  }

  _viewGrades() {
    if (!this.mqttClient) {
      this.statusMessage = 'Not authenticated. Please login again.';
      this.statusType = 'error';
      return;
    }

    window.location.href = `/grades.html?student=${this.studentData.student}&authenticated=true`;
  }

  _accessResources() {
    if (!this.mqttClient) {
      this.statusMessage = 'Not authenticated. Please login again.';
      this.statusType = 'error';
      return;
    }

    window.location.href = `/resources.html?student=${this.studentData.student}&authenticated=true`;
  }

}

customElements.define('student-actions', StudentActions);
