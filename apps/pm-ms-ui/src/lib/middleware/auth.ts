import { NextResponse } from 'next/server';
import { Middleware } from './_core';

import { userServices } from '../services/user';
import { authServices } from '../services/auth';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/projects', '/calendar', '/reports', '/settings'];

// Routes that should redirect to dashboard if user is already authenticated
const authRoutes = ['/signin', '/signup'];

export const auth: Middleware = async (request) => {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;
  const payload = token ? await authServices.verifyToken(token) : null;

  // Check if user is authenticated
  const isAuthenticated = !!token && !!payload;

  // Redirect authenticated users away from auth pages
  if (authRoutes.includes(pathname) && isAuthenticated) {
    const user = await userServices.getUserById(payload?.userId);
    // clear cook
    if (!user) {
      const response = NextResponse.redirect(new URL('/signin', request.url));
      response.cookies.delete('auth-token');
      return response;
    }

    // add id to request.cookies
    const response = NextResponse.next();
    response.cookies.set('x-user-id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    // return NextResponse.redirect(new URL('/dashboard', request.url));
    return response;
  }

  // Redirect unauthenticated users to signin page
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
};
