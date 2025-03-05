const mqtt = require('mqtt');
const dotenv = require('dotenv');

dotenv.config();

const options = {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
};

const mqttBroker = process.env.MQTT_SERVER || "mqtt://mqtt.uvucs.org";

module.exports = {
  mqttBroker,
  options
};