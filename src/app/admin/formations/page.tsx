import { AdminPageHeading } from "@/components/admin-ui";
import { AdminTrainingClient } from "@/components/admin-training-client";
import { getAdminData } from "@/lib/admin-data";

export default async function AdminTrainingPage() {
  const { inquiries } = await getAdminData();
  const trainingInquiries = inquiries.filter((item) =>
    ["suno-essential", "suno-expert", "training-progress"].includes(item.source || "") ||
    item.inquiry_type === "formation",
  );

  return (
    <>
      <AdminPageHeading
        title="Formations"
        description="Inscrits aux formations IA, niveau choisi, progression, scores et compositions finales en attente de validation."
      />
      <AdminTrainingClient inquiries={trainingInquiries} />
    </>
  );
}
