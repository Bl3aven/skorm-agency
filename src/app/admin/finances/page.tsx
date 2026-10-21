import { AdminCreateButton } from "@/components/admin-create-button";
import { AdminItemActions } from "@/components/admin-item-actions";
import { AdminPageHeading, AdminPanel, MetricCard, Status } from "@/components/admin-ui";
import { getAdminData } from "@/lib/admin-data";

export default async function FinancesPage() {
  const { financial_transactions: data, artists } = await getAdminData();
  const income = data.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = data.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  return (
    <main className="admin-main">
      <AdminPageHeading title="Finances" description="Cachets, commissions, factures, règlements et dépenses." action={<AdminCreateButton kind="finance" artists={artists} />} />
      <section className="metrics-grid three">
        <MetricCard label="Chiffre d’affaires" value={`${income.toLocaleString("fr-FR")} €`} hint="Opérations enregistrées" />
        <MetricCard label="Dépenses" value={`${expenses.toLocaleString("fr-FR")} €`} hint="Production et frais" />
        <MetricCard label="Solde" value={`${(income - expenses).toLocaleString("fr-FR")} €`} hint="Avant fiscalité" />
      </section>
      <section className="admin-grid">
        <AdminPanel title="Historique" wide>
          <div className="finance-list">{data.length ? data.map((transaction) => (
            <div key={transaction.id}>
              <span><b>{transaction.label}</b><small>{transaction.artist_name || "Agence"} · {transaction.transaction_date}</small></span>
              <Status>{transaction.status}</Status>
              <strong className={transaction.type}>{transaction.type === "income" ? "+" : "-"}{Number(transaction.amount).toLocaleString("fr-FR")} €</strong>
              <AdminItemActions kind="finance" item={transaction} />
            </div>
          )) : <p className="admin-empty">Les encaissements et dépenses apparaîtront ici.</p>}</div>
        </AdminPanel>
      </section>
    </main>
  );
}
