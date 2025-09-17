const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const orders = [];
let nextId = 1;

function calculateTotal(price, quantity) {
  const numericPrice = Number(price);
  const numericQuantity = Number(quantity);
  if (!Number.isFinite(numericPrice) || !Number.isFinite(numericQuantity)) {
    return 0;
  }
  return Math.round(numericPrice * numericQuantity * 100) / 100;
}

function sanitizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateOrderPayload(payload = {}) {
  const errors = [];
  const { customer = {}, product = {}, quantity } = payload;
  const customerName = sanitizeString(customer.name);
  const customerEmail = sanitizeString(customer.email);
  const productName = sanitizeString(product.name);
  const productPrice = Number(product.price);
  const numericQuantity = Number(quantity);

  if (!customerName) {
    errors.push("O nome do cliente é obrigatório.");
  }

  if (!customerEmail) {
    errors.push("O e-mail do cliente é obrigatório.");
  } else if (!EMAIL_REGEX.test(customerEmail)) {
    errors.push("Informe um e-mail de cliente válido.");
  }

  if (!productName) {
    errors.push("O nome do produto é obrigatório.");
  }

  if (!Number.isFinite(productPrice) || productPrice <= 0) {
    errors.push("O preço do produto deve ser maior que zero.");
  }

  if (!Number.isInteger(numericQuantity) || numericQuantity <= 0) {
    errors.push("A quantidade deve ser um número inteiro maior que zero.");
  }

  return errors;
}

function createOrder(payload) {
  const errors = validateOrderPayload(payload);
  if (errors.length > 0) {
    const error = new Error("Payload inválido");
    error.validationErrors = errors;
    throw error;
  }

  const { customer, product, quantity } = payload;
  const normalizedQuantity = Number(quantity);
  const normalizedPrice = Number(product.price);

  const order = {
    id: nextId++,
    customer: {
      name: sanitizeString(customer.name),
      email: sanitizeString(customer.email)
    },
    product: {
      name: sanitizeString(product.name),
      price: Math.round(normalizedPrice * 100) / 100
    },
    quantity: normalizedQuantity,
    total: calculateTotal(normalizedPrice, normalizedQuantity),
    createdAt: new Date().toISOString()
  };

  orders.unshift(order);
  return order;
}

function listOrders() {
  return orders.map((order) => ({ ...order }));
}

function removeOrderById(orderId) {
  const index = orders.findIndex((order) => order.id === orderId);
  if (index >= 0) {
    orders.splice(index, 1);
    return true;
  }
  return false;
}

function clearOrders() {
  orders.splice(0, orders.length);
  nextId = 1;
}

module.exports = {
  calculateTotal,
  createOrder,
  listOrders,
  removeOrderById,
  clearOrders,
  validateOrderPayload
};