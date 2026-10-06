import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="page-header">
      {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </header>
  );
}

export function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="section">
      <h2 className="section-head">
        <span className="section-index">{index}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function StudyRow({
  slug,
  title,
  label,
}: {
  slug: string;
  title: string;
  label: string;
}) {
  return (
    <Link to="/studies/$slug" params={{ slug }} className="row">
      <span className="row-title">{title}</span>
      <span className="row-leader" aria-hidden="true" />
      <span className="row-label">{label}</span>
    </Link>
  );
}

export function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="meta">
      <strong>{label}:</strong>
      <span>{value}</span>
    </p>
  );
}
