# Frameworks and Drivers

> Frameworks and Drivers representam a camada mais externa da Clean Architecture e são responsáveis por conectar a aplicação ao mundo externo.

Essa camada contém todos os detalhes de infraestrutura necessários para que a aplicação funcione, mas que não fazem parte das regras de negócio.

Em uma aplicação baseada em Clean Architecture, Frameworks and Drivers devem ser considerados detalhes substituíveis.

## O que faz parte dessa camada?

Alguns exemplos comuns:

- Express
- Fastify
- NestJS
- PostgreSQL
- MySQL
- MongoDB
- Prisma
- TypeORM
- Redis
- RabbitMQ
- Kafka
- AWS S3
- Stripe
- APIs externas
- Serviços de Email

Todos esses componentes são ferramentas utilizadas para executar a aplicação, mas não representam o negócio.

---

## O princípio fundamental

Uma das regras mais importantes da Clean Architecture é:

> As regras de negócio não devem depender de Frameworks and Drivers.

Isso significa que:

- Uma Entity não deve conhecer o Prisma.
- Um Use Case não deve conhecer o Express.
- Um domínio não deve conhecer o PostgreSQL.
- Uma regra de negócio não deve conhecer uma API externa.

As dependências sempre apontam para dentro da arquitetura.

```text
Frameworks & Drivers
        ↓
Interface Adapters
        ↓
Use Cases
        ↓
Entities
```

As camadas internas nunca dependem das externas.

---

## Exemplo

Imagine um sistema de cadastro de usuários.

Regra de negócio:

> Um usuário não pode ser cadastrado com um email já existente.

Essa regra continua sendo verdadeira independentemente da tecnologia utilizada.

### Hoje

```text
Express
Prisma
PostgreSQL
```

### Amanhã

```text
Fastify
Drizzle
MySQL
```

A regra continua exatamente igual.

Por isso ela não deve depender dessas tecnologias.

---

## Exemplo incorreto

Um erro comum é misturar regra de negócio com infraestrutura.

```typescript
import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

app.post("/users", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (user) {
    throw new Error("Email already exists");
  }

  await prisma.user.create({
    data: req.body,
  });

  res.sendStatus(201);
});
```

Nesse exemplo:

- Existe HTTP.
- Existe Express.
- Existe Prisma.
- Existe banco de dados.
- Existe regra de negócio.

Tudo está misturado.

---

## Exemplo correto

A regra fica isolada dentro do Use Case.

```typescript
export class CreateUser {
  constructor(readonly userRepository: UserRepository) {}

  async execute(input: Input): Promise<void> {
    const user = await this.userRepository.getByEmail(input.email);

    if (user) {
      throw new Error("Email already exists");
    }

    await this.userRepository.save(new User(input.name, input.email));
  }
}
```

Observe que:

- Não existe Express.
- Não existe Prisma.
- Não existe PostgreSQL.
- Não existe HTTP.

O Use Case conhece apenas o contrato necessário para executar a regra.

---

## Contratos (Ports)

Para evitar dependência direta com frameworks, normalmente utilizamos interfaces.

### Exemplo

```typescript
export interface UserRepository {
  getByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

O Use Case depende apenas desse contrato.

Ele não sabe:

- Qual banco será utilizado.
- Qual ORM será utilizado.
- Qual framework está executando a aplicação.

---

## Implementações concretas

A implementação real fica na camada de Frameworks and Drivers.

### Exemplo com Prisma

```typescript
export class UserRepositoryPrisma implements UserRepository {
  async getByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async save(user: User) {
    await prisma.user.create({
      data: user,
    });
  }
}
```

Agora o Prisma está isolado na camada externa.

Se amanhã a aplicação migrar para outro ORM, apenas essa implementação precisará ser alterada.

---

## Exemplo com APIs externas

Frameworks and Drivers não envolvem apenas banco de dados.

Uma API externa também é um detalhe de infraestrutura.

### Contrato

```typescript
export interface TeamStatsProvider {
  getStats(teamId: number): Promise<TeamStats>;
}
```

### Implementação

```typescript
export class ApiFootballProvider implements TeamStatsProvider {
  async getStats(teamId: number) {
    const response = await axios.get(`/teams/${teamId}`);

    return response.data;
  }
}
```

Nesse caso:

- O contrato pertence à aplicação.
- O Axios pertence à infraestrutura.
- A API externa é apenas um detalhe técnico.

---

## Drivers

O termo Driver representa algo que inicia uma interação com a aplicação.

Alguns exemplos:

- Requisições HTTP
- Eventos do RabbitMQ
- Mensagens Kafka
- Cron Jobs
- CLI Commands
- WebSockets

### Exemplo

```text
Usuário
   ↓
Express Route
   ↓
Controller
   ↓
Use Case
```

Nesse fluxo, o Express atua como um Driver.

Ele apenas entrega a solicitação para a aplicação.

---

## Frameworks

Frameworks são ferramentas utilizadas para implementar detalhes técnicos da aplicação.

### Exemplos

#### Framework Web

```text
Express
Fastify
NestJS
```

#### Persistência

```text
Prisma
TypeORM
Sequelize
Mongoose
```

#### Mensageria

```text
RabbitMQ
Kafka
```

#### Cloud

```text
AWS
Azure
GCP
```

Todos eles devem ser tratados como detalhes substituíveis.

---

## Fluxo completo

```text
HTTP Request
      ↓
Express
      ↓
Controller
      ↓
Use Case
      ↓
Repository Interface
      ↓
Prisma Repository
      ↓
PostgreSQL
```

Visualmente:

```text
┌─────────────────────────────┐
│ Frameworks & Drivers        │
│                             │
│ Express                     │
│ Prisma                      │
│ PostgreSQL                  │
│ RabbitMQ                    │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Interface Adapters          │
│                             │
│ Controllers                 │
│ Presenters                  │
│ Repositories                │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Use Cases                   │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Entities                    │
└─────────────────────────────┘
```

---

## Quando trocar um Framework?

Uma boa arquitetura permite trocar tecnologias externas sem alterar o domínio.

### Exemplo

Antes:

```text
Express
Prisma
PostgreSQL
```

Depois:

```text
Fastify
Drizzle
MySQL
```

As alterações devem acontecer apenas nas camadas externas.

As Entities e Use Cases permanecem inalterados.

---

## Sinais de acoplamento incorreto

Alguns sinais indicam que detalhes de infraestrutura estão vazando para dentro da aplicação.

### Exemplo

```typescript
import express from "express";
import prisma from "@prisma/client";
import axios from "axios";
```

Se esse tipo de import aparece dentro de:

- Entities
- Use Cases

normalmente existe um problema arquitetural.

---

## Resumo

Frameworks and Drivers representam todos os detalhes técnicos necessários para executar a aplicação.

Características principais:

- São a camada mais externa da arquitetura.
- Contêm frameworks, bancos e serviços externos.
- Devem ser considerados substituíveis.
- Não devem influenciar as regras de negócio.
- Dependem das camadas internas.
- Podem ser trocados sem alterar Entities e Use Cases.

Em Clean Architecture, Frameworks and Drivers são apenas ferramentas utilizadas para executar a aplicação. O negócio deve continuar funcionando mesmo que essas ferramentas sejam substituídas.
