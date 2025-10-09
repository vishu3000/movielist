// /Users/vishu/movielist/src/context/UserAgentContext.js
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const UserAgentContext = createContext({
  device: "desktop",
  os: "unknown",
  browser: "unknown",
  isBot: false,
});

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function UserAgentProvider({ initial = null, children }) {
  const [ua, setUa] = useState(
    initial || {
      device: "desktop",
      os: "unknown",
      browser: "unknown",
      isBot: false,
    }
  );

  useEffect(() => {
    const device = readCookie("uaDevice") || ua.device;
    const os = readCookie("uaOS") || ua.os;
    const browser = readCookie("uaBrowser") || ua.browser;
    const isBot = (readCookie("uaIsBot") || String(ua.isBot)) === "true";
    setUa({ device, os, browser, isBot });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ua, [ua]);
  return <UserAgentContext.Provider value={value}>{children}</UserAgentContext.Provider>;
}

export function useUserAgent() {
  return useContext(UserAgentContext);
}