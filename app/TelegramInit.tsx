"use client";
import { useEffect } from "react";

export default function TelegramInit() {
  useEffect(function () {
    const tg = (window as any).Telegram ? (window as any).Telegram.WebApp : null;
    if (!tg) return;

    try {
      tg.ready();
      tg.expand();
      if (typeof tg.disableVerticalSwipes === "function") tg.disableVerticalSwipes();
      if (typeof tg.setHeaderColor === "function") tg.setHeaderColor("#8B2FD9");
      if (typeof tg.setBackgroundColor === "function") tg.setBackgroundColor("#F5F3F9");

      function applyHeight() {
        const h = tg.viewportStableHeight || tg.viewportHeight;
        document.documentElement.style.height = h ? h + "px" : "100vh";
      }
      applyHeight();
      if (typeof tg.onEvent === "function") {
        tg.onEvent("viewportChanged", applyHeight);
      }
    } catch (e) {
      // Telegram WebApp API not fully available in this context — safe to ignore
    }
  }, []);

  return null;
}
