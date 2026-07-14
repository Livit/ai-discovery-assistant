// catalog-ai-data.jsx — Realistic fake data for the AI catalog experience.
// Keeps catalog.jsx focused on UI; data lives here so it's easy to edit.

// ── Suggestion data ──────────────────────────────────────────
// Each entry has a kind: "sim" (simulation/course title),
// "outcome" (learning outcome framing), "topic" (topic / concept).
// Suggestions are filtered by query substring against `keywords`.
const SUGGESTIONS = [
  // Cell division cluster
  { kind: "sim",     label: "Cell Division",                                       sub: "Simulation · Introductory Biology · 35 min",       keywords: "cell div mitosis meiosis chromosome" },
  { kind: "outcome", label: "Understanding mitosis and meiosis",                   sub: "Learning outcome · 6 simulations cover this",      keywords: "cell div mitosis meiosis chromosome cycle" },
  { kind: "topic",   label: "Chromosome structure and replication",                sub: "Topic · 4 simulations cover this",                  keywords: "cell div chromosome replication dna mitosis" },
  { kind: "outcome", label: "Identify phases of the cell cycle",                   sub: "Learning outcome · 3 simulations cover this",       keywords: "cell div cycle mitosis phase interphase" },
  { kind: "sim",     label: "Meiosis: Genetic Variation Through Crossing Over",    sub: "Simulation · Genetics · 40 min",                    keywords: "cell div meiosis genetic variation crossing" },

  // Osmosis / membrane transport
  { kind: "sim",     label: "Osmosis and Diffusion: Choose the Right Solution",    sub: "Simulation · Introductory Biology · 35 min",        keywords: "osmosis diffusion membrane transport water" },
  { kind: "outcome", label: "Explain how water moves across a semipermeable membrane", sub: "Learning outcome · 5 simulations cover this",  keywords: "osmosis water membrane semipermeable diffusion" },
  { kind: "topic",   label: "Passive transport and tonicity",                      sub: "Topic · 4 simulations cover this",                  keywords: "osmosis membrane transport tonicity passive diffusion" },

  // PCR
  { kind: "sim",     label: "PCR: Diagnose a Genetic Disease",                     sub: "Simulation · Molecular Biology · 45 min",           keywords: "pcr polymerase dna amplification genetic" },
  { kind: "outcome", label: "Design primers and interpret PCR results",            sub: "Learning outcome · 3 simulations cover this",       keywords: "pcr primer amplification dna molecular" },

  // Titration
  { kind: "sim",     label: "Titration: Reach the Equivalence Point",              sub: "Simulation · General Chemistry · 35 min",           keywords: "titration acid base ph equivalence" },
  { kind: "topic",   label: "Acid–base equilibria and indicators",                 sub: "Topic · 6 simulations cover this",                  keywords: "titration acid base equilibria indicator" },
];

// ── Search results for the natural-language osmosis query ────
const NL_QUERY_DEFAULT = "a simulation that helps students understand osmosis before a wet lab";
const NL_INTERPRETATION = ["osmosis", "membrane transport", "diffusion", "pre-lab"];

const NL_RESULTS = [
  {
    id: "osmosis-1",
    title: "Osmosis and Diffusion: Choose the Right Solution",
    discipline: "Biology",
    level: "Introductory",
    duration: "35 min",
    description: "Help a struggling aquarium fish by choosing the right saline solution. Predict how cells respond in hypertonic, hypotonic and isotonic environments through guided experiments.",
    confidence: "strong",
    match: "Covers osmosis fundamentals at an introductory level, suitable as pre-lab preparation. Includes a guided prediction step that mirrors a typical wet-lab worksheet.",
    theme: "bio-cell",
  },
  {
    id: "membrane-1",
    title: "Membrane Transport: Active vs Passive Transport",
    discipline: "Biology",
    level: "Introductory",
    duration: "40 min",
    description: "Investigate how molecules cross the cell membrane. Distinguish between simple diffusion, facilitated diffusion, osmosis and active transport using a virtual cell.",
    confidence: "strong",
    match: "Frames osmosis as one mode of passive transport — useful primer that sets up the broader context your students will see in lab.",
    theme: "bio-cell",
  },
  {
    id: "kidney-1",
    title: "Kidney Function: Filtration and Osmoregulation",
    discipline: "Health Sciences",
    level: "Intermediate",
    duration: "45 min",
    description: "Follow filtrate through the nephron and adjust ADH levels to see how the kidney regulates water balance and blood pressure in real time.",
    confidence: "partial",
    match: "Partial match — uses osmosis as the underlying mechanism but assumes prior understanding. Better as a follow-up than as pre-lab prep.",
    theme: "anatomy",
  },
  {
    id: "plant-1",
    title: "Plant Water Uptake: From Roots to Leaves",
    discipline: "Biology",
    level: "Introductory",
    duration: "30 min",
    description: "Trace water movement from root hairs to stomata. Observe the role of osmotic gradients and transpiration pull in moving water upward.",
    confidence: "partial",
    match: "Partial match — applies osmosis in a plant biology context. Pair with a dedicated osmosis sim if your wet lab uses animal cells.",
    theme: "env-leaf",
  },
];

// ── Zero-result query data ────────────────────────────────────
const ZERO_QUERY = "human factors engineering lab simulation";
const ZERO_CLOSEST = [
  {
    id: "z1",
    title: "Sensory Perception: How the Brain Interprets Stimuli",
    discipline: "Health Sciences",
    level: "Intermediate",
    duration: "40 min",
    description: "Run perception experiments to see how the visual and auditory systems process sensory input, including limits of attention and reaction time.",
    relation: "Closest topical match — touches on reaction time and perception thresholds, which overlap with human factors testing.",
    theme: "anatomy",
  },
  {
    id: "z2",
    title: "Anatomy of the Human Eye: Vision and Optics",
    discipline: "Health Sciences",
    level: "Introductory",
    duration: "35 min",
    description: "Dissect the structures of the eye and model how light is focused on the retina, then explore common visual disorders.",
    relation: "Adjacent — useful when teaching display ergonomics or visual workload, but doesn't cover task design or workplace systems.",
    theme: "anatomy",
  },
  {
    id: "z3",
    title: "Statistical Analysis: Design a Controlled Experiment",
    discipline: "Biology",
    level: "Intermediate",
    duration: "30 min",
    description: "Plan an experiment, choose appropriate sample sizes and run a hypothesis test on the data — a core skill across applied disciplines.",
    relation: "Method match — the experimental-design framing transfers to human-subjects studies, even though the content isn't HFE.",
    theme: "biochem",
  },
];

// ── Syllabus-result data ──────────────────────────────────────
const SYLLABUS_COURSE = {
  course: "Cell Biology — BIO 150",
  inferred: true,
  totalMatches: 14,
  units: [
    {
      id: "u1",
      name: "Cell Structure and Function",
      state: "match",
      sims: [
        { id: "s1", title: "Tour of a Eukaryotic Cell", desc: "Explore organelles in 3D and assign each one its function inside a living cell.", duration: "35 min", level: "Introductory", theme: "bio-cell" },
        { id: "s2", title: "Cellular Respiration: Aerobic Metabolism", desc: "Track glucose through glycolysis, the Krebs cycle, and oxidative phosphorylation.", duration: "45 min", level: "Intermediate", theme: "biochem" },
        { id: "s3", title: "The Endomembrane System in Action", desc: "Follow a protein from the ER to the cell surface and troubleshoot trafficking errors.", duration: "40 min", level: "Intermediate", theme: "bio-cell" },
      ],
    },
    {
      id: "u2",
      name: "Membrane Transport",
      state: "match",
      sims: [
        { id: "s4", title: "Osmosis and Diffusion: Choose the Right Solution", desc: "Save an aquarium fish by predicting how cells behave in different tonicities.", duration: "35 min", level: "Introductory", theme: "bio-cell" },
        { id: "s5", title: "Membrane Transport: Active vs Passive Transport", desc: "Distinguish passive diffusion, facilitated diffusion and active transport.", duration: "40 min", level: "Introductory", theme: "bio-cell" },
        { id: "s6", title: "Ion Channels: The Action Potential", desc: "Trigger an action potential and measure the membrane potential across an axon.", duration: "45 min", level: "Intermediate", theme: "anatomy" },
        { id: "s7", title: "Endocytosis and Exocytosis", desc: "Watch how cells engulf and expel large molecules using vesicle transport.", duration: "30 min", level: "Introductory", theme: "bio-cell" },
      ],
    },
    {
      id: "u3",
      name: "Cell Division and Reproduction",
      state: "match",
      sims: [
        { id: "s8", title: "Mitosis: Replicate Your Cells", desc: "Walk through each phase of mitosis and verify that chromosomes are evenly distributed.", duration: "35 min", level: "Introductory", theme: "bio-dna" },
        { id: "s9", title: "Meiosis: Genetic Variation Through Crossing Over", desc: "Pair homologous chromosomes and observe how variation is generated.", duration: "40 min", level: "Intermediate", theme: "bio-dna" },
      ],
    },
    {
      id: "u4",
      name: "Genetics and Gene Expression",
      state: "partial",
      gap: "We have strong coverage of DNA structure and replication, but gene-expression regulation in eukaryotes is thin. The simulation below covers part of the unit; the rest of the topics aren't yet in our catalog.",
      sims: [
        { id: "s10", title: "DNA Structure: Build a Double Helix", desc: "Assemble base pairs to build a DNA molecule and explore replication.", duration: "30 min", level: "Introductory", theme: "bio-dna" },
      ],
    },
  ],
};

window.AI_CATALOG_DATA = {
  SUGGESTIONS,
  NL_QUERY_DEFAULT, NL_INTERPRETATION, NL_RESULTS,
  ZERO_QUERY, ZERO_CLOSEST,
  SYLLABUS_COURSE,
};
