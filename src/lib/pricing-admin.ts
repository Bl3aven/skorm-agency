import { getDb } from "@/lib/db";

export type PricingEntry = {
  id: string;
  seed_key: string | null;
  category: string;
  prestation: string;
  detail: string;
  target: string;
  price: string;
  billing_type: string;
  notes: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function getPricingEntries(): Promise<PricingEntry[]> {
  if (!process.env.ADMIN_DB_SECRET) return [];
  const db = await getDb();

  const { data, error } = await db.rpc("admin_get_service_pricing_entries", {
    p_secret: process.env.ADMIN_DB_SECRET,
  });

  if (error || !Array.isArray(data)) return [];
  return data as PricingEntry[];
}
