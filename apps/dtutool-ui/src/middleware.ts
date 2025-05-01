import { NextRequest, NextResponse } from "next/server";

export async function middleware(
  request: NextRequest
): Promise<NextResponse | undefined> {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-url", request.url);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  return response;
}

export const config = {
  matcher: ["/:path*"],
};
