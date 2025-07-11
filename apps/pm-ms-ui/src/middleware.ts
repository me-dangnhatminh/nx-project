import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authServices } from './lib/services/auth';

const protectedRoutes = ['/dashboard', '/projects', '/calendar', '/reports', '/settings'];
const authRoutes = ['/signin', '/signup'];

const authenticated = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  const isAuthRoute = authRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname.startsWith(`${route}/`) || pathname === route,
  );

  const removeAuthCookie = (response: NextResponse) => {
    response.cookies.set({
      name: 'auth-token',
      value: '',
      maxAge: 0,
      path: '/',
    });
  };

  const redirectToSignin = () => {
    const url = new URL('/signin', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  };

  const redirectToDashboard = () => NextResponse.redirect(new URL('/dashboard', request.url));

  if (!token) {
    if (isAuthRoute) return NextResponse.next();
    if (isProtectedRoute) return redirectToSignin();
    return NextResponse.next();
  }

  try {
    const verified = await authServices.verifyToken(token);
    if (!verified) {
      const res = redirectToSignin();
      removeAuthCookie(res);
      return res;
    }

    // const user = await userServices.findUser('email', verified.email); // TODO: fix
    // if (!user) {
    //   const res = redirectToSignin();
    //   removeAuthCookie(res);
    //   return res;
    // }

    if (isAuthRoute) return redirectToDashboard();

    const response = NextResponse.next();
    response.cookies.set({ name: 'x-user-id', value: verified.userId, path: '/' });
    return response;
  } catch (err) {
    console.error('Auth middleware error:', err);
    const res = redirectToSignin();
    removeAuthCookie(res);
    return res;
  }
};

export async function middleware(request: NextRequest) {
  return authenticated(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
