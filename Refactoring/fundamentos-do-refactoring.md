# Fundamentos do Refactoring

> Alteração feita na estrutura interna do software para torná-lo mais fácil de ser entendido e menos custoso de ser modificado, sem alterar o seu comportamento observável.
>
> _Martin Fowler_

## Equilíbrio entre comportamento e estrutura

**Deve sempre existir um equilíbrio entre comportamento e estrutura.**

| Comportamento                                                                                              | Estrutura                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Tudo o que importa para o cliente, que viabiliza a operação e gera retorno sobre o investimento realizado. | O que de fato mantém o software de pé, funcionando e sendo mantido ao longo do tempo, sem prejudicar a operação do cliente. |

> ⚠️ Comportamento sem estrutura gera débito técnico. Estrutura em excesso gera _overengineering_.

> Refatore com um propósito. Fique atento às oportunidades e evite refatorar apenas por refatorar.

## Quando refatorar?

- Refatore ao adicionar novas funcionalidades.
- Refatore ao corrigir defeitos.
- Refatore quando precisar entender uma parte do código.

### Regra prática

Se você precisa alterar um código e percebe que ele está difícil de entender, testar ou modificar, provavelmente existe uma oportunidade de refatoração.

O objetivo não é deixar o código "mais bonito", mas sim facilitar sua evolução e reduzir o custo de manutenção ao longo do tempo.

### Benefícios da refatoração

- Melhora a legibilidade do código.
- Reduz a complexidade.
- Facilita a manutenção.
- Diminui o acoplamento.
- Aumenta a testabilidade.
- Torna a evolução do software mais segura.
- Ajuda a reduzir o débito técnico.

### O que a refatoração não deve fazer?

Uma refatoração **não deve alterar o comportamento observável do sistema**.

Após a refatoração:

- As regras de negócio devem continuar funcionando da mesma forma.
- Os testes existentes devem continuar passando.
- O usuário não deve perceber mudanças no comportamento da aplicação.

O foco da refatoração é melhorar a estrutura interna do software, mantendo o mesmo resultado externo.
