import { TrainingAccess } from "@/components/training-access";

export default async function TrainingAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; test?: string }>;
}) {
  const params = await searchParams;
  return <TrainingAccess sessionId={params.session_id} testAccess={params.test === "skorm-preview-2026"} />;
}
