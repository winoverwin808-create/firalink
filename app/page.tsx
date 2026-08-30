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
    <>
      <style jsx global>{
        body { margin:0; padding:0; background:#F5F3F9; }
        .app { font-family:'Inter',sans-serif; color:#1A1523; max-width:430px; margin:0 auto; min-height:100vh; padding-bottom:60px; }
        .topbar { display:flex; align-items:center; gap:9px; padding:22px 20px 8px; }
        .logo-mark { width:32px; height:32px; border-radius:10px; background:linear-gradient(135deg,#8B2FD9,#5B1FA6); display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:15px; color:#fff; }
        .logo-text { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:16.5px; }
        .greeting { padding:16px 20px 4px; }
        .greeting h1 { font-family:'Space Grotesk',sans-serif; font-size:23px; margin:0 0 3px; font-weight:600; }
        .greeting p { margin:0; color:#6E6B7A; font-size:13.5px; }
        .hero-card { margin:18px 20px 0; border-radius:22px; padding:24px 22px; background:linear-gradient(135deg,#8B2FD9,#5B1FA6); box-shadow:0 14px 30px rgba(91,31,166,0.28); }
        .hero-card .eyebrow { font-size:11px; letter-spacing:0.09em; font-weight:700; color:rgba(255,255,255,0.75); text-transform:uppercase; display:block; margin-bottom:6px; }
        .hero-card h2 { font-family:'Space Grotesk',sans-serif; color:#fff; font-size:21px; margin:0 0 8px; font-weight:600; }
        .hero-card p { margin:0; color:rgba(255,255,255,0.82); font-size:13px; line-height:1.5; }
        .section { padding:20px 20px 4px; }
        .section h2 { font-family:'Space Grotesk',sans-serif; font-size:16.5px; margin:0 0 14px; font-weight:600; }
        .chip-row { display:flex; gap:10px; flex-wrap:wrap; }
        .chip { background:#fff; border:1px solid #ECE8F5; border-radius:14px; padding:10px 14px; font-size:13px; font-weight:600; box-shadow:0 10px 24px rgba(107,60,180,0.08); }
        .team-row { background:#fff; border:1px solid #ECE8F5; border-radius:14px; padding:12px 16px; margin-bottom:8px; display:flex; justify-content:space-between; box-shadow:0 10px 24px rgba(107,60,180,0.08); }
        .team-row span { color:#6E6B7A; font-size:12px; }
        .empty { color:#6E6B7A; font-size:13px; }
      }</style>

      <div className="app">
        <div className="topbar">
          <div className="logo-mark">F</div>
          <div className="logo-text">Firalink Hub</div>
        </div>

        <div className="greeting">
          <h1>Good morning, team 👋</h1>
          <p>{categories.length} categories loaded from Supabase</p>
        </div>

        <div className="hero-card">
          <span className="eyebrow">Live AI Studio</span>
          <h2>Talk to Firalink AI</h2>
          <p>Speak naturally to search projects, request edits, or get feedback</p>
        </div>

        {["graphics", "video", "documents"].map((type) => (
          <div className="section" key={type}>
            <h2 style={{ textTransform: "capitalize" }}>{type}</h2>
            <div className="chip-row">
              {grouped[type].map((cat) => (
                <div className="chip" key={cat.id}>{cat.name}</div>
              ))}
            </div>
          </div>
        ))}
<div className="section">
          <h2>Team</h2>
          {team.map((m) => (
            <div className="team-row" key={m.id}>
              <strong>{m.name}</strong>
              <span>{m.role}</span>
            </div>
          ))}
          {team.length === 0 && <p className="empty">No team members yet — add some in Supabase.</p>}
        </div>
      </div>
    </>
  );
}