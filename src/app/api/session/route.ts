import { verifySignature } from "thirdweb/auth";
import { buildReadMessage, isReadFresh, type SignedRead } from "@/modules/payments/read-auth";
import { getThirdwebServerClient } from "@/lib/thirdweb-server";
import { issueSession } from "@/lib/session";

/**
 * Login de sesión: el usuario firma un mensaje con su wallet; el server VERIFICA
 * la firma (prueba que controla la wallet) y emite un JWT de sesión en cookie
 * httpOnly. A partir de ahí, las rutas derivan la identidad de la cookie, no del
 * body — cierra el IDOR. Sigue la regla: nunca confiar en input del cliente.
 */
export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as Partial<SignedRead>;
  if (!body.wallet || !body.signature || !body.issuedAtMs) {
    return Response.json({ error: "invalid request" }, { status: 400 });
  }
  const wallet = body.wallet.toLowerCase() as `0x${string}`;

  if (!isReadFresh(body.issuedAtMs, Date.parse(new Date().toISOString()))) {
    return Response.json({ error: "signature expired" }, { status: 401 });
  }
  const valid = await verifySignature({
    client: getThirdwebServerClient(),
    address: wallet,
    message: buildReadMessage(wallet, body.issuedAtMs),
    signature: body.signature,
  });
  if (!valid) {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  const token = await issueSession(wallet);
  return new Response(JSON.stringify({ status: "ok", wallet }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `remi_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`,
    },
  });
}
