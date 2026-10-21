import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export default function EnglishSponsorPage() {
  return (
    <main className="lumen-page">
      <Link href="/en" className="lumen-back"><ArrowLeft size={14} /> Back</Link>
      <section className="lumen-card-shell lumen-card-large">
        <ContactForm variant="sponsor" lang="en" />
      </section>
    </main>
  );
}
