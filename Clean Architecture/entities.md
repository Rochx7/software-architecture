# Entities

> Uma Entity representa um conceito central do domínio da aplicação e encapsula regras de negócio que precisam ser protegidas e reutilizadas.

As Entities são o coração da aplicação. Elas contêm regras de negócio independentes de frameworks, bancos de dados, APIs externas ou qualquer detalhe de infraestrutura.

Em uma aplicação baseada em Clean Architecture, as Entities devem sobreviver mesmo que toda a tecnologia ao redor seja substituída.

## Características de uma Entity

Uma Entity geralmente possui:

- Identidade própria.
- Estado.
- Comportamento.
- Regras de negócio.
- Independência de tecnologias externas.

### Exemplo

```typescript
export class Account {
  constructor(
    readonly accountId: string,
    private balance: number,
  ) {}

  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error("Invalid amount");
    }

    this.balance += amount;
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (amount > this.balance) {
      throw new Error("Insufficient funds");
    }

    this.balance -= amount;
  }

  getBalance(): number {
    return this.balance;
  }
}
```

Nesse exemplo:

- A Entity protege suas regras.
- Não existe SQL.
- Não existe HTTP.
- Não existe Prisma.
- Não existe TypeORM.

A única preocupação é a regra de negócio.

---

## Entity ≠ Tabela do Banco

Um erro comum é enxergar uma Entity apenas como o reflexo de uma tabela.

### Errado

```sql
account
├── id
├── name
├── email
└── password
```

```typescript
type Account = {
  id: string;
  name: string;
  email: string;
  password: string;
};
```

Isso é apenas uma estrutura de dados.

Uma Entity deve possuir comportamento e proteger suas invariantes.

### Melhor

```typescript
export class Account {
  constructor(
    readonly accountId: string,
    private email: Email,
  ) {}

  changeEmail(email: Email) {
    this.email = email;
  }
}
```

---

## Invariantes

Uma das principais responsabilidades de uma Entity é garantir que determinadas regras nunca sejam violadas.

Essas regras são chamadas de **Invariantes**.

### Exemplo

Um CPF inválido nunca deveria existir dentro da aplicação.

```typescript
export class CPF {
  constructor(readonly value: string) {
    if (!CPF.validate(value)) {
      throw new Error("Invalid CPF");
    }
  }
}
```

Após a criação do objeto, a aplicação passa a ter a garantia de que aquele CPF é válido.

---

## Value Objects

Nem todo objeto do domínio precisa ter identidade.

Quando um objeto existe apenas para representar um valor e suas regras, utilizamos o padrão **Value Object**.

### Exemplos

- CPF
- CNPJ
- Email
- Password
- Money
- Distance
- Coordinate

### Exemplo

```typescript
export class Email {
  constructor(readonly value: string) {
    if (!value.match(/^.+@.+$/)) {
      throw new Error("Invalid email");
    }
  }
}
```

Duas instâncias de Email com o mesmo valor representam exatamente a mesma coisa.

```typescript
new Email("john@gmail.com");
new Email("john@gmail.com");
```

---

## Entidades Anêmicas (Anemic Domain Model)

Um dos principais problemas encontrados em sistemas corporativos é o chamado Anemic Domain Model.

Nesse modelo, as Entities possuem apenas dados e nenhuma regra de negócio.

### Exemplo

```typescript
type Account = {
  accountId: string;
  balance: number;
};
```

Toda a lógica acaba espalhada pelos serviços:

```typescript
function withdraw(account: Account, amount: number) {
  if (amount > account.balance) {
    throw new Error("Insufficient funds");
  }

  account.balance -= amount;
}
```

O problema é que as regras ficam dispersas e difíceis de manter.

Uma Entity rica concentra seu comportamento:

```typescript
account.withdraw(100);
```

---

## Mecanismo de Persistência

As Entities não devem conhecer como são persistidas.

Isso significa que elas não devem depender de:

- Prisma
- TypeORM
- Sequelize
- Mongoose
- SQL
- PostgreSQL
- MongoDB

### Errado

```typescript
export class Account extends Model {}
```

Nesse caso a Entity está acoplada ao ORM.

### Correto

```typescript
export class Account {
  constructor(
    readonly accountId: string,
    readonly email: Email,
  ) {}
}
```

A persistência deve ficar em camadas externas da aplicação.

---

## DAO (Data Access Object)

DAO é um padrão voltado exclusivamente para acesso a dados.

Seu objetivo é encapsular consultas, comandos SQL e detalhes de persistência.

### Exemplo

```typescript
export interface AccountDAO {
  save(data: any): Promise<void>;
  getById(accountId: string): Promise<any>;
}
```

Implementação:

```typescript
export class AccountDAODatabase implements AccountDAO {
  async getById(accountId: string): Promise<any> {
    return database.query("select * from account where account_id = $1", [
      accountId,
    ]);
  }
}
```

O DAO normalmente trabalha com:

- DTOs
- Records
- Objetos simples

Sem necessariamente conhecer o domínio.

---

## Repository

O Repository atua como uma ponte entre o Domain Model e o mecanismo de persistência.

Enquanto o DAO trabalha com registros de banco, o Repository trabalha com objetos de domínio.

### Exemplo

```typescript
export interface AccountRepository {
  save(account: Account): Promise<void>;
  getById(accountId: string): Promise<Account>;
}
```

Implementação:

```typescript
export class AccountRepositoryDatabase implements AccountRepository {
  constructor(readonly accountDAO: AccountDAO) {}

  async getById(accountId: string): Promise<Account> {
    const accountData = await this.accountDAO.getById(accountId);

    return new Account(accountData.account_id, new Email(accountData.email));
  }
}
```

---

## DAO vs Repository

### DAO

Responsável pela persistência.

```text
Aplicação
    ↓
DAO
    ↓
Banco de Dados
```

Trabalha com:

- SQL
- Tabelas
- DTOs
- Records

---

### Repository

Responsável pela mediação entre domínio e persistência.

```text
Use Case
    ↓
Repository
    ↓
DAO
    ↓
Banco de Dados
```

Trabalha com:

- Entities
- Value Objects
- Agregados
- Regras de domínio

---

## Onde ficam as regras?

Uma dúvida comum é:

> "A regra fica na Entity ou no Use Case?"

### Regra independente

Fica na Entity.

```typescript
account.withdraw(amount);
```

A regra pode ser reutilizada por qualquer fluxo da aplicação.

---

### Regra de aplicação

Fica no Use Case.

```typescript
export class Withdraw {
  async execute(input: Input) {
    const account = await this.accountRepository.getById(input.accountId);

    account.withdraw(input.amount);

    await this.accountRepository.save(account);
  }
}
```

O Use Case orquestra.

A Entity protege as regras de negócio.

---

## Resumo

As Entities representam o núcleo do domínio e devem conter regras de negócio independentes de tecnologia.

Características principais:

- Possuem comportamento.
- Protegem invariantes.
- Não dependem de banco de dados.
- Não dependem de frameworks.
- Não dependem de APIs externas.
- São reutilizáveis por diversos Use Cases.

Em Clean Architecture, as Entities são os elementos mais estáveis da aplicação e normalmente são os que menos sofrem alterações quando tecnologias externas mudam.
