import { useState, useEffect, useRef } from "react";

// ── Image compressor ──
function compressImage(file, maxWidth = 1200) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve({ dataUrl, base64: dataUrl.split(",")[1], width: canvas.width, height: canvas.height });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Grade display ──
function GradeBadge({ grade }) {
  const colors = {
    "A+": "#2d8a4e", "A": "#2d8a4e", "A-": "#3a9a5e",
    "B+": "#d4a843", "B": "#d4a843", "B-": "#c49a33",
    "C+": "#d46a43", "C": "#d46a43", "C-": "#c45a33",
    "D": "#c43333", "F": "#991111",
  };
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 52, height: 52, borderRadius: 12,
      background: `${colors[grade] || "#555"}22`,
      border: `2px solid ${colors[grade] || "#555"}`,
      color: colors[grade] || "#555",
      fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif",
    }}>{grade}</div>
  );
}

// ── Edit suggestion bar ──
function EditBar({ label, value, min, max, unit }) {
  const range = max - min;
  const zero = ((0 - min) / range) * 100;
  const pos = ((value - min) / range) * 100;
  const isPositive = value >= 0;

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "#999", fontSize: 12 }}>{label}</span>
        <span style={{ color: isPositive ? "#4a9" : "#d46a43", fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>
          {value > 0 ? "+" : ""}{value}{unit || ""}
        </span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          left: isPositive ? `${zero}%` : `${pos}%`,
          width: `${Math.abs(pos - zero)}%`,
          height: "100%",
          background: isPositive ? "linear-gradient(90deg, #4a9, #2d8a4e)" : "linear-gradient(90deg, #d46a43, #e86840)",
          borderRadius: 3,
        }} />
        <div style={{
          position: "absolute", left: `${zero}%`, top: -2,
          width: 2, height: 10, background: "#666",
        }} />
      </div>
    </div>
  );
}

// ── Submission target card ──
function SubmissionCard({ target }) {
  const typeColors = { gallery: "#a87ed8", museum: "#d4a843", publication: "#4a90d9", stock: "#4a9", competition: "#e86840" };
  const color = typeColors[target.type] || "#888";
  return (
    <div style={{ padding: "12px 14px", marginBottom: 8, background: `${color}0a`, border: `1px solid ${color}25`, borderRadius: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
        <span style={{ color, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 7px", border: `1px solid ${color}44`, borderRadius: 3, textTransform: "uppercase" }}>{target.type}</span>
        <span style={{ color: "#888", fontSize: 11 }}>{target.fit_score}% fit</span>
      </div>
      <div style={{ color: "#e8e0d4", fontSize: 14, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 2 }}>{target.name}</div>
      <div style={{ color: "#888", fontSize: 12, lineHeight: 1.5 }}>{target.why}</div>
      {target.submission_notes && <div style={{ color: "#666", fontSize: 11, marginTop: 4, fontStyle: "italic" }}>{target.submission_notes}</div>}
    </div>
  );
}

// ── Single photo analysis view ──
function PhotoAnalysis({ analysis, imageUrl, onBack }) {
  const [activeSection, setActiveSection] = useState("edits");

  return (
    <div style={{ padding: "20px 16px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#d4a843", fontSize: 13, cursor: "pointer", marginBottom: 16, padding: 0, fontFamily: "'DM Sans', sans-serif" }}>{"\u2190"} Back to portfolio</button>

      {/* Image + Grade + Book Verdict */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12, alignItems: "flex-start" }}>
        <img src={imageUrl} style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <GradeBadge grade={analysis.grade} />
            {analysis.book_worthy != null && (
              <div style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                background: analysis.book_worthy ? "rgba(45,138,78,0.12)" : "rgba(212,106,67,0.12)",
                border: `1px solid ${analysis.book_worthy ? "rgba(45,138,78,0.3)" : "rgba(212,106,67,0.3)"}`,
                color: analysis.book_worthy ? "#2d8a4e" : "#d46a43",
              }}>
                {analysis.book_worthy ? "INCLUDE" : "CUT"}
              </div>
            )}
          </div>
          <div style={{ color: "#e8e0d4", fontSize: 16, fontFamily: "'Playfair Display', Georgia, serif", marginTop: 10, lineHeight: 1.3 }}>{analysis.title}</div>
          <div style={{ color: "#888", fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>{analysis.one_line}</div>
        </div>
      </div>

      {/* Book verdict summary */}
      {analysis.book_verdict && (
        <div style={{
          padding: "12px 16px", marginBottom: 20, borderRadius: 8,
          background: analysis.book_worthy ? "rgba(45,138,78,0.06)" : "rgba(212,106,67,0.06)",
          border: `1px solid ${analysis.book_worthy ? "rgba(45,138,78,0.15)" : "rgba(212,106,67,0.15)"}`,
        }}>
          <div style={{ color: analysis.book_worthy ? "#2d8a4e" : "#d46a43", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>EDITOR'S VERDICT</div>
          <div style={{ color: "#bbb", fontSize: 13, lineHeight: 1.6 }}>{analysis.book_verdict}</div>
        </div>
      )}

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto" }}>
        {[
          { key: "edits", label: "Lightroom Edits" },
          { key: "critique", label: "Critique" },
          { key: "submit", label: "Where to Submit" },
          { key: "style", label: "Style Match" },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveSection(t.key)} style={{
            padding: "7px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: activeSection === t.key ? "rgba(212,168,67,0.12)" : "transparent",
            color: activeSection === t.key ? "#d4a843" : "#666",
            border: "none", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", flexShrink: 0,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Lightroom Edits */}
      {activeSection === "edits" && (
        <div>
          <div style={{ color: "#d4a843", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 4 }}>LIGHTROOM iOS ADJUSTMENTS</div>
          <div style={{ color: "#777", fontSize: 12, marginBottom: 16 }}>Apply these values in Lightroom Mobile's Light and Color panels.</div>

          {analysis.lightroom?.basic && <>
            <div style={{ color: "#999", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>LIGHT</div>
            {analysis.lightroom.basic.exposure != null && <EditBar label="Exposure" value={analysis.lightroom.basic.exposure} min={-5} max={5} unit=" EV" />}
            {analysis.lightroom.basic.contrast != null && <EditBar label="Contrast" value={analysis.lightroom.basic.contrast} min={-100} max={100} />}
            {analysis.lightroom.basic.highlights != null && <EditBar label="Highlights" value={analysis.lightroom.basic.highlights} min={-100} max={100} />}
            {analysis.lightroom.basic.shadows != null && <EditBar label="Shadows" value={analysis.lightroom.basic.shadows} min={-100} max={100} />}
            {analysis.lightroom.basic.whites != null && <EditBar label="Whites" value={analysis.lightroom.basic.whites} min={-100} max={100} />}
            {analysis.lightroom.basic.blacks != null && <EditBar label="Blacks" value={analysis.lightroom.basic.blacks} min={-100} max={100} />}
          </>}

          {analysis.lightroom?.color && <>
            <div style={{ color: "#999", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8, marginTop: 16 }}>COLOR</div>
            {analysis.lightroom.color.temp != null && <EditBar label="Temperature" value={analysis.lightroom.color.temp} min={-100} max={100} unit="K" />}
            {analysis.lightroom.color.tint != null && <EditBar label="Tint" value={analysis.lightroom.color.tint} min={-100} max={100} />}
            {analysis.lightroom.color.vibrance != null && <EditBar label="Vibrance" value={analysis.lightroom.color.vibrance} min={-100} max={100} />}
            {analysis.lightroom.color.saturation != null && <EditBar label="Saturation" value={analysis.lightroom.color.saturation} min={-100} max={100} />}
          </>}

          {analysis.lightroom?.detail && <>
            <div style={{ color: "#999", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8, marginTop: 16 }}>DETAIL</div>
            {analysis.lightroom.detail.clarity != null && <EditBar label="Clarity" value={analysis.lightroom.detail.clarity} min={-100} max={100} />}
            {analysis.lightroom.detail.dehaze != null && <EditBar label="Dehaze" value={analysis.lightroom.detail.dehaze} min={-100} max={100} />}
            {analysis.lightroom.detail.sharpening != null && <EditBar label="Sharpening" value={analysis.lightroom.detail.sharpening} min={0} max={150} />}
            {analysis.lightroom.detail.noise_reduction != null && <EditBar label="Noise Reduction" value={analysis.lightroom.detail.noise_reduction} min={0} max={100} />}
          </>}

          {analysis.lightroom?.tone_curve && (
            <div style={{ marginTop: 16 }}>
              <div style={{ color: "#999", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>TONE CURVE NOTES</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6, padding: "10px 14px", background: "rgba(0,0,0,0.2)", borderRadius: 6 }}>{analysis.lightroom.tone_curve}</div>
            </div>
          )}

          {analysis.lightroom?.crop && (
            <div style={{ marginTop: 16 }}>
              <div style={{ color: "#999", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>CROP SUGGESTION</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6 }}>{analysis.lightroom.crop}</div>
            </div>
          )}

          {analysis.lightroom?.bw_conversion && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "#999", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>B&W CONVERSION?</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6 }}>{analysis.lightroom.bw_conversion}</div>
            </div>
          )}
        </div>
      )}

      {/* Critique */}
      {activeSection === "critique" && (
        <div>
          <div style={{ color: "#d4a843", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 12 }}>FULL CRITIQUE</div>
          {analysis.critique?.strengths && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: "#2d8a4e", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>STRENGTHS</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7 }}>{analysis.critique.strengths}</div>
            </div>
          )}
          {analysis.critique?.weaknesses && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: "#d46a43", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>AREAS FOR IMPROVEMENT</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7 }}>{analysis.critique.weaknesses}</div>
            </div>
          )}
          {analysis.critique?.composition && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: "#4a90d9", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>COMPOSITION ANALYSIS</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7 }}>{analysis.critique.composition}</div>
            </div>
          )}
          {analysis.critique?.light && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: "#e8c557", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>LIGHT & EXPOSURE</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7 }}>{analysis.critique.light}</div>
            </div>
          )}
          {analysis.critique?.thesis_relevance && (
            <div style={{ padding: "10px 14px", background: "rgba(120,80,160,0.1)", borderRadius: 6, border: "1px solid rgba(120,80,160,0.2)" }}>
              <div style={{ color: "#a87ed8", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>THESIS: INTERIORITY</div>
              <div style={{ color: "#bbb", fontSize: 13, lineHeight: 1.7 }}>{analysis.critique.thesis_relevance}</div>
            </div>
          )}
        </div>
      )}

      {/* Where to Submit */}
      {activeSection === "submit" && (
        <div>
          <div style={{ color: "#d4a843", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 12 }}>SUBMISSION RECOMMENDATIONS</div>
          {analysis.submissions?.map((s, i) => <SubmissionCard key={i} target={s} />)}
          {(!analysis.submissions?.length) && <div style={{ color: "#555", fontSize: 13, textAlign: "center", padding: 20 }}>No submission targets generated.</div>}
        </div>
      )}

      {/* Style Match */}
      {activeSection === "style" && (
        <div>
          <div style={{ color: "#d4a843", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 12 }}>STYLE ANALYSIS</div>
          {analysis.style_match && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: "#a87ed8", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>REMINDS ME OF</div>
              <div style={{ color: "#e8e0d4", fontSize: 16, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 4 }}>{analysis.style_match.photographer}</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7 }}>{analysis.style_match.comparison}</div>
            </div>
          )}
          {analysis.style_match?.push_further && (
            <div>
              <div style={{ color: "#4a9", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>TO PUSH FURTHER</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7 }}>{analysis.style_match.push_further}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Book Sequencing View ──
function BookSequencer({ photos, analyses, projects, photoProjects, activeProject, setActiveProject }) {
  const projectPhotos = activeProject && activeProject !== "all" && activeProject !== "unassigned"
    ? photos.filter(p => photoProjects[p.id] === activeProject).map(p => p.id)
    : null;

  const projectAnalyses = Object.entries(analyses)
    .filter(([id, a]) => a?.sequence_position != null)
    .filter(([id]) => !projectPhotos || projectPhotos.includes(id));

  const included = projectAnalyses
    .filter(([id, a]) => a.book_worthy !== false)
    .map(([id, a]) => a)
    .sort((a, b) => a.sequence_position - b.sequence_position);

  const cut = projectAnalyses
    .filter(([id, a]) => a.book_worthy === false)
    .map(([id, a]) => a);

  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{ color: "#d4a843", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 4 }}>BOOK SEQUENCE</div>
      <div style={{ color: "#777", fontSize: 12, lineHeight: 1.5, marginBottom: 16 }}>Select a project. Only photos that pass editorial review are included. Cut photos are shown separately with reasons.</div>

      {/* Project selector */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {projects.map(proj => {
          const projIds = photos.filter(p => photoProjects[p.id] === proj.id).map(p => p.id);
          const total = Object.entries(analyses).filter(([id, a]) => a && projIds.includes(id)).length;
          const worthy = Object.entries(analyses).filter(([id, a]) => a && projIds.includes(id) && a.book_worthy !== false).length;
          return (
            <button key={proj.id} onClick={() => setActiveProject(proj.id)} style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: activeProject === proj.id ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.03)",
              color: activeProject === proj.id ? "#d4a843" : "#666",
              border: `1px solid ${activeProject === proj.id ? "rgba(212,168,67,0.3)" : "rgba(255,255,255,0.06)"}`,
              fontFamily: "'DM Sans', sans-serif",
            }}>{proj.name} ({worthy}/{total})</button>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 20px" }}>
          <div style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>Create a project in the Portfolio tab first, then assign photos to it.</div>
        </div>
      )}

      {projects.length > 0 && !projectPhotos && (
        <div style={{ textAlign: "center", padding: "30px 20px" }}>
          <div style={{ color: "#555", fontSize: 14 }}>Select a project above to see its book sequence.</div>
        </div>
      )}

      {projectPhotos && included.length === 0 && cut.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 20px" }}>
          <div style={{ color: "#555", fontSize: 14 }}>Add and analyze photos in this project to see the book edit.</div>
        </div>
      )}

      {/* Included photos */}
      {included.length > 0 && (
        <>
          <div style={{ color: "#2d8a4e", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 12 }}>INCLUDED ({included.length} photos)</div>
          {included.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
              <div style={{ width: 32, textAlign: "center", flexShrink: 0 }}>
                <div style={{ color: "#d4a843", fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>{i + 1}</div>
                {i < included.length - 1 && <div style={{ width: 1, height: 40, background: "rgba(212,168,67,0.2)", margin: "4px auto 0" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <img src={a.imageUrl} style={{ width: "100%", maxWidth: 200, height: 100, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(45,138,78,0.3)", marginBottom: 6 }} />
                <div style={{ color: "#e8e0d4", fontSize: 14, fontFamily: "'Playfair Display', Georgia, serif" }}>{a.title}</div>
                {a.sequence_note && <div style={{ color: "#888", fontSize: 12, marginTop: 2, lineHeight: 1.5, fontStyle: "italic" }}>{a.sequence_note}</div>}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Cut photos */}
      {cut.length > 0 && (
        <>
          <div style={{ marginTop: 24, color: "#d46a43", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 12 }}>CUT ({cut.length} photos)</div>
          <div style={{ color: "#666", fontSize: 12, marginBottom: 12 }}>These photos did not make the edit. Review the verdicts to understand why.</div>
          {cut.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start", opacity: 0.6 }}>
              <div style={{ width: 32, textAlign: "center", flexShrink: 0 }}>
                <div style={{ color: "#d46a43", fontSize: 16, fontWeight: 700 }}>{"\u2715"}</div>
              </div>
              <div style={{ flex: 1 }}>
                <img src={a.imageUrl} style={{ width: "100%", maxWidth: 200, height: 100, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(212,106,67,0.3)", marginBottom: 6 }} />
                <div style={{ color: "#e8e0d4", fontSize: 14, fontFamily: "'Playfair Display', Georgia, serif" }}>{a.title}</div>
                {a.book_verdict && <div style={{ color: "#d46a43", fontSize: 12, marginTop: 2, lineHeight: 1.5, fontStyle: "italic" }}>{a.book_verdict}</div>}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── Main App ──
export default function PhotoCritiqueApp() {
  const [photos, setPhotos] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [activeView, setActiveView] = useState("portfolio");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(null);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [photoProjects, setPhotoProjects] = useState({});
  const [activeProject, setActiveProject] = useState("all");
  const [newProjectName, setNewProjectName] = useState("");
  const [showProjectMenu, setShowProjectMenu] = useState(null);
  const fileInputRef = useRef(null);

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const id = `proj-${Date.now()}`;
    setProjects(prev => [...prev, { id, name: newProjectName.trim() }]);
    setNewProjectName("");
  };

  const removeProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setPhotoProjects(prev => {
      const next = {};
      Object.entries(prev).forEach(([photoId, projId]) => { if (projId !== id) next[photoId] = projId; });
      return next;
    });
    if (activeProject === id) setActiveProject("all");
  };

  const assignPhoto = (photoId, projectId) => {
    setPhotoProjects(prev => {
      if (projectId === "none") { const next = { ...prev }; delete next[photoId]; return next; }
      return { ...prev, [photoId]: projectId };
    });
    setShowProjectMenu(null);
  };

  const filteredPhotos = activeProject === "all" ? photos
    : activeProject === "unassigned" ? photos.filter(p => !photoProjects[p.id])
    : photos.filter(p => photoProjects[p.id] === activeProject);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const compressed = await compressImage(file);
      const id = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setPhotos(prev => [...prev, { id, file: file.name, ...compressed }]);
    }
    e.target.value = "";
  };

  const analyzePhoto = async (photo) => {
    setAnalyzing(photo.id);
    setError("");

    const photoProjectId = photoProjects[photo.id];
    const existingAnalyses = Object.entries(analyses)
      .filter(([id, a]) => a && photoProjectId && photoProjects[id] === photoProjectId)
      .map(([id, a]) => a);
    const projectName = projects.find(p => p.id === photoProjectId)?.name || "Untitled";
    const portfolioContext = existingAnalyses.length > 0
      ? `\n\nBOOK/PROJECT: "${projectName}". This project has ${existingAnalyses.length} other photos. Titles: ${existingAnalyses.map(a => a.title).join(", ")}. Consider how this new image fits with or contrasts the existing body of work for book sequencing (position ${existingAnalyses.length + 1} in the sequence).`
      : `\n\nBOOK/PROJECT: "${projectName}". This is the first photo in this project. Assign sequence_position: 1.`;

    const prompt = `You are a world-class photography critic, Lightroom expert, and gallery curator. Analyze this photograph.

PHOTOGRAPHER'S THESIS: "Interiority" — solitary humans in monumental/architectural spaces. Urban life, architecture, street culture.${portfolioContext}

Respond with ONLY a JSON object:

{
  "title": "A poetic title for this image",
  "one_line": "One-sentence summary of the image",
  "grade": "A+/A/A-/B+/B/B-/C+/C/C-/D/F",
  "lightroom": {
    "basic": {
      "exposure": 0.5,
      "contrast": 15,
      "highlights": -30,
      "shadows": 25,
      "whites": 10,
      "blacks": -5
    },
    "color": {
      "temp": -5,
      "tint": 0,
      "vibrance": 10,
      "saturation": -5
    },
    "detail": {
      "clarity": 15,
      "dehaze": 5,
      "sharpening": 40,
      "noise_reduction": 10
    },
    "tone_curve": "Lift the blacks slightly for a matte look. Add gentle S-curve for contrast.",
    "crop": "Crop suggestion or 'No crop needed'",
    "bw_conversion": "Would this image benefit from B&W? If yes, specify which B&W mix (red filter, orange filter, etc.)"
  },
  "critique": {
    "strengths": "What works well — composition, light, timing, emotion",
    "weaknesses": "What could be improved — be specific and constructive",
    "composition": "Detailed composition analysis — rule of thirds, leading lines, visual weight, framing",
    "light": "Light quality, direction, exposure analysis",
    "thesis_relevance": "How does this image relate to the interiority thesis? Does it capture solitary figures in architecture?"
  },
  "submissions": [
    {
      "type": "gallery",
      "name": "Specific Gallery Name",
      "fit_score": 85,
      "why": "Why this image fits this venue",
      "submission_notes": "Practical submission details — deadlines, format requirements"
    }
  ],
  "style_match": {
    "photographer": "Name of photographer this image evokes",
    "comparison": "Specific comparison — which body of work, what qualities match",
    "push_further": "How to develop this style — specific techniques and approaches"
  },
  "sequence_position": 1,
  "sequence_note": "Why this image belongs at this position in a book sequence — what it sets up or resolves",
  "book_worthy": true,
  "book_verdict": "INCLUDE: This image earns its place because... / CUT: This image should be cut because..."
}

Rules:
- Lightroom values must be realistic numbers (exposure: -5 to +5, others: -100 to +100, sharpening: 0-150, noise: 0-100)
- Grade honestly — A+ is reserved for exceptional work
- Suggest 3-5 real submission targets (galleries, museums, publications, stock houses, competitions)
- Submission types: gallery, museum, publication, stock, competition
- fit_score: 0-100 based on how well the image fits that venue
- Be specific in critique — reference specific elements of the actual image
- Style match should reference a real photographer from history
- book_worthy: BE A RUTHLESS EDITOR. Not every photo belongs in a book. Set to true ONLY if the image is strong enough to earn a place. Consider: technical quality (is it sharp, well-exposed?), emotional impact (does it move you?), thesis relevance (does it serve the interiority theme?), redundancy (does it say something another image in the portfolio already says better?), and overall strength (would Robert Frank or Josef Koudelka include this in their edit?). A B- or below should almost never be book_worthy. Grade inflation in book_worthy defeats the purpose.
- book_verdict: Explain the decision clearly — if CUT, say exactly why and what would need to change. If INCLUDE, say what the image contributes that nothing else does.`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: photo.base64 } },
              { type: "text", text: prompt }
            ]
          }],
        }),
      });

      const data = await response.json();
      const text = data.content?.filter(i => i.type === "text").map(i => i.text).join("\n") || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Could not parse analysis.");
      const parsed = JSON.parse(match[0].replace(/```json|```/g, "").trim());
      parsed.imageUrl = photo.dataUrl;
      setAnalyses(prev => ({ ...prev, [photo.id]: parsed }));
      setSelectedPhoto(photo.id);
      setActiveView("analysis");
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    }
    setAnalyzing(null);
  };

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    setAnalyses(prev => { const next = { ...prev }; delete next[id]; return next; });
    if (selectedPhoto === id) { setSelectedPhoto(null); setActiveView("portfolio"); }
  };

  const analyzedCount = Object.keys(analyses).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0f1419", color: "#e0e0e0", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "28px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ color: "#d4a843", fontSize: 10, letterSpacing: "0.25em", fontWeight: 600, marginBottom: 4 }}>PHOTO CRITIQUE STUDIO</div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#f0ebe3", margin: 0 }}>Review & Submit</h1>
          <div style={{ color: "#666", fontSize: 11, marginTop: 4 }}>{photos.length} photo{photos.length !== 1 ? "s" : ""} · {analyzedCount} analyzed · {projects.length} project{projects.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", position: "sticky", top: 0, zIndex: 10, background: "#0f1419" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", gap: 4 }}>
          {[
            { key: "portfolio", label: "Portfolio" },
            { key: "analysis", label: "Analysis" },
            { key: "book", label: "Book Sequence" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveView(t.key)} style={{
              padding: "7px 16px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
              background: activeView === t.key ? "rgba(212,168,67,0.12)" : "transparent",
              color: activeView === t.key ? "#d4a843" : "#666",
              border: "none", fontFamily: "'DM Sans', sans-serif",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Portfolio View */}
        {activeView === "portfolio" && (
          <div style={{ padding: "20px 16px" }}>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: "none" }} />

            <button onClick={() => fileInputRef.current?.click()} style={{
              width: "100%", padding: "20px", background: "rgba(212,168,67,0.06)", border: "2px dashed rgba(212,168,67,0.25)",
              borderRadius: 12, color: "#d4a843", fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", marginBottom: 16,
            }}>
              + Upload Photos
            </button>

            {/* Project management */}
            <div style={{ marginBottom: 20, padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "#d4a843", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 10 }}>PROJECTS / BOOKS</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                <button onClick={() => setActiveProject("all")} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: activeProject === "all" ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.03)", color: activeProject === "all" ? "#d4a843" : "#666", border: `1px solid ${activeProject === "all" ? "rgba(212,168,67,0.3)" : "rgba(255,255,255,0.06)"}`, fontFamily: "'DM Sans', sans-serif" }}>All ({photos.length})</button>
                <button onClick={() => setActiveProject("unassigned")} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: activeProject === "unassigned" ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.03)", color: activeProject === "unassigned" ? "#d4a843" : "#666", border: `1px solid ${activeProject === "unassigned" ? "rgba(212,168,67,0.3)" : "rgba(255,255,255,0.06)"}`, fontFamily: "'DM Sans', sans-serif" }}>Unassigned ({photos.filter(p => !photoProjects[p.id]).length})</button>
                {projects.map(proj => {
                  const count = photos.filter(p => photoProjects[p.id] === proj.id).length;
                  return (
                    <div key={proj.id} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                      <button onClick={() => setActiveProject(proj.id)} style={{ padding: "5px 12px", borderRadius: "6px 0 0 6px", fontSize: 11, fontWeight: 600, cursor: "pointer", background: activeProject === proj.id ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.03)", color: activeProject === proj.id ? "#d4a843" : "#666", border: `1px solid ${activeProject === proj.id ? "rgba(212,168,67,0.3)" : "rgba(255,255,255,0.06)"}`, fontFamily: "'DM Sans', sans-serif" }}>{proj.name} ({count})</button>
                      <button onClick={() => removeProject(proj.id)} style={{ padding: "5px 8px", borderRadius: "0 6px 6px 0", fontSize: 10, cursor: "pointer", background: "rgba(255,255,255,0.03)", color: "#555", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "none", fontFamily: "'DM Sans', sans-serif" }}>{"\u2715"}</button>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} onKeyDown={e => e.key === "Enter" && addProject()} placeholder="New project name..." style={{ flex: 1, padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "#e0e0e0", fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
                <button onClick={addProject} style={{ padding: "8px 14px", background: "rgba(212,168,67,0.12)", border: "1px solid rgba(212,168,67,0.25)", borderRadius: 6, color: "#d4a843", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ ADD</button>
              </div>
            </div>

            {error && <div style={{ color: "#e86840", fontSize: 13, marginBottom: 16, padding: "10px 14px", background: "rgba(232,104,64,0.1)", borderRadius: 8 }}>{error}</div>}

            {filteredPhotos.length === 0 && photos.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{"\uD83D\uDCF7"}</div>
                <div style={{ color: "#777", fontSize: 14, lineHeight: 1.6 }}>Upload your photos to get Lightroom edit suggestions, grading, submission recommendations, and book sequencing.</div>
              </div>
            )}

            {filteredPhotos.length === 0 && photos.length > 0 && (
              <div style={{ textAlign: "center", padding: "30px 20px" }}>
                <div style={{ color: "#555", fontSize: 14 }}>No photos in this project yet. Assign photos using the folder icon on each thumbnail.</div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {filteredPhotos.map(p => {
                const proj = projects.find(pr => pr.id === photoProjects[p.id]);
                return (
                <div key={p.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
                  <img src={p.dataUrl} onClick={() => {
                    if (analyses[p.id]) { setSelectedPhoto(p.id); setActiveView("analysis"); }
                    else analyzePhoto(p);
                  }} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />

                  {analyzing === p.id && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(15,20,25,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 28, height: 28, border: "2px solid rgba(212,168,67,0.3)", borderTop: "2px solid #d4a843", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    </div>
                  )}

                  {analyses[p.id] && (
                    <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4, alignItems: "center" }}>
                      {analyses[p.id].book_worthy != null && (
                        <div style={{ padding: "2px 5px", background: "rgba(15,20,25,0.8)", borderRadius: 4, fontSize: 9, fontWeight: 700, color: analyses[p.id].book_worthy ? "#2d8a4e" : "#d46a43" }}>
                          {analyses[p.id].book_worthy ? "IN" : "CUT"}
                        </div>
                      )}
                      <div style={{ padding: "2px 6px", background: "rgba(15,20,25,0.8)", borderRadius: 4, fontSize: 12, fontWeight: 800, color: "#2d8a4e", fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {analyses[p.id].grade}
                      </div>
                    </div>
                  )}

                  <button onClick={(e) => { e.stopPropagation(); removePhoto(p.id); }} style={{
                    position: "absolute", top: 6, left: 6, width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(15,20,25,0.7)", border: "none", color: "#888", fontSize: 12,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{"\u2715"}</button>

                  {/* Project assign button */}
                  {projects.length > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); setShowProjectMenu(showProjectMenu === p.id ? null : p.id); }} style={{
                      position: "absolute", top: 6, left: 32, width: 22, height: 22, borderRadius: "50%",
                      background: proj ? "rgba(212,168,67,0.6)" : "rgba(15,20,25,0.7)",
                      border: "none", color: proj ? "#0f1419" : "#888", fontSize: 11,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{"\uD83D\uDCC1"}</button>
                  )}

                  {/* Project dropdown */}
                  {showProjectMenu === p.id && (
                    <div style={{ position: "absolute", top: 32, left: 6, background: "#1a2030", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, overflow: "hidden", zIndex: 20, minWidth: 130 }}>
                      <button onClick={(e) => { e.stopPropagation(); assignPhoto(p.id, "none"); }} style={{ display: "block", width: "100%", padding: "8px 12px", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#888", fontSize: 11, textAlign: "left", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>No project</button>
                      {projects.map(pr => (
                        <button key={pr.id} onClick={(e) => { e.stopPropagation(); assignPhoto(p.id, pr.id); }} style={{ display: "block", width: "100%", padding: "8px 12px", background: photoProjects[p.id] === pr.id ? "rgba(212,168,67,0.1)" : "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", color: photoProjects[p.id] === pr.id ? "#d4a843" : "#ccc", fontSize: 11, textAlign: "left", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                          {photoProjects[p.id] === pr.id ? "\u2713 " : ""}{pr.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "4px 8px", background: "linear-gradient(transparent, rgba(15,20,25,0.9))" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ color: analyses[p.id] ? "#d4a843" : "#888", fontSize: 10, fontWeight: 600 }}>
                        {analyzing === p.id ? "Analyzing\u2026" : analyses[p.id] ? "Tap to view" : "Tap to analyze"}
                      </div>
                      {proj && <div style={{ color: "#d4a843", fontSize: 9, fontWeight: 600, padding: "1px 5px", background: "rgba(212,168,67,0.15)", borderRadius: 3 }}>{proj.name}</div>}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        )}

        {/* Analysis View */}
        {activeView === "analysis" && selectedPhoto && analyses[selectedPhoto] && (
          <PhotoAnalysis
            analysis={analyses[selectedPhoto]}
            imageUrl={photos.find(p => p.id === selectedPhoto)?.dataUrl}
            onBack={() => setActiveView("portfolio")}
          />
        )}

        {activeView === "analysis" && !selectedPhoto && (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{ color: "#555", fontSize: 14 }}>Select a photo from your portfolio to see its analysis.</div>
            <button onClick={() => setActiveView("portfolio")} style={{ marginTop: 12, padding: "8px 20px", background: "#d4a843", color: "#0f1419", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Go to Portfolio</button>
          </div>
        )}

        {/* Book Sequence View */}
        {activeView === "book" && (
          <BookSequencer photos={photos} analyses={analyses} projects={projects} photoProjects={photoProjects} activeProject={activeProject} setActiveProject={setActiveProject} />
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ textAlign: "center", padding: "20px 16px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ color: "#444", fontSize: 10, fontStyle: "italic" }}>"To photograph is to appropriate the thing photographed." {"\u2014"} Susan Sontag</div>
      </div>
    </div>
  );
}
