import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { studies } from "../data/studies";
import "./styles.css";

const pad = (n: number) => String(n).padStart(2, "0");

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="sidebar-title">Páginas</p>
        <nav aria-label="Páginas">
          <ul className="nav">
            <li>
              <Link to="/" className="nav-link" activeOptions={{ exact: true }}>
                <span className="nav-num">00.</span>
                índice
              </Link>
            </li>
            {studies.map((study, i) => (
              <li key={study.slug}>
                <Link
                  to="/studies/$slug"
                  params={{ slug: study.slug }}
                  className="nav-link"
                >
                  <span className="nav-num">{pad(i + 1)}.</span>
                  {study.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="workspace">
        <div className="topbar">Study Hub</div>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
