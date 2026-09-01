"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function Admin() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);

  const [newCatType, setNewCatType] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newAvatar, setNewAvatar] = useState<File | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoStatus, setVideoStatus] = useState("");
  const [videoBusy, setVideoBusy] = useState(false);
  const [memberBusy, setMemberBusy] = useState(false);

  async function loadData() {
    const { data: cats } = await supabase.from("categories").select("*").order("type");
    const { data: members } = await supabase.from("team_members").select("*");
    const { data: ideasData } = await supabase.from("ideas").select("*").order("created_at", { ascending: false });
    const { data: hero } = await supabase.from("hero_video").select("*").eq("id", 1).maybeSingle();
    if (cats) setCategories(cats);
    if (members) setTeam(members);
    if (ideasData) setIdeas(ideasData);
    setHeroVideoUrl(hero && hero.video_url ? hero.video_url : null);
  }

  useEffect(function () { loadData(); }, []);

  async function addCategory(type: string) {
    if (!newCatName.trim()) return;
    await supabase.from("categories").insert({ type, name: newCatName.trim() });
    setNewCatName("");
    setNewCatType("");
    loadData();
  }

  async function deleteCategory(id: string) {
    await supabase.from("categories").delete().eq("id", id);
    loadData();
  }

  async function addMember() {
    if (!newName.trim()) return;
    setMemberBusy(true);
    let avatarUrl: string | null = null;
    if (newAvatar) {
      const ext = newAvatar.name.split(".").pop();
      const path = "avatars/" + Date.now() + "_" + Math.random().toString(36).slice(2) + "." + ext;
      const uploadResult = await supabase.storage.from("uploads").upload(path, newAvatar);
      if (!uploadResult.error) {
        avatarUrl = supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;
      }
    }
    await supabase.from("team_members").insert({
      name: newName.trim(),
      role: newRole.trim() || "Team Member",
      avatar_url: avatarUrl,
    });
    setNewName("");
    setNewRole("");
    setNewAvatar(null);
    setMemberBusy(false);
    loadData();
  }

  async function deleteMember(id: string) {
    await supabase.from("team_members").delete().eq("id", id);
    loadData();
  }

  async function uploadHeroVideo() {
    if (!videoFile) return;
    setVideoBusy(true);
    setVideoStatus("Uploading...");
    const ext = videoFile.name.split(".").pop();
    const path = "hero/" + Date.now() + "_" + Math.random().toString(36).slice(2) + "." + ext;
    const uploadResult = await supabase.storage.from("uploads").upload(path, videoFile);
    if (uploadResult.error) {
      setVideoStatus("Upload error: " + uploadResult.error.message);
      setVideoBusy(false);
      return;
    }
    const publicUrl = supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;
    const upsertResult = await supabase.from("hero_video").upsert({ id: 1, video_url: publicUrl });
    setVideoBusy(false);
    if (upsertResult.error) {
      setVideoStatus("Error: " + upsertResult.error.message);
      return;
    }
    setVideoStatus("Video updated!");
    setVideoFile(null);
    loadData();
    setTimeout(function () { setVideoStatus(""); }, 2000);
  }

  async function removeHeroVideo() {
    setVideoBusy(true);
    await supabase.from("hero_video").upsert({ id: 1, video_url: null });
    setVideoBusy(false);
    setVideoStatus("Video removed.");
    loadData();
    setTimeout(function () { setVideoStatus(""); }, 2000);
  }

  async function setIdeaStatus(id: string, status: string) {
    await supabase.from("ideas").update({ status: status }).eq("id", id);
    loadData();
  }

  const grouped: Record<string, any[]> = { graphics: [], video: [], documents: [] };
  categories.forEach((c) => { if (grouped[c.type]) grouped[c.type].push(c); });

  const panelStyle = { background: "#fff", border: "1px solid #ECE8F5", borderRadius: 22, padding: 18, marginBottom: 16, boxShadow: "0 10px 24px rgba(107,60,180,0.08)" };
  const chipStyle = { display: "flex", alignItems: "center", gap: 8, background: "#F5F3F9", border: "1px solid #ECE8F5", borderRadius: 12, padding: "8px 8px 8px 13px", fontSize: 12.5, fontWeight: 600, maxWidth: "100%" };
  const delBtn = { width: 20, height: 20, borderRadius: 999, background: "#FCEBEB", color: "#D64545", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, flex: "0 0 auto" };
  const addBtnStyle = { flex: 1, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", color: "#fff", fontWeight: 700, fontSize: 12.5, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer" };
  const inputStyle = { flex: 1, border: "1px solid #ECE8F5", borderRadius: 10, padding: "8px 10px", fontSize: 13, minWidth: 0, boxSizing: "border-box" as const };
  const wordSafe = { wordBreak: "break-word" as const, overflowWrap: "anywhere" as const, minWidth: 0 };
  const approveBtn = { flex: 1, background: "#E4F7EA", color: "#1E8A4C", fontWeight: 700, fontSize: 12, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer" };
  const declineBtn = { flex: 1, background: "#FCEBEB", color: "#D64545", fontWeight: 700, fontSize: 12, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer" };
  const statusPill = (status: string) => {
    const s = status || "pending";
    if (s === "approved") return { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: "#E4F7EA", color: "#1E8A4C" };
    if (s === "declined") return { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: "#FCEBEB", color: "#D64545" };
    return { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: "#F1E9FB", color: "#7C3AED" };
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#F5F3F9", minHeight: "100vh", maxWidth: 430, width: "100%", margin: "0 auto", padding: "20px 20px 60px", overflowX: "hidden" as const, boxSizing: "border-box" as const }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div className="fh-hover-scale" style={{ width: 36, height: 36, borderRadius: 999, background: "#fff", border: "1px solid #ECE8F5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "0 0 auto" }} onClick={function () { router.push("/"); }}>←</div>
        <div>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, margin: 0 }}>Manage Content</h1>
          <p style={{ color: "#6E6B7A", fontSize: 12.5, margin: 0 }}>Categories, video, team &amp; requests</p>
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={{ fontSize: 15, marginBottom: 10 }}>Hero Video</h2>
        <p style={{ fontSize: 12, color: "#6E6B7A", marginBottom: 12 }}>Shown in the &quot;Live AI Studio&quot; section on the homepage. Keep it to about a minute.</p>
        {heroVideoUrl ? (
          <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 12, background: "#F5F3F9" }}>
            <video src={heroVideoUrl} controls playsInline style={{ width: "100%", display: "block", maxHeight: 200 }} />
          </div>
        ) : (
          <p style={{ fontSize: 12.5, color: "#6E6B7A", marginBottom: 12 }}>No video uploaded yet.</p>
        )}
        <input
          type="file"
          accept="video/*"
          style={{ ...inputStyle, width: "100%", marginBottom: 10 }}
          onChange={function (e) { setVideoFile(e.target.files ? e.target.files[0] : null); }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button style={addBtnStyle} onClick={uploadHeroVideo} disabled={videoBusy || !videoFile}>{videoBusy ? "Working..." : "Upload Video"}</button>
          {heroVideoUrl ? (
            <button style={{ ...addBtnStyle, background: "#FCEBEB", color: "#D64545", flex: "0 0 auto", padding: "10px 16px" }} onClick={removeHeroVideo} disabled={videoBusy}>Remove</button>
          ) : null}
        </div>
        {videoStatus ? <p style={{ marginTop: 10, fontSize: 12.5, color: videoStatus.indexOf("Error") === 0 || videoStatus.indexOf("error") !== -1 ? "#D64545" : "#5B1FA6" }}>{videoStatus}</p> : null}
      </div>

      {["graphics", "video", "documents"].map((type) => (
        <div style={panelStyle} key={type}>
          <h2 style={{ textTransform: "capitalize" as const, fontSize: 15, marginBottom: 10 }}>{type}</h2>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 9, marginBottom: 14 }}>
            {grouped[type].map((cat) => (
              <div style={chipStyle} key={cat.id}>
                <span style={wordSafe}>{cat.name}</span>
                <button style={delBtn} onClick={() => deleteCategory(cat.id)}>×</button>
              </div>
            ))}
          </div>
          {newCatType === type ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input style={inputStyle} placeholder="New category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
              <button style={addBtnStyle} onClick={() => addCategory(type)}>Add</button>
            </div>
          ) : (
            <button style={{ ...addBtnStyle, background: "#F5F3F9", color: "#7C3AED" }} onClick={() => setNewCatType(type)}>+ Add Category</button>
          )}
        </div>
      ))}

      <div style={panelStyle}>
        <h2 style={{ fontSize: 15, marginBottom: 10 }}>Team</h2>
        {team.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #EEEBF4" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: 999, background: "linear-gradient(160deg,#9B5CFC,#5B1FA6)", flex: "0 0 auto", overflow: "hidden" as const }}>
                {m.avatar_url ? <img src={m.avatar_url} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" as const }} /> : null}
              </div>
              <div style={{ minWidth: 0 }}>
                <strong style={{ fontSize: 13, ...wordSafe }}>{m.name}</strong>
                <div style={{ color: "#6E6B7A", fontSize: 11, ...wordSafe }}>{m.role}</div>
              </div>
            </div>
            <button style={delBtn} onClick={() => deleteMember(m.id)}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" as const }}>
          <input style={inputStyle} placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input style={inputStyle} placeholder="Role" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
        </div>
        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#6E6B7A", display: "block", margin: "10px 0 6px" }}>Profile picture (optional)</label>
        <input
          type="file"
          accept="image/*"
          style={{ ...inputStyle, width: "100%" }}
          onChange={function (e) { setNewAvatar(e.target.files ? e.target.files[0] : null); }}
        />
        <button style={{ ...addBtnStyle, marginTop: 10, width: "100%" }} onClick={addMember} disabled={memberBusy}>{memberBusy ? "Adding..." : "+ Add Team Member"}</button>
      </div>

      <div style={panelStyle}>
        <h2 style={{ fontSize: 15, marginBottom: 4 }}>Startup Ideas</h2>
        <p style={{ fontSize: 12, color: "#6E6B7A", marginBottom: 12 }}>Approve or decline requests submitted from &quot;Have an idea? Let&apos;s create it together.&quot; The result shows up in the homepage notifications.</p>
        {ideas.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "#6E6B7A" }}>No ideas submitted yet.</p>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} style={{ borderBottom: "1px solid #EEEBF4", padding: "10px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <strong style={{ fontSize: 13, ...wordSafe }}>{idea.name}</strong>
                <span style={statusPill(idea.status)}>{idea.status === "approved" ? "Approved" : idea.status === "declined" ? "Declined" : "Pending"}</span>
              </div>
              <p style={{ margin: "0 0 8px", fontSize: 12.5, color: "#6E6B7A", ...wordSafe }}>{idea.message}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={approveBtn} onClick={() => setIdeaStatus(idea.id, "approved")}>Approve</button>
                <button style={declineBtn} onClick={() => setIdeaStatus(idea.id, "declined")}>Decline</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
