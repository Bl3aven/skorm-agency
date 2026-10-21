import { AdminCreateButton } from "@/components/admin-create-button";
import { AdminTaskList } from "@/components/admin-task-list";
import { AdminPageHeading } from "@/components/admin-ui";
import { getAdminData } from "@/lib/admin-data";

export default async function TasksPage() {
  const { tasks: data, artists } = await getAdminData();

  return (
    <main className="admin-main">
      <AdminPageHeading
        title="Tâches"
        description="Le quotidien de l’agence, classé par artiste, priorité et échéance."
        action={<AdminCreateButton kind="task" artists={artists} />}
      />
      <AdminTaskList tasks={data} />
    </main>
  );
}
