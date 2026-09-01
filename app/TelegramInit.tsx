"use client";
import { useEffect } from "react";

export default function TelegramInit() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();

    document.documentElement.style.height = tg.viewportStableHeight
      ? tg.viewportStableHeight + "px"
      : "100vh";

    tg.onEvent("viewportChanged", function () {
      document.documentElement.style.height = tg.viewportStableHeight + "px";
    });
  }, []);

  return null;
}