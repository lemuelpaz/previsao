const SANDBOX = "https://api-m.sandbox.paypal.com";
const LIVE    = "https://api-m.paypal.com";

function base(mode: string) {
  return mode === "live" ? LIVE : SANDBOX;
}

async function getToken(clientId: string, secret: string, mode: string): Promise<string> {
  const res = await fetch(`${base(mode)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${clientId}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("PayPal auth failed: " + JSON.stringify(data));
  return data.access_token as string;
}

export async function createOrder(clientId: string, secret: string, mode: string, amountUSD: number, userId: string) {
  const token = await getToken(clientId, secret, mode);
  const res = await fetch(`${base(mode)}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        amount: { currency_code: "USD", value: amountUSD.toFixed(2) },
        custom_id: userId,
        description: "Metrix — Depósito de saldo",
      }],
    }),
    cache: "no-store",
  });
  return res.json() as Promise<{ id: string; status: string; links: { rel: string; href: string }[] }>;
}

export async function captureOrder(clientId: string, secret: string, mode: string, orderId: string) {
  const token = await getToken(clientId, secret, mode);
  const res = await fetch(`${base(mode)}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  return res.json() as Promise<{ id: string; status: string; purchase_units: { payments: { captures: { id: string; amount: { value: string } }[] } }[] }>;
}
