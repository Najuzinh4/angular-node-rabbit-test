# Módulo de pedidos com Angular, Node e RabbitMQ

Este projeto simula o fluxo de cadastros de pedidos integrado a um ERP. Ele inclui:

- **Frontend (Angular 17+)** com formulário reativo para cadastro de pedidos e listagem integrada à API.
- **Backend (Node + Express)** com validações, cálculo de totais e publicação dos pedidos em uma fila RabbitMQ.
- **Mensageria** com producer/consumer usando RabbitMQ simulando atualização de estoque.
- **Testes automatizados**: Jasmine/Karma no frontend e Jest no backend.

## Requisitos

- Node.js 18+
- npm 10+
- Docker e Docker Compose (opcional, mas recomendado para subir RabbitMQ rapidamente)

## Estrutura do repositório

```
.
├── backend       # API Express + RabbitMQ producer/consumer
├── frontend      # Aplicação Angular
└── docker-compose.yml
```

## Executando o backend

```bash
cd backend
npm install
npm run dev
```

A API ficará disponível em `http://localhost:3000`. Endpoints principais:

- `POST /orders`: cria um pedido (validação de dados, cálculo do total e envio para RabbitMQ)
- `GET /orders`: lista os pedidos cadastrados em memória

## Executando o frontend

```bash
cd frontend
npm install
npm start
```

A aplicação será servida em `http://localhost:4200` e já está configurada para consumir a API em `http://localhost:3000`.

## Executando os testes

### Backend (Jest)

```bash
cd backend
npm test
```

### Frontend (Jasmine/Karma)

```bash
cd frontend
npm test
```

Os testes cobrem as principais regras de negócio, como cálculo do valor total e validação dos formulários.

## RabbitMQ com Docker Compose

O projeto inclui um `docker-compose.yml` que sobe o RabbitMQ com interface de gerenciamento, além dos serviços de backend e frontend.

> Em ambientes offline o backend utiliza automaticamente um stub interno para `amqplib`, permitindo executar os testes sem o serviço, mas para uso real basta instalar as dependências (`npm install`) e garantir que o RabbitMQ esteja em execução.

```bash
docker compose up --build
```

Serviços disponíveis após o comando:

- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- RabbitMQ Management: http://localhost:15672 (usuário/padrão `guest`)

Para parar tudo, use `docker compose down`.

> **Dica:** ao rodar o backend fora do Docker, mantenha o RabbitMQ ativo (via Docker Compose ou instalação local). A fila padrão utilizada é `orders_queue` e pode ser configurada pelas variáveis `RABBITMQ_URL` e `RABBITMQ_QUEUE`.

## Fluxo da mensageria

1. O frontend envia o pedido para `POST /orders`.
2. O backend valida e calcula o total, armazena o pedido em memória e publica a mensagem na fila `orders_queue`.
3. O consumer registrado no backend consome a mensagem e registra no console a atualização de estoque do produto.

## Boas práticas adotadas

- Validação de dados tanto no frontend quanto no backend.
- Separação de responsabilidades (serviços, filas, componentes).
- Testes automatizados para regras de negócio críticas.
- Documentação e Docker Compose para facilitar a execução do projeto.