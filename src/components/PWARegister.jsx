"use client";
import { useEffect, useState } from "react";

export default function PWARegister() {
  const [installEvt, setInstallEvt] = useState(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch((err) => console.warn("[PWA] SW register failed", err));
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    const onPrompt = (e) => {
      e.preventDefault();
      setInstallEvt(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && !standalone && !sessionStorage.getItem("vcut_ios_install_dismissed")) {
      setShowHint(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice;
    setInstallEvt(null);
  };

  const dismissIOS = () => {
    sessionStorage.setItem("vcut_ios_install_dismissed", "1");
    setShowHint(false);
  };

  if (installEvt) {
    return (
      <button
        onClick={install}
        style={{
          position: "fixed", bottom: 16, right: 16, zIndex: 9999,
          padding: "10px 16px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg,#22d3ee,#ffd700)",
          color: "#000", fontWeight: 800, fontSize: 12, letterSpacing: 0.6,
          textTransform: "uppercase", cursor: "pointer",
          boxShadow: "0 10px 30px -10px rgba(34,211,238,0.5)",
        }}
      >
        Install V-CUT App
      </button>
    );
  }

  if (showHint) {
    return (
      <div
        style={{
          position: "fixed", bottom: 16, left: 16, right: 16, zIndex: 9999,
          padding: "10px 14px", borderRadius: 12,
          background: "rgba(15,15,20,0.95)", border: "1px solid rgba(255,215,0,0.3)",
          color: "#e5e5e5", fontSize: 12, display: "flex", gap: 10, alignItems: "center",
        }}
      >
        <span style={{ flex: 1 }}>
          Install V-CUT: tap <strong>Share</strong> ⎋ then <strong>Add to Home Screen</strong> ➕
        </span>
        <button
          onClick={dismissIOS}
          style={{ background: "transparent", border: "1px solid #555", color: "#bbb", padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11 }}
        >
          Dismiss
        </button>
      </div>
    );
  }

  return null;
}
