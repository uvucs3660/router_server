import mqtt from 'mqtt';

export class MQTTService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionCallbacks = [];
    }

    async connect(brokerUrl, username, password) {
        return new Promise((resolve, reject) => {
            try {
                this.client = mqtt.connect(brokerUrl, {
                    username,
                    password,
                    connectTimeout: 10000,
                    reconnectPeriod: 0 // Disable auto-reconnect for login
                });

                this.client.on('connect', () => {
                    this.isConnected = true;
                    console.log('MQTT Connected successfully');
                    resolve(true);
                });

                this.client.on('error', (error) => {
                    console.error('MQTT Connection error:', error);
                    this.isConnected = false;
                    reject(error);
                });

                this.client.on('close', () => {
                    this.isConnected = false;
                    console.log('MQTT Connection closed');
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            this.isConnected = false;
        }
    }

    subscribe(topic, callback) {
        if (this.client && this.isConnected) {
            this.client.subscribe(topic);
            this.client.on('message', callback);
        }
    }

    publish(topic, message) {
        if (this.client && this.isConnected) {
            this.client.publish(topic, message);
        }
    }
}

export const mqttService = new MQTTService();
