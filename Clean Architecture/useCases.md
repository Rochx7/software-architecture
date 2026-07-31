# Use Cases

> Os Use Cases representam os comportamentos da aplicação.
>
> Eles são responsáveis por orquestrar as regras de negócio, coordenar Entities e interagir com recursos externos por meio de abstrações.
>
> Na Clean Architecture, os Use Cases ficam no centro da aplicação e representam aquilo que o sistema faz.

## O que são Use Cases?

Um Use Case representa uma ação que o usuário ou outro sistema deseja executar.

Em outras palavras, ele descreve um objetivo de negócio.

### Exemplos

- Criar uma conta (_Signup_)
- Realizar um depósito (_Deposit_)
- Efetuar uma transferência (_Transfer_)
- Criar uma ordem de compra (_Place Order_)
- Consultar uma conta (_Get Account_)

Cada Use Case possui uma responsabilidade específica e representa um comportamento da aplicação.

---

## Papel dos Use Cases

Os Use Cases são responsáveis por:

- Receber dados de entrada.
- Executar regras de negócio.
- Coordenar Entities.
- Interagir com repositórios.
- Chamar serviços externos por meio de abstrações.
- Retornar um resultado.

Eles funcionam como uma camada de orquestração entre o domínio e a infraestrutura.

```text
Driver Adapter
      ↓
   Use Case
      ↓
   Entities
      ↓
Interface Adapters
      ↓
Frameworks and Drivers
```

---

## O que um Use Case deve conhecer?

Um Use Case pode conhecer:

- Entities
- Value Objects
- Interfaces (Ports)
- DTOs

### Exemplo

```typescript
export class Signup {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<Output> {
    const account = Account.create(
      input.name,
      input.email,
      input.document,
      input.password,
    );

    await this.accountRepository.save(account);

    return {
      accountId: account.accountId,
    };
  }
}
```

Observe que o Use Case conhece apenas a interface `AccountRepository`.

Ele não sabe:

- Qual banco está sendo utilizado.
- Qual ORM está sendo utilizado.
- Qual framework está sendo executando a aplicação.

---

## O que um Use Case NÃO deve conhecer?

Os Use Cases não devem depender diretamente de tecnologias.

### Evite

```typescript
import express from "express";
```

```typescript
import axios from "axios";
```

```typescript
import pg from "pg";
```

```typescript
export class Signup {
  async execute(input: Input) {
    await pg.query(...);
  }
}
```

Isso cria acoplamento com a infraestrutura.

---

## Entradas e saídas

Uma boa prática é que os Use Cases recebam e retornem DTOs (_Data Transfer Objects_).

### Input

```typescript
type Input = {
  name: string;
  email: string;
  document: string;
  password: string;
};
```

### Output

```typescript
type Output = {
  accountId: string;
};
```

### Use Case

```typescript
export class Signup {
  async execute(input: Input): Promise<Output> {
    // ...
  }
}
```

---

## Por que utilizar DTOs?

Porque as necessidades dos Use Cases raramente coincidem com a estrutura das Entities.

Além disso:

- Evita acoplamento.
- Facilita evolução da API.
- Permite expor apenas os dados necessários.
- Mantém o domínio protegido.

### Exemplo

```typescript
type GetAccountOutput = {
  accountId: string;
  name: string;
  email: string;
};
```

O cliente recebe apenas os dados necessários.

---

## Use Cases e Entities

Uma dúvida muito comum é:

> Onde a regra de negócio deve ficar?

A resposta depende do tipo da regra.

### Regra da Entity

É uma regra independente e reutilizável.

```typescript
class Document {
  constructor(readonly value: string) {
    if (!this.validate()) {
      throw new Error("Invalid document");
    }
  }

  validate(): boolean {
    return true;
  }
}
```

Essa regra pode ser utilizada por qualquer Use Case.

---

### Regra do Use Case

É uma regra de orquestração.

```typescript
export class Signup {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input) {
    const exists = await this.accountRepository.exists(input.email);

    if (exists) {
      throw new Error("Account already exists");
    }

    const account = Account.create(
      input.name,
      input.email,
      input.document,
      input.password,
    );

    await this.accountRepository.save(account);
  }
}
```

Essa regra depende de recursos externos e, por isso, pertence ao Use Case.

---

## Use Cases e CRUD

Um erro comum é pensar que Use Case e CRUD são a mesma coisa.

### CRUD

Representa operações básicas:

- Create
- Read
- Update
- Delete

### Use Case

Representa um comportamento de negócio.

### Exemplo

```typescript
PlaceOrder;
```

Esse Use Case pode:

- Consultar produtos.
- Verificar saldo.
- Criar uma ordem.
- Persistir dados.
- Publicar eventos.

Tudo dentro da mesma operação.

Portanto, um Use Case normalmente é mais rico que um simples CRUD.

---

## Exemplo completo

```typescript
type Input = {
  name: string;
  email: string;
  document: string;
  password: string;
};

type Output = {
  accountId: string;
};

export class Signup {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<Output> {
    const exists = await this.accountRepository.exists(input.email);

    if (exists) {
      throw new Error("Account already exists");
    }

    const account = Account.create(
      input.name,
      input.email,
      input.document,
      input.password,
    );

    await this.accountRepository.save(account);

    return {
      accountId: account.accountId,
    };
  }
}
```

### Responsabilidades desse Use Case

- Receber a entrada.
- Consultar o repositório.
- Executar validações de negócio.
- Criar a Entity.
- Persistir os dados.
- Retornar o resultado.

---

## Características de um bom Use Case

### Possui apenas uma responsabilidade

### Exemplo

```typescript
Signup;
```

Responsável apenas por criar contas.

---

### Possui nome orientado ao negócio

### Ruim

```typescript
UserService;
```

### Melhor

```typescript
Signup;
CreateAccount;
TransferMoney;
PlaceOrder;
```

O nome deve representar uma ação de negócio.

---

### É independente de infraestrutura

O Use Case deve depender apenas de abstrações.

```typescript
constructor(
  readonly accountRepository: AccountRepository
) {}
```

Nunca de implementações concretas.

---

### É fácil de testar

```typescript
const repositoryMock = {
  save: vi.fn(),
  exists: vi.fn(() => false),
};
```

Como depende de interfaces, o Use Case pode ser testado sem banco de dados ou APIs externas.

---

## Checklist

Antes de criar um Use Case, pergunte:

- [ ] Ele representa uma ação de negócio?
- [ ] Possui uma responsabilidade clara?
- [ ] Recebe DTOs como entrada?
- [ ] Retorna DTOs como saída?
- [ ] Depende apenas de abstrações?
- [ ] É independente de banco de dados?
- [ ] É independente de frameworks?
- [ ] Pode ser testado isoladamente?

Se todas as respostas forem "sim", provavelmente você está diante de um bom Use Case.

---

## Resumo

Os Use Cases representam os comportamentos da aplicação.

Eles são responsáveis por coordenar Entities, aplicar regras de negócio dependentes do contexto e interagir com recursos externos por meio de abstrações.

Um bom Use Case:

- Possui uma única responsabilidade.
- Representa uma ação de negócio.
- Depende apenas de abstrações.
- Recebe DTOs como entrada.
- Retorna DTOs como saída.
- É independente de infraestrutura.
- É fácil de testar.

> "Os Use Cases descrevem e implementam os casos de uso da aplicação. Eles coordenam o fluxo de dados entre as Entities e o mundo externo."
>
> _Robert C. Martin_
