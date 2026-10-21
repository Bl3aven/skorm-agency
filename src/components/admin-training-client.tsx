"use client";

import { useMemo, useState } from "react";
import { Eye, X } from "lucide-react";
import { Status } from "@/components/admin-ui";

type Inquiry = {
  id: string;
  contact_name: string;
  company: string | null;
  email: string;
  inquiry_type: string;
  message: string;
  status: string;
  created_at: string;
  source?: string | null;
};

type TrainingStudent = {
  email: string;
  name: string;
  course: "beginner" | "expert";
  progress: number;
  status: string;
  source: string;
  updatedAt: string;
  details: Record<string, string>;
};

function parseMessage(message: string) {
  return Object.fromEntries(
    message.split("\n").map((line) => {
      const index = line.indexOf(":");
      if (index < 0) return ["note", line.trim()];
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }).filter(([, value]) => value),
  ) as Record<string, string>;
}

function courseLabel(course: "beginner" | "expert") {
  return course === "expert" ? "Expert" : "Débutant";
}

function statusTone(status: string) {
  if (status === "validated") return "good";
  if (status === "composition_pending") return "warn";
  return "neutral";
}

export function AdminTrainingClient({ inquiries }: { inquiries: Inquiry[] }) {
  const [selected, setSelected] = useState<TrainingStudent | null>(null);

  const students = useMemo(() => {
    const map = new Map<string, TrainingStudent>();
    const sorted = [...inquiries].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    for (const item of sorted) {
      const details = parseMessage(item.message || "");
      const course = item.source === "suno-expert" || details.course === "expert" || details.training_level === "expert" ? "expert" : "beginner";
      const progress = Number(details.progress || (item.source === "suno-essential" || item.source === "suno-expert" ? 0 : 0));
      const status = details.status || item.status || "paid";
      map.set(`${item.email}-${course}`, {
        email: item.email,
        name: item.contact_name || item.email,
        course,
        progress: Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0)),
        status,
        source: item.source || "",
        updatedAt: item.created_at,
        details,
      });
    }
    return Array.from(map.values()).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [inquiries]);

  return (
    <>
      <div className="metrics-grid three contest-admin-metrics">
        <div><span>Inscrits</span><strong>{students.length}</strong><small>Formations IA</small></div>
        <div><span>Expert</span><strong>{students.filter((item) => item.course === "expert").length}</strong><small>Niveau avancé</small></div>
        <div><span>Validés</span><strong>{students.filter((item) => item.status === "validated").length}</strong><small>Certification terminée</small></div>
      </div>

      <section className="admin-panel full">
        <div className="admin-table training-admin-table">
          <div className="admin-table-head">
            <span>Élève</span><span>Formation</span><span>Progression</span><span>Statut</span><span>Dernière activité</span><span>Actions</span>
          </div>
          {students.map((student) => (
            <div className="admin-table-row" key={`${student.email}-${student.course}`}>
              <span><b>{student.name}</b><small>{student.email}</small></span>
              <span><Status tone={student.course === "expert" ? "warn" : "neutral"}>{courseLabel(student.course)}</Status></span>
              <span>
                <div className="admin-progress-mini"><i style={{ width: `${student.progress}%` }} /></div>
                <small>{student.progress}%</small>
              </span>
              <span><Status tone={statusTone(student.status)}>{student.status === "composition_pending" ? "Composition à valider" : student.status === "validated" ? "Validé" : "En cours"}</Status></span>
              <span>{new Date(student.updatedAt).toLocaleString("fr-FR")}</span>
              <span className="admin-row-actions"><button type="button" onClick={() => setSelected(student)}><Eye size={14} /> Voir</button></span>
            </div>
          ))}
          {!students.length && <p className="admin-empty">Aucun inscrit formation pour le moment.</p>}
        </div>
      </section>

      {selected && (
        <div className="admin-modal-backdrop">
          <section className="admin-create-modal inquiry-detail-modal contest-entry-modal">
            <header>
              <div>
                <small>{courseLabel(selected.course)} · {selected.progress}%</small>
                <h2>{selected.name}</h2>
                <p>{selected.email}</p>
              </div>
              <button type="button" aria-label="Fermer" onClick={() => setSelected(null)}><X size={16} /></button>
            </header>
            <div className="inquiry-readable-details contest-entry-grid">
              {Object.entries(selected.details).map(([key, value]) => (
                <article className={key === "method" ? "wide" : ""} key={key}>
                  <span>{key.replaceAll("_", " ")}</span>
                  {/https?:\/\//i.test(value) ? <a href={value} target="_blank" rel="noreferrer">{value}</a> : <p>{value}</p>}
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
