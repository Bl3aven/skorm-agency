import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!sessionId || !stripeKey) return NextResponse.json({ paid: false }, { status: 400 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2026-06-24.dahlia" });
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return NextResponse.json({
    paid: session.payment_status === "paid",
    product: session.metadata?.product || null,
    email: session.customer_details?.email || session.customer_email || null,
  });
}
