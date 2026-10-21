"use client";

import { useState } from "react";

type Product = "suno-essential" | "suno-expert";

type Props = {
  product: Product;
  lang?: "fr" | "en";
};

export function TrainingCheckoutButton({ product, lang = "fr" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await response.json();

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Paiement indisponible.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Paiement indisponible.");
      setLoading(false);
    }
  }

  return (
    <div className="training-checkout-action">
      <button type="button" onClick={handleCheckout} disabled={loading}>
        {loading
          ? lang === "en" ? "Opening payment..." : "Ouverture du paiement..."
          : lang === "en" ? "Start the training" : "Démarrer la formation"}
      </button>
      {error ? <small>{error}</small> : null}
    </div>
  );
}
