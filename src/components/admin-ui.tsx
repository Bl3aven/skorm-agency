export function AdminPageHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="admin-page-heading">
      <div><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>;
}

export function AdminPanel({ title, children, wide = false }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return <section className={`admin-panel ${wide ? "wide" : ""}`}><header><h2>{title}</h2></header>{children}</section>;
}

export function Status({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" }) {
  return <span className={`admin-status ${tone}`}>{children}</span>;
}
import type React from "react";
