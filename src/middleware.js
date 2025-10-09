// /Users/vishu/movielist/middleware.js
import { NextResponse } from "next/server";

function parseUserAgent(ua) {
  const source = ua || "";

  const isBot = /(bot|crawler|spider|crawling)/i.test(source);

  const isTablet = /(ipad|tablet|(android(?!.*mobi)))/i.test(source);
  const isMobile =
    !isTablet &&
    /(mobi|iphone|ipod|android.*mobile|blackberry|phone|windows phone)/i.test(
      source
    );
  const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  // Very light browser and OS detection (kept simple on purpose)
  let browser = "unknown";
  if (/chrome|crios|crmo/i.test(source)) browser = "chrome";
  else if (/safari/i.test(source) && !/chrome|crios|crmo/i.test(source))
    browser = "safari";
  else if (/firefox|fxios/i.test(source)) browser = "firefox";
  else if (/edg/i.test(source)) browser = "edge";

  let os = "unknown";
  if (/windows nt/i.test(source)) os = "windows";
  else if (/android/i.test(source)) os = "android";
  else if (/iphone|ipad|ipod|ios/i.test(source)) os = "ios";
  else if (/mac os x/i.test(source)) os = "macos";
  else if (/linux/i.test(source)) os = "linux";

  return { device, os, browser, isBot };
}

// middleware.js
export function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  const { device, os, browser, isBot } = parseUserAgent(ua);

  const response = NextResponse.next();

  // Use forced device instead of detected device
  response.cookies.set("uaDevice", device, {
    path: "/",
    maxAge: 60 * 60,
  });
  response.cookies.set("uaOS", os, { path: "/", maxAge: 60 * 60 });
  response.cookies.set("uaBrowser", browser, { path: "/", maxAge: 60 * 60 });
  response.cookies.set("uaIsBot", String(isBot), {
    path: "/",
    maxAge: 60 * 60,
  });

  response.headers.set("x-ua-device", device);
  response.headers.set("x-ua-os", os);
  response.headers.set("x-ua-browser", browser);
  response.headers.set("x-ua-bot", String(isBot));

  return response;
}

// Skip static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml).*)"],
};
