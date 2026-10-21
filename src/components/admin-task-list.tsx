"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminItemActions } from "@/components/admin-item-actions";
import { Status } from "@/components/admin-ui";

type Task = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  due_at: string | null;
  artist_name: string | null;
};

function statusTone(task: Task) {
  if (task.status === "done") return "good";
  if (task.priority === "urgent") return "warn";
  return "neutral";
}

function statusLabel(status: string) {
  if (status === "done") return "fait";
  if (status === "doing") return "en cours";
  if (status === "cancelled") return "annulé";
  return "à faire";
}

export function AdminTaskList({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const rows = useMemo(
    () => tasks.map((task) => ({ ...task, status: localStatuses[task.id] || task.status || "todo" })),
    [tasks, localStatuses],
  );

  async function toggleTask(task: Task, checked: boolean) {
    const nextStatus = checked ? "done" : "todo";
    setBusyId(task.id);
    setLocalStatuses((current) => ({ ...current, [task.id]: nextStatus }));

    const response = await fetch("/api/admin/item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        kind: "task",
        id: task.id,
        payload: { status: nextStatus },
      }),
    });

    if (!response.ok) {
      setLocalStatuses((current) => ({ ...current, [task.id]: task.status || "todo" }));
      window.alert("La tâche n'a pas pu être enregistrée.");
    } else {
      router.refresh();
    }
    setBusyId(null);
  }

  if (!rows.length) {
    return <p className="admin-empty">Aucune tâche. Le calme avant la prochaine date.</p>;
  }

  return (
    <section className="task-page-list">
      {rows.map((task) => (
        <article key={task.id} className={task.status === "done" ? "task-done" : undefined}>
          <input
            type="checkbox"
            checked={task.status === "done"}
            disabled={busyId === task.id}
            aria-label={`Terminer ${task.title}`}
            onChange={(event) => toggleTask(task, event.currentTarget.checked)}
          />
          <span>
            <b>{task.title}</b>
            <small>
              {task.artist_name || "Agence"} · {task.category}
            </small>
          </span>
          <time>{task.due_at ? new Date(task.due_at).toLocaleDateString("fr-FR") : "Sans date"}</time>
          <Status tone={statusTone(task)}>{statusLabel(task.status)}</Status>
          <Status tone={task.priority === "urgent" ? "warn" : "neutral"}>{task.priority}</Status>
          <AdminItemActions kind="task" item={task} />
        </article>
      ))}
    </section>
  );
}
