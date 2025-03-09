import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COUNTRY_COOKIES_KEY,
} from "@/app/constants/game";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname === '/api/open/chatsse') {    
    response.headers.set('Content-Type', 'application/json')
    response.headers.set('Authorization', `Bearer ${process.env.GAME_API_BEARER_TOKEN}`)
    
    return response
  }

  const country = request.headers.get("req-country") || ("default" as string);
  response.cookies.set({
    name: COUNTRY_COOKIES_KEY,
    value: country,
    path: "/",
  });

  return response;
}
