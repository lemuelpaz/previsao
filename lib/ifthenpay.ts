const BASE = "https://mbway.ifthenpay.com/IfthenPayMBW.asmx";

// "000" = sucesso (pedido aceite / pagamento concluído). Qualquer outro código
// é falha, cancelamento ou pendência — ver MsgDescricao para o detalhe.
const SUCCESS_CODE = "000";

export interface MbWayRequestResult {
  requestId: string;    // IdPedido — usar para consultar o estado depois
  ok: boolean;
  code: string;
  message: string;
}

export async function createMbWayPayment(params: {
  key: string;
  amount: number;
  reference: string;    // id interno do pagamento — máx. 25 caracteres
  phone: string;         // formato local, ex: "912345678"
  description?: string;
  email?: string;
}): Promise<MbWayRequestResult> {
  const body = new URLSearchParams({
    MbWayKey: params.key,
    Canal: "03",
    Referencia: params.reference.slice(0, 25),
    valor: params.amount.toFixed(2),
    nrtlm: `351#${params.phone.replace(/\D/g, "")}`,
    descricao: (params.description ?? "Deposito Metrix").slice(0, 50),
    ...(params.email ? { email: params.email } : {}),
  });

  const res = await fetch(`${BASE}/SetPedidoJSON`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const data = await res.json();

  return {
    requestId: data.IdPedido ?? "",
    ok: data.Estado === SUCCESS_CODE,
    code: data.Estado ?? "",
    message: data.MsgDescricao ?? "",
  };
}

export interface MbWayStatusResult {
  paid: boolean;
  code: string;
  message: string;
}

export async function checkMbWayStatus(params: { key: string; requestId: string }): Promise<MbWayStatusResult> {
  const body = new URLSearchParams({
    MbWayKey: params.key,
    Canal: "03",
    idspagamento: params.requestId,
  });

  const res = await fetch(`${BASE}/EstadoPedidosJSON`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const data = await res.json();
  const estado = data.Estado ?? data[0]?.Estado ?? "";
  const msg    = data.MsgDescricao ?? data[0]?.MsgDescricao ?? "";

  return { paid: estado === SUCCESS_CODE, code: estado, message: msg };
}

// A ifthenpay envia a notificação por GET com o resultado do pagamento.
// Os nomes de parâmetro variam por integração — aceitamos as variações
// documentadas (chave/apk, referencia/oid, idpedido/tid, valor/val, estado).
export function parseMbWayCallback(query: URLSearchParams) {
  return {
    antiPhishingKey: query.get("chave") ?? query.get("apk") ?? "",
    reference:       query.get("referencia") ?? query.get("oid") ?? "",
    requestId:       query.get("idpedido") ?? query.get("tid") ?? "",
    amount:          parseFloat(query.get("valor") ?? query.get("val") ?? "0"),
    status:          (query.get("estado") ?? "").toUpperCase(),
  };
}

export function isMbWayPaid(status: string): boolean {
  return status === "PAGO" || status === "000" || status === "SUCCESS";
}
