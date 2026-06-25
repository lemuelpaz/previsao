import crypto from "crypto";

const BASE = "https://api.veopag.com";

// In-memory token cache (per process / serverless warm instance)
let _token = "";
let _tokenExp = 0;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExp) return _token;

  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.VEOPAG_CLIENT_ID,
      client_secret: process.env.VEOPAG_CLIENT_SECRET,
    }),
    cache: "no-store",
  });

  const data = await res.json();
  if (!data.token) throw new Error("VeoPag auth failed: " + JSON.stringify(data));

  _token = data.token as string;
  _tokenExp = Date.now() + 23 * 60 * 60 * 1000; // 23h
  return _token;
}

async function veoFetch(path: string, body: object) {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

export interface DepositResult {
  transactionId: string;
  status: string;
  qrcode: string;  // PIX BR Code (copy-paste string)
  amount: number;
  fee: number;
}

export async function createPixDeposit(params: {
  amount: number;
  externalId: string;
  payer: { name: string; email: string; document: string; phone?: string };
}): Promise<DepositResult> {
  const data = await veoFetch("/api/payments/deposit", {
    amount: params.amount,
    external_id: params.externalId,
    payer: params.payer,
  });
  // API returns { message, qrCodeResponse: { transactionId, status, qrcode, amount, fee } }
  const qr = data.qrCodeResponse ?? data;
  return {
    transactionId: qr.transactionId ?? qr.transaction_id ?? "",
    status: qr.status ?? "PENDING",
    qrcode: qr.qrcode ?? qr.paymentCode ?? "",
    amount: qr.amount ?? params.amount,
    fee: qr.fee ?? 0,
  };
}

export interface WithdrawResult {
  transactionId: string;
  status: string;
  amount: number;
}

// Map from UI key types to VeoPag expected values
const KEY_TYPE_MAP: Record<string, string> = {
  cpf: "CPF", cnpj: "CNPJ", email: "EMAIL", phone: "PHONE", random: "EVP",
  CPF: "CPF", CNPJ: "CNPJ", EMAIL: "EMAIL", PHONE: "PHONE", EVP: "EVP",
};

export async function createPixWithdraw(params: {
  amount: number;
  externalId: string;
  pixKey: string;
  pixKeyType: string;
  description?: string;
}): Promise<WithdrawResult> {
  const keyType = KEY_TYPE_MAP[params.pixKeyType] ?? params.pixKeyType.toUpperCase();
  const data = await veoFetch("/api/withdrawals/withdraw", {
    amount: params.amount,
    external_id: params.externalId,
    pix_key: params.pixKey,
    key_type: keyType,
    description: params.description ?? "Saque Metrix",
  });
  return {
    transactionId: data.transaction_id ?? data.transactionId ?? "",
    status: data.status ?? "PENDING",
    amount: data.amount ?? params.amount,
  };
}

// HMAC-SHA256 webhook verification
// VeoPag signs: HMAC-SHA256(`${timestamp}.${rawBody}`, webhookSecret)
export function verifyWebhookSignature(rawBody: string, timestamp: string, signature: string): boolean {
  const secret = process.env.VEOPAG_WEBHOOK_SECRET;
  if (!secret) return true; // skip if not configured
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
