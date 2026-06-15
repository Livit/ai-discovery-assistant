// data.jsx — shared data for the Labster prototype
// Realistic course names + dataset that flows across Home / Admin / Catalog

const LICENSES = [
  { id: "csi", name: "CSI College of Sciences", plan: "Course Access", role: "Administrator" },
  { id: "uni", name: "Northvale University", plan: "Site License", role: "Instructor" },
  { id: "hs",  name: "Riverside High School", plan: "Trial", role: "Instructor" },
];

const USER = {
  name: "Arthur Barthur",
  firstName: "Arthur",
  lastName: "Barthur",
  email: "abarthur@college.edu",
  initials: "AB",
};

// "My courses" — realistic and reused everywhere
const MY_COURSES = [
  {
    id: "chem-101", name: "General Chemistry — CHEM 101",
    sims: { played: 12, total: 16 },
    students: { active: 84, invited: 96 },
    coInstructors: { active: 2, invited: 3 },
    validity: { from: "1/15/2026", to: "5/30/2026" },
    instructors: ["a.barthur@college.edu", "k.morales@college.edu"],
    attempts: 1240, avgScore: 78,
  },
  {
    id: "orgo-210", name: "Organic Chemistry I — CHEM 210",
    sims: { played: 8, total: 12 },
    students: { active: 56, invited: 60 },
    coInstructors: { active: 1, invited: 1 },
    validity: { from: "1/15/2026", to: "5/30/2026" },
    instructors: ["a.barthur@college.edu"],
    attempts: 820, avgScore: 71,
  },
  {
    id: "bio-150", name: "Cell Biology — BIO 150",
    sims: { played: 6, total: 10 },
    students: { active: 42, invited: 48 },
    coInstructors: { active: 1, invited: 2 },
    validity: { from: "1/15/2026", to: "5/30/2026" },
    instructors: ["a.barthur@college.edu", "j.tanaka@college.edu"],
    attempts: 540, avgScore: 82,
  },
];

const RECOMMENDED = [
  { id: "r1", title: "Titration: Reach the Equivalence Point",  discipline: "Chemistry", duration: "35 min", level: "Intermediate", color: "chem", new: true },
  { id: "r2", title: "PCR: Diagnose a Genetic Disease",          discipline: "Biology",   duration: "45 min", level: "Intermediate", color: "bio" },
  { id: "r3", title: "Gel Electrophoresis: Visualize DNA",       discipline: "Biology",   duration: "30 min", level: "Beginner",     color: "bio" },
  { id: "r4", title: "Spectrophotometry: Determine an Unknown",  discipline: "Chemistry", duration: "40 min", level: "Intermediate", color: "chem" },
  { id: "r5", title: "Forces & Motion: The Roller Coaster",      discipline: "Physics",   duration: "25 min", level: "Beginner",     color: "physics", new: true },
  { id: "r6", title: "Microbiology: ID an Unknown Bacterium",    discipline: "Biology",   duration: "50 min", level: "Advanced",     color: "bio" },
];

// Disciplines used across the catalog. Order matters — sections render in this order.
const DISCIPLINES = ["Chemistry", "Biology", "Health Sciences", "Earth & Space Science"];

const CATALOG = [
  // — Chemistry —
  { id: "hs-chem", title: "High School Chemistry",
    description: "Cover the foundational principles of High School Chemistry, exploring atoms, molecules, reactions, and the behavior of matter through interactive simulations.",
    disciplines: ["Chemistry"], level: "High School", units: 4, sims: 8, theme: "chem-flask" },
  { id: "ap-chem", title: "AP Chemistry",
    description: "Conduct an in-depth analysis into the fascinating world of AP Chemistry, exploring atomic structure, chemical reactions, thermodynamics, and the behavior of gases through immersive virtual simulations.",
    disciplines: ["Chemistry"], level: "Advanced Placement", units: 5, sims: 12, theme: "chem-molecule" },
  { id: "intro-chem", title: "Introduction to Chemistry",
    description: "Embark on a scientific journey with Introduction to Chemistry, exploring the essentials of chemical reactions, atomic structure, and the properties of matter through immersive virtual simulations.",
    disciplines: ["Chemistry"], level: "Higher Education", units: 3, sims: 6, theme: "chem-flask" },
  { id: "gen-chem-1", title: "General Chemistry I",
    description: "Examine the essentials of chemistry with General Chemistry I, covering atomic structure, chemical bonds, stoichiometry, gas laws, and more through interactive virtual labs.",
    disciplines: ["Chemistry"], level: "Higher Education", units: 3, sims: 8, theme: "chem-bonds" },
  { id: "gen-chem-2", title: "General Chemistry II",
    description: "Explore the dynamic world of chemistry in General Chemistry II, diving into reactions, properties, and transformative processes that shape the molecular landscape.",
    disciplines: ["Chemistry"], level: "Higher Education", units: 3, sims: 8, theme: "chem-reaction" },
  { id: "orgo", title: "Organic Chemistry",
    description: "This course brings the essence of Organic Chemistry, mastering chemical safety, bonding, stereochemistry, and reaction mechanisms through immersive simulations.",
    disciplines: ["Chemistry"], level: "Higher Education", units: 4, sims: 10, theme: "chem-benzene" },
  { id: "bioorg", title: "General Bioorganic Chemistry",
    description: "Discover the links between biology and organic chemistry in our Bioorganic Chemistry course, which focuses on the foundational principles and practical applications.",
    disciplines: ["Chemistry", "Biology"], level: "Higher Education", units: 4, sims: 9, theme: "biochem" },
  { id: "biochem", title: "Biochemistry",
    description: "Master lab skills and biochemical techniques while investigating the intricacies of the major biomolecules that support life.",
    disciplines: ["Chemistry", "Biology"], level: "Higher Education", units: 4, sims: 10, theme: "biochem" },

  // — Biology —
  { id: "hs-bio", title: "High School Biology",
    description: "Venture into the marvels of biology, mastering an understanding of genetics, cell biology, ecology, and evolution.",
    disciplines: ["Biology"], level: "High School", units: 4, sims: 8, theme: "bio-cell" },
  { id: "ap-bio", title: "AP Biology",
    description: "Unlock the secrets of life from molecular biology to genetics and evolution in this comprehensive course, designed to foster a deep understanding of biological principles through immersive simulations.",
    disciplines: ["Biology"], level: "Advanced Placement", units: 5, sims: 12, theme: "bio-dna" },
  { id: "intro-bio", title: "Introduction to Biology",
    description: "Embark on an immersive journey with Introduction to Biology, exploring the foundations of life, the mysteries of cells, genetics, evolution, and ecosystems through dynamic virtual simulations.",
    disciplines: ["Biology"], level: "Higher Education", units: 3, sims: 6, theme: "bio-cell" },
  { id: "gen-bio", title: "General Biology I",
    description: "Master the full spectrum of foundational biological concepts from the chemical and molecular basis of life to genetic engineering.",
    disciplines: ["Biology"], level: "Higher Education", units: 4, sims: 10, theme: "bio-dna" },

  // — Health Sciences —
  { id: "anatomy", title: "Anatomy and Physiology",
    description: "Unlock the secrets of the human body with Anatomy and Physiology. Explore structures and processes at every scale, from cellular foundations to complex organ systems.",
    disciplines: ["Health Sciences", "Biology"], level: "Higher Education", units: 5, sims: 12, theme: "anatomy" },
  { id: "food", title: "Food Science and Nutrition",
    description: "Engage in an educational adventure, exploring the fundamentals of food science and nutrition, from the role of nutrition in health to food preservation.",
    disciplines: ["Health Sciences", "Biology", "Chemistry", "Earth & Space Science"], level: "Higher Education", units: 4, sims: 9, theme: "food" },

  // — Earth & Space Science —
  { id: "hs-earth", title: "High School Earth and Space Science",
    description: "Uncover the mysteries of the universe, Earth's geological transformations, and environmental challenges through immersive virtual simulations in our High School Earth and Space Science Course.",
    disciplines: ["Earth & Space Science"], level: "High School", units: 4, sims: 8, theme: "earth-space" },
  { id: "ap-env", title: "AP Environmental Science",
    description: "Dive into AP Environmental Science, exploring ecosystems, biodiversity, and Earth's cycles to understand our planet's complex interconnections.",
    disciplines: ["Earth & Space Science", "Biology"], level: "Advanced Placement", units: 5, sims: 11, theme: "env-leaf" },
];

const INSTRUCTORS = [
  { name: "Arthur Barthur",   email: "abarthur@college.edu",   lastLogin: "Today, 9:41 AM",  status: "active" },
  { name: "Kira Morales",     email: "k.morales@college.edu",  lastLogin: "Today, 8:12 AM",  status: "active" },
  { name: "Jun Tanaka",       email: "j.tanaka@college.edu",   lastLogin: "Yesterday",       status: "active" },
  { name: "Priya Raman",      email: "p.raman@college.edu",    lastLogin: "Mar 28, 2026",    status: "active" },
  { name: "Lukas Weber",      email: "l.weber@college.edu",    lastLogin: "—",               status: "invited" },
  { name: "Sasha Petrov",     email: "s.petrov@college.edu",   lastLogin: "Mar 12, 2026",    status: "dormant" },
];

const STUDENTS = [
  { name: "Adaeze Okafor",    email: "a.okafor@college.edu",    lastLogin: "Today, 10:03 AM", status: "active"  },
  { name: "Bjorn Lindqvist",  email: "b.lindqvist@college.edu", lastLogin: "Today, 8:55 AM",  status: "active"  },
  { name: "Carmen Ortiz",     email: "c.ortiz@college.edu",     lastLogin: "Yesterday",       status: "active"  },
  { name: "Daniela Reyes",    email: "d.reyes@college.edu",     lastLogin: "Apr 30, 2026",    status: "active"  },
  { name: "Emil Kowalski",    email: "e.kowalski@college.edu",  lastLogin: "—",               status: "invited" },
  { name: "Farah Habibi",     email: "f.habibi@college.edu",    lastLogin: "Mar 22, 2026",    status: "dormant" },
];

const DASH_COURSES = [
  { name: "General Chemistry — CHEM 101",     instructors: "a.barthur@college.edu, k.morales@college.edu", students: 84, attempts: 1240, score: 78 },
  { name: "Organic Chemistry I — CHEM 210",   instructors: "a.barthur@college.edu",                        students: 56, attempts: 820,  score: 71 },
  { name: "Cell Biology — BIO 150",           instructors: "a.barthur@college.edu, j.tanaka@college.edu", students: 42, attempts: 540,  score: 82 },
  { name: "Microbiology — BIO 220",           instructors: "p.raman@college.edu",                          students: 38, attempts: 510,  score: 75 },
  { name: "Genetics — BIO 240",               instructors: "j.tanaka@college.edu",                         students: 29, attempts: 360,  score: 80 },
];

// Bar chart heights — 12 months per metric
const CHART_DATA = {
  staff:        [42, 56, 64, 50, 18, 38, 22, 14, 60, 70, 58, 78],
  students:     [110, 140, 175, 145, 50, 95, 60, 30, 165, 195, 170, 200],
  simsPlayed:   [120, 150, 180, 145, 30, 80, 40, 22, 175, 200, 175, 210],
  attempts:     [7000, 9200, 11000, 9500, 1800, 4800, 2200, 1400, 10500, 12500, 10800, 12800],
};

const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

// UX improvement annotations
const UX_NOTES = {
  home: [
    { id: "h1", target: ".home-banner", x: "5%", y: "10%", title: "Personalize the hero", body: "Replace static banner with a dynamic 'Continue where you left off' module — surface the last simulation a student played or the next one due. Banner-style upsells score low on dashboards-for-instructors." },
    { id: "h2", target: ".course-card", x: "1%", y: "10%", title: "Health at a glance", body: "Add a small status indicator (green / amber / red) next to each course title to flag low engagement, expiring licenses or grading backlog without scanning all stats." },
    { id: "h3", target: ".section-head", x: "92%", y: "0%", title: "Empty state guidance", body: "If 'My courses' is empty, show a guided template picker instead of a blank state. First-time-instructor activation is one of the biggest drop-off points." },
    { id: "h4", target: ".rec-grid",   x: "0%", y: "-5%", title: "Explain the 'why'", body: "Add a one-liner under 'Recommended simulations' explaining why each is recommended (matches your courses / your students struggled with topic X) — recommendations without rationale read as random." },
  ],
  catalog: [
    { id: "c1", target: ".cat-search", x: "94%", y: "30%", title: "Search-as-you-type with facets", body: "Currently it's a passive input. Surface inline filters (level, duration, language) below the search box and show counts on each filter chip — instructors filter heavily." },
    { id: "c2", target: ".cat-card",   x: "1%", y: "20%", title: "Preview without leaving", body: "Add an expandable 'Quick look' panel inline on each card showing learning outcomes + a 5-sec animated preview, so users don't need to bounce into a full course page to evaluate." },
    { id: "c3", target: ".cat-discipline", x: "94%", y: "10%", title: "Bulk add to course", body: "Let instructors multi-select sims and add to a course with one action. Today they have to click 'Add course' once per item." },
  ],
  admin: [
    { id: "a1", target: ".kpi-row", x: "20%", y: "-10%", title: "Trend, not just total", body: "KPIs show point-in-time numbers. Add a 7-day delta indicator (▲ 12% vs last week) so admins can spot sudden drops in engagement." },
    { id: "a2", target: ".charts-grid", x: "0%", y: "-5%", title: "Compare metrics", body: "Four separate charts make correlation hard. Offer a layered view (e.g. simulation attempts vs unique students) to spot whether usage is real engagement or one student replaying." },
    { id: "a3", target: ".table", x: "92%", y: "0%", title: "Action column", body: "Make rows actionable — message all students in a low-scoring course, export grades, or re-invite dormant instructors directly from the table." },
    { id: "a4", target: ".license-row", x: "92%", y: "0%", title: "Forecast usage", body: "On License, show a small projection: 'At current rate, you'll exceed your seat cap in 18 days' so admins act before students get blocked." },
  ],
  account: [
    { id: "ac1", target: ".account-card", x: "94%", y: "5%", title: "Inline edit", body: "Right now every value looks read-only. Make name, email and password individually editable with an 'Edit' control per row, instead of a separate settings page." },
    { id: "ac2", target: ".sb-account", x: "100%", y: "-50%", title: "Persistent menu access", body: "The account submenu is hidden behind a small chevron — consider exposing My Account, Settings, Help and Log out as a single click from the avatar to reduce a navigation step." },
  ],
};

window.LP_DATA = { LICENSES, USER, MY_COURSES, RECOMMENDED, CATALOG, DISCIPLINES, INSTRUCTORS, STUDENTS, DASH_COURSES, CHART_DATA, MONTHS, UX_NOTES };
