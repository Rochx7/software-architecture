import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, StudyRow } from "../components/Ui";
import { studies } from "../data/studies";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <PageHeader
        title="Study Hub"
        subtitle="Arquitetura de software, frontend, backend e o que mais eu estiver estudando."
      />

      <Section index="00." title="Estudos">
        {studies.map((study) => (
          <StudyRow
            key={study.slug}
            slug={study.slug}
            title={study.title}
            label={study.tags[0]}
          />
        ))}
      </Section>
    </>
  );
}
