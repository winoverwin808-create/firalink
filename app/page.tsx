"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
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
    const worksResult = await supabase.from("works").select("*").order("created_at", { ascending: false });
    const ideasResult = await supabase.from("ideas").select("*").order("created_at", { ascending: false });
    if (catsResult.data) setCategories(catsResult.data);
    if (membersResult.data) setTeam(membersResult.data);
    if (worksResult.data) setWorks(worksResult.data);
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

  function categoryName(id: string) {
    const found = categories.find(function (c) { return c.id === id; });
    return found ? found.name : "General";
  }

  function creatorName(id: string) {
    const found = team.find(function (m) { return m.id === id; });
    return found ? found.name : "Team";
  }

  const latestWorks = works.slice(0, 6);
  const recommendedWorks = works.slice().sort(function (a, b) {
    return (b.recommends || 0) - (a.recommends || 0);
  }).slice(0, 5);
  const featuredWorks = works.slice().sort(function (a, b) {
    return (b.likes || 0) - (a.likes || 0);
  }).slice(0, 2);

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

  async function likeWork(id: string, current: number) {
    await supabase.from("works").update({ likes: (current || 0) + 1 }).eq("id", id);
    loadAll();
  }

  async function recommendWork(id: string, current: number) {
    await supabase.from("works").update({ recommends: (current || 0) + 1 }).eq("id", id);
    loadAll();
  }

  const cardChip = { background: "#fff", border: "1px solid #ECE8F5", borderRadius: 14, padding: "10px 14px", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 24px rgba(107,60,180,0.08)" };
  const sectionTitle = { fontFamily: "Space Grotesk, sans-serif", fontSize: 16.5, margin: "0 0 14px", fontWeight: 600 };
  const iconBtn = { width: 40, height: 40, borderRadius: 999, background: "#fff", border: "1px solid #ECE8F5", display: "flex", alignItems: "center", justifyContent: "center", color: "#6E6B7A", cursor: "pointer", position: "relative" as const };
  const overlay = { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 };
  const sheet = { background: "#fff", width: "100%", maxWidth: 430, borderRadius: "22px 22px 0 0", padding: 20, maxHeight: "70vh", overflowY: "auto" as const };
  const inputStyle = { width: "100%", border: "1px solid #ECE8F5", borderRadius: 10, padding: "10px 12px", fontSize: 13, marginBottom: 12, boxSizing: "border-box" as const };
  const btn = { width: "100%", background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer" };
  const navItem = { fontSize: 10, fontWeight: 600, color: "#A6A3B0", textAlign: "center" as const, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 };
  const workCard = { flex: "0 0 200px", background: "#fff", border: "1px solid #ECE8F5", borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 24px rgba(107,60,180,0.08)" };
  const thumb = { height: 120, background: "linear-gradient(150deg,#9B5CFC,#5B1FA6)", position: "relative" as const };
  const tinyBtn = { fontSize: 11, color: "#6E6B7A", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, marginRight: 12 };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "#1A1523", background: "#F5F3F9", maxWidth: 430, margin: "0 auto", minHeight: "100vh", paddingBottom: 90 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 20px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>F</div>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 16.5 }}>Firalink Hub</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={iconBtn}>🔍</div>
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

      <div style={{ margin: "18px 20px 0", borderRadius: 22, padding: 24, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", boxShadow: "0 14px 30px rgba(91,31,166,0.28)", display: "flex", gap: 16, position: "relative" as const }}>
        <div style={{ width: 52, height: 52, borderRadius: 15, flex: "0 0 auto", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22 }}>🎙️</div>
        <div>
          <span style={{ fontSize: 11, letterSpacing: "0.09em", fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>Live AI Studio</span>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", color: "#fff", fontSize: 21, marginBottom: 8, fontWeight: 600 }}>Talk to Firalink AI</div>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.5, maxWidth: 230 }}>Speak naturally to search projects, request edits, or get feedback</p>
        </div>
        <div style={{ position: "absolute" as const, top: 22, right: 20, width: 34, height: 34, borderRadius: 999, background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>→</div>
      </div>

      {latestWorks.length > 0 ? (
        <div style={{ padding: "20px 20px 4px" }}>
          <h2 style={sectionTitle}>Latest Works</h2>
          <div style={{ display: "flex", gap: 14, overflowX: "auto" as const, paddingBottom: 6 }}>
            {latestWorks.map(function (w) {
              return (
                <div style={workCard} key={w.id}>
                  <div style={thumb}>
                    <div style={{ position: "absolute" as const, top: 10, left: 10, background: "rgba(255,255,255,0.92)", padding: "4px 9px", borderRadius: 8, fontSize: 10, fontWeight: 700, color: "#5B1FA6" }}>{(w.file_type || "").toUpperCase()}</div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" as const }}>{w.title}</div>
                    <div style={{ fontSize: 11, color: "#6E6B7A", marginBottom: 10 }}>{creatorName(w.creator_id)} · {categoryName(w.category_id)}</div>
                    <div style={{ borderTop: "1px solid #EEEBF4", paddingTop: 8, display: "flex", flexWrap: "wrap" as const }}>
                      <span style={tinyBtn} onClick={function () { likeWork(w.id, w.likes); }}>❤️ {w.likes || 0}</span>
                      <span style={tinyBtn} onClick={function () { recommendWork(w.id, w.recommends); }}>⭐ {w.recommends || 0}</span>
                      {w.file_url ? <a href={w.file_url} target="_blank" rel="noreferrer" style={tinyBtn}>⬇️ Download</a> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {featuredWorks.length > 0 ? (
        <div style={{ padding: "20px 20px 4px" }}>
          <h2 style={sectionTitle}>Featured Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {featuredWorks.map(function (w) {
              return (
                <div style={{ background: "#fff", border: "1px solid #ECE8F5", borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 24px rgba(107,60,180,0.08)" }} key={w.id}>
                  <div style={{ height: 100, background: "linear-gradient(160deg,#FF7AB0,#9B5CFC)" }}></div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 3 }}>{w.title}</div>
                    <div style={{ fontSize: 10.5, color: "#6E6B7A" }}>{creatorName(w.creator_id)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {["graphics", "video", "documents"].map(function (type) {
        return (
          <div style={{ padding: "20px 20px 4px" }} key={type}>
            <h2 style={{ ...sectionTitle, textTransform: "capitalize" as const }}>{type}</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {grouped[type].map(function (cat) {
                return <div style={cardChip} key={cat.id}>{cat.name}</div>;
              })}
              {grouped[type].length === 0 ? <p style={{ color: "#6E6B7A", fontSize: 13 }}>No subcategories yet.</p> : null}
            </div>
          </div>
        );
      })}

      <div style={{ padding: "20px 0 4px" }}>
        <div style={{ margin: "0 20px", borderRadius: 22, padding: 22, background: "#F1E9FB", border: "1px solid #E4D6FA" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#7C3AED", display: "block", marginBottom: 8 }}>What's Next</span>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 19, marginBottom: 8 }}>AI is joining the crew.</div>
          <p style={{ margin: "0 0 16px", color: "#6E6B7A", fontSize: 13, lineHeight: 1.5 }}>Smart tagging, auto-recommendations, and creative assist tools are coming to help the team work faster.</p>
        </div>
      </div>

      <div style={{ padding: "20px 20px 4px" }}>
        <h2 style={sectionTitle}>Our Services</h2>
        <div style={{ display: "flex", gap: 10 }}>
          {["🎨 Graphics", "🎬 Video", "📄 Documents"].map(function (s) {
            return (
              <div key={s} style={{ flex: 1, background: "#fff", border: "1px solid #ECE8F5", borderRadius: 16, padding: "16px 8px", textAlign: "center" as const, boxShadow: "0 10px 24px rgba(107,60,180,0.08)", fontSize: 11.5, fontWeight: 700 }}>{s}</div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "20px 20px 4px" }}>
        <h2 style={sectionTitle}>Team Highlights</h2>
        <div style={{ display: "flex", gap: 14, overflowX: "auto" as const }}>
          {team.map(function (m) {
            return (
              <div key={m.id} style={{ flex: "0 0 100px", textAlign: "center" as const }}>
                <div style={{ width: 64, height: 64, borderRadius: 999, background: "linear-gradient(160deg,#9B5CFC,#5B1FA6)", margin: "0 auto 8px" }}></div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: 10.5, color: "#6E6B7A" }}>{m.role}</div>
              </div>
            );
          })}
          {team.length === 0 ? <p style={{ color: "#6E6B7A", fontSize: 13 }}>No team members yet.</p> : null}
        </div>
      </div>

      {recommendedWorks.length > 0 ? (
        <div style={{ padding: "20px 20px 4px" }}>
          <h2 style={sectionTitle}>Recommended Works</h2>
          <div style={{ background: "#fff", border: "1px solid #ECE8F5", borderRadius: 22, padding: "6px 16px", boxShadow: "0 10px 24px rgba(107,60,180,0.08)" }}>
            {recommendedWorks.map(function (w) {
              return (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid #EEEBF4" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: "linear-gradient(150deg,#FFC15C,#B5730F)", flex: "0 0 auto" }}></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" as const }}>{w.title}</div>
                    <div style={{ fontSize: 11, color: "#6E6B7A" }}>{creatorName(w.creator_id)} · {categoryName(w.category_id)}</div>
                  </div>
                  <div style={{ color: "#7C3AED", fontWeight: 700, fontSize: 11.5 }}>★ {w.recommends || 0}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div style={{ margin: "28px 20px 10px", borderRadius: 22, padding: "26px 22px", textAlign: "center" as const, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", boxShadow: "0 14px 30px rgba(91,31,166,0.28)" }}>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 17, marginBottom: 14, color: "#fff" }}>Have an idea? Let's create it together.</div>
        <div
          style={{ display: "inline-block", background: "#fff", color: "#5B1FA6", fontWeight: 700, fontSize: 13, padding: "12px 24px", borderRadius: 13, cursor: "pointer" }}
          onClick={function () { setShowForm(true); setShowNotif(false); }}
        >
          Start a Request
        </div>
      </div>

      <div style={{ position: "fixed" as const, left: "50%", transform: "translateX(-50%)", bottom: 0, width: "100%", maxWidth: 430, background: "#fff", borderTop: "1px solid #ECE8F5", display: "flex", justifyContent: "space-around", padding: "12px 6px", boxSizing: "border-box" as const }}>
        <div style={{ ...navItem, color: "#7C3AED" }}><span>🏠</span>Home</div>
        <div style={navItem}><span>🎨</span>Graphics</div>
        <div style={navItem}><span>🎬</span>Video</div>
        <div style={navItem}><span>📄</span>Docs</div>
        <div style={navItem}><span>👥</span>Team</div>
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