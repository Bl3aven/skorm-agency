import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export default function JoinAgencyPage() {
  return (
    <main className="lumen-page">
      <Link href="/" className="lumen-back"><ArrowLeft size={14} /> Retour</Link>
      <section className="lumen-card-shell lumen-card-large">
        <ContactForm variant="artist" />
      </section>
    </main>
  );
}
