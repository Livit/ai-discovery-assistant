// sim-detail.jsx — Simulation detail page (opened from a search-result card).
// Recreated from the attached Figma reference; real data comes from
// window.SIMS_CATALOG + window.SIM_SEARCH_FIELDS (marketing desc / standards).
// Video + supplementary material are mocked (per the request).
const { useState: useSD } = React;
const ISd = window.LPIcon;

const SD_DISC = {
  "Chemistry": { bg: "#BDFBFF", ink: "#00565C", icon: "flask-conical" },
  "Biology": { bg: "#F9EBFF", ink: "#8800C7", icon: "dna" },
  "Health Sciences": { bg: "#E7F9C8", ink: "#314908", icon: "brain" },
  "Earth & Space Science": { bg: "#FFE8DB", ink: "#A33C00", icon: "atom" },
  "Physics": { bg: "#E5F0FF", ink: "#003D70", icon: "atom" },
  "General Science": { bg: "#EEF1F4", ink: "#3A4754", icon: "flask-conical" }
};
function sdDiscOf(sim) {
  if (SD_DISC[sim.s]) return sim.s;
  const all = ((sim.s || "") + ", " + (sim.d || ""));
  if (/earth|space|geolog|astro/i.test(all)) return "Earth & Space Science";
  if (/health|medic|anatomy|physiolog|nursing/i.test(all)) return "Health Sciences";
  if (/chem/i.test(all)) return "Chemistry";
  if (/phys/i.test(all)) return "Physics";
  if (/bio|cell|genetic|ecolog/i.test(all)) return "Biology";
  return "General Science";
}
const sdSeg = (s) => (s || "").split(/[,;]/)[0].trim();
const sdList = (s, sep) => (s || "").split(sep).map((t) => t.trim()).filter(Boolean);

function SimDetailPage({ code, onBack, onOpenSearch }) {
  const sim = (window.SIMS_CATALOG || []).find((s) => s.c === code) || {};
  const f = (window.SIM_SEARCH_FIELDS || {})[code] || {};
  const [added, setAdded] = useSD(false);
  const [fav, setFav] = useSD(false);

  const disc = sdDiscOf(sim);
  const tone = SD_DISC[disc] || SD_DISC["Biology"];
  const objectives = sdList(sim.o, ";");
  const techniques = sdList(sim.k, ";");
  const standards = (f.standards || []).filter((s) => s.value);
  const about = (f.desc || "").split(/\n+/).map((t) => t.trim()).filter(Boolean);
  const levels = sdList(sim.l, ";");

  return (
    <div className="sd-wrap" data-screen-label="04 Simulation detail">
      {/* Back */}
      <div className="sd-breadcrumb">
        <window.BackButton onClick={onBack} />
      </div>

      {/* Title + actions */}
      <div className="sd-title-row">
        <div className="sd-title">
          <div className="sd-title-ico" style={{ background: tone.bg, color: tone.ink }}>
            <ISd name={tone.icon} />
          </div>
          <h1>{sim.n || "Simulation"}</h1>
        </div>
        <div className="sd-actions">
          <button className={`sd-fav ${fav ? "on" : ""}`} onClick={() => setFav((v) => !v)} aria-label="Add to favorites">
            <ISd name="heart" />
          </button>
          <button className={`sd-add ${added ? "on" : ""}`} onClick={() => setAdded((v) => !v)}>
            {added ? <><ISd name="check" /> Added</> : <><ISd name="plus" /> Add simulation</>}
          </button>
        </div>
      </div>

      {/* Chips */}
      <div className="sd-chips">
        <span className="sd-chip">{disc}</span>
        {levels.map((l) => <span key={l} className="sd-chip">{l}</span>)}
      </div>

      {/* Learning Objectives hero */}
      <div className="sd-lo">
        <h2>Learning Objectives</h2>
        <div className="sd-lo-divider" />
        <div className="sd-lo-body">
          <ul className="sd-lo-list">
            {objectives.length ? objectives.map((o, i) => <li key={i}>{o}</li>) :
              <li>Learning objectives for this simulation are being finalised.</li>}
          </ul>
          <div className="sd-video" role="img" aria-label="Simulation preview video (placeholder)">
            <div className="sd-play"><ISd name="play" /></div>
            <span className="sd-video-cap">video thumbnail</span>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="sd-grid">
        <div className="sd-col-left">
          {/* Supplementary materials (mocked) */}
          <div className="sd-card">
            <h3>Supplementary materials</h3>
            <div className="sd-sub-label">Lesson's resources:</div>
            <div className="sd-res-row">
              {[["Pre-Activity", "Lab Manual"], ["Pre-Activity / Activity", "Theory Page"], ["Post-Activity", "Lab Report"]].map(([k, v]) => (
                <div key={v} className="sd-res">
                  <div className="sd-res-eyebrow">{k}</div>
                  <div className="sd-res-item"><span>{v}</span><ISd name="copy" /></div>
                </div>
              ))}
            </div>
            <div className="sd-sub-label" style={{ marginTop: 18 }}>Instructor's resources:</div>
            <div className="sd-res-row">
              {[["Quiz Questions", "Quiz Questions Answered"], ["Quiz Questions", "Quiz Questions Unanswered"]].map(([k, v]) => (
                <div key={v} className="sd-res">
                  <div className="sd-res-eyebrow">{k}</div>
                  <div className="sd-res-item sd-res-item--wide"><span>{v}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* About = marketing description */}
          <div className="sd-about">
            <h3>About</h3>
            {about.length ? about.map((p, i) => <p key={i}>{p}</p>) :
              <p className="sd-empty">No marketing description is available for this simulation yet.</p>}
          </div>
        </div>

        <div className="sd-col-right">
          {/* Simulation's features (Length real; rest mocked) */}
          <div className="sd-card">
            <h3>Simulation's features</h3>
            <div className="sd-feat"><span className="sd-feat-label">Length:</span><span className="sd-pill">{sim.t || "—"}</span></div>
            <div className="sd-feat"><span className="sd-feat-label">Accessibility mode:</span><span className="sd-pill">Available</span></div>
            <div className="sd-feat"><span className="sd-feat-label">Languages:</span><span className="sd-pill">English</span><span className="sd-pill">Spanish</span></div>
            <div className="sd-feat">
              <span className="sd-feat-label">Device compatibility:</span>
              <span className="sd-devices"><ISd name="monitor" /><ISd name="chrome" /><ISd name="apple" /></span>
            </div>
          </div>

          {/* Techniques in Lab */}
          <div className="sd-card">
            <h3>Techniques in Lab</h3>
            <ul className="sd-bullets">
              {techniques.length ? techniques.map((t, i) => <li key={i}>{t}</li>) :
                <li className="sd-empty">No techniques listed.</li>}
            </ul>
          </div>

          {/* Related standards = AP + College/University */}
          <div className="sd-card">
            <h3>Related standards</h3>
            <ul className="sd-bullets">
              {standards.length ? standards.map((s, i) => <li key={i}><strong>{s.label}:</strong> {s.value}</li>) :
                <li className="sd-empty">No related standards on record.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>);
}

window.SimDetailPage = SimDetailPage;
