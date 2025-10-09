// /Users/vishu/movielist/src/lib/userAgent-ssr.js
export function userAgentFromCookies(req) {
    const cookies = req?.cookies || {};
    return {
      device: cookies.uaDevice || "desktop",
      os: cookies.uaOS || "unknown",
      browser: cookies.uaBrowser || "unknown",
      isBot: cookies.uaIsBot === "true",
    };
  }