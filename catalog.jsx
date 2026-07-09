// catalog.jsx — AI-Enhanced Catalog for Labster
// Modes:
//   browse           — default catalog (header + tabs + discipline-grouped course cards)
//   results-nl       — natural-language query results with AI interpretation banner
//   results-zero     — zero/partial-result state with handoff CTA
// Plus a slide-in Syllabus Panel modal that has its own internal flow
//   panel-input → panel-loading → panel-results

const { useState: useCatS, useMemo: useCatM, useEffect: useCatE, useRef: useCatR } = React;
const ICat = window.LPIcon;

// ─────────────────────────────────────────────────────────────
// DISCIPLINE TOKENS
// ─────────────────────────────────────────────────────────────
const DISC = {
  "Chemistry": { key: "chem", bg: "#BDFBFF", ink: "#00565C", icon: "flask-conical" },
  "Biology": { key: "bio", bg: "#F9EBFF", ink: "#8800C7", icon: "dna" },
  "Health Sciences": { key: "health", bg: "#E7F9C8", ink: "#314908", icon: "brain" },
  "Earth & Space Science": { key: "earth", bg: "#FFE8DB", ink: "#A33C00", icon: "atom" }
};

// ─────────────────────────────────────────────────────────────
// LIVE-AI SEARCH HELPERS — map catalog records → result-card shape
// ─────────────────────────────────────────────────────────────
// Resolve a catalog record's discipline to a DISC token key.
function discOf(sim) {
  if (DISC[sim.s]) return sim.s;
  const all = ((sim.s || "") + ", " + (sim.d || ""));
  if (/earth|space|geolog|astro/i.test(all)) return "Earth & Space Science";
  if (/health|medic|anatomy|physiolog|nursing/i.test(all)) return "Health Sciences";
  if (/chem/i.test(all)) return "Chemistry";
  if (/bio|cell|genetic|ecolog/i.test(all)) return "Biology";
  return "Biology";
}
function firstSeg(s) { return (s || "").split(",")[0].trim(); }
function trimText(s, n) {
  s = (s || "").replace(/\s*;\s*/g, " · ").trim();
  return s.length > n ? s.slice(0, n).replace(/[ ·]+$/, "") + "…" : s;
}
// Convert a LabsterAI "recommendations" payload into SearchResultsView items.
function aiRecsToResults(res) {
  const mk = (x, conf) => {
    const s = window.LabsterAI && window.LabsterAI.byCode(x.code);
    if (!s) return null;
    return {
      id: s.c, title: s.n,
      discipline: discOf(s), level: firstSeg(s.l), duration: s.t,
      description: trimText(s.o, 150),
      confidence: conf, match: x.reason
    };
  };
  const strong = (res.strong || []).map((x) => mk(x, "strong")).filter(Boolean);
  const seen = new Set(strong.map((r) => r.id));
  const partial = (res.partial || []).map((x) => mk(x, "partial")).filter((r) => r && !seen.has(r.id));
  return [...strong, ...partial];
}

// Tiny sparkle SVG (inline)
function Sparkle({ size = 16, color }) {
  return (
    <svg className="sparkle" viewBox="0 0 24 24" width={size} height={size} fill={color || "currentColor"} aria-hidden="true" style={{ fill: "rgb(0, 111, 204)" }}>
      <path d="M12 2.5l1.7 5.2 5.2 1.7-5.2 1.7L12 16.3l-1.7-5.2L5.1 9.4l5.2-1.7L12 2.5z" />
      <path d="M19.5 13.5l.85 2.6 2.6.85-2.6.85L19.5 20.5l-.85-2.6-2.6-.85 2.6-.85.85-2.7z" opacity="0.85" />
      <path d="M5 16l.6 1.8L7.4 18.4 5.6 19 5 20.8 4.4 19l-1.8-.6L4.4 17.8 5 16z" opacity="0.7" />
    </svg>);

}

// Discipline thumb (reused) — small colored block + lucide icon
function DiscThumb({ discipline, size = 64 }) {
  const d = DISC[discipline] || DISC["Biology"];
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: d.bg, color: d.ink,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <ICat name={d.icon} />
    </div>);

}

// ─────────────────────────────────────────────────────────────
// AI SUGGESTIONS DROPDOWN
// ─────────────────────────────────────────────────────────────
function highlight(label, q) {
  if (!q) return label;
  const i = label.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return label;
  return <>{label.slice(0, i)}<span className="hl">{label.slice(i, i + q.length)}</span>{label.slice(i + q.length)}</>;
}

function SuggestionsDropdown({ q, onPick, onSubmit }) {
  const { SUGGESTIONS } = window.AI_CATALOG_DATA;

  const trySearches = [
  "a simulation that helps students understand osmosis before a wet lab",
  "human factors engineering lab simulation"];


  const ql = q.trim().toLowerCase();
  const filtered = ql ?
  SUGGESTIONS.filter((s) => s.keywords.includes(ql.split(/\s+/)[0]) || s.label.toLowerCase().includes(ql)) :
  [];

  const grouped = {
    sim: filtered.filter((s) => s.kind === "sim").slice(0, 4),
    outcome: filtered.filter((s) => s.kind === "outcome").slice(0, 3),
    topic: filtered.filter((s) => s.kind === "topic").slice(0, 3)
  };

  return (
    <div className="sugg-pop" role="listbox">
      {ql && filtered.length === 0 &&
      <div className="sugg-empty">
          Press <strong>Enter</strong> to search for <em>"{q}"</em> with AI
        </div>
      }

      {grouped.sim.length > 0 &&
      <>
          <div className="sugg-section-head">Simulations & courses</div>
          {grouped.sim.map((s) =>
        <div key={s.label} className="sugg-row kind-sim" onMouseDown={() => onPick(s)}>
              <div className="sugg-ico"><ICat name="book-open" /></div>
              <div>
                <div className="sugg-label">{highlight(s.label, q)}</div>
                <div className="sugg-sub">{s.sub}</div>
              </div>
              <div className="sugg-kbd">↵</div>
            </div>
        )}
        </>
      }

      {grouped.outcome.length > 0 &&
      <>
          <div className="sugg-section-head">
            Learning outcomes
          </div>
          {grouped.outcome.map((s) =>
        <div key={s.label} className="sugg-row kind-outcome" onMouseDown={() => onPick(s)}>
              <div>
                <div className="sugg-label">{highlight(s.label, q)}</div>
                <div className="sugg-sub">{s.sub}</div>
              </div>
              <div className="sugg-kbd">↵</div>
            </div>
        )}
        </>
      }

      {grouped.topic.length > 0 &&
      <>
          <div className="sugg-section-head">
            Topics & concepts
          </div>
          {grouped.topic.map((s) =>
        <div key={s.label} className="sugg-row kind-topic" onMouseDown={() => onPick(s)}>
              <div>
                <div className="sugg-label">{highlight(s.label, q)}</div>
                <div className="sugg-sub">{s.sub}</div>
              </div>
              <div className="sugg-kbd">↵</div>
            </div>
        )}
        </>
      }

      {/* Always show the "try" examples at the bottom */}
      <div className="sugg-section-head">
        Try a natural-language search
      </div>
      {trySearches.map((t) =>
      <div key={t} className="sugg-row kind-outcome" onMouseDown={() => onSubmit(t)}>
          <div>
            <div className="sugg-label" style={{ fontStyle: "italic" }}>"{t}"</div>
          </div>
          <div className="sugg-kbd">↵</div>
        </div>
      )}

    </div>);

}

// ─────────────────────────────────────────────────────────────
// TOP BAR — navy strip with right-aligned search
// ─────────────────────────────────────────────────────────────
function CatTopbar({ q, setQ, focused, setFocused, onSubmit, onPick, hasResults, onOpenDrOne }) {
  const wrapRef = useCatR(null);

  useCatE(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [setFocused]);

  function handleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (q.trim()) onSubmit(q.trim());
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  }

  return (
    <div className="cat-topbar">
      <div className="cat-topbar-spacer" />
      <button
        className="cat-topbar-drone"
        onClick={onOpenDrOne}
        aria-label="Open AI assistant">
        
        <span className="cat-topbar-drone-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#0B2240" style={{ strokeWidth: "2.5px", width: "36px", height: "36px", fill: "rgb(255, 255, 255)" }}>
            <path d="M12 2.5l1.95 4.55L18.5 9l-4.55 1.95L12 15.5l-1.95-4.55L5.5 9l4.55-1.95L12 2.5z" />
            <path d="M18.5 14.5l1.05 2.45L22 18l-2.45 1.05L18.5 21.5l-1.05-2.45L15 18l2.45-1.05L18.5 14.5z" />
          </svg>
        </span>
        <span className="cat-topbar-drone-tooltip">
          Let AI find the right simulations for your Course
        </span>
      </button>
      <div
        className={`cat-topbar-search ${focused ? "dropdown-open" : ""} ${hasResults ? "has-results" : ""}`}
        ref={wrapRef}>
        
        <ICat name="search" />
        <input
          type="text"
          value={q}
          placeholder="Search by name, topic, learning outcome..."
          onFocus={() => setFocused(true)}
          onChange={(e) => {setQ(e.target.value);setFocused(true);}}
          onKeyDown={handleKey} />
        
        {focused && <SuggestionsDropdown q={q} onPick={onPick} onSubmit={onSubmit} />}
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// AI INTERPRETATION BANNER
// ─────────────────────────────────────────────────────────────
function AIBanner({ query, terms, onRefine }) {
  return (
    <div className="ai-banner ai-banner--subtle">
      <Sparkle size={14} color="#6E5AF1" />
      <span className="ai-banner-note">AI interpreted your query</span>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// RESULT TOAST — design system Toast component
// (variant with no title, no actions — just body text + optional icon).
// ─────────────────────────────────────────────────────────────
function ResultToast({ variant, text }) {
  // variant: "success" | "warning" | "info" | "error"
  const v = variant || "info";
  const icon = {
    success: "check",
    warning: "triangle-alert",
    info: "info",
    error: "circle-x"
  }[v];
  return (
    <div className={`sr-toast sr-toast--${v}`} role="status">
      <span className="sr-toast-icon"><ICat name={icon} /></span>
      <span className="sr-toast-text">{text}</span>
    </div>);

}

// Shared simulation card — design system's "Simulation card — Catalog (List)".
// Used in every results page (NL search, zero-state, syllabus, Dr One).
// Layout: thumbnail │ body (title / desc / meta) │ primary CTA.
// Supports three button states: "add" (default) | "added" | "in-course".
function ResultSimCard({ item, state: initialState = "add" }) {
  const [state, setState] = useCatS(initialState);
  const tone = DISC[item.discipline] || DISC["Biology"];

  function toggle() {
    if (state === "in-course") return;
    setState((s) => s === "added" ? "add" : "added");
  }

  return (
    <article className="sr-sim-card">
      <div className="sr-sim-thumb" style={{ background: tone.bg, color: tone.ink }}>
        <ICat name={tone.icon} />
      </div>
      <div className="sr-sim-body">
        <h4 className="sr-sim-title">{item.title}</h4>
        <p className="sr-sim-desc">{item.description}</p>
        <div className="sr-sim-meta">
          <span className="sr-sim-pill">{item.level}</span>
          <span className="sr-sim-pill">{item.discipline}</span>
          <span className="sr-sim-platforms" title="Available on Desktop, Chrome and macOS">
            <ICat name="monitor" />
            <ICat name="chrome" />
            <ICat name="apple" />
          </span>
          <span className="sr-sim-pill"><ICat name="clock" /> {item.duration}</span>
        </div>
      </div>
      <div className="sr-sim-cta">
        <button
          className={`sr-sim-add sr-sim-add--${state}`}
          onClick={toggle}
          disabled={state === "in-course"}>
          {state === "in-course" && <><ICat name="check" /> Already in course</>}
          {state === "added" && <><ICat name="check" /> Added</>}
          {state === "add" && <>Add simulation</>}
        </button>
      </div>
    </article>);

}

// ─────────────────────────────────────────────────────────────
// FILTER SIDEBAR (Figma left rail)
// ─────────────────────────────────────────────────────────────
function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useCatS(defaultOpen);
  return (
    <div className="sr-filter-group">
      <button className="sr-filter-head" onClick={() => setOpen((o) => !o)}>
        <span>{title}</span>
        <ICat name={open ? "chevron-up" : "chevron-down"} />
      </button>
      {open && <div className="sr-filter-body">{children}</div>}
    </div>);

}

function FilterCheck({ label, checked, onChange }) {
  return (
    <label className="sr-filter-check">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange && onChange(e.target.checked)} />
      <span className="sr-filter-box" />
      <span className="sr-filter-label">{label}</span>
    </label>);

}

function FilterSidebar({ filters, setFilter }) {
  function toggle(group, value) {
    const set = new Set(filters[group] || []);
    if (set.has(value)) set.delete(value);else set.add(value);
    setFilter(group, Array.from(set));
  }
  function has(group, value) {
    return (filters[group] || []).includes(value);
  }

  return (
    <aside className="sr-filter-rail">
      <FilterGroup title="Subject">
        {["Chemistry", "Biology", "Physics", "Medicine", "Engineering", "General Science"].map((v) =>
        <FilterCheck key={v} label={v} checked={has("subject", v)} onChange={() => toggle("subject", v)} />
        )}
      </FilterGroup>

      <FilterGroup title="Educational level">
        {["Higher Education", "High School"].map((v) =>
        <FilterCheck key={v} label={v} checked={has("level", v)} onChange={() => toggle("level", v)} />
        )}
      </FilterGroup>

      <FilterGroup title="Language">
        {["English", "Deutsch", "Español", "Italiano", "Français"].map((v) =>
        <FilterCheck key={v} label={v} checked={has("lang", v)} onChange={() => toggle("lang", v)} />
        )}
      </FilterGroup>

      <FilterGroup title="Duration">
        <div className="sr-duration-pills">
          {["Up to 15 min", "Up to 30 min", "Up to 60 min"].map((v) =>
          <button
            key={v}
            className={`sr-duration-pill ${has("duration", v) ? "selected" : ""}`}
            onClick={() => toggle("duration", v)}>
              {v}
            </button>
          )}
        </div>
        <div className="sr-duration-range">
          <input className="sr-range-input" placeholder="From" />
          <input className="sr-range-input" placeholder="To" />
        </div>
      </FilterGroup>

      <FilterGroup title="Accessibility">
        <FilterCheck label="Accessible only" checked={has("a11y", "only")} onChange={() => toggle("a11y", "only")} />
      </FilterGroup>

      <FilterGroup title="Favourites">
        <FilterCheck label="Favourites only" checked={has("fav", "only")} onChange={() => toggle("fav", "only")} />
      </FilterGroup>

      <FilterGroup title="Standards" defaultOpen={true}>
        {["AP", "IB", "NGSS", "University"].map((v) =>
        <FilterCheck key={v} label={v} checked={has("standards", v)} onChange={() => toggle("standards", v)} />
        )}
      </FilterGroup>
    </aside>);

}

// ─────────────────────────────────────────────────────────────
// SEARCH RESULTS VIEW (Figma layout: title + sidebar + list)
// ─────────────────────────────────────────────────────────────
function SearchResultsView({ query, results, interp, intro, onRefineInterp, onBack }) {
  const [sort, setSort] = useCatS("Best match");
  const [filters, setFilters] = useCatS({});
  function setFilter(group, value) {
    setFilters((f) => ({ ...f, [group]: value }));
  }

  return (
    <div className="sr-wrap" data-screen-label="03 Search results">
      <div className="sr-back-row">
        <button className="sr-back-btn" onClick={onBack}>
          <ICat name="arrow-left" /> Back
        </button>
      </div>

      <div className="sr-title">
        <h1>{results.length} results</h1>
        <p>{intro ? intro : `Showing results for "${query}"`}</p>
      </div>

      <div className="sr-top-actions">
        <button className="sr-filters-inline">
          Filters <ICat name="chevron-up" />
        </button>
        <div className="sr-sort">
          <span className="sr-sort-label">Sort by</span>
          <button className="sr-sort-select">
            {sort} <ICat name="chevron-down" />
          </button>
        </div>
      </div>

      <div className="sr-main">
        <FilterSidebar filters={filters} setFilter={setFilter} />
        <div className="sr-results-col">
          {results.map((r, i) => {
            return (
              <div key={r.id} className="sr-result-group">
                <ResultSimCard item={r} />
              </div>);
          })}
        </div>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// SYLLABUS TAKEOVER (full-screen, modeled on Figma "CourseMapping")
// ─────────────────────────────────────────────────────────────
function SyllabusPanel({ onClose }) {
  const [stage, setStage] = useCatS("input"); // input | loading | results
  const [text, setText] = useCatS("");
  const [filename, setFilename] = useCatS(null);
  const [loadingStep, setLoadingStep] = useCatS(0);
  const [showPaste, setShowPaste] = useCatS(false);

  const PRESET = `BIO 150 — CELL BIOLOGY
Spring 2026 — Course Syllabus

Unit 1: Cell Structure and Function
Unit 2: Membrane Transport
Unit 3: Cell Division and Reproduction
Unit 4: Genetics and Gene Expression
`;

  useCatE(() => {
    if (stage !== "loading") return;
    setLoadingStep(0);
    const t1 = setTimeout(() => setLoadingStep(1), 500);
    const t2 = setTimeout(() => setLoadingStep(2), 1100);
    const t3 = setTimeout(() => setStage("results"), 1800);
    return () => {clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  }, [stage]);

  function runRecommendations() {setStage("loading");}
  function pickFile() {setFilename("BIO_150_Cell_Biology_Syllabus.pdf");}

  useCatE(() => {
    function onKey(e) {if (e.key === "Escape") onClose();}
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSubmit = !!(filename || text.trim());

  return (
    <div className="st-root" data-screen-label="04 Syllabus Takeover" role="region" aria-label="Map your syllabus">
      <button className="st-back" onClick={onClose} aria-label="Back to catalog">
        <ICat name="arrow-left" /> Back
      </button>
      {stage === "input" &&
      <SyllabusInput
        text={text} setText={setText}
        filename={filename} pickFile={pickFile}
        showPaste={showPaste} setShowPaste={setShowPaste}
        preset={PRESET} canSubmit={canSubmit}
        onRun={runRecommendations} />
      }
      {stage === "loading" && <SyllabusLoading step={loadingStep} />}
      {stage === "results" &&
      <SyllabusResults onRemap={() => setStage("input")} />
      }
    </div>);

}

function SyllabusInput({ text, setText, filename, pickFile, showPaste, setShowPaste, preset, canSubmit, onRun }) {
  return (
    <div className="st-stage st-stage-input">
      <div className="st-input-intro">
        <div className="st-eyebrow"><Sparkle size={12} /> Labster AI</div>
        <h1>Map your syllabus</h1>
        <p>Drop your course syllabus and we'll match each unit to the Labster simulations that best support your topics and flag any gaps in our catalog.</p>
      </div>

      <div className="st-upload-card">
        {!filename ?
        <div className="st-dropzone" onClick={pickFile}>
            <div className="st-dropzone-icon">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 22 V6" />
                <path d="M9 13 l7 -7 l7 7" />
                <path d="M5 26 H27" />
              </svg>
            </div>
            <div className="st-dropzone-title">Drag and drop your PDF here</div>
            <div className="st-dropzone-or">or</div>
            <button className="st-browse-btn">Browse file</button>
          </div> :

        <div className="st-dropzone st-dropzone-loaded">
            <div className="st-dropzone-icon st-dropzone-icon-loaded">
              <ICat name="file-text" />
            </div>
            <div className="st-dropzone-title">{filename}</div>
            <div className="st-dropzone-or">PDF · 4 pages · 218 KB</div>
            <button className="st-browse-btn" onClick={pickFile}>Replace file</button>
          </div>
        }

        {filename &&
        <div className="st-success-msg">
            <div className="st-success-icon"><ICat name="check" /></div>
            <span>File loaded successfully</span>
          </div>
        }

        <button
          className="st-primary-cta"
          onClick={onRun}
          disabled={!canSubmit}
          style={!canSubmit ? { opacity: 0.55, cursor: "not-allowed" } : {}}>
          
          Get recommendations
        </button>

        <div className="st-paste-toggle">
          <button onClick={() => setShowPaste((s) => !s)}>
            {showPaste ? "Hide paste option" : "Or paste syllabus text instead"}
            <ICat name={showPaste ? "chevron-up" : "chevron-down"} />
          </button>
        </div>

        {showPaste &&
        <div className="st-paste">
            <textarea
            placeholder="Paste your course syllabus here — including unit titles and topics."
            value={text}
            onChange={(e) => setText(e.target.value)} />
          
            <button className="btn-tertiary" style={{ marginTop: 6, fontSize: 12 }} onClick={() => setText(preset)}>
              <ICat name="zap" /> Use sample syllabus (BIO 150 — Cell Biology)
            </button>
          </div>
        }
      </div>
    </div>);

}

function SyllabusLoading({ step }) {
  const steps = [
  "Reading syllabus and detecting course",
  "Extracting units and learning outcomes",
  "Matching against 310+ Labster simulations"];

  return (
    <div className="st-stage st-stage-loading">
      <div className="loading-orb"><Sparkle size={38} color="#fff" /></div>
      <h3>Mapping your syllabus…</h3>
      <p>Our AI is reading each unit and finding the simulations that best support your topics.</p>
      <div className="loading-steps">
        {steps.map((s, i) =>
        <div key={i} className={`loading-step ${i < step ? "done" : i === step ? "active" : ""}`}>
            <div className="dot">{i < step && <ICat name="check" />}</div>
            <span>{s}</span>
          </div>
        )}
      </div>
    </div>);

}

function UnitFeedback({ unitId }) {
  const [v, setV] = useCatS(null);
  const [confirm, setConfirm] = useCatS(false);
  function pick(dir) {
    setV(dir);
    setConfirm(true);
    setTimeout(() => setConfirm(false), 1500);
  }
  return (
    <div className="st-unit-feedback">
      {confirm &&
      <span className="st-fb-confirm">
          <ICat name="check" />
          {v === "up" ? "Thanks — we'll learn from this" : "Got it — we'll improve this match"}
        </span>
      }
      <button className={`st-fb-pill ${v === "up" ? "selected up" : ""}`} onClick={() => pick("up")}>
        <ICat name="thumbs-up" /> Good recommendations
      </button>
      <button className={`st-fb-pill ${v === "down" ? "selected down" : ""}`} onClick={() => pick("down")}>
        <ICat name="thumbs-down" /> Bad recommendations
      </button>
    </div>);

}

function AddButton({ label }) {
  const [added, setAdded] = useCatS(false);
  return (
    <button className={`btn-add st-add-btn ${added ? "added" : ""}`} onClick={() => setAdded((a) => !a)}>
      {added ? <><ICat name="check" /> Added</> : <>{label || "Add simulation"}</>}
    </button>);

}

// Adapter — Map-syllabus data shape uses {desc, theme}; remap to the
// catalog-list ResultSimCard contract ({description, discipline}).
function SimCard({ s, state }) {
  const discipline = s.theme === "anatomy" || s.theme === "biochem" ? "Health Sciences" : "Biology";
  const item = {
    id: s.id,
    title: s.title,
    description: s.desc,
    duration: s.duration,
    level: s.level,
    discipline
  };
  return <ResultSimCard item={item} state={state} />;
}

function SyllabusResults({ onRemap }) {
  const { SYLLABUS_COURSE } = window.AI_CATALOG_DATA;
  const c = SYLLABUS_COURSE;

  return (
    <div className="st-stage st-stage-results">
      <h2 className="st-results-headline">
        {c.totalMatches} Simulations match your Syllabus!
      </h2>

      <div className="st-ai-warning">
        <span>Recommendations generated by AI. Please review before use</span>
      </div>

      <div className="st-bulk-actions">
        <button className="btn-tertiary" onClick={onRemap} style={{ padding: "8px 12px" }}>
          <ICat name="rotate-cw" /> Re-map syllabus
        </button>
        <div className="st-bulk-right">
          <button className="btn btn-secondary"><ICat name="download" /> Download <ICat name="chevron-down" /></button>
          <button className="btn btn-primary">Add all simulations</button>
        </div>
      </div>

      {c.units.map((u) =>
      <div key={u.id} className="st-unit">
          <div className="st-unit-head">
            <h3 className="st-unit-title">{u.name}</h3>
          </div>

          {u.state === "partial" &&
        <div className="st-unit-gap">
              <strong>Coverage gap. </strong>{u.gap}
            </div>
        }

          <div className="st-sim-list">
            {u.sims.map((s) => <SimCard key={s.id} s={s} />)}
          </div>

          {u.state === "match" && <UnitFeedback unitId={u.id} />}
        </div>
      )}

      <div className="st-unit">
        <div className="st-unit-head">
          <h3 className="st-unit-title">Other topics in your syllabus</h3>
        </div>
        <div className="st-empty-state">
          <div className="st-empty-illus">
            <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M30 16 H50 V22 H30 Z" />
              <path d="M26 22 H54 L50 70 H30 Z" />
              <path d="M30 22 Q32 40 30 60" />
              <path d="M50 22 Q48 40 50 60" />
              <path d="M34 34 Q40 40 46 34" />
              <circle cx="36" cy="48" r="2" fill="currentColor" />
              <circle cx="44" cy="50" r="1.5" fill="currentColor" />
              <circle cx="40" cy="58" r="2.5" fill="currentColor" />
              <path d="M40 16 V10 M52 14 L55 10 M28 14 L25 10" />
            </svg>
          </div>
          <div className="st-empty-text">
            <div>Looks like there's no direct match for this topic.</div>
            <div className="st-empty-sub">You might find something useful by browsing or searching related terms.</div>
          </div>
        </div>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// CATALOG PAGE
// ─────────────────────────────────────────────────────────────
function CatalogPage() {
  const { CATALOG, DISCIPLINES } = window.LP_DATA;
  const { NL_RESULTS, NL_INTERPRETATION, ZERO_CLOSEST } = window.AI_CATALOG_DATA;

  const [tab, setTab] = useCatS("Courses");
  const [q, setQ] = useCatS("");
  const [focused, setFocused] = useCatS(false);
  const [mode, setMode] = useCatS("browse"); // browse | results-nl | results-zero | results-ai
  const [interp, setInterp] = useCatS(NL_INTERPRETATION);
  const [syllabusOpen, setSyllabusOpen] = useCatS(false);
  const [drOneOpen, setDrOneOpen] = useCatS(false);
  // Live-AI search state
  const [aiSearch, setAiSearch] = useCatS({ loading: false, query: "", intro: "", results: [], replyText: "" });

  useCatE(() => {if (window.lucide) window.lucide.createIcons();});

  // Expose helpers so the user (and screenshots) can jump between states
  useCatE(() => {
    window.AICatalog = {
      browse: () => {setMode("browse");setQ("");},
      nlResults: () => scriptedRoute("a simulation that helps students understand osmosis before a wet lab"),
      zeroResults: () => scriptedRoute("human factors engineering lab simulation"),
      openSyllabus: () => setSyllabusOpen(true),
      closeSyllabus: () => setSyllabusOpen(false),
      openDrOne: () => setDrOneOpen(true),
      closeDrOne: () => setDrOneOpen(false),
      openSuggestions: (q) => {setQ(q || "");setFocused(true);}
    };
  });

  // ── Scripted demo routing (canned states; preserved for Tweaks buttons) ──
  function scriptedRoute(query) {
    setQ(query);
    setFocused(false);
    const ql = query.toLowerCase();
    if (ql.includes("osmosis") || ql.includes("wet lab") || ql.includes("membrane transport") || ql.includes("diffusion")) {
      setInterp(NL_INTERPRETATION);
      setMode("results-nl");
    } else if (ql.includes("human factor")) {
      setMode("results-zero");
    } else {
      setMode("browse");
    }
    const main = document.querySelector(".app-main");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Routing for submit — live AI search over the real catalog ──
  async function onSubmit(query) {
    query = (query || "").trim();
    if (!query) return;
    setQ(query);
    setFocused(false);
    const main = document.querySelector(".app-main");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });

    const live =
      window.LabsterAI &&
      window.claude && typeof window.claude.complete === "function" &&
      window.__LP_DESCRIBE_MODE !== "scripted";

    if (!live) { scriptedRoute(query); return; }

    setAiSearch({ loading: true, query, intro: "", results: [], replyText: "" });
    setMode("results-ai");
    try {
      // Search box stays results-first regardless of the assistant's flow mode.
      const res = await window.LabsterAI.converse([{ role: "user", content: query }], "frictionless");
      if (res.type === "recommendations") {
        const results = aiRecsToResults(res);
        if (results.length === 0) {
          setAiSearch({ loading: false, query, intro: "", results: [],
            replyText: res.intro || "No simulations cleared the match threshold for that search." });
        } else {
          setAiSearch({ loading: false, query, intro: res.intro, results, replyText: "" });
        }
      } else {
        setAiSearch({ loading: false, query, intro: "", results: [], replyText: res.text || "" });
      }
    } catch (e) {
      // Network/AI unavailable — fall back to the canned demo routing.
      scriptedRoute(query);
    }
  }

  function onPick(s) {
    // For a topic/outcome, treat label as a query that goes to NL results
    if (s.kind === "outcome" || s.kind === "topic") {
      onSubmit(s.label);
    } else {
      onSubmit(s.label);
    }
  }

  function backToCatalog() {
    setMode("browse");
    setQ("");
  }

  // ── Filtered courses (only in browse mode) ──
  const filtered = useCatM(() =>
  CATALOG.filter((c) => !q ||
  c.title.toLowerCase().includes(q.toLowerCase()) ||
  c.description.toLowerCase().includes(q.toLowerCase())
  ), [q, CATALOG]
  );
  const grouped = useCatM(() =>
  DISCIPLINES.map((d) => [d, filtered.filter((c) => c.disciplines[0] === d)]).
  filter(([, list]) => list.length > 0),
  [filtered, DISCIPLINES]
  );

  const hasResults = mode === "results-nl" || mode === "results-zero" || mode === "results-ai";

  return (
    <div className="page" data-screen-label="02 Catalog" style={{ padding: 0, maxWidth: "none" }}>
      {syllabusOpen ?
      <SyllabusPanel onClose={() => setSyllabusOpen(false)} /> :
      drOneOpen ?
      <>
      <CatTopbar
          q={q}
          setQ={setQ}
          focused={focused}
          setFocused={setFocused}
          onSubmit={onSubmit}
          onPick={onPick}
          hasResults={hasResults}
          onOpenDrOne={() => setDrOneOpen(true)} />
      <window.DoctorOnePanel onClose={() => setDrOneOpen(false)} />
      </> :

      <>
      <CatTopbar
          q={q}
          setQ={setQ}
          focused={focused}
          setFocused={setFocused}
          onSubmit={onSubmit}
          onPick={onPick}
          hasResults={hasResults}
          onOpenDrOne={() => setDrOneOpen(true)} />
      

      {/* ── BROWSE MODE ────────────────────────────────────── */}
      {mode === "browse" &&
        <>
          <div className="cat-hero-white">
            <h1>Explore our Catalog</h1>
            <p>Find Simulations, Collections and Ready-Made Courses that fit your Syllabus</p>
            <div className="cat-tabs-centered">
              {["Courses", "Collections", "All Simulations", "What's New"].map((t) =>
              <div key={t} className={`cat-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>
              )}
            </div>
          </div>

          <div style={{ maxWidth: 1056 + 64, margin: "0 auto", padding: "28px 32px 64px" }}>
            <div className="cat-filterbar">
              <button className="cat-filter">Disciplines<ICat name="chevron-down" /></button>
              <button className="cat-filter">Educational Level<ICat name="chevron-down" /></button>
              <span className="results">{filtered.length} Results out of 310</span>
              <button className="cat-filter">Sort by<ICat name="chevron-down" /></button>
            </div>

            {grouped.map(([discipline, list]) =>
            <div key={discipline} className="cat-discipline">
                <div className="cat-discipline-head">
                  <div className="cat-discipline-mark" style={{ background: DISC[discipline].bg, color: DISC[discipline].ink }}>
                    <ICat name={DISC[discipline].icon} />
                  </div>
                  <span className="cat-discipline-icon-name">{discipline}</span>
                  <div className="cat-discipline-rule" />
                  <span className="cat-discipline-count">{list.length} Courses</span>
                </div>
                {list.map((c) => <CatalogCardStandard key={c.id} c={c} />)}
              </div>
            )}
          </div>
        </>
        }

      {/* ── NL RESULTS MODE (scripted demo) ─────────────────── */}
      {mode === "results-nl" &&
        <SearchResultsView
          query={q}
          results={NL_RESULTS}
          interp={interp}
          onRefineInterp={setInterp}
          onBack={backToCatalog} />

        }

      {/* ── LIVE-AI RESULTS MODE ────────────────────────────── */}
      {mode === "results-ai" &&
        (aiSearch.loading ?
        <div className="search-results-wrap" data-screen-label="03 Search results (AI)">
            <div className="sr-back-row" style={{ maxWidth: "none" }}>
              <button className="sr-back-btn" onClick={backToCatalog}>
                <ICat name="arrow-left" /> Back
              </button>
            </div>
            <div className="ai-search-loading">
              <div className="loading-orb"><Sparkle size={38} color="#fff" /></div>
              <h3>Reading your search…</h3>
              <p>Interpreting "{aiSearch.query}" and matching it against 310+ Labster simulations.</p>
            </div>
          </div> :
        aiSearch.results.length > 0 ?
        <SearchResultsView
          query={aiSearch.query}
          results={aiSearch.results}
          interp={[1]}
          intro={aiSearch.intro}
          onRefineInterp={() => {}}
          onBack={backToCatalog} /> :

        <div className="search-results-wrap">
            <div className="search-context">
              <div className="lhs">
                <span className="back" onClick={backToCatalog}><ICat name="arrow-left" /> Back to catalog</span>
                &nbsp;&nbsp;·&nbsp;&nbsp;Searched for "{aiSearch.query}"
              </div>
            </div>
            <div className="zero-state">
              <div className="icon-wrap"><ICat name="search-x" /></div>
              <h3>No strong matches for that search</h3>
              <p>{aiSearch.replyText || "Try broadening your description, or map your full syllabus so we can find adjacent coverage and flag gaps."}</p>
            </div>
            <div className="handoff-banner">
              <div className="h-illus"><Sparkle size={30} color="#fff" /></div>
              <div className="h-body">
                <div className="h-eyebrow">Need a fuller picture?</div>
                <h3 className="h-title">Upload your syllabus and we'll map your entire curriculum</h3>
                <p className="h-sub">See exactly which units we cover, which need adjustment and which topics we should prioritise next.</p>
              </div>
              <button className="h-cta" onClick={() => setSyllabusOpen(true)}>
                Map my syllabus <ICat name="arrow-right" />
              </button>
            </div>
          </div>)
        }

      {/* ── ZERO RESULTS MODE ──────────────────────────────── */}
      {mode === "results-zero" &&
        <div className="search-results-wrap">
          <div className="search-context">
            <div className="lhs">
              <span className="back" onClick={backToCatalog}><ICat name="arrow-left" /> Back to catalog</span>
              &nbsp;&nbsp;·&nbsp;&nbsp;Searched for "{q}"
            </div>
          </div>

          <div className="zero-state">
            <div className="icon-wrap"><ICat name="search-x" /></div>
            <h3>Labster doesn't currently have simulations covering human factors engineering</h3>
            <p>This is a specialized topic — our catalog focuses on core STEM and health sciences. We've surfaced the closest related content below, and you can request a topic from our team via the syllabus mapper.</p>
          </div>

          <div className="handoff-banner">
            <div className="h-illus"><Sparkle size={30} color="#fff" /></div>
            <div className="h-body">
              <div className="h-eyebrow">Need a fuller picture?</div>
              <h3 className="h-title">Upload your syllabus and we'll map your entire curriculum</h3>
              <p className="h-sub">See exactly which units we cover, which need adjustment and which topics — like human factors engineering — we should prioritise next.</p>
            </div>
            <button className="h-cta" onClick={() => setSyllabusOpen(true)}>
              Map my syllabus <ICat name="arrow-right" />
            </button>
          </div>

          <div className="closest-section-head">
            <h4>Closest related content</h4>
            <div className="rule" />
          </div>

          {ZERO_CLOSEST.map((r) =>
          <div key={r.id} className="sr-result-group" style={{ maxWidth: 856, margin: "0 auto 20px" }}>
              <ResultToast variant="info" text={r.relation} />
              <ResultSimCard item={r} />
            </div>
          )}
        </div>
        }

      {/* ── SYLLABUS PANEL ─────────────────────────────────── */}
      </>
      }
    </div>);

}

// ─────────────────────────────────────────────────────────────
// CARD — STANDARD (for browse view — keeps prior styling)
// ─────────────────────────────────────────────────────────────
function CatalogCardStandard({ c }) {
  const primary = c.disciplines[0];
  const tone = DISC[primary];
  return (
    <article className="cat-card cat-card--standard">
      <div className="cat-card-thumb-mini" style={{ background: tone.bg, color: tone.ink }}>
        <ICat name={tone.icon} />
      </div>
      <div className="cat-card-body">
        <div className="cat-card-eyebrow">Course</div>
        <h4 className="cat-card-title">{c.title}</h4>
        <p className="cat-card-desc">{c.description}</p>
        <div className="cat-card-tags">
          {c.disciplines.map((d) => <span key={d} className="tag neutral">{d}</span>)}
          <span className="tag neutral">{c.level}</span>
          <span className="tag neutral">{c.units} Units</span>
          <span className="tag neutral">{c.sims} Simulations</span>
        </div>
      </div>
      <div className="cat-card-actions">
        <button className="btn btn-secondary">Learning Outcomes <ICat name="chevron-down" /></button>
        <button className="btn btn-primary">Add Course</button>
      </div>
    </article>);

}

Object.assign(window, { CatalogPage, ResultSimCard, ResultToast });