# Code Smells

> Um **Code Smell** é um indício de que existe um problema no design ou na estrutura do código.
>
> Ele não é necessariamente um bug, mas pode dificultar a manutenção, evolução, testes e compreensão do software.
>
> _Martin Fowler_

## O que são Code Smells?

Code Smells são sinais de alerta que indicam possíveis problemas na qualidade do código.

Eles geralmente surgem quando:

- O código cresce sem uma preocupação com design.
- Novas funcionalidades são adicionadas rapidamente.
- Não existe uma cultura de refatoração.
- Há excesso de pressão por entregas.
- O sistema acumula débito técnico ao longo do tempo.

> Um Code Smell não significa que o código está errado, mas sim que ele merece atenção.

---

## Métodos Duplicados

### Problema

Quando a mesma lógica aparece em diferentes lugares do sistema.

### Exemplo ruim

```typescript
function calculateMonthlyInterest(value: number): number {
  return value * 0.02;
}

function calculateLoanInterest(value: number): number {
  return value * 0.02;
}
```

A mesma regra está duplicada.

### Refatoração

```typescript
function calculateInterest(value: number): number {
  return value * 0.02;
}
```

### Problemas causados

- Dificulta manutenção.
- Aumenta o risco de inconsistências.
- Viola o princípio DRY (_Don't Repeat Yourself_).

---

## Métodos Longos

### Problema

Métodos com muitas linhas geralmente acumulam responsabilidades.

### Exemplo ruim

```typescript
async function createOrder(input: Input) {
  validateInput(input);

  const customer = await customerRepository.findById(input.customerId);

  validateCustomer(customer);

  const order = Order.create(customer.id, input.items);

  calculateTaxes(order);

  calculateDiscount(order);

  await orderRepository.save(order);

  sendEmail(order);

  publishEvent(order);

  return order;
}
```

### Refatoração

```typescript
async function createOrder(input: Input) {
  const customer = await getCustomer(input.customerId);

  const order = buildOrder(customer, input);

  await saveOrder(order);

  notifyOrderCreated(order);

  return order;
}
```

### Problemas causados

- Baixa legibilidade.
- Maior dificuldade para testes.
- Alta complexidade.

---

## Mistura de Responsabilidades

### Problema

Uma classe ou função faz muitas coisas diferentes.

### Exemplo ruim

```typescript
class UserService {
  async createUser(input: Input) {
    validateInput(input);

    const user = User.create(input);

    await database.insert(user);

    await emailService.sendWelcomeEmail(user);

    logger.info("User created");

    return user;
  }
}
```

### Refatoração

Cada responsabilidade deve possuir seu próprio componente.

```typescript
class UserValidator {}

class UserRepository {}

class EmailService {}

class UserService {}
```

### Problemas causados

- Alto acoplamento.
- Baixa reutilização.
- Violação do SRP (_Single Responsibility Principle_).

---

## Comentários Desnecessários

### Problema

Comentários explicando algo que o próprio código deveria deixar claro.

### Exemplo ruim

```typescript
// Soma dois números
function sum(a: number, b: number) {
  return a + b;
}
```

### Melhor

```typescript
function sum(a: number, b: number) {
  return a + b;
}
```

### Comentários úteis

Comentários são úteis quando explicam:

- Regras de negócio complexas.
- Decisões arquiteturais.
- Limitações técnicas.
- Integrações externas.

Exemplo:

```typescript
// O parceiro exige autenticação renovada a cada 30 minutos.
```

---

## Código Morto (Dead Code)

### Problema

Código que não é utilizado.

### Exemplo ruim

```typescript
function calculateTax() {
  return 10;
}

function processOrder() {
  return "ok";
}
```

Se `calculateTax` nunca é utilizada, ela é código morto.

### Problemas causados

- Polui o código.
- Confunde desenvolvedores.
- Aumenta o custo de manutenção.

### Solução

Remover código não utilizado.

O Git já é o backup.

---

## Condições Aninhadas e Confusas

### Problema

Muitos níveis de ifs dificultam a leitura.

### Exemplo ruim

```typescript
if (user) {
  if (user.active) {
    if (user.subscription) {
      if (user.subscription.valid) {
        return true;
      }
    }
  }
}

return false;
```

### Refatoração

Utilizar _Guard Clauses_.

```typescript
if (!user) return false;
if (!user.active) return false;
if (!user.subscription) return false;

return user.subscription.valid;
```

### Benefícios

- Menos indentação.
- Leitura mais rápida.
- Menor complexidade cognitiva.

---

## Muitos Parâmetros

### Problema

Métodos com muitos argumentos.

### Exemplo ruim

```typescript
createUser(name, email, document, phone, address, city, state, zipCode);
```

### Refatoração

Utilizar objetos.

```typescript
type CreateUserInput = {
  name: string;
  email: string;
  document: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

createUser(input: CreateUserInput);
```

---

## Nomes Genéricos

### Problema

Variáveis e funções com nomes sem significado.

### Exemplo ruim

```typescript
const data = getData();

function execute() {}
```

### Melhor

```typescript
const customer = getCustomer();

function createOrder() {}
```

### Regra

O nome deve revelar a intenção.

---

## Classes Gigantes (God Object)

### Problema

Uma única classe concentra muitas responsabilidades.

### Exemplo ruim

```typescript
class Application {
  createUser() {}
  sendEmail() {}
  generateReport() {}
  processPayment() {}
  exportFile() {}
  authenticate() {}
}
```

### Problemas causados

- Acoplamento excessivo.
- Baixa coesão.
- Dificuldade de testes.

### Refatoração

Dividir em componentes menores e especializados.

---

## Primitive Obsession

### Problema

Uso excessivo de tipos primitivos para representar conceitos do domínio.

### Exemplo ruim

```typescript
function createAccount(email: string, document: string) {}
```

### Refatoração

Utilizar Value Objects.

```typescript
class Email {
  constructor(readonly value: string) {
    this.validate();
  }
}

class Document {
  constructor(readonly value: string) {
    this.validate();
  }
}
```

---

## Shotgun Surgery

### Problema

Uma pequena mudança exige alterações em muitos arquivos.

### Sintoma

Ao alterar uma regra de negócio você precisa modificar:

- Controller
- Service
- Repository
- DTO
- Entity
- Testes

### Consequência

O sistema fica frágil e difícil de evoluir.

---

## Feature Envy

### Problema

Uma classe conhece mais detalhes de outra classe do que da própria.

### Exemplo ruim

```typescript
class OrderService {
  calculateDiscount(customer: Customer) {
    if (customer.points > 1000) {
      return 20;
    }

    return 0;
  }
}
```

### Melhor

```typescript
class Customer {
  calculateDiscount() {
    return this.points > 1000 ? 20 : 0;
  }
}
```

---

## Lista de Verificação

Ao revisar um código, procure por:

- [ ] Código duplicado
- [ ] Métodos longos
- [ ] Classes grandes
- [ ] Muitos parâmetros
- [ ] Comentários desnecessários
- [ ] Código morto
- [ ] Condições aninhadas
- [ ] Alto acoplamento
- [ ] Baixa coesão
- [ ] Nomes genéricos
- [ ] Primitive Obsession
- [ ] Shotgun Surgery
- [ ] Feature Envy

---

## Conclusão

Code Smells não são bugs.

Eles são sinais de que a estrutura do software pode estar se deteriorando.

Quanto mais cedo forem identificados e corrigidos, menor será o custo de manutenção e evolução da aplicação.

> "Qualquer tolo consegue escrever código que um computador entende. Bons programadores escrevem código que humanos entendem."
>
> _Martin Fowler_
