import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const rawPath = Array.isArray(resolvedParams?.path)
      ? resolvedParams.path.join("/")
      : resolvedParams?.path;
    const fallbackPath = request.nextUrl.pathname.replace(/^\/api\//, "");
    const path = rawPath || fallbackPath;
    const target = `${API_BASE}/api/${path}${request.nextUrl.search}`;

    const upstream = await fetch(target, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Proxy error",
      },
      { status: 502 }
    );
  }
}
