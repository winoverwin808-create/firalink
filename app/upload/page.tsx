"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Upload() {
  const [type, setType] = useState("graphics");
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadCats() {
      const { data } = await supabase.from("categories").select("*").eq("type", type);
      setCategories(data || []);
      setCategoryId("");
    }
    loadCats();
  }, [type]);

  async function submit() {
    const missingTitle = !title.trim();
    const missingCategory = !categoryId;
    const missingFile = !file;
    if (missingTitle || missingCategory || missingFile) {
      setStatus("Please fill in title, choose a subcategory, and select a file.");
      return;
    }
    setUploading(true);
    setStatus("Uploading...");

    const fileExt = file.name.split(".").pop();
    const filePath = Date.now() + "_" + Math.random().toString(36).slice(2) + "." + fileExt;

    const uploadResult = await supabase.storage.from("uploads").upload(filePath, file);

    if (uploadResult.error) {
      setStatus("Upload error: " + uploadResult.error.message);
      setUploading(false);
      return;
    }

    const urlData = supabase.storage.from("uploads").getPublicUrl(filePath);
    const publicUrl = urlData.data.publicUrl;

    const insertResult = await supabase.from("works").insert({
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId,
      file_url: publicUrl,
      file_type: fileExt,
      likes: 0,
      shares: 0,
      recommends: 0,
      views: 0,
    });

    setUploading(false);

    if (insertResult.error) {
      setStatus("Error: " + insertResult.error.message);
    } else {
      setStatus("Posted successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
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
        {categories.map(function (c) {
          return <option key={c.id} value={c.id}>{c.name}</option>;
        })}
      </select>

      <label style={label}>Title</label>
      <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Nomad Coffee Brand Kit" />

      <label style={label}>Description</label>
      <textarea style={{ ...inputStyle, minHeight: 70 }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />

      <label style={label}>Upload File</label>
      <input
        type="file"
        style={inputStyle}
        onChange={function (e) {
          setFile(e.target.files ? e.target.files[0] : null);
        }}
      />
      {file ? <p style={{ fontSize: 12, color: "#6E6B7A", marginTop: -8, marginBottom: 12 }}>Selected: {file.name}</p> : null}

      <button style={btn} onClick={submit} disabled={uploading}>{uploading ? "Uploading..." : "Post"}</button>
      {status ? <p style={{ marginTop: 12, fontSize: 13, color: status.indexOf("Error") === 0 ? "#D64545" : "#5B1FA6" }}>{status}</p> : null}
    </div>
  );
}