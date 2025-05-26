// Student Actions Component - Updated to use authenticated MQTT client

import { initializeMqttClient, logout } from './mqtt-client.js';

class StudentActions extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    const data = JSON.parse(this.getAttribute('data') || '{}');
    
    // Initialize MQTT client if authenticated
    this.mqttClient = await initializeMqttClient();
    
    // If not authenticated and not on login page, redirect to login
    if (!this.mqttClient && !window.location.pathname.includes('login.html')) {
      const currentUrl = new URL(window.location.href);
      const loginUrl = new URL('/login.html', window.location.origin);
      
      // Transfer query parameters
      for (const [key, value] of currentUrl.searchParams.entries()) {
        loginUrl.searchParams.append(key, value);
      }
      
      window.location.href = loginUrl.toString();
      return;
    }
    
    // Render the component
    this.render(data);
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  render(data) {
    this.shadowRoot.innerHTML = `
      <style>
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
      </style>
      
      <div class="student-info">
        <h2>Student Information</h2>
        <p><strong>ID:</strong> ${data.student || 'N/A'}</p>
        <p><strong>Name:</strong> ${data.first || 'N/A'} ${data.last || 'N/A'}</p>
        <p><strong>GitHub:</strong> ${data.github || 'N/A'}</p>
        <p><strong>Username:</strong> ${data.username || 'N/A'}</p>
        <p><strong>Authentication Status:</strong> 
          <span class="authenticated">${data.authenticated ? 'Authenticated' : 'Not Authenticated'}</span>
        </p>
      </div>
      
      <div class="action-buttons">
        <button id="submit-attendance">Submit Attendance</button>
        <button id="view-grades">View Grades</button>
        <button id="access-resources">Access Resources</button>
      </div>
      
      <div id="status-message"></div>
      
      <button class="logout-btn" id="logout-button">Logout</button>
    `;
  }
  
  setupEventListeners() {
    const submitAttendanceBtn = this.shadowRoot.getElementById('submit-attendance');
    const viewGradesBtn = this.shadowRoot.getElementById('view-grades');
    const accessResourcesBtn = this.shadowRoot.getElementById('access-resources');
    const logoutBtn = this.shadowRoot.getElementById('logout-button');
    const statusMessage = this.shadowRoot.getElementById('status-message');
    
    submitAttendanceBtn?.addEventListener('click', () => {
      if (!this.mqttClient) {
        statusMessage.textContent = 'Not authenticated. Please login again.';
        statusMessage.className = 'error';
        return;
      }
      
      this.mqttClient.publish('attendance/submit', JSON.stringify({
        studentId: JSON.parse(this.getAttribute('data')).student,
        timestamp: new Date().toISOString()
      }));
      
      statusMessage.textContent = 'Attendance submitted successfully!';
      statusMessage.className = 'status';
    });
    
    viewGradesBtn?.addEventListener('click', () => {
      if (!this.mqttClient) {
        statusMessage.textContent = 'Not authenticated. Please login again.';
        statusMessage.className = 'error';
        return;
      }
      
      const studentData = JSON.parse(this.getAttribute('data'));
      window.location.href = `/grades.html?student=${studentData.student}&authenticated=true`;
    });
    
    accessResourcesBtn?.addEventListener('click', () => {
      if (!this.mqttClient) {
        statusMessage.textContent = 'Not authenticated. Please login again.';
        statusMessage.className = 'error';
        return;
      }
      
      const studentData = JSON.parse(this.getAttribute('data'));
      window.location.href = `/resources.html?student=${studentData.student}&authenticated=true`;
    });
    
    logoutBtn?.addEventListener('click', () => {
      logout();
    });
  }
}

// Define the custom element
customElements.define('student-actions', StudentActions);
