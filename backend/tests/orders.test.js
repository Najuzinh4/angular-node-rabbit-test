const {
  calculateTotal,
  createOrder,
  listOrders,
  clearOrders,
  validateOrderPayload
} = require("../src/orders");

function buildPayload(overrides = {}) {
  return {
    customer: {
      name: "Cliente Teste",
      email: "cliente@teste.com"
    },
    product: {
      name: "Produto Teste",
      price: 10.5
    },
    quantity: 2,
    ...overrides,
    customer: {
      name: overrides.customer?.name ?? "Cliente Teste",
      email: overrides.customer?.email ?? "cliente@teste.com"
    },
    product: {
      name: overrides.product?.name ?? "Produto Teste",
      price: overrides.product?.price ?? 10.5
    }
  };
}

describe("orders service", () => {
  beforeEach(() => {
    clearOrders();
  });

  it("calcula o valor total com duas casas decimais", () => {
    expect(calculateTotal(10.333, 3)).toBeCloseTo(31, 2);
    expect(calculateTotal(5.555, 2)).toBeCloseTo(11.11, 2);
  });

  it("valida o payload antes de criar o pedido", () => {
    const errors = validateOrderPayload({});
    expect(errors).toContain("O nome do cliente é obrigatório.");
    expect(errors).toContain("O e-mail do cliente é obrigatório.");
    expect(errors).toContain("O nome do produto é obrigatório.");
    expect(errors).toContain("O preço do produto deve ser maior que zero.");
    expect(errors).toContain("A quantidade deve ser um número inteiro maior que zero.");
  });

  it("cria um pedido e armazena em memória", () => {
    const order = createOrder(buildPayload());

    expect(order.id).toBeGreaterThan(0);
    expect(order.total).toBe(21);
    expect(order.product.price).toBe(10.5);
    expect(listOrders()).toHaveLength(1);
  });
});