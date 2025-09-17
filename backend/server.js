const express = require("express");
const cors = require("cors");
const { createOrder, listOrders, removeOrderById } = require("./src/orders");
const { publishOrder, startOrderConsumer } = require("./src/messageQueue");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ message: "Backend funcionando 🚀" });
});


app.get("/orders", (req, res) => {
  res.json(listOrders());
});

app.post("/orders", async (req, res) => {
  let order;

  try {
    order = createOrder(req.body);
    await publishOrder(order);
    res.status(201).json(order);
  } catch (error) {
    if (order) {
      removeOrderById(order.id);
    }

    if (error.validationErrors) {
      return res.status(400).json({ errors: error.validationErrors });
    }

    console.error("Erro ao criar pedido", error);
    res.status(500).json({ error: "Não foi possível criar o pedido." });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
    startOrderConsumer((order) => {
    const productName = order?.product?.name || order?.productName || "desconhecido";
    console.log(`Estoque atualizado para produto ${productName}`);
  });
});
