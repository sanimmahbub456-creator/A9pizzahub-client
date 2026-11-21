import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/upload  (multipart: image)
 * Proxies to ImgBB so IMGBB_API_KEY never reaches the browser.
 * Signed-in users may upload up to 5 MB; anonymous uploads (optional avatar on sign-up) up to 2 MB.
 */
export async function POST(req: Request) {
  const key = process.env.IMGBB_API_KEY;
  if (!key) return NextResponse.json({ message: "Image upload is not configured" }, { status: 500 });

  const session = await auth.api.getSession({ headers: await headers() });
  const maxSize = (session ? 5 : 2) * 1024 * 1024;

  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) return NextResponse.json({ message: "No image provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 });
  if (file.size > maxSize) return NextResponse.json({ message: `Image must be smaller than ${maxSize / 1024 / 1024} MB` }, { status: 413 });

  const body = new FormData();
  body.append("image", Buffer.from(await file.arrayBuffer()).toString("base64"));

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: "POST", body });
    const json = await res.json();
    if (!res.ok || !json?.data?.display_url) {
      return NextResponse.json({ message: json?.error?.message ?? "Image upload failed" }, { status: 502 });
    }
    return NextResponse.json({ url: json.data.display_url as string });
  } catch {
    return NextResponse.json({ message: "Image host is unreachable. Try again." }, { status: 502 });
  }
}
