// ai-engine.js — Live AI for the "Describe what I am teaching" flow.
// Exposes window.LabsterAI with:
//   prefilter(text)       → narrows the 311-sim catalog to top candidates (recall step)
//   converse(history)     → calls Claude with the system prompt + candidates, returns
//                           { type:"reply", text } | { type:"recommendations", intro, strong, partial }
//
// The catalog (window.SIMS_CATALOG) is loaded from sims-catalog.js.

(function () {
  // ── FRICTIONLESS system prompt (new — results-first, refine after) ────────
  // Same role, tone, boundaries and negative rules as guided, but the five
  // factors become OPTIONAL refinement dials instead of an entry gate.
  const SYSTEM_PROMPT_FRICTIONLESS = `You are a knowledgeable US higher education STEM Educational Content Specialist specializing in finding or curating relevant educational materials. Maintain a balanced, educational tone, always keeping scientific rigor in your conversations. Be concise and helpful.

Your domain knowledge centers on curriculum mapping, pedagogical alignment, and digital literacy. Your core expertise involves identifying, evaluating, and integrating high-quality educational resources into higher education and high school STEM courses. You clearly understand how to embed simulations into high school and university-level syllabi.

Purpose: Your sole function is to help instructors find Labster simulations that fit their teaching needs. Every response should move toward that goal. Stay focused on content discovery — if the conversation drifts elsewhere, acknowledge briefly and redirect warmly.

Results first: The instructor's time is the priority. The moment you have enough signal to produce useful matches — typically a discipline and a topic, or any description that the candidate list can match against — return recommendations immediately. Do NOT run an intake before showing results. Show first, refine after.

The five factors — discipline, educational level, topics covered, learning objectives, relevant learning standards — are refinement dials, NOT a gate. You do not need them answered before recommending. Instead, after you show results, you may offer ONE optional refinement so the instructor can narrow the set if they want to. Pick the single factor whose values vary MOST across the results you are showing — the one most likely to change the set (e.g. if the matches span Introductory through Advanced, offer level; if they span several disciplines, offer discipline). If the result set is already tight and coherent, offer no refinement. Never offer more than one refinement at a time.

When to ask instead of show: Only ask a clarifying question when the request is too vague to produce any match above threshold — when you genuinely cannot tell what the instructor is teaching. In that case ask exactly ONE short question (one sentence) to get the minimum signal needed, then recommend. Never ask a second question; if the answer is still thin, show your best matches and let a refinement chip do the rest.

If the user answers "no," "don't know," or anything dismissive, accept it immediately and recommend with what you have. Never re-ask. Never make the user feel they must justify their choices to get results.

Tone and dynamic: The user is the expert on their course. You're here to help them find content, not to evaluate their choices or second-guess their needs. Keep responses concise and direct. One idea per message. No preamble.

Recommendations: Present results in two tiers — Strong match (simulations covering 80–100% of what the user described) and Partial match (simulations covering 60–79%, clearly labeled as such). Do not surface simulations below 60% coverage. For each simulation, include the title, a one-line explanation of why it matches, and the relevant metadata (duration, level, discipline).

No results: If nothing meets the threshold, say so plainly. Offer the user a chance to refine or broaden their description — but don't push. One prompt, then let them lead.

Boundaries: If a user asks something outside content discovery — general advice, curriculum design, technical support, anything unrelated — acknowledge it briefly and bring the conversation back: "That's outside what I can help with here — I'm focused on finding the right simulations for you. Want to continue from where we left off?"

Negative rules

Tone & relationship:
- Never position yourself as the expert correcting or guiding the instructor.
- Never be overly enthusiastic or use hollow affirmations ("Great question!", "Absolutely!", "That's a fantastic learning objective!").
- Never be paternalistic — don't add unsolicited advice about pedagogy or curriculum design.
- Never over-explain your own reasoning unless asked.
- Never apologize excessively.

Conversation flow:
- Never run a multi-question intake before showing results.
- Never ask more than one question at a time, and only ask at all when you cannot match the request.
- Never re-ask a question the user has already answered or declined to answer.
- Never push back if the user says they don't know — accept it and recommend.
- Never stall with filler responses before showing results.
- Never withhold recommendations to collect more context when you already have enough to match.

Recommendations:
- Never show simulations below 60% match, even to fill space.
- Never present a weak match as strong — if it's partial, label it as partial.
- Never fabricate or infer simulation content that isn't in the catalog.
- Never show the same simulation twice in the same set of results.
- Never frame partial matches as "close enough" in a way that oversells fit.

Scope:
- Never engage with topics outside content discovery — curriculum advice, pedagogical strategy, technical support, general AI questions.
- Never comment on the quality of the user's syllabus, learning objectives, or course structure.
- Never make assumptions about what the instructor should be teaching.

Trust & transparency:
- Never present AI-generated matches as definitive or certain.
- Never hide when a match is weak or coverage is incomplete.
- Never make the user feel like they need to justify their choices to get results.`;

  // ── Output contract (FRICTIONLESS) — results-first, optional refine chips ──
  const OUTPUT_CONTRACT_FRICTIONLESS = `OUTPUT FORMAT — STRICT
You are powering a UI, so you must respond with a SINGLE JSON object and nothing else (no markdown, no code fences, no text before or after).

Use exactly one of these two shapes:

1) A conversational turn — use ONLY when the request is too vague to match anything, or for a boundary redirect / no-results message:
{"type":"reply","text":"<one short question or message, one idea, concise>"}

2) Recommendations — your DEFAULT response whenever the candidate list can produce any match at 60%+:
{"type":"recommendations","intro":"<one short sentence introducing the results>","strong":[{"code":"<SIM CODE>","reason":"<one-line why it matches>"}],"partial":[{"code":"<SIM CODE>","reason":"<one-line why it is a partial match>"}],"refine":{"prompt":"<short call to action, e.g. 'Narrow by level'>","factor":"level","options":["<2–4 short option labels>"]}}

Rules:
- Choose "code" values ONLY from the CANDIDATE SIMULATIONS list below. Never invent a code or a simulation.
- "strong" = 80–100% coverage; "partial" = 60–79%. Omit anything below 60%. Either array may be empty.
- Do not repeat a code across strong and partial.
- Keep each "reason" to one line, grounded in the simulation's actual learning objectives. Do not restate the title.
- RECOMMEND FIRST. Do not ask intake questions to collect the five factors before showing results — show results as soon as you can match the request.
- "refine" is OPTIONAL and at most ONE per response. Include it only when a single factor would meaningfully narrow the current set; pick the factor (level / discipline / topic / objective / standard) whose values vary MOST across the simulations you are returning. Provide 2–4 concrete option labels drawn from those results. If the set is already tight, OMIT "refine" entirely.
- Only use {"type":"reply"} to ask a question when you genuinely cannot match the request at all. Ask exactly one short question, then recommend on the next turn.
- If nothing clears 60%, return a {"type":"reply"} that says so plainly and offers to refine or broaden.`;

  // ── Local prefilter: narrow catalog → candidates (recall, not ranking) ─────
  const STOP = new Set(("a an and the of to for in on with at by from is are be this that my our your i we teaching teach class course students student level want need cover covering topics topic about would like help find show me my".split(" ")));
  const DISCIPLINES = ["chemistry","biology","physics","medicine","health","engineering","general science","anatomy","physiology","biochemistry","microbiology","genetics","ecology"];

  // Conservative stemmer: collapses simple plural/morphological variants so the query
  // word "cells" matches the catalog word "cell", and "structures" ↔ "structure".
  function stem(w) {
    if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
    if (w.length > 4 && (w.endsWith("ses") || w.endsWith("xes") || w.endsWith("hes"))) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
    return w;
  }

  // Concept expansion — the recall step is lexical, so a query term is broadened to the
  // vocabulary the catalog ACTUALLY uses for the same concept. This fixes the "vocabulary
  // mismatch" problem: e.g. "prokaryotic" appears in almost no bacterial sims, which
  // describe themselves as "bacterial", "gram", "plasmid", etc. A query term that matches
  // (stemmed) any term in a group below adds the OTHER terms as lower-weight signals.
  const CONCEPTS = [
    ["prokaryote","prokaryotic","bacteria","bacterial","gram","plasmid","flagella","flagellum","archaea","coli","peptidoglycan","microbe","microbial","microbiology"],
    ["eukaryote","eukaryotic","organelle","nucleus","nuclei","mitochondria","cytoplasm","cytoplasmic"],
    ["cell","cellular","cytoplasm","membrane","organelle"],
    ["gene","genetic","genetics","dna","genome","genomic","chromosome","allele","mutation","plasmid"],
    ["protein","synthesis","ribosome","translation","transcription","peptide","amino"],
    ["evolution","evolutionary","phylogenetic","phylogeny","taxonomy","taxonomic","species"],
    ["enzyme","enzymatic","catalysis","substrate","kinetics"],
    ["acid","base","buffer","titration","neutralization"],
    ["photosynthesis","chloroplast","calvin"],
    ["respiration","mitochondria","atp","glycolysis","krebs"],
    ["stain","staining","gram","microscopy","microscope","brightfield","darkfield"],
    ["ecology","ecosystem","biodiversity","biome","population","community"]
  ];
  const CONCEPT_INDEX = (() => {
    const idx = new Map(); // stemmed term -> Set of stemmed sibling terms
    for (const group of CONCEPTS) {
      const stemmed = group.map(t => t.split(/\s+/).map(stem).join(" "));
      for (const term of stemmed) {
        if (!idx.has(term)) idx.set(term, new Set());
        for (const sib of stemmed) if (sib !== term) idx.get(term).add(sib);
      }
    }
    return idx;
  })();

  function tokens(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter(w => w.length >= 3 && !STOP.has(w)).map(stem);
  }

  // Stemmed word set for a catalog field, so matching is word-level (not substring)
  // and plural/singular agnostic.
  function fieldSet(s) {
    return new Set((s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter(w => w.length >= 2).map(stem));
  }

  function prefilter(text, limit) {
    limit = limit || 90;
    const cat = window.SIMS_CATALOG || [];
    const qExact = new Set(tokens(text));
    const qExpand = new Set();
    for (const w of qExact) {
      const sibs = CONCEPT_INDEX.get(w);
      if (sibs) for (const s of sibs) if (!qExact.has(s)) qExpand.add(s);
    }
    const ql = (text || "").toLowerCase();
    const mentionedDisc = DISCIPLINES.filter(d => ql.includes(d));

    const scored = cat.map(sim => {
      const nameSet = fieldSet(sim.n);
      const loSet   = fieldSet(sim.o);
      const techSet = fieldSet(sim.k);
      const discSet = fieldSet((sim.s || "") + " " + (sim.d || ""));
      const discRaw = ((sim.s || "") + " " + (sim.d || "")).toLowerCase();
      const blob = ((sim.n || "") + " " + (sim.o || "")).toLowerCase();
      // whole-word (stemmed) match, or multi-word concept phrase substring
      const hit = (set, w) => set.has(w) || (w.includes(" ") && blob.includes(w));
      let score = 0;
      for (const w of qExact) {
        if (hit(nameSet, w)) score += 5;
        if (hit(loSet, w))   score += 3;
        if (hit(techSet, w)) score += 2;
        if (hit(discSet, w)) score += 1;
      }
      for (const w of qExpand) { // expansion signals count, weighted lower than exact
        if (hit(nameSet, w)) score += 3;
        if (hit(loSet, w))   score += 2;
        if (hit(techSet, w)) score += 1.5;
        if (hit(discSet, w)) score += 0.5;
      }
      // Discipline baseline so the right section is well-represented in the pool
      if (mentionedDisc.some(d => discRaw.includes(d))) score += 2;
      return { sim, score };
    });

    scored.sort((a, b) => b.score - a.score);
    let pool = scored.filter(s => s.score > 0);
    // If the query was too sparse to match anything, fall back to discipline or first N
    if (pool.length === 0) pool = scored;
    return pool.slice(0, limit).map(s => s.sim);
  }

  function candidateBlock(cands) {
    // Compact JSON the model reads to ground its picks.
    const rows = cands.map(s => ({
      code: s.c, name: s.n, discipline: s.s, level: s.l, duration: s.t,
      objectives: s.o,
      standards: (s.std || "").slice(0, 160)
    }));
    return "CANDIDATE SIMULATIONS (the ONLY sims you may recommend; pick by \"code\"):\n" + JSON.stringify(rows);
  }

  // Extract the first complete, balanced {...} object from a string, respecting
  // string literals/escapes. Returns the substring or null. This tolerates trailing
  // garbage the model sometimes appends after a valid object.
  function firstJsonObject(s) {
    const start = s.indexOf("{");
    if (start < 0) return null;
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
      } else {
        if (ch === '"') inStr = true;
        else if (ch === "{") depth++;
        else if (ch === "}") { depth--; if (depth === 0) return s.slice(start, i + 1); }
      }
    }
    return null; // unbalanced (e.g. truncated by output cap)
  }

  function parseResponse(raw) {
    if (!raw) return { type: "reply", text: "Sorry — I didn't get a response. Try again?" };
    let t = raw.trim();
    // strip code fences if the model added them
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    let obj = null;
    try { obj = JSON.parse(t); }
    catch (e) {
      // The model sometimes appends a duplicated fragment after a complete object
      // (e.g. ...}"strong":[...]}). Extract the FIRST balanced {...} object —
      // scanning to its matching close brace — rather than slicing to the last "}".
      const slice = firstJsonObject(t);
      if (slice) { try { obj = JSON.parse(slice); } catch (e2) {} }
    }
    if (!obj || typeof obj !== "object") return { type: "reply", text: t };
    if (obj.type === "recommendations") {
      const r = {
        type: "recommendations",
        intro: obj.intro || "",
        strong: Array.isArray(obj.strong) ? obj.strong : [],
        partial: Array.isArray(obj.partial) ? obj.partial : []
      };
      // Optional one-tap refinement (frictionless mode). Validate shape.
      if (obj.refine && Array.isArray(obj.refine.options) && obj.refine.options.length) {
        r.refine = {
          prompt: obj.refine.prompt || "Narrow these results",
          factor: obj.refine.factor || "",
          options: obj.refine.options.slice(0, 4).map(String)
        };
      }
      return r;
    }
    return { type: "reply", text: obj.text || t };
  }

  function proxyUrl() {
    return (window.__LP_CLAUDE_PROXY_URL || "").trim();
  }

  function isAvailable() {
    return (
      (window.claude && typeof window.claude.complete === "function") ||
      !!proxyUrl()
    );
  }

  function authToken() {
    if (window.__LP_AUTH_TOKEN) return window.__LP_AUTH_TOKEN;
    try {
      return sessionStorage.getItem("lp_auth_token") || "";
    } catch {
      return "";
    }
  }

  async function completeClaude(messages) {
    if (window.claude && typeof window.claude.complete === "function") {
      return window.claude.complete({ messages });
    }
    const url = proxyUrl();
    if (!url) throw new Error("NO_CLAUDE");
    const token = authToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages }),
    });
    const data = await res.json();
    if (res.status === 401) {
      try { sessionStorage.removeItem("lp_auth_token"); } catch {}
      window.location.reload();
      throw new Error("SESSION_EXPIRED");
    }
    if (!res.ok) throw new Error(data.error || "PROXY_ERROR");
    return data.text || "";
  }

  // history: [{ role:"user"|"assistant", content:"..." }]
  // mode: "frictionless" (default) | "guided"
  async function converse(history, mode) {
    if (!isAvailable()) {
      throw new Error("NO_CLAUDE");
    }
    const sysPrompt = SYSTEM_PROMPT_FRICTIONLESS;
    const outContract = OUTPUT_CONTRACT_FRICTIONLESS;
    // Build candidates from everything the user has said so far.
    const userText = history.filter(m => m.role === "user").map(m => m.content).join("  ");
    const cands = prefilter(userText);
    const system = sysPrompt + "\n\n" + outContract + "\n\n" + candidateBlock(cands);

    // The built-in helper accepts only a prompt string or { messages } — there is
    // no `system` field, so we MUST fold the instructions into the message array.
    if (!history.length) return { type: "reply", text: "Tell me what you're teaching and I'll find simulations that fit." };
    const primer = system + "\n\n---\nBegin the conversation. Respond ONLY with the single JSON object specified above. The instructor's first message follows.\n\n";
    const messages = history.map((m, i) =>
      i === 0 ? { role: m.role, content: primer + m.content } : { role: m.role, content: m.content }
    );

    const raw = await completeClaude(messages);
    return parseResponse(raw);
  }

  // Look up full sim record by code, for rendering cards.
  function byCode(code) {
    return (window.SIMS_CATALOG || []).find(s => s.c === code) || null;
  }

  window.LabsterAI = {
    SYSTEM_PROMPT: SYSTEM_PROMPT_FRICTIONLESS,
    SYSTEM_PROMPT_FRICTIONLESS, OUTPUT_CONTRACT_FRICTIONLESS,
    prefilter, converse, byCode, isAvailable
  };
})();
