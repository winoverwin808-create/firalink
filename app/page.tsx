"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: cats } = await supabase.from("categories").select("*").order("type");
      const { data: members } = await supabase.from("team_members").select("*");
      if (cats) setCategories(cats);
      if (members) setTeam(members);
    }
    loadData();
  }, []);

  const grouped: Record<string, any[]> = { graphics: [], video: [], documents: [] };
  categories.forEach((c) => { if (grouped[c.type]) grouped[c.type].push(c); });

  const card = { background: "#fff", border: "1px solid #ECE8F5", borderRadius: 14, padding: "10px 14px", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 24px rgba(107,60,180,0.08)" };
  const sectionTitle = { fontFamily: "Space Grotesk, sans-serif", fontSize: 16.5, margin: "0 0 14px", fontWeight: 600 };
  const iconBtn = { width: 40, height: 40, borderRadius: 999, background: "#fff", border: "1px solid #ECE8F5", display: "flex", alignItems: "center", justifyContent: "center", color: "#6E6B7A" };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "#1A1523", background: "#F5F3F9", maxWidth: 430, margin: "0 auto", minHeight: "100vh", paddingBottom: 60 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 20px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>F</div>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 16.5 }}>Firalink Hub</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={iconBtn}>🔍</div>
          <div style={iconBtn}>🔔</div>
        </div>
      </div>

      <div style={{ padding: "16px 20px 4px" }}>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 23, margin: "0 0 3px", fontWeight: 600 }}>Good morning, team 👋</h1>
        <p style={{ margin: 0, color: "#6E6B7A", fontSize: 13.5 }}>{categories.length} categories loaded from Supabase</p>
      </div>

      <div style={{ margin: "18px 20px 0", borderRadius: 22, padding: 24, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", boxShadow: "0 14px 30px rgba(91,31,166,0.28)", display: "flex", gap: 16, position: "relative" }}>
        <div style={{ width: 52, height: 52, borderRadius: 15, flex: "0 0 auto", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22 }}>🎙️</div>
        <div>
          <span style={{ fontSize: 11, letterSpacing: "0.09em", fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Live AI Studio</span>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", color: "#fff", fontSize: 21, marginBottom: 8, fontWeight: 600 }}>Talk to Firalink AI</div>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.5, maxWidth: 230 }}>Speak naturally to search projects, request edits, or get feedback</p>
        </div>
        <div style={{ position: "absolute", top: 22, right: 20, width: 34, height: 34, borderRadius: 999, background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>→</div>
      </div>

      {["graphics", "video", "documents"].map((type) => (
       <div style={{ padding: "20px 20px 4px" }} key={type}>
          <h2 style={{ ...sectionTitle, textTransform: "capitalize" }}>{type}</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {grouped[type].map((cat) => (
              <div style={card} key={cat.id}>{cat.name}</div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ padding: "20px 20px 4px" }}>
        <h2 style={sectionTitle}>Team</h2>
        {team.map((m) => (
          <div key={m.id} style={{ background: "#fff", border: "1px solid #ECE8F5", borderRadius: 14, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", boxShadow: "0 10px 24px rgba(107,60,180,0.08)" }}>
            <strong style={{ fontSize: 13 }}>{m.name}</strong>
            <span style={{ color: "#6E6B7A", fontSize: 12 }}>{m.role}</span>
          </div>
        ))}
        {team.length === 0 && <p style={{ color: "#6E6B7A", fontSize: 13 }}>No team members yet — add some in Supabase.</p>}
      </div>

      <div style={{ margin: "28px 20px 10px", borderRadius: 22, padding: "26px 22px", textAlign: "center", background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", boxShadow: "0 14px 30px rgba(91,31,166,0.28)" }}>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 17, marginBottom: 14, color: "#fff" }}>Have an idea? Let's create it together.</div>
        <div style={{ display: "inline-block", background: "#fff", color: "#5B1FA6", fontWeight: 700, fontSize: 13, padding: "12px 24px", borderRadius: 13 }}>Start a Request</div>
      </div>

      <div style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 0, width: "100%", maxWidth: 430, background: "#fff", borderTop: "1px solid #ECE8F5", display: "flex", justifyContent: "space-around", padding: "12px 6px" }}>
        {["🏠 Home", "🎨 Graphics", "🎬 Video", "📄 Docs", "👥 Team"].map((label) => (
          <div key={label} style={{ fontSize: 10, fontWeight: 600, color: "#A6A3B0", textAlign: "center" }}>{label}</div>
        ))}
      </div>

    </div>
  );
}
