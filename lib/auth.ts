import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "previsao_secret");
const COOKIE = "previsao_token";

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);
  cookies().set(COOKIE, token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" });
}

export async function getSession(): Promise<{ userId: string } | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

export async function destroySession() {
  cookies().delete(COOKIE);
}
