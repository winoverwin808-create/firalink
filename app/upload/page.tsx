"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Upload() {
  const [type, setType] = useState("graphics");
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("png");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadCats() {
      const { data } = await supabase.from("categories").select("*").eq("type", type);
      setCategories(data || []);
      setCategoryId("");
    }
    loadCats();
  }, [type]);

  async function submit() {
    if (!title.trim() || !categoryId) {
      setStatus("Please fill in title and choose a subcategory.");
      return;
    }
    const { error } = await supabase.from("works").insert({
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId,
      file_url: fileUrl.trim(),
      file_type: fileType,
      likes: 0,
      shares: 0,
      recommends: 0,
      views: 0,
    });
    if (error) {
      setStatus("Error: " + error.message);
    } else {
      setStatus("Posted successfully!");
      setTitle("");
      setDescription("");
      setFileUrl("");
    }
  }

  const inputStyle = { width: "100%", border: "1px solid #ECE8F5", borderRadius: 10, padding: "10px 12px", fontSize: 13, marginBottom: 12, boxSizing: "border-box" as const };
  const label = { fontSize: 12, fontWeight: 700, color: "#6E6B7A", marginBottom: 6, display: "block" };
  const btn = { width: "100%", background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer" };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#F5F3F9", minHeight: "100vh", maxWidth: 430, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 22, marginBottom: 20 }}>Post New Work</h1>

      <label style={label}>Category</label>
      <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value)}>
        <option value="graphics">Graphics</option>
        <option value="video">Video</option>
        <option value="documents">Documents</option>
      </select>

      <label style={label}>Subcategory</label>
      <select style={inputStyle} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">Select subcategory</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label style={label}>Title</label>
      <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Nomad Coffee — Brand Kit" />

      <label style={label}>Description</label>
      <textarea style={{ ...inputStyle, minHeight: 70 }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />

      <label style={label}>File Link (upload to Google Drive/Dropbox and paste link)</label>
      <input style={inputStyle} value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />

      <label style={label}>File Type</label>
      <select style={inputStyle} value={fileType} onChange={(e) => setFileType(e.target.value)}>
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
        <option value="mp4">MP4</option>
        <option value="pdf">PDF</option>
        <option value="docx">DOCX</option>
      </select>

      <button style={btn} onClick={submit}>Post</button>
      {status && <p style={{ marginTop: 12, fontSize: 13, color: status.includes("Error") ? "#D64545" : "#5B1FA6" }}>{status}</p>}
    </div>
  );
}