const mqtt = require('mqtt');
const { mqttBroker, options } = require('../../config/mqtt');

class MqttClient {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.isConnected = false;
  }

  connect() {
    console.log(`Connecting to MQTT broker at ${mqttBroker}`);
    this.client = mqtt.connect(mqttBroker, options);

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.isConnected = true;
      
      // Resubscribe to all topics if reconnecting
      if (this.subscriptions.size > 0) {
        this.subscriptions.forEach((callback, topic) => {
          this.client.subscribe(topic);
        });
      }
    });

    this.client.on('message', (topic, message) => {
      const callback = this.subscriptions.get(topic);
      if (callback) {
        try {
          const payload = JSON.parse(message.toString());
          callback(payload);
        } catch (error) {
          console.error(`Failed to parse MQTT message on topic ${topic}:`, error);
          callback(message.toString());
        }
      }
    });

    this.client.on('error', (error) => {
      console.error('MQTT client error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('MQTT connection closed');
      this.isConnected = false;
    });
  }

  publish(topic, message) {
    if (!this.isConnected) {
      console.warn('MQTT client not connected. Attempting to connect...');
      this.connect();
      return false;
    }

    const payload = typeof message === 'object' ? JSON.stringify(message) : message;
    this.client.publish(topic, payload);
    return true;
  }

  subscribe(topic, callback) {
    if (!this.isConnected) {
      console.warn('MQTT client not connected. Attempting to connect...');
      this.connect();
    }

    this.subscriptions.set(topic, callback);
    this.client.subscribe(topic);
  }

  unsubscribe(topic) {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.delete(topic);
      this.client.unsubscribe(topic);
      return true;
    }
    return false;
  }
}

const mqttClient = new MqttClient();
mqttClient.connect();

module.exports = mqttClient;