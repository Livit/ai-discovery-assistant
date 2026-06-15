// doctorone-data.jsx — fake data for the Doctor One AI assistant.

// ── Courses the instructor has already created ───────────────
// Used by Flow 3 — "Get suggestions to add content to an existing course".
const DRONE_COURSES = [
  {
    id: "c-cellbio",
    title: "Cell Biology — BIO 150",
    discipline: "Biology",
    term: "Spring 2026",
    students: 142,
    sims: 8,
    units: 4,
    cover: "bio-cell",
  },
  {
    id: "c-genchem",
    title: "General Chemistry I — CHM 110",
    discipline: "Chemistry",
    term: "Spring 2026",
    students: 96,
    sims: 6,
    units: 5,
    cover: "chem",
  },
  {
    id: "c-anatomy",
    title: "Human Anatomy & Physiology",
    discipline: "Health Sciences",
    term: "Fall 2025",
    students: 58,
    sims: 11,
    units: 6,
    cover: "anatomy",
  },
  {
    id: "c-microbio",
    title: "Introductory Microbiology",
    discipline: "Biology",
    term: "Spring 2026",
    students: 71,
    sims: 5,
    units: 4,
    cover: "bio-cell",
  },
];

// ── Simulation pool used across flows ────────────────────────
// Every output card uses this same shape. `discipline` drives the
// thumbnail color via DISC tokens in catalog.jsx.
const DRONE_SIM_POOL = {
  // Cell biology cluster
  s_tour: {
    id: "s_tour", title: "Tour of a Eukaryotic Cell",
    discipline: "Biology", level: "Introductory", duration: "35 min",
    description: "Explore organelles in 3D and assign each one its function inside a living cell.",
  },
  s_osmosis: {
    id: "s_osmosis", title: "Osmosis and Diffusion: Choose the Right Solution",
    discipline: "Biology", level: "Introductory", duration: "35 min",
    description: "Save an aquarium fish by predicting how cells behave in hypertonic, isotonic and hypotonic environments.",
  },
  s_membrane: {
    id: "s_membrane", title: "Membrane Transport: Active vs Passive Transport",
    discipline: "Biology", level: "Introductory", duration: "40 min",
    description: "Distinguish passive diffusion, facilitated diffusion and active transport with a virtual cell.",
  },
  s_mitosis: {
    id: "s_mitosis", title: "Mitosis: Replicate Your Cells",
    discipline: "Biology", level: "Introductory", duration: "35 min",
    description: "Walk through each phase of mitosis and verify chromosomes are evenly distributed.",
  },
  s_meiosis: {
    id: "s_meiosis", title: "Meiosis: Genetic Variation Through Crossing Over",
    discipline: "Biology", level: "Intermediate", duration: "40 min",
    description: "Pair homologous chromosomes and observe how genetic variation is generated.",
  },
  s_dna: {
    id: "s_dna", title: "DNA Structure: Build a Double Helix",
    discipline: "Biology", level: "Introductory", duration: "30 min",
    description: "Assemble base pairs to build a DNA molecule and explore semi-conservative replication.",
  },
  s_geneexp: {
    id: "s_geneexp", title: "Gene Expression: From Transcription to Translation",
    discipline: "Biology", level: "Intermediate", duration: "45 min",
    description: "Follow a gene from DNA template to functional protein. Troubleshoot a misfolded result.",
  },
  s_respiration: {
    id: "s_respiration", title: "Cellular Respiration: Aerobic Metabolism",
    discipline: "Biology", level: "Intermediate", duration: "45 min",
    description: "Track glucose through glycolysis, the Krebs cycle, and oxidative phosphorylation.",
  },
  s_photo: {
    id: "s_photo", title: "Photosynthesis: The Light Reactions",
    discipline: "Biology", level: "Intermediate", duration: "40 min",
    description: "Measure oxygen output from a chloroplast suspension as you vary light wavelength.",
  },
  s_microscope: {
    id: "s_microscope", title: "Light Microscopy: Resolve a Specimen",
    discipline: "Biology", level: "Introductory", duration: "25 min",
    description: "Master Köhler illumination and bring blurred samples into focus for measurement.",
  },
  s_endomembrane: {
    id: "s_endomembrane", title: "The Endomembrane System in Action",
    discipline: "Biology", level: "Intermediate", duration: "40 min",
    description: "Follow a protein from the ER to the cell surface and troubleshoot trafficking errors.",
  },
};

// ── Flow 1 output — Prepare next course ──────────────────────
// Driven by the (synthetic) user follow-up: discipline=Biology,
// topics=cell structure / membrane transport / cell division,
// LOs around mitosis & meiosis.
const DRONE_PREPARE_RECS = [
  {
    sim: "s_tour",
    alignment: "Covers your first learning objective on identifying organelles and their functions, set at the right intro level for week 1 of the course.",
  },
  {
    sim: "s_osmosis",
    alignment: "Directly addresses the membrane transport topic — students predict outcomes in different tonicities, which mirrors a typical pre-lab worksheet.",
  },
  {
    sim: "s_membrane",
    alignment: "Frames osmosis as one mode of passive transport, then contrasts it with active transport. Useful primer that pairs with the wet-lab session.",
  },
  {
    sim: "s_mitosis",
    alignment: "Maps to your learning objective on identifying phases of the cell cycle. Includes an embedded quiz on chromosome behaviour.",
  },
  {
    sim: "s_meiosis",
    alignment: "Extends the cell-division topic to gamete formation. Recommended after Mitosis so students see the contrast in chromosome number and crossing over.",
  },
  {
    sim: "s_dna",
    alignment: "Sets up the genetics unit. Students build base pairs by hand — strong foundation before gene-expression simulations.",
  },
];

// ── Flow 3 output — Add to an existing course ────────────────
// Keyed by courseId. `inCourse` lists sims already added.
// `suggestions` are new recommendations with a reason.
const DRONE_ADD_TO_COURSE = {
  "c-cellbio": {
    inCourse: ["s_tour", "s_osmosis", "s_membrane", "s_mitosis"],
    suggestions: [
      {
        sim: "s_meiosis",
        alignment: "Your course covers Mitosis but not Meiosis. This simulation closes that gap and reuses the same chromosome-pairing UI students already know.",
      },
      {
        sim: "s_endomembrane",
        alignment: "Extends Unit 1 (Cell Structure) into protein trafficking — students often ask about this after the organelles tour.",
      },
      {
        sim: "s_geneexp",
        alignment: "Bridges your weakest unit (Genetics). Picks up where DNA Structure leaves off and ends at a functional protein.",
      },
      {
        sim: "s_respiration",
        alignment: "Connects organelles to metabolism — a recurring exam topic where prior cohorts have struggled.",
      },
    ],
  },
  "c-genchem": {
    inCourse: [],
    suggestions: [
      {
        sim: "s_microscope",
        alignment: "Lab-skills primer that pairs well with your titration unit — same precision-measurement mindset.",
      },
    ],
  },
  "c-anatomy": {
    inCourse: ["s_tour", "s_membrane"],
    suggestions: [
      {
        sim: "s_osmosis",
        alignment: "Reinforces tonicity before your kidney-function unit — instructors who added this saw a 12% bump in unit-test scores.",
      },
      {
        sim: "s_respiration",
        alignment: "Sets up the muscle-physiology unit by grounding students in ATP production first.",
      },
    ],
  },
  "c-microbio": {
    inCourse: ["s_microscope"],
    suggestions: [
      {
        sim: "s_tour",
        alignment: "Useful refresher on eukaryotic cells before you contrast them with prokaryotic architecture in Unit 2.",
      },
      {
        sim: "s_dna",
        alignment: "Foundation for the bacterial-genetics unit. Students arrive shaky on base-pairing — this builds the muscle.",
      },
    ],
  },
};

window.DR_ONE_DATA = {
  DRONE_COURSES,
  DRONE_SIM_POOL,
  DRONE_PREPARE_RECS,
  DRONE_ADD_TO_COURSE,
};
