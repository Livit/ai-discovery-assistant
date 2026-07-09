// course.jsx — "My Course" overview page + AI recommendations view
// Recreates Figma "my course recommend" and "my course recommendations".
// Self-contained: uses window.LPIcon and the shared sim-thumb image.

const { useState: useCrsS } = React;
const ICrs = window.LPIcon;

// Course content for General Chemistry — CHEM 101 (units → simulations)
const COURSE_UNITS = [
  {
    id: "u1",
    name: "Atomic Theory and the Periodic Table",
    sims: [
      { id: "s1", title: "Atomic Structure: Bohr and Quantum Models", duration: "32 min" },
      { id: "s2", title: "Electron Configuration: Fill the Orbitals", duration: "28 min" },
      { id: "s3", title: "Periodic Trends: Predict the Properties", duration: "30 min" },
    ],
  },
  {
    id: "u2",
    name: "Molecules and Compounds",
    sims: [
      { id: "s4", title: "Ionic and Covalent Bonding: Build a Molecule", duration: "35 min" },
      { id: "s5", title: "Lewis Structures: Draw the Bonds", duration: "30 min" },
      { id: "s6", title: "Molecular Geometry: Apply VSEPR Theory", duration: "32 min" },
    ],
  },
  {
    id: "u3",
    name: "Classifying and Balancing Chemical Reactions",
    sims: [
      { id: "s7", title: "Balancing Equations: Conserve the Atoms", duration: "26 min" },
      { id: "s8", title: "Types of Reactions: Classify the Change", duration: "30 min" },
      { id: "s9", title: "Stoichiometry: Calculate the Yield", duration: "38 min" },
    ],
  },
];

// AI-recommended simulations for this course
const COURSE_RECS = [
  { id: "r1", title: "Acid–Base Titration: Find the Unknown Concentration",
    desc: "Standardize a solution and reach the equivalence point using a pH indicator — reinforces the acid–base concepts in your reactions unit." },
  { id: "r2", title: "Reaction Kinetics: Measure the Rate of a Reaction",
    desc: "Vary concentration and temperature to determine rate laws, extending the 'types of reactions' material with quantitative analysis." },
  { id: "r3", title: "Thermochemistry: Measure Enthalpy Changes",
    desc: "Use calorimetry to quantify heat released or absorbed, a natural complement to balancing and classifying reactions." },
  { id: "r4", title: "Gas Laws: Relate Pressure, Volume and Temperature",
    desc: "Run experiments on an ideal gas to derive the combined gas law — bridges atomic theory and molecular behaviour." },
  { id: "r5", title: "Electrochemistry: Build a Galvanic Cell",
    desc: "Assemble half-cells and measure cell potential to connect redox reactions to real energy applications." },
];

function PlatformIcons() {
  return (
    <span className="cf-sim-platforms" title="Available on Desktop, Chrome and macOS">
      <ICrs name="monitor"/><ICrs name="chrome"/><ICrs name="apple"/>
    </span>
  );
}

function SparkleGlyph({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M12 2.2l1.95 4.85L18.8 9l-4.85 1.95L12 15.8l-1.95-4.85L5.2 9l4.85-1.95L12 2.2z"/>
      <path d="M18.6 14.4l1.0 2.5 2.5 1.0-2.5 1.0-1.0 2.5-1.0-2.5-2.5-1.0 2.5-1.0 1.0-2.5z"/>
    </svg>
  );
}

function CourseHeader({ courseName, tab }) {
  return (
    <>
      <div className="course-page-top">
        <h1>{courseName}</h1>
        <button className="course-students-view"><ICrs name="eye"/> Student's view</button>
      </div>
      <div className="course-tabs">
        {["Overview", "Content", "Students", "Grades"].map(t => (
          <div key={t} className={`course-tab ${t === tab ? "active" : ""}`}>{t}</div>
        ))}
      </div>
    </>
  );
}

function CourseSimRow({ sim }) {
  const [published, setPublished] = useCrsS(false);
  return (
    <div className="cf-sim">
      <span className="cf-sim-grip"><ICrs name="grip-vertical"/></span>
      <div className="cf-sim-thumb"></div>
      <div className="cf-sim-main">
        <h4 className="cf-sim-title">{sim.title}</h4>
        <div className="cf-sim-meta">
          <span className="cf-sim-dur">{sim.duration}</span>
          <PlatformIcons/>
        </div>
      </div>
      <div className="cf-sim-right">
        <button className="cf-text-action"><ICrs name="plus"/> Schedule</button>
        <button className="cf-text-action"><ICrs name="plus"/> Attempts</button>
        <button className="cf-publish" onClick={() => setPublished(p => !p)}>
          {published ? "Published" : "Publish"}
        </button>
        <button className="cf-icon-btn"><ICrs name="ellipsis-vertical"/></button>
      </div>
    </div>
  );
}

function CourseUnit({ unit }) {
  return (
    <div className="cf-unit">
      <div className="cf-unit-head">
        <span className="cf-unit-folder"><ICrs name="folder"/></span>
        <h3 className="cf-unit-title">{unit.name}</h3>
        <div className="cf-unit-actions">
          <button className="cf-icon-btn"><ICrs name="plus"/></button>
          <button className="cf-icon-btn"><ICrs name="pencil"/></button>
          <button className="cf-icon-btn"><ICrs name="trash-2"/></button>
        </div>
      </div>
      {unit.sims.map(s => <CourseSimRow key={s.id} sim={s}/>)}
    </div>
  );
}

function CourseRecCard({ rec }) {
  const [added, setAdded] = useCrsS(false);
  return (
    <article className="crec-card">
      <div className="crec-thumb"></div>
      <div className="crec-body">
        <h4 className="crec-title">{rec.title}</h4>
        <p className="crec-desc">{rec.desc}</p>
        <div className="crec-meta">
          <span className="sr-sim-pill">Higher Education</span>
          <span className="sr-sim-pill">Chemistry</span>
          <PlatformIcons/>
          <span className="sr-sim-pill"><ICrs name="clock"/> 35 min</span>
        </div>
      </div>
      <div className="crec-cta">
        <button className={`sr-sim-add sr-sim-add--${added ? "added" : "add"}`} onClick={() => setAdded(a => !a)}>
          {added ? <><ICrs name="check"/> Added</> : <>Add simulation</>}
        </button>
      </div>
    </article>
  );
}

function CourseRecommendations({ onBack }) {
  const [fb, setFb] = useCrsS(null);
  return (
    <div className="crec" data-screen-label="07 Course AI recommendations">
      <button className="crec-back" onClick={onBack}><ICrs name="arrow-left"/> Back</button>
      <div className="crec-spark" style={{ color: "var(--blue-9)" }}><SparkleGlyph size={42}/></div>

      <div className="crec-warning">
        <span>Recommendations generated by AI. Please review before use</span>
      </div>

      <div className="crec-list">
        {COURSE_RECS.map(r => <CourseRecCard key={r.id} rec={r}/>)}
      </div>

      <div className="crec-feedback">
        <button className={`crec-fb up ${fb === "up" ? "on" : ""}`} onClick={() => setFb("up")} aria-label="Good recommendations">
          <ICrs name="thumbs-up"/>
        </button>
        <button className={`crec-fb down ${fb === "down" ? "on" : ""}`} onClick={() => setFb("down")} aria-label="Bad recommendations">
          <ICrs name="thumbs-down"/>
        </button>
      </div>
    </div>
  );
}

function CoursePage({ courseName }) {
  const [view, setView] = useCrsS("content"); // content | recommend
  const name = courseName || "General Chemistry — CHEM 101";

  return (
    <div className="course-page" data-screen-label="06 My Course">
      <CourseHeader courseName={name} tab="Overview"/>

      {view === "content" ? (
        <div className="course-content">
          <div className="course-actions">
            <button className="course-ai-fab" onClick={() => setView("recommend")} aria-label="Let AI find the simulations for this Course">
              <SparkleGlyph size={22}/>
              <span className="tb-tooltip">Let AI find the simulations for this Course</span>
            </button>
            <button className="course-pill-btn"><ICrs name="chevrons-down-up"/> Collapse all</button>
            <button className="cf-publish" style={{ padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <ICrs name="plus"/> Add content
            </button>
            <button className="course-kebab"><ICrs name="ellipsis-vertical"/></button>
          </div>

          {COURSE_UNITS.map(u => <CourseUnit key={u.id} unit={u}/>)}
        </div>
      ) : (
        <CourseRecommendations onBack={() => setView("content")}/>
      )}
    </div>
  );
}

window.CoursePage = CoursePage;
