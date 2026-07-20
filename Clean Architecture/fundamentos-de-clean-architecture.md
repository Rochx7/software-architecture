# Fundamentos da Clean Architecture

> O centro da sua aplicação não é o banco de dados, o framework ou as bibliotecas que ela possa estar utilizando. O centro da sua aplicação são os **Use Cases**.
> _Robert C. Martin_

A Clean Architecture é muito orientada a **Use Cases**. Ela utiliza **Domain Model**, mas o centro são os Use Cases.

![alt text](image.png)

## Entities

- Representam as regras de negócio independentes, ou seja, que podem ser utilizadas pelos Use Cases para compor as regras de negócio da aplicação.
- As Entities podem ser representadas tanto por objetos quanto por um conjunto de funções.

### Exemplos de regras de negócio independentes

- O documento é válido?
- Qual é a distância entre duas coordenadas?
- Existe match entre uma ordem de compra e uma ordem de venda?

> As Entities devem ser independentes e reutilizáveis. Não podem depender de recursos externos, como banco de dados ou integrações.

### Exemplos de Entities

- Account
- UUID
- Document
- Email
- Name
- Password

<br/>

## Use Cases

- São responsáveis pelo comportamento da aplicação, demandado pelos drivers.
- Orquestram as regras de negócio independentes, implementadas pelas Entities, e os recursos externos, como banco de dados, filas e APIs.

### Exemplos

- Signup
- Deposit
- PlaceOrder
- GetAccount
- ExecuteOrder

![alt text](image-2.png)

<details>

<summary><b>Definindo entradas e saídas</b></summary>

### Definindo entradas e saídas

Nos Use Cases, as entradas e saídas são sempre DTOs (_Data Transfer Objects_), e não Entities.

Isso é importante para não criar acoplamentos desnecessários entre as camadas externas e o domínio.

> As necessidades de um Use Case nem sempre combinam com a estrutura das Entities. Além disso, normalmente as Entities possuem suas propriedades encapsuladas, tornando ainda mais inviável essa utilização.

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

export class Signup implements UseCase {
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

</details><br>

> **Use Case é diferente de CRUD?**
>
> Um CRUD é composto por operações de **Create**, **Read**, **Update** e **Delete**, enquanto um Use Case nem sempre executa esse tipo de operação. Muitas vezes ele realiza uma combinação dessas operações, envolvendo diferentes tabelas e outros tipos de recursos externos.

<br/>

## Interface Adapters

- Funcionam como uma ponte entre o Core da aplicação e os recursos externos.
- São responsáveis por traduzir dados entre o domínio e as tecnologias utilizadas pela aplicação.
- Podem ser representados por código SQL, mapeamento de URLs, Gateways, Controllers, Endpoints ou APIs externas.

### Exemplos de Interface Adapters

- **AccountRepository**: consultas (queries) SQL.
- **PaymentGateway**: endpoint, payload e integração com provedores de pagamento.
- **OrderController**: mapeamento de URLs, extração de parâmetros e query strings.
- **EventPublisher**: publicação de mensagens em filas.
- **OrderHandler**: processamento de mensagens recebidas.

### Exemplo de código

Repare que a conexão com o banco de dados ficou abstraída pela interface `DatabaseConnection`, criando independência em relação à tecnologia utilizada. Dessa forma, o repositório não depende diretamente de uma biblioteca específica para acesso ao banco de dados.

```typescript
// OrderRepositoryDatabase.ts
export class OrderRepositoryDatabase implements OrderRepository {

    constructor(readonly databaseConnection: DatabaseConnection) {
    }

    async save(order: Order): Promise<void> {
        await this.databaseConnection.query(
            "insert into app.order (order_id, account_id, market_id, side, quantity, price, status, fill_quantity, fill_price, timestamp) values ($1, $2, $3, $4, $5, $6, $7 ...)"
        );
    }

    async update(order: Order): Promise<void> {
        await this.databaseConnection.query(
            "update app.order set status = $1, fill_quantity = $2, fill_price = $3 where order_id = $4",
            [order.status, order.fillQuantity, order.fillPrice, order.orderId]
        );
    }

    async getById(orderId: string): Promise<Order> {
        const [orderData] = await this.databaseConnection.query(
            "select * from app.order where order_id = $1",
            [orderId]
        );

        const order = new Order(
            orderData.order_id,
            orderData.account_id,
            orderData.market_id,
            orderData.side,
            parseFloat(orderData.quantity),
            parseFloat(orderData.price),
            parseFloat(orderData.fill_quantity),
            {...}
        );

        return order;
    }

    async listByMarketIdAndStatus(
        marketId: string,
        status: string
    ): Promise<Order[]> {
        const ordersData = await this.databaseConnection.query(
            "select * from app.order where market_id = $1 and status = $2",
            [marketId, status]
        );

        const orders: Order[] = [];

        for (const orderData of ordersData) {
            const order = new Order(
                orderData.order_id,
                orderData.account_id,
                orderData.market_id,
                orderData.side,
                parseFloat(orderData.quantity),
                parseFloat(orderData.price),
                parseFloat(orderData.fill_quantity),
                {...}
            );

            orders.push(order);
        }

        return orders;
    }
}
```

<br/>

## Uso do padrão Domain Model

- A Clean Architecture utiliza o padrão **Domain Model** em vez de **Transaction Script** como estratégia de design.
- As regras de negócio são concentradas na camada de domínio quando pensamos em independência e reuso.
- Porém, o Use Case possui um papel fundamental de orquestração.
- É a junção dessas duas camadas que abstrai a lógica da aplicação.

![alt text](image-1.png)

<br/>

## Frameworks and Drivers

Os Frameworks and Drivers são o nível mais baixo da abstração e representam a interação com a tecnologia, com os componentes que realizam a conexão com o banco de dados, as requisições HTTP, a interação com o sistema de arquivos ou o acesso aos recursos do sistema operacional.

**Exemplos de Frameworks and Drivers**

- DatabaseConnection
- HttpServer
- HttpClient
- Queue
- PgPromiseAdapter
- AxiosAdapter
- ExpressAdapter

**Como fica no codigo?**
Nessa camada temos o uso do padrão Adapter para proporcionar a independência de bibliotecas e frameworks.

```typescript
import pgp from "pg-promise";

export default interface DatabaseConnection {
  query(statement: string, params: any): Promise<any>;
  close(): Promise<void>;
}

export class PgPromiseAdapter implements DatabaseConnection {
  connection: pgp.IDatabase<{}>;

  constructor() {
    this.connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  }

  async query(statement: string, params: any): Promise<any> {
    return this.connection.query(statement, params);
  }

  async close(): Promise<void> {
    return this.connection.$pool.end();
  }
}
```

<br/>

## Dependency Rule

Quem está dentro não conhece quem está fora, mas quem está fora conhece quem está dentro: as Entities não conhecem os Use Cases, e estes não conhecem a implementação dos Interface Adapters, que, por sua vez, não conhecem a implementação dos Frameworks and Drivers.

> As Dependency Rules são as setas pretas fazendo a ligação entre as camadas de fora para dentro.

- Em linhas gerais, ela diz que quem está fora conhece (ou pode conhecer) quem está dentro, mas quem está dentro não pode conhecer quem está fora.

<br/>

## Inicializacao

Toda aplicação tem um ponto de entrada, ou _entrypoint_, e ele, em um design desacoplado, é responsável por realizar a inicialização das dependências.

> Esse padrão é conhecido como **Composition Root** e é por meio dele que cada classe sabe qual dependência deve utilizar.

<br/>

#### Devo usar CLEAN ARCH em todos os projetos?

Claro que não. Nem sempre devemos utilizar a mesma solução para resolver todos os problemas.

Projetos de áreas como contabilidade, fiscal, previdenciária, jurídica etc. costumam se beneficiar bastante desse tipo de arquitetura. Nesses casos, ela faz muito sentido, principalmente quando combinada com DDD.
