import { AdminCreateButton } from "@/components/admin-create-button";
import { AdminItemActions } from "@/components/admin-item-actions";
import { AdminPageHeading, Status } from "@/components/admin-ui";
import { getAdminData } from "@/lib/admin-data";

export default async function ContactsPage() {
  const { contacts: data } = await getAdminData();
  return (
    <main className="admin-main">
      <AdminPageHeading title="Contacts" description="Bookers, clubs, festivals, marques, presse et partenaires." action={<AdminCreateButton kind="contact" />} />
      <section className="admin-panel full">
        <div className="admin-table contacts">
          <div className="admin-table-head"><span>Contact</span><span>Société</span><span>Catégorie</span><span>Pays</span><span>Relation</span><span>Actions</span></div>
          {data.length ? data.map((contact) => (
            <div className="admin-table-row" key={contact.id}>
              <span><b>{contact.full_name}</b><small>{contact.email}</small></span><span>{contact.company}</span><span>{contact.category}</span><span>{contact.country}</span><span><Status tone={contact.relationship === "active" ? "good" : "neutral"}>{contact.relationship}</Status></span><AdminItemActions kind="contact" item={contact} />
            </div>
          )) : <p className="admin-empty">Votre carnet d’adresses professionnel apparaîtra ici.</p>}
        </div>
      </section>
    </main>
  );
}
