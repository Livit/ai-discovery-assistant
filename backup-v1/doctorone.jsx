// doctorone.jsx — AI Content Discovery panel
// Implements the Figma "AI Assistant Option One" flow:
//   landing → (one of three flows) → loading → results
//
// Flows:
//   prepare  — text-conversation, multi-turn, ends in Strong + Partial match results
//   add      — pick a course from a list, then results with "Already in Course" mixed in
//   syllabus — drop a PDF (or skip), then results grouped by syllabus topic

const { useState: useDS, useEffect: useDE, useRef: useDR } = React;
const IDr = window.LPIcon;

// ─────────────────────────────────────────────────────────────
// SPARKLES (display ornament above title)
// ─────────────────────────────────────────────────────────────
function HeroSparkles({ size = 36 }) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} fill="#0B2240" aria-hidden="true" style={{ width: "39px", height: "38px", fill: "rgb(0, 111, 204)" }}>
      <path d="M14 6l1.8 4.6L20.4 12l-4.6 1.4L14 18l-1.8-4.6L7.6 12l4.6-1.4L14 6z" />
      <path d="M25 14l1.2 3 3 1.2-3 1.2L25 22.4l-1.2-3-3-1.2 3-1.2L25 14z" />
      <path d="M21.5 23l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3z" />
    </svg>);

}

// ─────────────────────────────────────────────────────────────
// COMPOSER — text input with send button
// ─────────────────────────────────────────────────────────────
function Composer({ value, setValue, onSend, placeholder, disabled }) {
  const ref = useDR(null);
  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }
  function submit() {
    const v = (value || "").trim();
    if (!v || disabled) return;
    onSend(v);
    setValue("");
    if (ref.current) {ref.current.style.height = "auto";}
  }
  function onChange(e) {
    setValue(e.target.value);
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 200) + "px";
    }
  }
  return (
    <div className={`ai-composer ${disabled ? "is-disabled" : ""}`}>
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onKeyDown={handleKey}
        placeholder={placeholder || "Type here..."}
        rows={3}
        disabled={disabled} />
      <button
        className="ai-send"
        onClick={submit}
        disabled={disabled || !(value || "").trim()}
        aria-label="Send">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22 11 13 2 9z" />
        </svg>
      </button>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// PROMPT BUTTONS — three starters under the input
// ─────────────────────────────────────────────────────────────
function PromptButtons({ onPick }) {
  const items = [
  { id: "prepare", label: "Prepare my next Course", icon: "book-open" },
  { id: "add", label: "Add new content to my Course", icon: "circle-plus" },
  { id: "syllabus", label: "Map my syllabus", icon: "share-2" }];

  return (
    <div className="ai-prompts">
      {items.map((it) =>
      <button key={it.id} className="ai-prompt-btn" onClick={() => onPick(it.id)}>
          <span className="ai-prompt-ico"><IDr name={it.icon} /></span>
          <span>{it.label}</span>
        </button>
      )}
    </div>);

}

// ─────────────────────────────────────────────────────────────
// START CARDS — two entry points per "AI page v2"
//   Describe what I am teaching  →  typed conversation
//   Upload Syllabus              →  syllabus mapping journey
// ─────────────────────────────────────────────────────────────
function StartCards({ onPick }) {
  const items = [
  { id: "prepare", label: "Describe what I am teaching", icon: "message-square-text" },
  { id: "syllabus", label: "Upload Syllabus", icon: "file-up" }];

  return (
    <div className="ai-start">
      <p className="ai-start-q">How would you like to start?</p>
      <div className="ai-start-cards">
        {items.map((it) =>
        <button key={it.id} className="ai-start-card" onClick={() => onPick(it.id)}>
            <span className="ai-start-card-ico"><IDr name={it.icon} /></span>
            <span className="ai-start-card-label">{it.label}</span>
          </button>
        )}
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// CHAT BUBBLES
// ─────────────────────────────────────────────────────────────
function AIBubble({ children }) {
  return <div className="ai-msg ai-msg--bot">{children}</div>;
}
function UserBubble({ children }) {
  return <div className="ai-msg ai-msg--user">{children}</div>;
}

// ─────────────────────────────────────────────────────────────
// LOADING — small inline dot spinner per Figma
// ─────────────────────────────────────────────────────────────
function InlineSpinner() {
  return (
    <div className="ai-spinner" role="status" aria-label="Loading">
      {Array.from({ length: 12 }).map((_, i) =>
      <span key={i} style={{ transform: `rotate(${i * 30}deg)` }} />
      )}
    </div>);

}

// ─────────────────────────────────────────────────────────────
// SIM CARD — matches Figma "Simulation card — Catalog (List)"
//   thumbnail │ title + desc + meta │ CTA
// ─────────────────────────────────────────────────────────────
function SimImageThumb({ seed = 0 }) {
  // Stylized "lab screenshot" placeholder — no real images available.
  const hues = ["#7FB3D5", "#A2C7DB", "#88C5C4", "#A8C9D0"];
  const counter = ["#FAFAF0", "#F0EBE0", "#EDE6D3", "#F4EEDE"];
  const c1 = hues[seed % hues.length];
  const c2 = counter[seed % counter.length];
  return (
    <div className="ai-sim-thumb" aria-hidden="true">
      <svg viewBox="0 0 160 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {/* sky */}
        <rect x="0" y="0" width="160" height="55" fill={c1} />
        {/* counter */}
        <rect x="0" y="55" width="160" height="45" fill={c2} />
        {/* skyline silhouettes */}
        <rect x="6" y="32" width="14" height="23" fill="rgba(255,255,255,0.45)" />
        <rect x="24" y="26" width="10" height="29" fill="rgba(255,255,255,0.55)" />
        <rect x="38" y="36" width="18" height="19" fill="rgba(255,255,255,0.40)" />
        <rect x="60" y="28" width="12" height="27" fill="rgba(255,255,255,0.50)" />
        <rect x="76" y="34" width="22" height="21" fill="rgba(255,255,255,0.45)" />
        <rect x="102" y="30" width="10" height="25" fill="rgba(255,255,255,0.55)" />
        <rect x="116" y="36" width="18" height="19" fill="rgba(255,255,255,0.40)" />
        <rect x="138" y="32" width="14" height="23" fill="rgba(255,255,255,0.50)" />
        {/* equipment on counter */}
        <rect x="14" y="62" width="34" height="22" rx="3" fill="#1F2A44" opacity="0.85" />
        <rect x="20" y="68" width="22" height="10" rx="1" fill="#E7F4FF" />
        <circle cx="92" cy="76" r="12" fill="#C9CCD3" />
        <circle cx="92" cy="76" r="6" fill="#8B919B" />
        <rect x="120" y="60" width="26" height="26" rx="3" fill="#E0D7B9" />
        <rect x="124" y="64" width="18" height="3" fill="#A48A4A" />
        <rect x="124" y="69" width="14" height="3" fill="#A48A4A" />
        {/* hand */}
        <path d="M-2 100 C 30 78 60 86 80 100 Z" fill="#E8B695" />
      </svg>
    </div>);

}

function shortLevel(l) {
  if (!l) return "";
  const map = { "High School": "High School", "Higher Education": "Higher Ed", "Professional": "Professional", "Middle School": "Middle School" };
  return l.split(",").map((x) => map[x.trim()] || x.trim()).filter(Boolean).join(" · ");
}

function MetaBar({ sim }) {
  // Real catalog metadata when available; skeleton otherwise (scripted add/syllabus flows).
  return (
    <div className="ai-sim-meta">
      <span className="ai-sim-pill">{(sim && (sim.code || sim.id)) || "SIM"}</span>
      {sim && sim.level ?
      <span className="ai-sim-metatext">{shortLevel(sim.level)}</span> :
      <span className="ai-sim-skel" style={{ width: 88 }}></span>}
      <span className="ai-sim-icons">
        <IDr name="monitor" />
        <IDr name="chrome" />
        <IDr name="apple" />
      </span>
      {sim && sim.duration ?
      <span className="ai-sim-metatext">{sim.duration}</span> :
      <span className="ai-sim-skel" style={{ width: 124 }}></span>}
    </div>);

}

function SimCard({ sim, state, onToggle, seed }) {
  // state: "add" | "added" | "in-course"
  return (
    <article className="ai-sim-card">
      <SimImageThumb seed={seed || 0} />
      <div className="ai-sim-body">
        <h4 className="ai-sim-title">{sim.title}</h4>
        <p className="ai-sim-desc">{sim.description}</p>
        <MetaBar sim={sim} />
      </div>
      <div className="ai-sim-cta">
        <button
          className={`ai-sim-btn ai-sim-btn--${state}`}
          onClick={() => state !== "in-course" && onToggle && onToggle()}
          disabled={state === "in-course"}>
          {state === "in-course" && "Already in Course"}
          {state === "added" && <><IDr name="check" /> Added</>}
          {state === "add" && "Add simulation"}
        </button>
      </div>
    </article>);

}

// ─────────────────────────────────────────────────────────────
// AI WARNING BANNER (top of every results page)
// ─────────────────────────────────────────────────────────────
function AIWarning() {
  return (
    <div className="ai-warning-banner">
      <span className="ai-warning-ico">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#D08800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>
      <span>Recommendations generated by AI. Please review before use</span>
    </div>);

}

// Thumbs feedback (bottom-right of each group)
function ThumbsFeedback() {
  const [v, setV] = useDS(null);
  return (
    <div className="ai-thumbs">
      <button
        className={`ai-thumb ${v === "up" ? "is-on" : ""}`}
        onClick={() => setV("up")}
        aria-label="Good recommendations">
        <IDr name="thumbs-up" />
      </button>
      <button
        className={`ai-thumb ${v === "down" ? "is-on" : ""}`}
        onClick={() => setV("down")}
        aria-label="Bad recommendations">
        <IDr name="thumbs-down" />
      </button>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// RESULT SECTIONS
// ─────────────────────────────────────────────────────────────
function MatchPill({ tone, label }) {
  return <span className={`ai-match-pill ai-match-pill--${tone}`}>{label}</span>;
}

function ResultGroup({ header, sims, getState, onAddAll, onToggle, baseSeed = 0 }) {
  return (
    <div className="ai-result-group">
      <div className="ai-result-group-head">
        {header}
        {onAddAll &&
        <button className="ai-primary-btn" onClick={onAddAll}>Add all simulations</button>
        }
      </div>
      <div className="ai-sim-list">
        {sims.map((sim, i) =>
        <SimCard
          key={sim.id}
          sim={sim}
          seed={baseSeed + i}
          state={getState ? getState(sim) : "add"}
          onToggle={() => onToggle && onToggle(sim.id)} />
        )}
      </div>
      <ThumbsFeedback />
    </div>);

}

// ─────────────────────────────────────────────────────────────
// COURSE PICKER (Flow "Add new content")
// Per Figma — clickable list-style options, one per line, right-aligned
// ─────────────────────────────────────────────────────────────
function CoursePicker({ courses, onPick }) {
  return (
    <div className="ai-course-picker">
      {courses.map((c) =>
      <button key={c.id} className="ai-course-row" onClick={() => onPick(c)}>
          <span className="ai-course-row-label">{c.title}</span>
        </button>
      )}
    </div>);

}

// ─────────────────────────────────────────────────────────────
// SYLLABUS UPLOAD CARD (Flow "Map my syllabus")
// ─────────────────────────────────────────────────────────────
function SyllabusUpload({ onSubmit }) {
  const [filename, setFilename] = useDS(null);
  function pickFile() {setFilename("BIO_150_Cell_Biology_Syllabus.pdf");}
  return (
    <div className="ai-upload-card">
      {!filename ?
      <div className="ai-dropzone" onClick={pickFile}>
          <div className="ai-dropzone-ico">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 22 V6" />
              <path d="M9 13 l7 -7 l7 7" />
              <path d="M5 26 H27" />
            </svg>
          </div>
          <div className="ai-dropzone-title">Drag and drop your PDF here</div>
          <div className="ai-dropzone-or">or</div>
          <button className="ai-browse-btn" onClick={(e) => {e.stopPropagation();pickFile();}}>Browse file</button>
        </div> :

      <div className="ai-dropzone is-loaded" onClick={(e) => e.stopPropagation()}>
          <div className="ai-dropzone-ico is-loaded"><IDr name="file-text" /></div>
          <div className="ai-dropzone-title">{filename}</div>
          <div className="ai-dropzone-or">PDF · 4 pages · 218 KB</div>
          <button className="ai-browse-btn" onClick={() => setFilename(null)}>Replace file</button>
        </div>
      }
      {filename &&
      <div className="ai-file-success">
          <span className="ai-file-success-ico">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0E7A56" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <span>File loaded successfully</span>
        </div>
      }
      <button
        className="ai-primary-btn ai-primary-btn--block"
        onClick={() => onSubmit(filename || "syllabus.pdf")}
        disabled={!filename}>
        Get recommendations
      </button>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// DOWNLOAD DROPDOWN (syllabus results header)
// ─────────────────────────────────────────────────────────────
function DownloadButton() {
  return (
    <button className="ai-secondary-btn">
      Download <IDr name="chevron-down" />
    </button>);

}

// ─────────────────────────────────────────────────────────────
// AI RECOMMENDATIONS — Strong + Partial tiers from a live AI turn
//   Each item is { sim (catalog record), reason (one-line why) }
// ─────────────────────────────────────────────────────────────
function AIRecs({ intro, strong, partial, addedSims, setAddedSims, onToggle }) {
  const card = (it) => ({
    id: it.sim.c, code: it.sim.c, title: it.sim.n,
    description: it.reason, level: it.sim.l, duration: it.sim.t, discipline: it.sim.s
  });
  const strongCards = (strong || []).map(card);
  const partialCards = (partial || []).map(card);
  const getState = (sim) => addedSims.has(sim.id) ? "added" : "add";
  const addAll = (cards) => setAddedSims((prev) => {
    const n = new Set(prev);
    cards.forEach((c) => n.add(c.id));
    return n;
  });
  const empty = strongCards.length === 0 && partialCards.length === 0;
  return (
    <div className="ai-results">
      <AIWarning />
      {intro && <p className="ai-recs-intro">{intro}</p>}
      {strongCards.length > 0 &&
      <ResultGroup
        header={<MatchPill tone="strong" label="Strong match" />}
        sims={strongCards}
        getState={getState}
        onAddAll={() => addAll(strongCards)}
        onToggle={onToggle}
        baseSeed={0} />
      }
      {partialCards.length > 0 &&
      <ResultGroup
        header={<MatchPill tone="partial" label="Partial match" />}
        sims={partialCards}
        getState={getState}
        onAddAll={() => addAll(partialCards)}
        onToggle={onToggle}
        baseSeed={strongCards.length} />
      }
      {empty &&
      <p className="ai-recs-intro">No simulations cleared the match threshold. Try broadening or refining your description.</p>
      }
    </div>);

}

// ─────────────────────────────────────────────────────────────
// MAIN PANEL
// ─────────────────────────────────────────────────────────────
function DoctorOnePanel({ onClose }) {
  const { DRONE_COURSES, DRONE_SIM_POOL, DRONE_PREPARE_RECS, DRONE_ADD_TO_COURSE } = window.DR_ONE_DATA;
  const { SYLLABUS_COURSE } = window.AI_CATALOG_DATA;

  const [stage, setStage] = useDS("idle");
  // stage values:
  //  idle
  //  prepare  — live AI "Describe what I am teaching" conversation
  //  add-pick → add-loading → add-results
  //  syllabus-upload → syllabus-loading → syllabus-results
  const [input, setInput] = useDS("");
  const [messages, setMessages] = useDS([]);
  const [selectedCourse, setSelectedCourse] = useDS(null);
  const [addedSims, setAddedSims] = useDS(() => new Set());
  const threadRef = useDR(null);

  // ── Live-AI state for the Describe flow ──────────────────────
  // aiThread = display items: { kind:"bot"|"user", text } | { kind:"recs", intro, strong, partial }
  // aiApiRef = role/content history sent to the model (excludes the UI greeting)
  const [aiThread, setAiThread] = useDS([]);
  const [aiBusy, setAiBusy] = useDS(false);
  const aiApiRef = useDR([]);

  useDE(() => {if (window.lucide) window.lucide.createIcons();});
  useDE(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, stage, aiThread, aiBusy]);

  function pushMsg(m) {setMessages((prev) => [...prev, m]);}
  function toggleAdded(id) {
    setAddedSims((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);else n.add(id);
      return n;
    });
  }
  function resetAll() {
    setStage("idle");
    setMessages([]);
    setInput("");
    setSelectedCourse(null);
    setAddedSims(new Set());
    setAiThread([]);
    setAiBusy(false);
    aiApiRef.current = [];
  }

  // ── Start one of the flows from the start cards ──
  function startPrepare() {
    aiApiRef.current = [];
    setAiThread([{ kind: "bot", text: "Describe what you're teaching — include the course or discipline, education level, key topics, or learning objectives." }]);
    setAiBusy(false);
    setInput("");
    setStage("prepare");
  }
  function startSyllabus(opening) {
    setMessages([
    { who: "bot", text: "Drop your course syllabus and we'll match each unit to the Labster simulations that best support your topics and flag any gaps in our Catalog." }]
    );
    if (opening) pushMsg({ who: "user", text: opening });
    setStage("syllabus-upload");
  }

  function onPromptPick(id) {
    if (id === "prepare") startPrepare();
    if (id === "syllabus") startSyllabus();
  }

  // ── Scripted fallback (used when live AI is off or unreachable) ──
  function scriptedRecs() {
    const mk = (r) => {
      const s = DRONE_SIM_POOL[r.sim];
      return s ? { sim: { c: s.id, n: s.title, s: s.discipline, l: s.level, t: s.duration, o: s.description }, reason: r.alignment } : null;
    };
    const all = DRONE_PREPARE_RECS.map(mk).filter(Boolean);
    return { strong: all.slice(0, 4), partial: all.slice(4) };
  }

  // ── Live-AI turn for the Describe flow ──
  async function aiSend(text) {
    const t = (text || "").trim();
    if (!t || aiBusy) return;
    const hist = aiApiRef.current.concat([{ role: "user", content: t }]);
    aiApiRef.current = hist;
    setAiThread((prev) => [...prev, { kind: "user", text: t }]);
    setInput("");
    setAiBusy(true);

    const scripted = window.__LP_DESCRIBE_MODE === "scripted";
    try {
      if (scripted) throw new Error("SCRIPTED_MODE");
      const res = await window.LabsterAI.converse(hist);
      if (res.type === "recommendations") {
        const strong = res.strong
          .map((x) => ({ sim: window.LabsterAI.byCode(x.code), reason: x.reason }))
          .filter((x) => x.sim);
        const partial = res.partial
          .map((x) => ({ sim: window.LabsterAI.byCode(x.code), reason: x.reason }))
          .filter((x) => x.sim && !strong.some((s) => s.sim.c === x.sim.c));
        setAiThread((prev) => [...prev, { kind: "recs", intro: res.intro, strong, partial }]);
        aiApiRef.current = hist.concat([{ role: "assistant",
          content: (res.intro || "Recommendations provided.") +
            " [strong: " + strong.map((s) => s.sim.n).join("; ") +
            " | partial: " + partial.map((s) => s.sim.n).join("; ") + "]" }]);
      } else {
        setAiThread((prev) => [...prev, { kind: "bot", text: res.text }]);
        aiApiRef.current = hist.concat([{ role: "assistant", content: res.text }]);
      }
    } catch (e) {
      // Resilient fallback so the prototype always demonstrates the result UI.
      const fb = scriptedRecs();
      setAiThread((prev) => [
        ...prev,
        ...(scripted ? [] : [{ kind: "bot", text: "(Live AI is unavailable right now — showing a sample recommendation set.)" }]),
        { kind: "recs", intro: "Based on what you described, here's what fits.", strong: fb.strong, partial: fb.partial }
      ]);
    } finally {
      setAiBusy(false);
    }
  }

  function onSend(text) {
    if (stage === "prepare") { aiSend(text); return; }
  }

  // ── Course picked (Add to Course flow) ──
  function onCoursePicked(course) {
    pushMsg({ who: "user", text: course.title });
    setSelectedCourse(course);
    setTimeout(() => {
      pushMsg({ who: "bot", text: `Great. Looking for recommendations for ${course.title}...` });
      setStage("add-loading");
      setTimeout(() => setStage("add-results"), 1800);
    }, 400);
  }

  // ── Syllabus uploaded ──
  function onSyllabusSubmit(filename) {
    pushMsg({ who: "user", text: `Uploaded: ${filename}` });
    setTimeout(() => {
      pushMsg({ who: "bot", text: "Mapping your syllabus to the Labster catalog..." });
      setStage("syllabus-loading");
      setTimeout(() => setStage("syllabus-results"), 2200);
    }, 400);
  }

  const isIdle = stage === "idle";
  const inResults = stage === "add-results" || stage === "syllabus-results";
  const inLoading = stage === "add-loading" || stage === "syllabus-loading";
  const inConversation = stage === "add-pick" || stage === "syllabus-upload";

  return (
    <div className="ai-root" data-screen-label="05 AI Content Discovery">
      {/* Top action row: Back ⇠   New conversation ⇢ */}
      <div className="ai-actionrow">
        <button className="ai-textlink" onClick={onClose}>
          <IDr name="arrow-left" /> Back to Catalog
        </button>
        {!isIdle &&
        <button className="ai-textlink" onClick={resetAll}>
            <IDr name="rotate-cw" /> New Conversation
          </button>
        }
      </div>

      {/* Hero header — sparkles + title + tagline */}
      <div className="ai-hero">
        <HeroSparkles size={32} />
        <h1 style={{ fontSize: "44px" }}>AI Content Discovery</h1>
        <p style={{ fontSize: "22px", fontWeight: "500" }}>Let AI find the right simulations for your Course</p>
      </div>

      {/* CONTENT — light grey region per Figma */}
      <div className="ai-content">

        {/* ── IDLE: "How would you like to start?" + two entry cards ── */}
        {isIdle &&
        <StartCards onPick={onPromptPick} />
        }

        {/* ── DESCRIBE WHAT I AM TEACHING — live AI conversation ── */}
        {stage === "prepare" &&
        <div className="ai-thread" ref={threadRef}>
            {aiThread.map((item, i) => {
            if (item.kind === "user") return <UserBubble key={i}>{item.text}</UserBubble>;
            if (item.kind === "bot") return <AIBubble key={i}>{item.text}</AIBubble>;
            if (item.kind === "recs") return <AIRecs key={i} intro={item.intro} strong={item.strong} partial={item.partial} addedSims={addedSims} setAddedSims={setAddedSims} onToggle={toggleAdded} />;
            return null;
          })}
            {aiBusy &&
          <div className="ai-thread-spinner"><InlineSpinner /></div>
          }
            {!aiBusy &&
          <Composer
            value={input}
            setValue={setInput}
            onSend={onSend}
            placeholder="Type here..." />
          }
          </div>
        }

        {/* ── CONVERSATION / LOADING — scripted chat thread (Syllabus flow) ── */}
        {(inConversation || inLoading) &&
        <div className="ai-thread" ref={threadRef}>
            {messages.map((m, i) =>
          m.who === "bot" ?
          <AIBubble key={i}>{m.text}</AIBubble> :
          <UserBubble key={i}>{m.text}</UserBubble>
          )}

            {/* Inline interactive node — appears under last bot message */}
            {stage === "add-pick" &&
          <CoursePicker courses={window.LP_DATA.MY_COURSES.map((c) => {
            // Map to existing DRONE_ADD_TO_COURSE keys so the recs render.
            const dataKey =
            c.id === "bio-150" ? "c-cellbio" :
            c.id === "chem-101" ? "c-genchem" :
            c.id === "orgo-210" ? "c-anatomy" :
            "c-cellbio";
            return { id: dataKey, title: c.name };
          })} onPick={onCoursePicked} />
          }

            {stage === "syllabus-upload" &&
          <div className="ai-upload-wrap">
                <SyllabusUpload onSubmit={onSyllabusSubmit} />
              </div>
          }

            {inLoading &&
          <div className="ai-thread-spinner"><InlineSpinner /></div>
          }

            {/* Composer at bottom of thread for text turns */}
            {false &&
          <Composer
            value={input}
            setValue={setInput}
            onSend={onSend}
            placeholder="Type here..." />
          }
          </div>
        }

        {/* ── ADD results — flat list with "Already in Course" mixed ── */}
        {stage === "add-results" && selectedCourse && (() => {
          const courseData = DRONE_ADD_TO_COURSE[selectedCourse.id] || DRONE_ADD_TO_COURSE["c-cellbio"];
          const inCourse = courseData.inCourse.map((id) => DRONE_SIM_POOL[id]).filter(Boolean);
          const suggestions = courseData.suggestions.map((r) => DRONE_SIM_POOL[r.sim]).filter(Boolean);
          // Interleave so the user sees a mix per Figma: a few in-course then a suggestion, etc.
          const merged = [];
          const a = [...inCourse],b = [...suggestions];
          // 3 in-course, 1 suggestion, 3 in-course, 1 suggestion, ...
          while (a.length || b.length) {
            for (let k = 0; k < 3 && a.length; k++) merged.push({ sim: a.shift(), kind: "in-course" });
            if (b.length) merged.push({ sim: b.shift(), kind: "add" });
          }
          const getState = (sim) => {
            const entry = merged.find((m) => m.sim.id === sim.id);
            if (entry && entry.kind === "in-course") return "in-course";
            return addedSims.has(sim.id) ? "added" : "add";
          };
          return (
            <div className="ai-results">
              <AIWarning />
              <div className="ai-result-group">
                <div className="ai-sim-list">
                  {merged.map((m, i) =>
                  <SimCard
                    key={`${m.sim.id}-${i}`}
                    sim={m.sim}
                    seed={i}
                    state={getState(m.sim)}
                    onToggle={() => toggleAdded(m.sim.id)} />
                  )}
                </div>
                <ThumbsFeedback />
              </div>
            </div>);

        })()}

        {/* ── SYLLABUS results — grouped by unit ── */}
        {stage === "syllabus-results" && (() => {
          const getState = (sim) => addedSims.has(sim.id) ? "added" : "add";
          const units = SYLLABUS_COURSE.units.map((u, idx) => ({
            id: u.id,
            name: u.name,
            sims: u.sims.map((s) => ({
              id: s.id,
              title: s.title,
              description: s.desc,
              discipline: "Biology",
              level: s.level,
              duration: s.duration
            }))
          }));
          let seedCounter = 0;
          return (
            <div className="ai-results">
              <AIWarning />
              <div className="ai-syllabus-actions">
                <DownloadButton />
                <button className="ai-primary-btn" onClick={() => {
                  const allIds = units.flatMap((u) => u.sims.map((s) => s.id));
                  setAddedSims((prev) => {
                    const n = new Set(prev);
                    allIds.forEach((id) => n.add(id));
                    return n;
                  });
                }}>Add all simulations</button>
              </div>
              {units.map((u) => {
                const seedStart = seedCounter;
                seedCounter += u.sims.length;
                return (
                  <div key={u.id} className="ai-result-group">
                    <div className="ai-result-group-head ai-result-group-head--syllabus">
                      <h3 className="ai-syllabus-unit-title">{u.name}</h3>
                    </div>
                    <div className="ai-sim-list">
                      {u.sims.map((sim, i) =>
                      <SimCard
                        key={sim.id}
                        sim={sim}
                        seed={seedStart + i}
                        state={getState(sim)}
                        onToggle={() => toggleAdded(sim.id)} />
                      )}
                    </div>
                    <ThumbsFeedback />
                  </div>);

              })}
            </div>);

        })()}
      </div>
    </div>);

}

window.DoctorOnePanel = DoctorOnePanel;