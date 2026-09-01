"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

const IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"];
const VIDEO_TYPES = ["mp4", "mov", "webm", "m4v"];

function isImageType(ft: string) {
  return IMAGE_TYPES.indexOf((ft || "").toLowerCase()) !== -1;
}
function isVideoType(ft: string) {
  return VIDEO_TYPES.indexOf((ft || "").toLowerCase()) !== -1;
}

export default function Home() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [ideaName, setIdeaName] = useState("");
  const [ideaMessage, setIdeaMessage] = useState("");
  const [ideaStatus, setIdeaStatus] = useState("");
  const [seenCount, setSeenCount] = useState(0);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ graphics: false, video: false, documents: false });
  const [activeFilter, setActiveFilter] = useState<{ type: string; id: string; name: string } | null>(null);
  const [activeNav, setActiveNav] = useState("home");
  const [highlightWorkId, setHighlightWorkId] = useState<string | null>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  function setRef(key: string) {
    return function (el: HTMLDivElement | null) {
      sectionRefs.current[key] = el;
    };
  }
  function scrollToSection(key: string) {
    const el = sectionRefs.current[key];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function loadAll() {
    const catsResult = await supabase.from("categories").select("*").order("type");
    const membersResult = await supabase.from("team_members").select("*");
    const worksResult = await supabase.from("works").select("*").order("created_at", { ascending: false });
    const ideasResult = await supabase.from("ideas").select("*").order("created_at", { ascending: false });
    const heroResult = await supabase.from("hero_video").select("*").eq("id", 1).maybeSingle();
    if (catsResult.data) setCategories(catsResult.data);
    if (membersResult.data) setTeam(membersResult.data);
    if (worksResult.data) setWorks(worksResult.data);
    if (ideasResult.data) setIdeas(ideasResult.data);
    if (heroResult.data) setHeroVideoUrl(heroResult.data.video_url || null);
  }

  useEffect(function () {
    loadAll();
    const stored = window.localStorage.getItem("seenIdeaCount");
    setSeenCount(stored ? parseInt(stored) : 0);
  }, []);

  useEffect(function () {
    if (!searchOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
    }
    window.addEventListener("keydown", onKey);
    return function () { window.removeEventListener("keydown", onKey); };
  }, [searchOpen]);

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

  const displayedWorks = activeFilter ? works.filter(function (w) { return w.category_id === activeFilter.id; }) : latestWorks;
  const worksHeading = activeFilter ? activeFilter.name : "Latest Works";

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
      status: "pending",
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

  function openSearch() {
    setSearchOpen(true);
  }
  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  function toggleExpand(type: string) {
    setExpanded(function (prev) { return { ...prev, [type]: !prev[type] }; });
  }

  function focusCategorySection(type: string) {
    setExpanded(function (prev) { return { ...prev, [type]: true }; });
    setActiveNav(type);
    setTimeout(function () { scrollToSection(type); }, 60);
  }

  function selectSubcategory(cat: any) {
    setActiveFilter({ type: cat.type, id: cat.id, name: cat.name });
    setActiveNav(cat.type);
    setTimeout(function () { scrollToSection("works"); }, 60);
  }

  function clearFilter() {
    setActiveFilter(null);
  }

  function goHome() {
    setActiveNav("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToTeamSection() {
    setActiveNav("team");
    setTimeout(function () { scrollToSection("team"); }, 60);
  }

  // Search: gather matches across categories, works, team, and static pages/sections
  const q = searchQuery.trim().toLowerCase();
  const searchActive = q.length > 0;
  const catMatches = searchActive ? categories.filter(function (c) {
    return (c.name || "").toLowerCase().includes(q) || (c.type || "").toLowerCase().includes(q);
  }) : [];
  const workMatches = searchActive ? works.filter(function (w) {
    return (w.title || "").toLowerCase().includes(q) || (w.description || "").toLowerCase().includes(q);
  }) : [];
  const teamMatches = searchActive ? team.filter(function (m) {
    return (m.name || "").toLowerCase().includes(q) || (m.role || "").toLowerCase().includes(q);
  }) : [];
  const staticPages = [
    { label: "About Us", sub: "Purpose, services & how it works", href: "/about" },
    { label: "Our Services", sub: "Graphics, video & documents", key: "services" },
    { label: "Team Highlights", sub: "Meet the crew", key: "team" },
    { label: "Have an idea?", sub: "Submit a request", key: "cta" },
    { label: "Post new work", sub: "Upload a file", href: "/upload" },
  ];
  const pageMatches = searchActive ? staticPages.filter(function (p) {
    return p.label.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q);
  }) : [];
  const totalMatches = catMatches.length + workMatches.length + teamMatches.length + pageMatches.length;

  function goToCategoryResult(cat: any) {
    closeSearch();
    selectSubcategory(cat);
    setExpanded(function (prev) { return { ...prev, [cat.type]: true }; });
  }
  function goToWorkResult(w: any) {
    closeSearch();
    setActiveFilter(null);
    setHighlightWorkId(w.id);
    setTimeout(function () { scrollToSection("works"); }, 60);
    setTimeout(function () { setHighlightWorkId(null); }, 2600);
  }
  function goToTeamResult() {
    closeSearch();
    goToTeamSection();
  }
  function goToPageResult(p: any) {
    closeSearch();
    if (p.href) {
      router.push(p.href);
      return;
    }
    setActiveNav(p.key === "team" ? "team" : "home");
    setTimeout(function () { scrollToSection(p.key); }, 60);
  }

  const cardChip = { background: "#fff", border: "1px solid #ECE8F5", borderRadius: 14, padding: "10px 14px", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 24px rgba(107,60,180,0.08)", cursor: "pointer" as const, wordBreak: "break-word" as const };
  const cardChipActive = { ...cardChip, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", color: "#fff", boxShadow: "0 10px 24px rgba(91,31,166,0.25)" };
  const sectionTitle = { fontFamily: "Space Grotesk, sans-serif", fontSize: 16.5, margin: "0 0 14px", fontWeight: 600 };
  const iconBtn = { width: 40, height: 40, borderRadius: 999, background: "#fff", border: "1px solid #ECE8F5", display: "flex", alignItems: "center", justifyContent: "center", color: "#6E6B7A", cursor: "pointer", position: "relative" as const };
  const overlay = { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 };
  const sheet = { background: "#fff", width: "100%", maxWidth: 430, borderRadius: "22px 22px 0 0", padding: 20, maxHeight: "70vh", overflowY: "auto" as const };
  const inputStyle = { width: "100%", border: "1px solid #ECE8F5", borderRadius: 10, padding: "10px 12px", fontSize: 13, marginBottom: 12, boxSizing: "border-box" as const };
  const btn = { width: "100%", background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer" };
  const navItem = { fontSize: 10, fontWeight: 600, color: "#A6A3B0", textAlign: "center" as const, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, cursor: "pointer" as const };
  const navItemActive = { ...navItem, color: "#7C3AED" };
  const workCard = { flex: "0 0 200px", background: "#fff", border: "1px solid #ECE8F5", borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 24px rgba(107,60,180,0.08)" };
  const thumb = { height: 120, background: "linear-gradient(150deg,#9B5CFC,#5B1FA6)", position: "relative" as const, overflow: "hidden" as const };
  const tinyBtn = { fontSize: 11, color: "#6E6B7A", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, marginRight: 12 };
  const catHeader = { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #ECE8F5", borderRadius: 18, padding: "14px 16px", boxShadow: "0 10px 24px rgba(107,60,180,0.08)", cursor: "pointer" as const };
  const catIcon = { width: 42, height: 42, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flex: "0 0 auto" };
  const searchResultRow = { display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: "1px solid #EEEBF4", cursor: "pointer" as const };
  const searchResultIcon = { width: 36, height: 36, borderRadius: 10, background: "#F1E9FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flex: "0 0 auto" };
  const wordSafe = { wordBreak: "break-word" as const, overflowWrap: "anywhere" as const };
  const statusBadge = { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, display: "inline-block" };

  function renderThumbMedia(w: any) {
    if (isImageType(w.file_type)) {
      return <img src={w.file_url} alt={w.title} style={{ width: "100%", height: "100%", objectFit: "cover" as const, display: "block" }} />;
    }
    if (isVideoType(w.file_type)) {
      return <video src={w.file_url} muted preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" as const, display: "block" }} />;
    }
    return null;
  }

  function renderWorkCard(w: any) {
    const isHighlighted = highlightWorkId === w.id;
    return (
      <div className="fh-hover-lift" style={{ ...workCard, boxShadow: isHighlighted ? "0 0 0 3px #8B2FD9" : workCard.boxShadow }} key={w.id}>
        <div style={thumb}>
          {renderThumbMedia(w)}
          <div style={{ position: "absolute" as const, top: 10, left: 10, background: "rgba(255,255,255,0.92)", padding: "4px 9px", borderRadius: 8, fontSize: 10, fontWeight: 700, color: "#5B1FA6" }}>{(w.file_type || "").toUpperCase()}</div>
        </div>
        <div style={{ padding: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, ...wordSafe, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{w.title}</div>
          <div style={{ fontSize: 11, color: "#6E6B7A", marginBottom: 10, ...wordSafe }}>{creatorName(w.creator_id)} · {categoryName(w.category_id)}</div>
          <div style={{ borderTop: "1px solid #EEEBF4", paddingTop: 8, display: "flex", flexWrap: "wrap" as const }}>
            <span style={tinyBtn} onClick={function () { likeWork(w.id, w.likes); }}>❤️ {w.likes || 0}</span>
            <span style={tinyBtn} onClick={function () { recommendWork(w.id, w.recommends); }}>⭐ {w.recommends || 0}</span>
            {w.file_url ? <a href={w.file_url} target="_blank" rel="noreferrer" style={tinyBtn}>⬇️ Download</a> : null}
          </div>
        </div>
      </div>
    );
  }

  // staggered entrance animation: each top-level section gets an increasing delay
  let fadeIndex = 0;
  function fade(): React.CSSProperties {
    const style = { animationDelay: (fadeIndex * 0.06) + "s" };
    fadeIndex += 1;
    return style;
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "#1A1523", background: "#F5F3F9", maxWidth: 430, width: "100%", margin: "0 auto", minHeight: "100vh", paddingBottom: 90, position: "relative" as const, overflowX: "hidden" as const }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 20px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>F</div>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 16.5 }}>Firalink Hub</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="fh-hover-scale" style={iconBtn} onClick={openSearch}>🔍</div>
          <div className="fh-hover-scale" style={iconBtn} onClick={openNotif}>
            🔔
            {unreadCount > 0 ? (
              <span style={{ position: "absolute", top: -4, right: -4, background: "#D64545", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                {unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="fh-section" style={{ ...fade(), padding: "16px 20px 4px" }}>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 23, margin: "0 0 3px", fontWeight: 600 }}>Good morning, team 👋</h1>
        <p style={{ margin: 0, color: "#6E6B7A", fontSize: 13.5 }}>{categories.length} categories loaded from Supabase</p>
      </div>

      <div className="fh-section" style={{ ...fade(), margin: "18px 20px 0", borderRadius: 22, padding: 20, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", boxShadow: "0 14px 30px rgba(91,31,166,0.28)" }}>
        <span style={{ fontSize: 11, letterSpacing: "0.09em", fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>Live AI Studio</span>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", color: "#fff", fontSize: 20, marginBottom: 8, fontWeight: 600 }}>Talk to Firalink AI</div>
        <p style={{ margin: "0 0 14px", color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.5, maxWidth: 260 }}>A quick intro to what the hub can do</p>
        <div style={{ borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.12)" }}>
          {heroVideoUrl ? (
            <video src={heroVideoUrl} controls playsInline preload="metadata" style={{ width: "100%", display: "block", maxHeight: 220, objectFit: "cover" as const }} />
          ) : (
            <div style={{ padding: "26px 16px", textAlign: "center" as const, color: "rgba(255,255,255,0.75)", fontSize: 12.5 }}>No video uploaded yet — add one from the Admin page</div>
          )}
        </div>
      </div>

      <div ref={setRef("works")} className="fh-section" style={{ ...fade(), padding: "20px 20px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ ...sectionTitle, margin: 0 }}>{worksHeading}</h2>
          {activeFilter ? (
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#7C3AED", cursor: "pointer" }} onClick={clearFilter}>Clear filter ×</span>
          ) : null}
        </div>
        {displayedWorks.length > 0 ? (
          <div style={{ display: "flex", gap: 14, overflowX: "auto" as const, paddingBottom: 6 }}>
            {displayedWorks.map(renderWorkCard)}
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px dashed #D9D2EC", borderRadius: 18, padding: "22px 16px", textAlign: "center" as const }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "#6E6B7A" }}>{activeFilter ? "No works posted in " + activeFilter.name + " yet." : "No works posted yet."}</p>
            <a href="/upload" style={{ fontSize: 12.5, fontWeight: 700, color: "#7C3AED", textDecoration: "none" }}>Post the first one</a>
          </div>
        )}
      </div>

      {featuredWorks.length > 0 ? (
        <div className="fh-section" style={{ ...fade(), padding: "20px 20px 4px" }}>
          <h2 style={sectionTitle}>Featured Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {featuredWorks.map(function (w) {
              return (
                <div className="fh-hover-lift" style={{ background: "#fff", border: "1px solid #ECE8F5", borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 24px rgba(107,60,180,0.08)" }} key={w.id}>
                  <div style={{ height: 100, background: "linear-gradient(160deg,#FF7AB0,#9B5CFC)", overflow: "hidden" as const }}>{renderThumbMedia(w)}</div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 3, ...wordSafe, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{w.title}</div>
                    <div style={{ fontSize: 10.5, color: "#6E6B7A" }}>{creatorName(w.creator_id)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {["graphics", "video", "documents"].map(function (type) {
        const icon = type === "graphics" ? "🎨" : type === "video" ? "🎬" : "📄";
        const iconBg = type === "graphics" ? "linear-gradient(150deg,#FF7AB0,#9B5CFC)" : type === "video" ? "linear-gradient(150deg,#5CC8FF,#5B1FA6)" : "linear-gradient(150deg,#FFC15C,#B5730F)";
        const isOpen = expanded[type];
        const subs = grouped[type];
        return (
          <div ref={setRef(type)} className="fh-section" style={{ ...fade(), padding: "20px 20px 4px" }} key={type}>
            <div className="fh-hover-lift" style={catHeader} onClick={function () { toggleExpand(type); }}>
              <div style={{ ...catIcon, background: iconBg, color: "#fff" }}>{icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, textTransform: "capitalize" as const }}>{type}</div>
                <div style={{ fontSize: 11.5, color: "#6E6B7A" }}>{subs.length} subcategor{subs.length === 1 ? "y" : "ies"}</div>
              </div>
              <div className="fh-chevron" style={{ fontSize: 13, color: "#A6A3B0", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>⌄</div>
            </div>
            {isOpen ? (
              <div className="fh-expand" style={{ display: "flex", gap: 10, flexWrap: "wrap" as const, marginTop: 12 }}>
                {subs.length > 0 ? subs.map(function (cat) {
                  const isActive = activeFilter && activeFilter.id === cat.id;
                  return (
                    <div className="fh-hover-scale" style={isActive ? cardChipActive : cardChip} key={cat.id} onClick={function () { selectSubcategory(cat); }}>{cat.name}</div>
                  );
                }) : <p style={{ color: "#6E6B7A", fontSize: 13, margin: 0 }}>No subcategories yet — add some from the admin page.</p>}
              </div>
            ) : null}
          </div>
        );
      })}

      <div ref={setRef("services")} className="fh-section" style={{ ...fade(), padding: "20px 20px 4px" }}>
        <h2 style={sectionTitle}>Our Services</h2>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ label: "🎨 Graphics", type: "graphics" }, { label: "🎬 Video", type: "video" }, { label: "📄 Documents", type: "documents" }].map(function (s) {
            return (
              <div key={s.type} className="fh-hover-lift" style={{ flex: 1, background: "#fff", border: "1px solid #ECE8F5", borderRadius: 16, padding: "16px 8px", textAlign: "center" as const, boxShadow: "0 10px 24px rgba(107,60,180,0.08)", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }} onClick={function () { focusCategorySection(s.type); }}>{s.label}</div>
            );
          })}
        </div>
      </div>

      <div ref={setRef("team")} className="fh-section" style={{ ...fade(), padding: "20px 20px 4px" }}>
        <h2 style={sectionTitle}>Team Highlights</h2>
        <div style={{ display: "flex", gap: 14, overflowX: "auto" as const }}>
          {team.map(function (m) {
            return (
              <div key={m.id} style={{ flex: "0 0 100px", textAlign: "center" as const }}>
                <div style={{ width: 64, height: 64, borderRadius: 999, background: "linear-gradient(160deg,#9B5CFC,#5B1FA6)", margin: "0 auto 8px", overflow: "hidden" as const }}>
                  {m.avatar_url ? <img src={m.avatar_url} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" as const }} /> : null}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, ...wordSafe }}>{m.name}</div>
                <div style={{ fontSize: 10.5, color: "#6E6B7A", ...wordSafe }}>{m.role}</div>
              </div>
            );
          })}
          {team.length === 0 ? <p style={{ color: "#6E6B7A", fontSize: 13 }}>No team members yet.</p> : null}
        </div>
      </div>

      {recommendedWorks.length > 0 ? (
        <div className="fh-section" style={{ ...fade(), padding: "20px 20px 4px" }}>
          <h2 style={sectionTitle}>Recommended Works</h2>
          <div style={{ background: "#fff", border: "1px solid #ECE8F5", borderRadius: 22, padding: "6px 16px", boxShadow: "0 10px 24px rgba(107,60,180,0.08)" }}>
            {recommendedWorks.map(function (w) {
              return (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid #EEEBF4" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: "linear-gradient(150deg,#FFC15C,#B5730F)", flex: "0 0 auto", overflow: "hidden" as const }}>{renderThumbMedia(w)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, ...wordSafe, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{w.title}</div>
                    <div style={{ fontSize: 11, color: "#6E6B7A", ...wordSafe }}>{creatorName(w.creator_id)} · {categoryName(w.category_id)}</div>
                  </div>
                  <div style={{ color: "#7C3AED", fontWeight: 700, fontSize: 11.5, flex: "0 0 auto" }}>★ {w.recommends || 0}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div ref={setRef("cta")} className="fh-section fh-hover-lift" style={{ ...fade(), margin: "28px 20px 10px", borderRadius: 22, padding: "26px 22px", textAlign: "center" as const, background: "linear-gradient(135deg,#8B2FD9,#5B1FA6)", boxShadow: "0 14px 30px rgba(91,31,166,0.28)" }}>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 17, marginBottom: 14, color: "#fff" }}>Have an idea? Let&apos;s create it together.</div>
        <div
          className="fh-hover-scale"
          style={{ display: "inline-block", background: "#fff", color: "#5B1FA6", fontWeight: 700, fontSize: 13, padding: "12px 24px", borderRadius: 13, cursor: "pointer" }}
          onClick={function () { setShowForm(true); setShowNotif(false); }}
        >
          Start a Request
        </div>
      </div>

      <div className="fh-section" style={{ ...fade(), margin: "24px 0 0", padding: "26px 20px 20px", background: "linear-gradient(160deg,#2A1450,#1A0E33)", color: "#fff" }}>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Firalink Hub</div>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "9px 18px", marginBottom: 16 }}>
          <span className="fh-hover-scale" style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", cursor: "pointer", display: "inline-block" }} onClick={goHome}>Home</span>
          <span className="fh-hover-scale" style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", cursor: "pointer", display: "inline-block" }} onClick={function () { router.push("/about"); }}>About Us</span>
          <span className="fh-hover-scale" style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", cursor: "pointer", display: "inline-block" }} onClick={function () { setActiveNav("home"); setTimeout(function () { scrollToSection("services"); }, 60); }}>Services</span>
          <span className="fh-hover-scale" style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", cursor: "pointer", display: "inline-block" }} onClick={goToTeamSection}>Team</span>
          <a href="/upload" className="fh-hover-scale" style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", textDecoration: "none", display: "inline-block" }}>Post a Work</a>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.14)", marginBottom: 14 }}></div>
        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>© {new Date().getFullYear()} Firalink Hub</p>
      </div>

      <div style={{ position: "fixed" as const, left: "50%", transform: "translateX(-50%)", bottom: 0, width: "100%", maxWidth: 430, background: "#fff", borderTop: "1px solid #ECE8F5", display: "flex", justifyContent: "space-around", padding: "12px 6px", boxSizing: "border-box" as const, zIndex: 40 }}>
        <div style={activeNav === "home" ? navItemActive : navItem} onClick={goHome}><span>🏠</span>Home</div>
        <div style={activeNav === "graphics" ? navItemActive : navItem} onClick={function () { focusCategorySection("graphics"); }}><span>🎨</span>Graphics</div>
        <div style={activeNav === "video" ? navItemActive : navItem} onClick={function () { focusCategorySection("video"); }}><span>🎬</span>Video</div>
        <div style={activeNav === "documents" ? navItemActive : navItem} onClick={function () { focusCategorySection("documents"); }}><span>📄</span>Docs</div>
        <div style={activeNav === "team" ? navItemActive : navItem} onClick={goToTeamSection}><span>👥</span>Team</div>
      </div>

      {showForm ? (
        <div className="fh-overlay" style={overlay} onClick={function () { setShowForm(false); }}>
          <div className="fh-sheet" style={sheet} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, marginBottom: 14 }}>Submit Your Idea</h2>
            <input style={inputStyle} placeholder="Your name (optional)" value={ideaName} onChange={function (e) { setIdeaName(e.target.value); }} />
            <textarea style={{ ...inputStyle, minHeight: 90 }} placeholder="Describe your idea" value={ideaMessage} onChange={function (e) { setIdeaMessage(e.target.value); }} />
            <button className="fh-hover-scale" style={btn} onClick={submitIdea}>Submit Idea</button>
            {ideaStatus ? <p style={{ marginTop: 10, fontSize: 13, color: ideaStatus.indexOf("Error") === 0 ? "#D64545" : "#5B1FA6" }}>{ideaStatus}</p> : null}
          </div>
        </div>
      ) : null}

      {showNotif ? (
        <div className="fh-overlay" style={overlay} onClick={function () { setShowNotif(false); }}>
          <div className="fh-sheet" style={sheet} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, marginBottom: 4 }}>Submitted Ideas</h2>
            <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#6E6B7A" }}>Requests the team has sent in from &quot;Have an idea? Let&apos;s create it together.&quot;</p>
            {ideas.length === 0 ? (
              <p style={{ color: "#6E6B7A", fontSize: 13 }}>No ideas submitted yet.</p>
            ) : (
              ideas.map(function (idea) {
                const status = idea.status || "pending";
                const badgeStyle = status === "approved"
                  ? { ...statusBadge, background: "#E4F7EA", color: "#1E8A4C" }
                  : status === "declined"
                  ? { ...statusBadge, background: "#FCEBEB", color: "#D64545" }
                  : { ...statusBadge, background: "#F1E9FB", color: "#7C3AED" };
                const statusLabel = status === "approved" ? "Approved" : status === "declined" ? "Declined" : "Pending";
                return (
                  <div key={idea.id} style={{ borderBottom: "1px solid #EEEBF4", padding: "10px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <strong style={{ fontSize: 13, ...wordSafe }}>{idea.name}</strong>
                      <span style={badgeStyle}>{statusLabel}</span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6E6B7A", ...wordSafe }}>{idea.message}</p>
                  </div>
                );
              })
            )}
            <button className="fh-hover-scale" style={{ ...btn, marginTop: 14, background: "#F1E9FB", color: "#7C3AED" }} onClick={function () { setShowNotif(false); setShowForm(true); }}>Start a Request</button>
          </div>
        </div>
      ) : null}

      {searchOpen ? (
        <div className="fh-overlay" style={{ position: "fixed" as const, inset: 0, background: "#F5F3F9", zIndex: 60, maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" as const }}>
          <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", gap: 10, background: "#fff", borderBottom: "1px solid #ECE8F5" }}>
            <div className="fh-hover-scale" style={{ ...iconBtn, border: "none", background: "#F5F3F9" }} onClick={closeSearch}>←</div>
            <input
              autoFocus
              style={{ flex: 1, border: "1px solid #ECE8F5", borderRadius: 12, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" as const }}
              placeholder="Search every page"
              value={searchQuery}
              onChange={function (e) { setSearchQuery(e.target.value); }}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto" as const, padding: "10px 20px 30px" }}>
            {!searchActive ? (
              <p style={{ color: "#A6A3B0", fontSize: 13, marginTop: 20, textAlign: "center" as const }}>Search categories, works, team members, and pages.</p>
            ) : totalMatches === 0 ? (
              <p style={{ color: "#A6A3B0", fontSize: 13, marginTop: 20, textAlign: "center" as const }}>No results for &quot;{searchQuery}&quot;.</p>
            ) : (
              <>
                {catMatches.length > 0 ? (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#A6A3B0", margin: "10px 0 4px" }}>Categories</div>
                    {catMatches.map(function (c) {
                      return (
                        <div key={c.id} className="fh-hover-lift" style={searchResultRow} onClick={function () { goToCategoryResult(c); }}>
                          <div style={searchResultIcon}>{c.type === "graphics" ? "🎨" : c.type === "video" ? "🎬" : "📄"}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: "#6E6B7A", textTransform: "capitalize" as const }}>{c.type}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {workMatches.length > 0 ? (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#A6A3B0", margin: "10px 0 4px" }}>Works</div>
                    {workMatches.map(function (w) {
                      return (
                        <div key={w.id} className="fh-hover-lift" style={searchResultRow} onClick={function () { goToWorkResult(w); }}>
                          <div style={searchResultIcon}>🖼️</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{w.title}</div>
                            <div style={{ fontSize: 11, color: "#6E6B7A" }}>{creatorName(w.creator_id)} · {categoryName(w.category_id)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {teamMatches.length > 0 ? (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#A6A3B0", margin: "10px 0 4px" }}>Team</div>
                    {teamMatches.map(function (m) {
                      return (
                        <div key={m.id} className="fh-hover-lift" style={searchResultRow} onClick={goToTeamResult}>
                          <div style={searchResultIcon}>👤</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                            <div style={{ fontSize: 11, color: "#6E6B7A" }}>{m.role}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {pageMatches.length > 0 ? (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#A6A3B0", margin: "10px 0 4px" }}>Pages</div>
                    {pageMatches.map(function (p) {
                      return (
                        <div key={p.key || p.href} className="fh-hover-lift" style={searchResultRow} onClick={function () { goToPageResult(p); }}>
                          <div style={searchResultIcon}>📄</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{p.label}</div>
                            <div style={{ fontSize: 11, color: "#6E6B7A" }}>{p.sub}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}

    </div>
  );
}
