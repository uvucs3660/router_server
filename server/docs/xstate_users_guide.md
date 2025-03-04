# XState Service Users Guide

## Usage Guide

This implementation provides:

1. **Persisted State Machines** - State charts are stored in the database and loaded on demand.
2. **MQTT Integration** - Events are sent and received via MQTT.
3. **State Persistence** - Machine state is saved after each transition.
4. **Action Handling** - Actions publish events to MQTT topics.
5. **Error Handling** - Failed operations are retried with exponential backoff.

### Publishing Events

To trigger a state machine event, publish to the MQTT topic `xstate/chart/${chartId}/event` with payload:

```json
{
  "stateId": "instance-123",
  "type": "SUBMIT",
  "data": {
    "additionalInfo": "any data needed for the event"
  }
}
```

### Subscribing to State Changes

Subscribe to `xstate/chart/${chartId}/value/${stateId}` to receive updates when the machine state changes.

### Reloading Charts

If you update a chart definition, publish to `xstate/chart/${chartId}/reload` with payload:

```json
{
  "stateId": "instance-123"
}
```

This implementation satisfies all the requirements described in the XState service documentation.