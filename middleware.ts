import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    /^\/assets\/[a-zA-Z0-9_-]+\.(svg|jpg|png|gif)$/i,
    "/favicon.ico",
    "/api/webhook/clerk",
  ],
  ignoredRoutes: ["/api/webhook/clerk", "/profile/null"],
});
export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
