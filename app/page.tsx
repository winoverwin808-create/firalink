"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: cats } = await supabase.from("categories").select("*");
      const { data: members } = await supabase.from("team_members").select("*");
      if (cats) setCategories(cats);
      if (members) setTeam(members);
    }
    loadData();
  }, []);

  const grouped: Record<string, any[]> = { graphics: [], video: [], documents: [] };
  categories.forEach((c) => {
    if (grouped[c.type]) grouped[c.type].push(c);
  });

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "#1A1523", background: "#F5F3F9", maxWidth: 430, margin: "0 auto", minHeight: "100vh", paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "22px 20px 8px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>F</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16.5 }}>Firalink Hub</div>
      </div>

      <div style={{ padding: "16px 20px 4px" }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 23, margin: "0 0 3px", fontWeight: 600 }}>Good morning, team 👋</h1>
        <p style={{ margin: 0, color: "#6E6B7A", fontSize: 13.5 }}>{categories.length} categories loaded from Supabase</p>
      </div>

      <div style={{ margin: "18px 20px 0", borderRadius: 22, padding: 22, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", boxShadow: "0 14px 30px rgba(91,31,166,0.28)" }}>
        <span style={{ fontSize: 11, letterSpacing: "0.09em", fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Live AI Studio</span>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#fff", fontSize: 21, margin: "0 0 8px", fontWeight: 600 }}>Talk to Firalink AI</h2>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.5 }}>Speak naturally to search projects, request edits, or get feedback</p>
      </div>

      {["graphics", "video", "documents"].map((type) => (
        <div style={{ padding: "20px 20px 4px" }} key={type}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16.5, margin: "0 0 14px", fontWeight: 600, textTransform: "capitalize" }}>{type}</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {grouped[type].map((cat) => (
              <div style={{ background: "#fff", border: "1px solid #ECE8F5", borderRadius: 14, padding: "10px 14px", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 24px rgba(107,60,180,0.08)" }} key={cat.id}>
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ padding: "20px 20px 4px" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16.5, margin: "0 0 14px", fontWeight: 600 }}>Team</h2>
        {team.map((m) => (
          <div style={{ background: "#fff", border: "1px solid #ECE8F5", borderRadius: 14, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", boxShadow: "0 10px 24px rgba(107,60,180,0.08)" }} key={m.id}>
            <strong>{m.name}</strong>
            <span style={{ color: "#6E6B7A", fontSize: 12 }}>{m.role}</span>
          </div>
        ))}
        {team.length === 0 && <p style={{ color: "#6E6B7A", fontSize: 13 }}>No team members yet — add some in Supabase.</p>}
      </div>
    </div>
  );
}