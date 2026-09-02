"use client";
import { useRouter } from "next/navigation";

export default function About() {
  const router = useRouter();

  const section = { padding: "20px 20px 4px" };
  const heading = { fontFamily: "Space Grotesk, sans-serif", fontSize: 16.5, margin: "0 0 12px", fontWeight: 600 };
  const card = { background: "#fff", border: "1px solid #ECE8F5", borderRadius: 20, padding: 20, boxShadow: "0 10px 24px rgba(107,60,180,0.08)" };
  const body = { margin: "0 0 10px", fontSize: 13, lineHeight: 1.6, color: "#3C3750" };
  const stepRow = { display: "flex", gap: 12, marginBottom: 16 };
  const stepNum = { width: 26, height: 26, borderRadius: 999, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" };

  let fadeIndex = 0;
  function fade(): React.CSSProperties {
    const style = { animationDelay: (fadeIndex * 0.07) + "s" };
    fadeIndex += 1;
    return style;
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "#1A1523", background: "#F5F3F9", maxWidth: 430, margin: "0 auto", minHeight: "100vh", paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "22px 20px 6px" }}>
        <div className="fh-hover-scale" style={{ width: 36, height: 36, borderRadius: 999, background: "#fff", border: "1px solid #ECE8F5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={function () { router.push("/"); }}>←</div>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 18 }}>About Firalink Hub</div>
      </div>

      <div className="fh-section" style={{ ...fade(), margin: "18px 20px 0", borderRadius: 22, padding: 24, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", boxShadow: "0 14px 30px rgba(91,31,166,0.28)" }}>
        <span style={{ fontSize: 11, letterSpacing: "0.09em", fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>Platform Guide</span>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", color: "#fff", fontSize: 21, marginBottom: 8, fontWeight: 600 }}>One hub for everything the team creates</div>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.55 }}>Firalink Hub is a Telegram Mini App where the team posts, browses, and manages creative work in one place.</p>
      </div>

      <div className="fh-section" style={{ ...fade(), ...section }}>
        <h2 style={heading}>Purpose</h2>
        <div style={card}>
          <p style={body}>Firalink Hub exists to keep the team&apos;s creative output — graphics, video, and documents — organized, discoverable, and easy to hand off, instead of scattered across chats and folders.</p>
          <p style={{ ...body, margin: 0 }}>It runs as a Telegram Mini App so anyone on the team can open it directly from a chat, with no separate login or install.</p>
        </div>
      </div>

      <div className="fh-section" style={{ ...fade(), ...section }}>
        <h2 style={heading}>Services</h2>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { icon: "🎨", label: "Graphics", desc: "Brand kits, social posts, print" },
            { icon: "🎬", label: "Video", desc: "Edits, reels, motion pieces" },
            { icon: "📄", label: "Documents", desc: "Proposals, reports, decks" },
          ].map(function (s) {
            return (
              <div key={s.label} className="fh-hover-lift" style={{ flex: 1, background: "#fff", border: "1px solid #ECE8F5", borderRadius: 16, padding: "16px 10px", textAlign: "center" as const, boxShadow: "0 10px 24px rgba(107,60,180,0.08)" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 10.5, color: "#6E6B7A", lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fh-section" style={{ ...fade(), ...section }}>
        <h2 style={heading}>How it works</h2>
        <div style={card}>
          <div style={stepRow}>
            <div style={stepNum}>1</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Browse a category</div>
              <div style={{ fontSize: 12, color: "#6E6B7A", lineHeight: 1.5 }}>Open Graphics, Video, or Documents on the home screen to see its subcategories.</div>
            </div>
          </div>
          <div style={stepRow}>
            <div style={stepNum}>2</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Find or post work</div>
              <div style={{ fontSize: 12, color: "#6E6B7A", lineHeight: 1.5 }}>Tap a subcategory to see what&apos;s already there, or use Upload to add new work.</div>
            </div>
          </div>
          <div style={stepRow}>
            <div style={stepNum}>3</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>React &amp; recommend</div>
              <div style={{ fontSize: 12, color: "#6E6B7A", lineHeight: 1.5 }}>Like and recommend the work you find useful so it surfaces for the rest of the team.</div>
            </div>
          </div>
          <div style={{ ...stepRow, marginBottom: 0 }}>
            <div style={stepNum}>4</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Suggest what&apos;s next</div>
              <div style={{ fontSize: 12, color: "#6E6B7A", lineHeight: 1.5 }}>Use &quot;Have an idea? Let&apos;s create it together.&quot; to send a request straight to the team.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="fh-section" style={{ ...fade(), padding: "24px 20px 0" }}>
        <div
          className="fh-hover-scale"
          style={{ width: "100%", background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 0", borderRadius: 12, textAlign: "center" as const, cursor: "pointer", boxSizing: "border-box" as const }}
          onClick={function () { router.push("/"); }}
        >
          Back to Firalink Hub
        </div>
      </div>
    </div>
  );
}
