import { getDb } from "@/lib/db";

export type OrgEntry = {
  id: string;
  task: string;
  first_name: string;
  mission: string;
  status: string;
  commission_rate: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type DeathNoteEntry = {
  id: string;
  name: string;
  entry_type: string;
  reason: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type PrivateLists = {
  org_entries: OrgEntry[];
  death_note_entries: DeathNoteEntry[];
};

export async function getPrivateAdminLists(): Promise<PrivateLists> {
  const fallback: PrivateLists = { org_entries: [], death_note_entries: [] };
  if (!process.env.ADMIN_DB_SECRET) return fallback;
  const db = await getDb();

  const { data, error } = await db.rpc("admin_get_private_lists", {
    p_secret: process.env.ADMIN_DB_SECRET,
  });

  if (error || !data || typeof data !== "object") return fallback;
  const lists = data as Partial<PrivateLists>;
  return {
    org_entries: Array.isArray(lists.org_entries) ? lists.org_entries : [],
    death_note_entries: Array.isArray(lists.death_note_entries) ? lists.death_note_entries : [],
  };
}
