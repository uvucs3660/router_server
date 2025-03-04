# Xstate Service

## Prompt

acting as an expert node.js developer, modify the server.js file, to include the functionality defined in the requirements below. Ask any questions necessary to complete it, and feel free to update the xstate_service.md, to reflect the approach, after any insights.

## Requirements

The purpose of this service is to use xstate.js v5 to manage long-running state charts. To enable persistence across sessions, the service saves state history, context, and values, then loads them for subsequent calls. State charts are stored and retrieved in the data store using the load() and save() methods.  The 

## node modules - do not change modules without asking.

  aws-sdk
  koa web server
  mqtt
  pg
  xstate 5

## Architecture

The service is built as a Node.js application that:
1. Loads state machine definitions from the data store
2. Exposes MQTT interfaces for state machine interactions
3. Persists state to the data store
4. Publishes events when state transitions and actions occur

## API Interfaces

### MQTT Topics

#### Subscription Topics
- `xstate/chart/${chartid}/value/${stateid}` - Subscribe to receive state updates

#### Publication Topics
- `xstate/chart/${chartid}/event` - Publish events to this topic
- `xstate/chart/${chartid}/state` - Service publishes current state to this topic
- `xstate/chart/${chartid}/action/${actionName}` - Service publishes when actions occur

### State Change Message

To trigger a state transition, publish a message to `xstate/chart/${chartid}/event` with the event payload:

State Change Message
``` json 
{
  "type": "accept",
  "data": {
    // Optional additional data
  }
}
```

## State Persistence

States are persisted with the following information:

1. **Context** - The current context object
2. **Value** - The current state value
3. **History** - Previous states for history states
4. **MetaData** - Metadata about the current state

Example persisted state:
```json
{
  "context": {
    "count": 2,
    "dateValue": "2022-01-01",
    "boolValue": true,
    "stringValue": "Updated String"
  },
  "value": {
    "_": "Partial Compensate" 
  },
  "history": {
    "Negotiate": {
      "current": "Offer",
      "states": {}
    }
  },
  "metadata": {
    "timestamp": 1645564789000
  }
}
```

## Action Handlers

When actions are executed by the state machine, the service:

1. Invokes the corresponding action handler
2. Publishes the action event to MQTT
3. Includes the current context, state value, and other metadata

Action events are published to: `xstate/chart/${chartid}/action/${actionName}`

Example action message:
```json
{
  "type": "sendEmail",
  "params": {
    "from": "me",
    "to": "you@email.com"
  },
  "context": {
    "count": 1,
    "dateValue": "2022-01-01",
    "boolValue": false,
    "stringValue": "Some String"
  },
  "state": {
    "value": { "_": "Perform" },
    "context": { /* ... */ }
  }
}
```

## Configuration

State machines are defined as json from the data store. They are loaded on demand, as part of the mqtt subscription. The service supports:

- Hot reloading of machine definitions
- Custom action handlers
- Custom guard conditions
- Custom delay functions

## Error Handling

The service implements the following error handling:

1. Invalid events are rejected with an error message
2. Machine exceptions are caught and reported
3. Persistence failures are retried with exponential backoff

Error events are published to: `xstate/chart/${chartid}/error`

## Example State Chart

The service instantiates a machine and handles transitions and actions.

``` javascript
// Machine instantiation
const interpreter = createActor(fetchMachine);

// Event handling
interpreter.subscribe((state) => {
  // Persist state
  storageAdapter.saveState(chartid, stateid, state);
  
  // Publish state change
  mqttClient.publish(`xstate/chart/${chartid}/state`, JSON.stringify(state));
});

// Handle incoming events
mqttClient.subscribe(`xstate/chart/${chartid}/event`, (message) => {
  const event = JSON.parse(message);
  interpreter.send(event);
});
```

## Example xstate

``` json
{
  context: {
    requestor: 1,
    vendor: 2,
  },
  id: "Workflow",
  initial: "Negotiate",
  states: {
    Negotiate: {
      initial: "Propose",
      states: {
        Propose: {
          on: {
            reject: [
              {
                target: "Reject",
                actions: [],
                reenter: true,
              },
            ],
            counter_offer: [
              {
                target: "Propose",
                actions: [],
                reenter: false,
              },
            ],
            agree: [
              {
                target: "#MarketPlace.Perform.Initiate",
                actions: [],
                reenter: true,
              },
            ],
          },
        },
        Reject: {
          entry: {
            type: "rejectOffer",
            params: {
              rejected: "datetime",
            },
          },
          type: "final",
        },
      },
    },
    Perform: {
      initial: "Initiate",
      states: {
        Initiate: {
          entry: {
            type: "Underway",
}
```
