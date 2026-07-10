# Aplicando Ports and Adapters com SOLID

![alt text](image-1.png)

Ports and Adapters vai muito além da simples separação de responsabilidades. Essa arquitetura trata principalmente de **acoplamento**, **independência** e da **direção das dependências** dentro da aplicação.

## Direção das Dependências

A comunicação entre as camadas acontece da seguinte forma:

1. **Driver Adapter (Inbound Adapter)**
   - Tela (Frontend)
   - API REST
   - GraphQL
   - Fila de mensagens (consumidores)
   - Testes automatizados

2. **Application (Core)**
   - Casos de uso
   - Regras de negócio
   - Entidades
   - Serviços de domínio

3. **Driven Adapter (Outbound Adapter)**
   - Banco de dados
   - APIs externas
   - Sistema de arquivos
   - Filas de mensagens (produtores)
   - Serviços de terceiros

A regra mais importante é:

> As dependências sempre apontam para dentro, em direção ao núcleo da aplicação.

---

## Dependency Inversion Principle (DIP)

Módulos de alto nível (regras de negócio) não devem depender de módulos de baixo nível (banco de dados, APIs externas, sistemas de mensageria, etc.).

Ambos devem depender de **abstrações** (interfaces ou contratos).

### Errado

```text
Application → PostgreSQL
```

Nesse caso, a regra de negócio conhece diretamente a tecnologia utilizada.

### Correto

```text
Application → AccountRepository (Port)

PostgresRepository → AccountRepository
```

A aplicação depende apenas do contrato. A implementação concreta fica na infraestrutura.

---

## Interface Segregation Principle (ISP)

Nenhum componente deve ser obrigado a depender de métodos ou comportamentos que não utiliza.

Interfaces devem ser pequenas, específicas e focadas em uma única responsabilidade.

### Exemplo ruim

```typescript
interface UserRepository {
  save();
  find();
  sendEmail();
  generateReport();
}
```

### Exemplo melhor

```typescript
interface UserRepository {
  save();
  find();
}

interface EmailSender {
  send();
}
```

Cada componente depende apenas do que realmente precisa.

---

## Driven Adapter

O Driven Adapter é responsável por implementar as portas de saída definidas pelo Core.

Ele representa tudo aquilo que a aplicação utiliza para se comunicar com o mundo externo.

Exemplos:

- Banco de dados
- APIs externas
- Serviços de autenticação
- Sistemas de arquivos
- Mensageria

O Core define o contrato (Port) e o Driven Adapter fornece a implementação concreta.

```ts
// Driven Adapter

import pgp from "pg-promise";
import type { AccountServiceAccountData } from "./AccountService.ts";

export default interface AccountData extends AccountServiceAccountData {
  save(account: Account): Promise<void>;
  getById(accountId: string): Promise<Account>;
  list(): Promise<Account[]>;
}

export class AccountDataDatabase implements AccountData {
  async save(account: Account): Promise<void> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "insert into app.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
      [
        account.accountId,
        account.name,
        account.email,
        account.document,
        account.password,
      ],
    );
    await connection.$pool.end();
  }

  async getById(accountId: string): Promise<Account> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [accountData] = await connection.query(
      "select * from app.account where account_id = $1",
      [accountId],
    );
    const account = {
      accountId: accountData.account_id,
      name: accountData.name,
      email: accountData.email,
      document: accountData.document,
      password: accountData.password,
    };
    await connection.$pool.end();
    return account;
  }

  async list(): Promise<Account[]> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const accountsData = await connection.query(
      "select * from app.account",
      [],
    );
    const accounts: Account[] = [];
    for (const accountData of accountsData) {
      const account = {
        accountId: accountData.account_id,
        name: accountData.name,
        email: accountData.email,
        document: accountData.document,
        password: accountData.password,
      };
      accounts.push(account);
    }

    await connection.$pool.end();
    return accounts;
  }
}

export class AccountDataFake implements AccountData {
  accounts: Account[] = [];

  async save(account: Account): Promise<void> {
    this.accounts.push(account);
  }

  async getById(accountId: string): Promise<Account> {
    const account = this.accounts.find(
      (account: Account) => account.accountId === accountId,
    );
    if (!account) throw new Error("Account not found");
    return account;
  }

  async list(): Promise<Account[]> {
    return this.accounts;
  }
}

type Account = {
  accountId: string;
  name: string;
  email: string;
  document: string;
  password: string;
};
```

```ts
// Driven Adapter

import express, { type Request, type Response } from "express";
import cors from "cors";
import type AccountService from "./AccountService.ts";

export default class API {
  constructor(readonly accountService: AccountService) {
    const app = express();
    app.use(express.json());
    app.use(cors());

    app.post("/signup", async (req: Request, res: Response) => {
      const input = req.body;
      try {
        const output = await accountService.signup(input);
        res.json({
          accountId: output.accountId,
        });
      } catch (e: any) {
        res.json({
          error: e.message,
        });
      }
    });

    app.get("/accounts/:accountId", async (req: Request, res: Response) => {
      const accountId = req.params.accountId as string;
      const output = await accountService.getAccount(accountId);
      res.json(output);
    });

    app.listen(3000);
  }
}
```

### Exemplo

```text
AccountService
       │
       ▼
AccountRepository (Port)
       │
       ▼
PostgresAccountRepository (Driven Adapter)
```

---

## Port

Uma **Port** é um contrato que pertence ao núcleo da aplicação.

Ela define como o Core espera se comunicar com componentes externos.

Uma Port não pertence à API, ao banco de dados ou à infraestrutura.

Ela pertence ao domínio ou à aplicação.

A infraestrutura apenas implementa esse contrato.

```ts
import crypto from "crypto";
import { validateCpf } from "./validateCpf.ts";
import { validateName } from "./validateName.ts";

// Driver Port
export default interface AccountService {
  signup(input: SignupInput): Promise<SignupOutput>;
  getAccount(accountId: string): Promise<GetAccountOutput>;
}

// Driven Port
export interface AccountServiceAccountData {
  save(account: Account): Promise<void>;
  getById(accountId: string): Promise<Account>;
}

type Account = {
  accountId: string;
  name: string;
  email: string;
  document: string;
  password: string;
};

export class AccountServiceImpl {
  constructor(readonly accountData: AccountServiceAccountData) {}

  async signup(input: SignupInput): Promise<SignupOutput> {
    if (!validateName(input.name)) {
      throw new Error("Invalid name");
    }
    if (!input.email.match(/.+@.+\..+/)) {
      throw new Error("Invalid email");
    }
    if (!validateCpf(input.document)) {
      throw new Error("Invalid document");
    }
    if (
      input.password.length < 8 ||
      !input.password.match(/[a-z]/) ||
      !input.password.match(/[A-Z]/) ||
      !input.password.match(/[0-9]/)
    ) {
      throw new Error("Invalid password");
    }
    const account = {
      accountId: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      document: input.document,
      password: input.password,
    };
    await this.accountData.save(account);
    return {
      accountId: account.accountId,
    };
  }

  async getAccount(accountId: string): Promise<GetAccountOutput> {
    const output = await this.accountData.getById(accountId);
    return output;
  }
}

export class AccountServiceFake implements AccountService {
  async signup(input: SignupInput): Promise<SignupOutput> {
    return {
      accountId: "1",
    };
  }

  async getAccount(accountId: string): Promise<GetAccountOutput> {
    return {
      accountId: "1",
      name: "a",
      email: "b",
      document: "c",
      password: "d",
    };
  }
}

type SignupInput = {
  name: string;
  email: string;
  document: string;
  password: string;
};

type SignupOutput = {
  accountId: string;
};

type GetAccountOutput = {
  accountId: string;
  name: string;
  email: string;
  document: string;
  password: string;
};
```

### Exemplo

```typescript
export interface AccountRepository {
  save(account: Account): Promise<void>;
  findById(id: string): Promise<Account | null>;
}
```

O Core conhece apenas a interface.

Quem implementa essa interface pode ser:

- PostgreSQL
- MongoDB
- Redis
- API externa
- Mock para testes

Sem que seja necessário alterar as regras de negócio.

---

---

## Resumo

### Driver Adapter

Responsável por iniciar o fluxo da aplicação.

Exemplos:

- Controllers
- Frontend
- CLI
- Testes
- Consumidores de eventos

### Application/Core

Responsável pelas regras de negócio.

Exemplos:

- Use Cases
- Services
- Entities
- Value Objects

### Driven Adapter

Responsável por implementar integrações externas.

Exemplos:

- Banco de dados
- APIs externas
- Sistema de arquivos
- Mensageria

### Port

Contrato definido pelo Core.

### Adapter

Implementação concreta de uma Port.

---

> "O Core não deve conhecer tecnologias. As tecnologias devem conhecer o Core."
