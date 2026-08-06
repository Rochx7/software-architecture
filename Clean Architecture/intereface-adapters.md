# Interface Adapters

> Os Interface Adapters são responsáveis por fazer a comunicação entre os Use Cases e o mundo externo.
>
> Eles traduzem dados, formatos e contratos para que o domínio permaneça independente de tecnologias, frameworks e bibliotecas.

## O que são Interface Adapters?

Os Interface Adapters funcionam como uma ponte entre os Use Cases e recursos externos da aplicação.

Eles recebem dados de uma camada, adaptam para o formato esperado pela outra camada e garantem que o Core da aplicação permaneça desacoplado de detalhes de infraestrutura.

```text
Driver Adapter
      ↓
   Use Case
      ↓
Interface Adapter
      ↓
Frameworks and Drivers
```

Seu principal objetivo é evitar que regras de negócio dependam diretamente de tecnologias externas.

---

## Exemplo

Considere o Use Case `Signup`:

```typescript
export class Signup {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<void> {
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

O Use Case conhece apenas a abstração `AccountRepository`.

```typescript
export default interface AccountRepository {
  save(account: Account): Promise<void>;
}
```

Entretanto, alguém precisa implementar esse contrato.

```typescript
export class AccountRepositoryDatabase implements AccountRepository {
  constructor(readonly databaseConnection: DatabaseConnection) {}

  async save(account: Account): Promise<void> {
    await this.databaseConnection.query(
      "insert into account (...) values (...)",
    );
  }
}
```

Nesse caso, `AccountRepositoryDatabase` é um Interface Adapter.

Ele adapta a necessidade do domínio para a tecnologia utilizada no banco de dados.

---

## O que normalmente encontramos nos Interface Adapters?

### Repositórios

Responsáveis por adaptar o acesso aos dados.

```typescript
class AccountRepositoryDatabase implements AccountRepository {}
```

---

### Controllers

Responsáveis por adaptar requisições HTTP para Use Cases.

```typescript
class AccountController {
  async signup(request: Request) {
    return signup.execute(request.body);
  }
}
```

---

### Gateways

Responsáveis por adaptar integrações externas.

```typescript
class PaymentGatewayMercadoPago implements PaymentGateway {}
```

---

### Handlers

Responsáveis por adaptar mensagens recebidas de filas ou eventos.

```typescript
class OrderHandler {
  async handle(message: any) {}
}
```

---

### Publishers

Responsáveis por publicar eventos.

```typescript
class OrderPlacedPublisher implements EventPublisher {}
```

---

## O que NÃO deve existir nos Interface Adapters?

Os Interface Adapters não devem concentrar regras de negócio.

### Exemplo incorreto

```typescript
export class AccountRepositoryDatabase
  implements AccountRepository {

  async save(account: Account) {
    if (account.balance > 10000) {
      throw new Error("Saldo inválido");
    }

    await this.databaseConnection.query(...);
  }
}
```

A validação de saldo pertence ao domínio.

O repositório deveria apenas persistir os dados.

---

## Tradução entre modelos

Uma das principais responsabilidades dos Interface Adapters é converter estruturas de dados.

### Exemplo

Dados vindos do banco:

```typescript
const accountData = {
  account_id: "123",
  account_name: "João",
};
```

Transformação para uma Entity:

```typescript
const account = new Account(accountData.account_id, accountData.account_name);
```

O domínio não precisa conhecer o formato utilizado pelo banco.

---

## Interface Adapters e Dependency Rule

Os Interface Adapters conhecem os Use Cases e as abstrações do domínio.

Porém, o domínio não conhece os Interface Adapters.

```text
Use Case
    ↑
Interface Adapter
```

A dependência aponta sempre para dentro.

---

## Exemplos de Interface Adapters

- `AccountRepositoryDatabase`
- `PaymentGatewayMercadoPago`
- `OrderController`
- `OrderHandler`
- `EventPublisherRabbitMQ`
- `UserRepositoryPrisma`
- `AccountRepositoryPostgres`
- `HttpController`
- `RestClientAdapter`

---

## Resumo

Os Interface Adapters são responsáveis por conectar o domínio ao mundo externo.

Suas principais responsabilidades são:

- Adaptar formatos de dados.
- Implementar contratos definidos pelo domínio.
- Traduzir requisições e respostas.
- Isolar detalhes de infraestrutura.
- Manter o domínio desacoplado de tecnologias.

Eles funcionam como uma camada intermediária entre os Use Cases e os Frameworks and Drivers.

```text
Use Cases
    ↓
Interface Adapters
    ↓
Frameworks and Drivers
```

> O domínio define as regras. Os Interface Adapters traduzem essas regras para o mundo externo.
