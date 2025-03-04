const { createMachine, interpret } = require('xstate');
const { load, save } = require('../../store');

// Store for state charts and interpreters
const stateCharts = new Map();
const interpreters = new Map();

/**
 * Loads a state chart from the database by its ID
 * @param {string} chartId - Unique identifier for the state chart
 * @returns {Object|null} The chart definition or null if not found
 */
async function loadStateChart(chartId) {
  try {
    const result = await load(`xstate/charts/${chartId}`);
    if (result.rows.length > 0) {
      return result.rows[0].data;
    }
    return null;
  } catch (error) {
    console.error(`Error loading state chart ${chartId}:`, error);
    return null;
  }
}

/**
 * Saves a state chart definition to the database
 * @param {string} chartId - Unique identifier for the state chart
 * @param {Object} chartDefinition - XState machine configuration
 * @returns {Promise} Result of the save operation
 * @throws {Error} If saving fails
 */
async function saveStateChart(chartId, chartDefinition) {
  try {
    return await save(`xstate/charts/${chartId}`, JSON.stringify(chartDefinition));
  } catch (error) {
    console.error(`Error saving state chart ${chartId}:`, error);
    throw error;
  }
}

/**
 * Loads a specific state instance for a state chart
 * @param {string} chartId - Unique identifier for the state chart
 * @param {string} stateId - Unique identifier for the state instance
 * @returns {Object|null} The state data or null if not found
 */
async function loadStateInstance(chartId, stateId) {
  try {
    const result = await load(`xstate/states/${chartId}/${stateId}`);
    if (result.rows.length > 0) {
      return result.rows[0].data;
    }
    return null;
  } catch (error) {
    console.error(`Error loading state instance ${chartId}/${stateId}:`, error);
    return null;
  }
}

/**
 * Saves a state instance to the database
 * @param {string} chartId - Unique identifier for the state chart
 * @param {string} stateId - Unique identifier for the state instance
 * @param {Object} stateData - Current state data to save
 * @returns {Promise} Result of the save operation
 * @throws {Error} If saving fails
 */
async function saveStateInstance(chartId, stateId, stateData) {
  try {
    return await save(`xstate/states/${chartId}/${stateId}`, JSON.stringify(stateData));
  } catch (error) {
    console.error(`Error saving state instance ${chartId}/${stateId}:`, error);
    throw error;
  }
}

/**
 * Creates action creators that publish events to MQTT
 * @param {string} chartId - Unique identifier for the state chart
 * @param {string} stateId - Unique identifier for the state instance
 * @param {Object} mqttClient - MQTT client for publishing
 * @returns {Object} Object containing action creator functions
 */
function createPublishingActions(chartId, stateId, mqttClient) {
  return {
    publishEvent: ({ context, event, _event }) => {
      const topic = `xstate/chart/${chartId}/action/${stateId}`;
      const payload = {
        type: event.type,
        context,
        event,
        timestamp: new Date().toISOString()
      };
      mqttClient.publish(topic, JSON.stringify(payload));
    }
  };
}

/**
 * Creates and configures an XState interpreter for a state machine
 * @param {string} chartId - Unique identifier for the state chart
 * @param {string} stateId - Unique identifier for the state instance
 * @param {Object} machineConfig - XState machine configuration
 * @param {Object} mqttClient - MQTT client for publishing
 * @param {Object} initialState - Optional initial state
 * @returns {Interpreter} The configured XState interpreter
 */
function setupXStateInterpreter(chartId, stateId, machineConfig, mqttClient, initialState = null) {
  // Create machine
  const machine = createMachine(machineConfig);
  
  // Create interpreter
  const interpreter = interpret(machine);
  
  // Add state change listener
  interpreter.onTransition(async (state) => {
    // Extract the state value, context, and history
    const stateData = {
      value: state.value,
      context: state.context,
      history: state.history,
      event: state._event,
      timestamp: new Date().toISOString()
    };
    
    // Save the state
    await saveStateInstance(chartId, stateId, stateData);
    
    // Publish state change
    const topic = `xstate/chart/${chartId}/value/${stateId}`;
    mqttClient.publish(topic, JSON.stringify(stateData));
  });
  
  // Start the interpreter with the initial state if provided
  if (initialState) {
    interpreter.start(initialState);
  } else {
    interpreter.start();
  }
  
  // Store the interpreter
  interpreters.set(`${chartId}:${stateId}`, interpreter);
  
  return interpreter;
}

module.exports = {
  stateCharts,
  interpreters,
  loadStateChart,
  saveStateChart,
  loadStateInstance,
  saveStateInstance,
  createPublishingActions,
  setupXStateInterpreter
};
