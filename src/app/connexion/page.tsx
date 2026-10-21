"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError("Identifiants incorrects.");
      setLoading(false);
      return;
    }

    router.push(data?.redirect || "/admin");
    router.refresh();
  }

  return (
    <main className="admin-login">
      <form onSubmit={login}>
        <div className="admin-login-logo">SKORM<span>ESPACE PRIVÉ</span></div>
        <h1>Connexion</h1>
        <p>Connexion sécurisée pour l’administration SKORM et les espaces artistes.</p>
        <label>E-mail ou identifiant artiste<input name="email" type="text" autoComplete="username" required placeholder="admin@... ou paga" /></label>
        <label>Mot de passe<input name="password" type="password" autoComplete="current-password" required /></label>
        <button disabled={loading}>{loading ? "Connexion..." : "Accéder à l’espace"}</button>
        {error && <small>{error}</small>}
      </form>
    </main>
  );
}
