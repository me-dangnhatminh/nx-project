import { NextRequest, NextResponse } from 'next/server';

export type Middleware = (req: NextRequest) => NextResponse | void | Promise<NextResponse | void>;

export function compose(middlewares: Middleware[]): Middleware {
  return async (req: NextRequest) => {
    for (const mw of middlewares) {
      const res = await mw(req);
      if (res) return res;
    }
    return NextResponse.next();
  };
}
