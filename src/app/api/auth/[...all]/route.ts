import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const handler = toNextJsHandler(auth);

/** Wraps Better Auth so a crash returns a readable error instead of an empty 500 */
async function safe(req: Request, fn: (r: Request) => Promise<Response>) {
  try {
    return await fn(req);
  } catch (e) {
    console.error("[auth] handler crashed:", e);
    return Response.json(
      { message: "Auth server error", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export const GET = (req: Request) => safe(req, handler.GET);
export const POST = (req: Request) => safe(req, handler.POST);
