import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSession(request);
}

// Skip static assets and Next internals; run on every real page + API route.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};
