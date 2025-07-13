import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  console.log(`==> ${request.method} ${JSON.stringify(request.nextUrl)}`);
  return response;
}
