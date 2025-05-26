// MQTT Client Module - Provides authenticated MQTT client to other components

import * as mqtt from 'https://cdn.jsdelivr.net/npm/mqtt@5.0.5/+esm';
import { isAuthenticated, getAuthenticatedUser } from './mqtt-auth.js';

// Shared MQTT client instance
let sharedClient = null;

// Initialize the MQTT client if authenticated
export async function initializeMqttClient() {
  if (!isAuthenticated()) {
    console.error('Not authenticated. Redirecting to login page');
    redirectToLogin();
    return null;
  }

  if (sharedClient) {
    return sharedClient;
  }

  try {
    const username = getAuthenticatedUser();
    
    // Create a new MQTT client connection
    const mqttBroker = 'wss://dev.2h2.us:9883';  // Using WebSocket for browser support
    
    sharedClient = mqtt.connect(mqttBroker, {
      username: username,
      // No password here because we're relying on prior authentication
      // This is a reconnection of a previously authenticated user
      clientId: 'mqtt_client_' + Math.random().toString(16).substring(2, 8),
    });
    
    // Set up event handlers
    sharedClient.on('connect', () => {
      console.log('MQTT client connected');
    });
    
    sharedClient.on('error', (err) => {
      console.error('MQTT client error:', err);
      // If we get an authentication error, clear credentials and redirect to login
      if (err.message.includes('auth')) {
        localStorage.removeItem('mqttAuthenticated');
        localStorage.removeItem('mqttUsername');
        redirectToLogin();
      }
    });
    
    sharedClient.on('close', () => {
      console.log('MQTT client connection closed');
    });
    
    return sharedClient;
  } catch (error) {
    console.error('Failed to initialize MQTT client:', error);
    return null;
  }
}

// Get the shared MQTT client instance
export function getMqttClient() {
  if (!sharedClient) {
    return initializeMqttClient();
  }
  return sharedClient;
}

// Close the MQTT connection
export function closeMqttConnection() {
  if (sharedClient) {
    sharedClient.end();
    sharedClient = null;
  }
}

// Redirect to login page
function redirectToLogin() {
  const currentUrl = new URL(window.location.href);
  const loginUrl = new URL('/login.html', window.location.origin);
  
  // Transfer all query parameters except authentication ones
  for (const [key, value] of currentUrl.searchParams.entries()) {
    if (key !== 'authenticated') {
      loginUrl.searchParams.append(key, value);
    }
  }
  
  window.location.href = loginUrl.toString();
}

// Logout function
export function logout() {
  localStorage.removeItem('mqttAuthenticated');
  localStorage.removeItem('mqttUsername');
  closeMqttConnection();
  redirectToLogin();
}
