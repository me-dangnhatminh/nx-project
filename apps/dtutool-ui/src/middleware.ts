import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse | undefined> {
  const { pathname, search } = request.nextUrl;

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto =
    request.headers.get('x-forwarded-proto') || request.headers.get('x-forwarded-proto');
  const xURL = new URL(`${proto}://${host}${pathname}${search}`).toString();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', xURL);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/:path*'],
};
