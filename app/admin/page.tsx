"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Admin() {
  const [categories, setCategories] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [newCatType, setNewCatType] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");

  async function loadData() {
    const { data: cats } = await supabase.from("categories").select("*").order("type");
    const { data: members } = await supabase.from("team_members").select("*");
    if (cats) setCategories(cats);
    if (members) setTeam(members);
  }

  useEffect(() => { loadData(); }, []);

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
    await supabase.from("team_members").insert({ name: newName.trim(), role: newRole.trim() || "Team Member" });
    setNewName("");
    setNewRole("");
    loadData();
  }

  async function deleteMember(id: string) {
    await supabase.from("team_members").delete().eq("id", id);
    loadData();
  }

  const grouped: Record<string, any[]> = { graphics: [], video: [], documents: [] };
  categories.forEach((c) => { if (grouped[c.type]) grouped[c.type].push(c); });

  const panelStyle = { background: "#fff", border: "1px solid #ECE8F5", borderRadius: 22, padding: 18, marginBottom: 16, boxShadow: "0 10px 24px rgba(107,60,180,0.08)" };
  const chipStyle = { display: "flex", alignItems: "center", gap: 8, background: "#F5F3F9", border: "1px solid #ECE8F5", borderRadius: 12, padding: "8px 8px 8px 13px", fontSize: 12.5, fontWeight: 600 };
  const delBtn = { width: 20, height: 20, borderRadius: 999, background: "#FCEBEB", color: "#D64545", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 };
  const addBtnStyle = { flex: 1, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", color: "#fff", fontWeight: 700, fontSize: 12.5, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer" };
  const inputStyle = { flex: 1, border: "1px solid #ECE8F5", borderRadius: 10, padding: "8px 10px", fontSize: 13 };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#F5F3F9", minHeight: "100vh", maxWidth: 430, margin: "0 auto", padding: "20px 20px 60px" }}>
      <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 22, marginBottom: 4 }}>Manage Content</h1>
      <p style={{ color: "#6E6B7A", fontSize: 13, marginBottom: 20 }}>Add or remove categories and team members</p>

      {["graphics", "video", "documents"].map((type) => (
        <div style={panelStyle} key={type}>
          <h2 style={{ textTransform: "capitalize", fontSize: 15, marginBottom: 10 }}>{type}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 14 }}>
            {grouped[type].map((cat) => (
              <div style={chipStyle} key={cat.id}>
                <span>{cat.name}</span>
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
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #EEEBF4" }}>
            <div>
              <strong style={{ fontSize: 13 }}>{m.name}</strong>
              <div style={{ color: "#6E6B7A", fontSize: 11 }}>{m.role}</div>
            </div>
            <button style={delBtn} onClick={() => deleteMember(m.id)}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input style={inputStyle} placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input style={inputStyle} placeholder="Role" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
        </div>
        <button style={{ ...addBtnStyle, marginTop: 10, width: "100%" }} onClick={addMember}>+ Add Team Member</button>
      </div>
    </div>
  );
}