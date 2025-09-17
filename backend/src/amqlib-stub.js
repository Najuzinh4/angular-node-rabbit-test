const { EventEmitter } = require("events");

const queues = new Map();

function getQueue(name) {
  if (!queues.has(name)) {
    queues.set(name, { messages: [], consumers: [] });
  }
  return queues.get(name);
}

class StubChannel extends EventEmitter {
  async assertQueue(name) {
    getQueue(name);
  }

  sendToQueue(name, payload) {
    const queue = getQueue(name);
    queue.messages.push(payload);
    queue.consumers.forEach((consumer) => {
      consumer({ content: payload, fields: { queue: name } });
    });
    return true;
  }

  async consume(name, handler) {
    const queue = getQueue(name);
    queue.consumers.push(handler);
    while (queue.messages.length > 0) {
      const message = queue.messages.shift();
      handler({ content: message, fields: { queue: name } });
    }
    return { consumerTag: `stub-${Date.now()}` };
  }

  ack() {}

  nack(message, _allUpTo, requeue) {
    if (!message || !requeue) {
      return;
    }
   const queue = getQueue(message.fields?.queue || "default");
    queue.messages.unshift(message.content);
  }
}

class StubConnection extends EventEmitter {
  async createChannel() {
    return new StubChannel();
  }
}
async function connect() {
  return new StubConnection();
}

module.exports = { connect };
