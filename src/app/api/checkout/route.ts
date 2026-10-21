import Stripe from "stripe";
import { NextResponse } from "next/server";
import { z } from "zod";
import { commerce } from "@/lib/commerce";
import { getDb } from "@/lib/db";

const schema = z.object({
  product: z.enum(["suno-essential", "suno-expert"]),
  email: z.string().email().optional().or(z.literal("")),
  name: z.string().max(120).optional().or(z.literal("")),
  details: z.record(z.string(), z.string()).optional(),
});

function siteUrl(request: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Paiement Stripe non configuré." }, { status: 503 });
  }
  const product = parsed.data.product === "suno-expert" ? commerce.sunoExpert : commerce.sunoEssential;
  const origin = siteUrl(request);
  const successPath = "/formation-ia/acces";
  const cancelPath = "/formation-ia";

  const db = await getDb();
  if (process.env.ADMIN_DB_SECRET && parsed.data.email) {
    await db.from("inquiries").insert({
      inquiry_type: "formation",
      contact_name: parsed.data.name || parsed.data.email,
      company: product.name,
      email: parsed.data.email,
      artist_slug: null,
      message: Object.entries(parsed.data.details || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n"),
      source: parsed.data.product,
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2026-06-24.dahlia" });
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: parsed.data.email || undefined,
    line_items: [
      {
        price_data: {
          currency: product.currency,
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description: parsed.data.product === "suno-expert"
              ? "Accès à la formation IA musicale Expert."
              : "Accès à la formation IA musicale Fondations.",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      product: parsed.data.product,
      name: parsed.data.name || "",
      email: parsed.data.email || "",
    },
    success_url: `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${cancelPath}?payment=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
