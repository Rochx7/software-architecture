import { createFileRoute } from "@tanstack/react-router";
import { MetaLine, PageHeader, Section } from "../../components/Ui";
import { getStudy, studies } from "../../data/studies";

export const Route = createFileRoute("/studies/$slug")({
  component: StudyPage,
});

function StudyPage() {
  const { slug } = Route.useParams();
  const study = getStudy(slug);

  if (!study) {
    return (
      <PageHeader
        title="Estudo não encontrado"
        subtitle={`Não existe nenhum estudo em /studies/${slug}. Volte ao índice e escolha outro.`}
      />
    );
  }

  const number = String(studies.indexOf(study) + 1).padStart(2, "0");

  return (
    <>
      <PageHeader
        eyebrow={study.tags.join(" / ")}
        title={study.title}
        subtitle={study.summary}
      />

      <Section index={`${number}.`} title={study.title}>
        <MetaLine label="Status" value={study.status} />
        <MetaLine label="Tags" value={study.tags.join(", ")} />
        <article className="prose">{study.content}</article>
      </Section>
    </>
  );
}
