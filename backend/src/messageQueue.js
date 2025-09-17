let amqp;

try {
  amqp = require("amqplib");
} catch (error) {
  console.warn("Biblioteca amqplib não encontrada, utilizando stub local.");
  amqp = require("./amqplib-stub");
}

const queueName = process.env.RABBITMQ_QUEUE || "orders_queue";
const connectionUrl = process.env.RABBITMQ_URL || "amqp://localhost";

let channelPromise;

async function getChannel() {
  if (!channelPromise) {
    channelPromise = amqp
      .connect(connectionUrl)
      .then((connection) => {
        connection.on("error", (error) => {
          console.error("Erro na conexão com RabbitMQ", error);
          channelPromise = undefined;
        });

        connection.on("close", () => {
          console.warn("Conexão com RabbitMQ encerrada");
          channelPromise = undefined;
        });

        return connection.createChannel();
      })
      .then(async (channel) => {
        await channel.assertQueue(queueName, { durable: false });
        return channel;
      })
      .catch((error) => {
        channelPromise = undefined;
        throw error;
      });
  }

  return channelPromise;
}

async function publishOrder(order) {
  const channel = await getChannel();
  const payload = Buffer.from(JSON.stringify(order));
  channel.sendToQueue(queueName, payload, { persistent: false });
}

async function startOrderConsumer(handler) {
  try {
    const channel = await getChannel();
    await channel.consume(
      queueName,
      async (message) => {
        if (!message) {
          return;
        }

        const body = message.content.toString();
        let order;

        try {
          order = JSON.parse(body);
        } catch (error) {
          console.error("Mensagem inválida recebida na fila", error);
          channel.ack(message);
          return;
        }

        try {
          await handler(order);
          channel.ack(message);
        } catch (error) {
          console.error("Erro ao processar mensagem da fila", error);
          channel.nack(message, false, true);
        }
      },
      { noAck: false }
    );

    console.log(`Consumer pronto para fila ${queueName}`);
  } catch (error) {
    console.error("Não foi possível iniciar o consumer do RabbitMQ", error);
  }
}

module.exports = {
  publishOrder,
  startOrderConsumer
};