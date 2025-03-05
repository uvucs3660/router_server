const { createMachine, interpret } = require('xstate');
const fs = require('fs').promises;
const path = require('path');

// Store active machines
const activeMachines = new Map();

// Create and start a machine from definition
async function createAndStartMachine(machineId, machineDefinition, context = {}) {
  try {
    // Create the machine
    const machine = createMachine(machineDefinition, { context });
    
    // Interpret the machine
    const service = interpret(machine)
      .onTransition((state) => {
        console.log(`Machine ${machineId} state: ${state.value}`);
      })
      .start();
    
    // Store the service
    activeMachines.set(machineId, {
      service,
      definition: machineDefinition
    });
    
    return {
      success: true,
      machineId,
      currentState: service.state.value,
      context: service.state.context
    };
  } catch (error) {
    console.error(`Error creating machine ${machineId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Send event to a machine
function sendEvent(machineId, event) {
  const machine = activeMachines.get(machineId);
  
  if (!machine) {
    return {
      success: false,
      error: `Machine ${machineId} not found`
    };
  }
  
  try {
    // Send the event
    machine.service.send(event);
    
    return {
      success: true,
      machineId,
      currentState: machine.service.state.value,
      context: machine.service.state.context
    };
  } catch (error) {
    console.error(`Error sending event to machine ${machineId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get machine state
function getMachineState(machineId) {
  const machine = activeMachines.get(machineId);
  
  if (!machine) {
    return {
      success: false,
      error: `Machine ${machineId} not found`
    };
  }
  
  return {
    success: true,
    machineId,
    currentState: machine.service.state.value,
    context: machine.service.state.context
  };
}

// Stop a machine
function stopMachine(machineId) {
  const machine = activeMachines.get(machineId);
  
  if (!machine) {
    return {
      success: false,
      error: `Machine ${machineId} not found`
    };
  }
  
  try {
    machine.service.stop();
    activeMachines.delete(machineId);
    
    return {
      success: true,
      machineId
    };
  } catch (error) {
    console.error(`Error stopping machine ${machineId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get list of active machines
function listMachines() {
  const machines = [];
  
  activeMachines.forEach((machine, machineId) => {
    machines.push({
      machineId,
      currentState: machine.service.state.value
    });
  });
  
  return {
    success: true,
    count: machines.length,
    machines
  };
}

module.exports = {
  createAndStartMachine,
  sendEvent,
  getMachineState,
  stopMachine,
  listMachines
};