"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    async function loadData() {
      const { data: cats } = await supabase.from("categories").select("*");
      const { data: members } = await supabase.from("team_members").select("*");
      if (cats) setCategories(cats);
      if (members) setTeam(members);
    }
    loadData();
  }, []);

  const grouped = { graphics: [], video: [], documents: [] };
  categories.forEach((c) => {
    if (grouped[c.type]) grouped[c.type].push(c);
  });

  return (
    <main style={{ background: "#F5F3F9", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: "60px" }}>
      <div style={{ padding: "24px 20px 8px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>F</div>
        <div style={{ fontWeight: 700, fontSize: 17 }}>Firalink Hub</div>
      </div>

      <div style={{ padding: "8px 20px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "8px 0 4px" }}>Good morning, team 👋</h1>
        <p style={{ color: "#6E6B7A", fontSize: 13.5 }}>{categories.length} categories loaded from Supabase</p>
      </div>

      <div style={{ margin: "16px 20px", borderRadius: 22, padding: "22px", background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", color: "#fff" }}>
        <div style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Live AI Studio</div>
        <div style={{ fontSize: 21, fontWeight: 600, marginBottom: 8 }}>Talk to Firalink AI</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>Speak naturally to search projects, request edits, or get feedback</div>
      </div>

      {["graphics", "video", "documents"].map((type) => (
        <div key={type} style={{ padding: "16px 20px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, textTransform: "capitalize" }}>{type}</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {grouped[type].map((cat) => (
              <div key={cat.id} style={{ background: "#fff", border: "1px solid #ECE8F5", borderRadius: 14, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ padding: "16px 20px" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Team</h2>
        {team.map((m) => (
          <div key={m.id} style={{ background: "#fff", border: "1px solid #ECE8F5", borderRadius: 14, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <strong>{m.name}</strong>
            <span style={{ color: "#6E6B7A", fontSize: 12 }}>{m.role}</span>
          </div>
        ))}
        {team.length === 0 && <p style={{ color: "#6E6B7A", fontSize: 13 }}>No team members yet — add some in Supabase.</p>}
      </div>
    </main>
  );
}