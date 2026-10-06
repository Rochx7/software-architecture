export type Study = {
  slug: string;
  title: string;
  summary: string;
  status: "ativo" | "rascunho";
  tags: string[];
  content: string; // markdown (por enquanto exibido como texto puro)
};

export const studies: Study[] = [
  {
    slug: "clean-architecture",
    title: "Clean Architecture",
    summary:
      "Camadas, regra de dependência e como separar domínio de infraestrutura.",
    status: "ativo",
    tags: ["arquitetura", "backend"],
    content: `# Clean Architecture

## Ideia central
As dependências apontam sempre para dentro: infraestrutura depende de aplicação,
que depende de domínio. O domínio não conhece banco, HTTP nem frameworks.

## Camadas
- Domain: entidades e regras de negócio
- Application: casos de uso
- Infrastructure: banco, APIs externas
- Presentation: controllers, UI`,
  },
  {
    slug: "react-fundamentos",
    title: "React: fundamentos de renderização",
    summary:
      "Como o React decide quando renderizar e o que o React Compiler muda.",
    status: "ativo",
    tags: ["frontend", "react"],
    content: `# Renderização no React

Um componente renderiza quando o estado, as props ou o contexto mudam.
Renderizar não é o mesmo que atualizar o DOM.`,
  },
  {
    slug: "csharp-dotnet-basico",
    title: "C# e .NET: primeiros passos",
    summary: "Estrutura de um projeto, DI nativa e minimal APIs.",
    status: "rascunho",
    tags: ["backend", "dotnet"],
    content: `# C# e .NET

Anotações em andamento.`,
  },
];

export function getStudy(slug: string) {
  return studies.find((study) => study.slug === slug);
}
