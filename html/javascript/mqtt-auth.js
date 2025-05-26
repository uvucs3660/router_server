// MQTT Authentication Module

// Import MQTT client
import * as mqtt from 'https://cdn.jsdelivr.net/npm/mqtt@5.0.5/+esm';

// Store authenticated client globally
let mqttClient = null;

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const statusMessage = document.getElementById('status-message');
  
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Clear previous messages
    statusMessage.textContent = 'Authenticating...';
    statusMessage.className = '';
    
    try {
      // First verify credentials with the server
      const response = await fetch('/mqtt-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Server verified the credentials, now establish a direct MQTT connection
        statusMessage.textContent = 'Connecting to MQTT broker...';
        
        // Connect to MQTT broker
        const mqttBroker = getMqttBrokerUrl();
        mqttClient = mqtt.connect(mqttBroker, {
          username: username,
          password: password,
          clientId: 'mqtt_client_' + Math.random().toString(16).substring(2, 8)
        });
        
        mqttClient.on('connect', () => {
          statusMessage.textContent = 'Authentication successful! Redirecting...';
          statusMessage.className = 'success-message';
          
          // Save authentication status in localStorage
          localStorage.setItem('mqttAuthenticated', 'true');
          localStorage.setItem('mqttUsername', username);
          
          // Redirect to auth page with authenticated status
          setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = new URL('/auth', window.location.origin);
            
            // Transfer query parameters from current URL except password
            for (const [key, value] of urlParams.entries()) {
              if (key !== 'p' && key !== 'password') {
                redirectUrl.searchParams.append(key, value);
              }
            }
            
            // Add authentication parameter
            redirectUrl.searchParams.append('u', username);
            redirectUrl.searchParams.append('authenticated', 'true');
            
            window.location.href = redirectUrl.toString();
          }, 1000);
        });
        
        mqttClient.on('error', (err) => {
          statusMessage.textContent = `MQTT Connection Error: ${err.message}`;
          statusMessage.className = 'error-message';
        });
        
      } else {
        statusMessage.textContent = `Authentication failed: ${result.message}`;
        statusMessage.className = 'error-message';
      }
    } catch (error) {
      statusMessage.textContent = `Error: ${error.message}`;
      statusMessage.className = 'error-message';
    }
  });
});

// Function to get MQTT broker URL
function getMqttBrokerUrl() {
  // Try to get broker URL from environment, or use default
  return 'wss://dev.2h2.us:9883';  // Using WebSocket for browser support
}

// Export the authenticated MQTT client for use by other modules
export function getMqttClient() {
  return mqttClient;
}

// Check if user is authenticated
export function isAuthenticated() {
  return localStorage.getItem('mqttAuthenticated') === 'true';
}

// Get authenticated username
export function getAuthenticatedUser() {
  return localStorage.getItem('mqttUsername');
}
