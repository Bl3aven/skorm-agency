import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export default function EnglishContactPage() {
  return (
    <main className="lumen-page">
      <Link href="/en" className="lumen-back"><ArrowLeft size={14} /> Back</Link>
      <section className="lumen-card-shell">
        <ContactForm variant="contact" lang="en" />
      </section>
    </main>
  );
}
