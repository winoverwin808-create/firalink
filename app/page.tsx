"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [ideaName, setIdeaName] = useState("");
  const [ideaMessage, setIdeaMessage] = useState("");
  const [ideaStatus, setIdeaStatus] = useState("");
  const [seenCount, setSeenCount] = useState(0);

  async function loadAll() {
    const catsResult = await supabase.from("categories").select("*").order("type");
    const membersResult = await supabase.from("team_members").select("*");
    const ideasResult = await supabase.from("ideas").select("*").order("created_at", { ascending: false });
    if (catsResult.data) setCategories(catsResult.data);
    if (membersResult.data) setTeam(membersResult.data);
    if (ideasResult.data) setIdeas(ideasResult.data);
  }

  useEffect(function () {
    loadAll();
    const stored = window.localStorage.getItem("seenIdeaCount");
    setSeenCount(stored ? parseInt(stored) : 0);
  }, []);

  const grouped: Record<string, any[]> = { graphics: [], video: [], documents: [] };
  categories.forEach(function (c) {
    if (grouped[c.type]) grouped[c.type].push(c);
  });

  const unreadCount = ideas.length - seenCount > 0 ? ideas.length - seenCount : 0;

  function openNotif() {
    setShowNotif(true);
    setShowForm(false);
    window.localStorage.setItem("seenIdeaCount", String(ideas.length));
    setSeenCount(ideas.length);
  }

  async function submitIdea() {
    if (!ideaMessage.trim()) {
      setIdeaStatus("Please write your idea before submitting.");
      return;
    }
    setIdeaStatus("Submitting...");
    const insertResult = await supabase.from("ideas").insert({
      name: ideaName.trim() || "Anonymous",
      message: ideaMessage.trim(),
    });
    if (insertResult.error) {
      setIdeaStatus("Error: " + insertResult.error.message);
      return;
    }
    setIdeaStatus("Thanks! Your idea has been submitted.");
    setIdeaName("");
    setIdeaMessage("");
    loadAll();
    setTimeout(function () {
      setShowForm(false);
      setIdeaStatus("");
    }, 1500);
  }

  const card = { background: "#fff", border: "1px solid #ECE8F5", borderRadius: 14, padding: "10px 14px", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 24px rgba(107,60,180,0.08)" };
  const sectionTitle = { fontFamily: "Space Grotesk, sans-serif", fontSize: 16.5, margin: "0 0 14px", fontWeight: 600 };
  const iconBtn = { width: 40, height: 40, borderRadius: 999, background: "#fff", border: "1px solid #ECE8F5", display: "flex", alignItems: "center", justifyContent: "center", color: "#6E6B7A", cursor: "pointer", position: "relative" as const };
  const overlay = { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 };
  const sheet = { background: "#fff", width: "100%", maxWidth: 430, borderRadius: "22px 22px 0 0", padding: 20, maxHeight: "70vh", overflowY: "auto" as const };
  const inputStyle = { width: "100%", border: "1px solid #ECE8F5", borderRadius: 10, padding: "10px 12px", fontSize: 13, marginBottom: 12, boxSizing: "border-box" as const };
  const btn = { width: "100%", background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer" };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "#1A1523", background: "#F5F3F9", maxWidth: 430, margin: "0 auto", minHeight: "100vh", paddingBottom: 60 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 20px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>F</div>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 16.5 }}>Firalink Hub</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={iconBtn} onClick={openNotif}>
            🔔
            {unreadCount > 0 ? (
              <span style={{ position: "absolute", top: -4, right: -4, background: "#D64545", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                {unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 20px 4px" }}>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 23, margin: "0 0 3px", fontWeight: 600 }}>Good morning, team 👋</h1>
        <p style={{ margin: 0, color: "#6E6B7A", fontSize: 13.5 }}>{categories.length} categories loaded from Supabase</p>
      </div>

      {["graphics", "video", "documents"].map(function (type) {
        return (
          <div style={{ padding: "20px 20px 4px" }} key={type}>
            <h2 style={{ ...sectionTitle, textTransform: "capitalize" as const }}>{type}</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {grouped[type].map(function (cat) {
                return <div style={card} key={cat.id}>{cat.name}</div>;
              })}
            </div>
          </div>
        );
      })}

      <div style={{ padding: "20px 20px 4px" }}>
        <h2 style={sectionTitle}>Team</h2>
        {team.map(function (m) {
          return (
            <div key={m.id} style={{ background: "#fff", border: "1px solid #ECE8F5", borderRadius: 14, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", boxShadow: "0 10px 24px rgba(107,60,180,0.08)" }}>
              <strong style={{ fontSize: 13 }}>{m.name}</strong>
              <span style={{ color: "#6E6B7A", fontSize: 12 }}>{m.role}</span>
            </div>
          );
        })}
        {team.length === 0 ? <p style={{ color: "#6E6B7A", fontSize: 13 }}>No team members yet.</p> : null}
      </div>

      <div style={{ margin: "28px 20px 10px", borderRadius: 22, padding: "26px 22px", textAlign: "center" as const, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", boxShadow: "0 14px 30px rgba(91,31,166,0.28)" }}>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 17, marginBottom: 14, color: "#fff" }}>Have an idea? Let's create it together.</div>
        <div
          style={{ display: "inline-block", background: "#fff", color: "#5B1FA6", fontWeight: 700, fontSize: 13, padding: "12px 24px", borderRadius: 13, cursor: "pointer" }}
          onClick={function () { setShowForm(true); setShowNotif(false); }}
        >
          Start a Request
        </div>
      </div>

      {showForm ? (
        <div style={overlay} onClick={function () { setShowForm(false); }}>
          <div style={sheet} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, marginBottom: 14 }}>Submit Your Idea</h2>
            <input style={inputStyle} placeholder="Your name (optional)" value={ideaName} onChange={function (e) { setIdeaName(e.target.value); }} />
            <textarea style={{ ...inputStyle, minHeight: 90 }} placeholder="Describe your idea" value={ideaMessage} onChange={function (e) { setIdeaMessage(e.target.value); }} />
            <button style={btn} onClick={submitIdea}>Submit Idea</button>
            {ideaStatus ? <p style={{ marginTop: 10, fontSize: 13, color: ideaStatus.indexOf("Error") === 0 ? "#D64545" : "#5B1FA6" }}>{ideaStatus}</p> : null}
          </div>
        </div>
      ) : null}

      {showNotif ? (
        <div style={overlay} onClick={function () { setShowNotif(false); }}>
          <div style={sheet} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, marginBottom: 14 }}>Submitted Ideas</h2>
            {ideas.length === 0 ? (
              <p style={{ color: "#6E6B7A", fontSize: 13 }}>No ideas submitted yet.</p>
            ) : (
              ideas.map(function (idea) {
                return (
                  <div key={idea.id} style={{ borderBottom: "1px solid #EEEBF4", padding: "10px 0" }}>
                    <strong style={{ fontSize: 13 }}>{idea.name}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6E6B7A" }}>{idea.message}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}

    </div>
  );
}