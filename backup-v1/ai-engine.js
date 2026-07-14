// ai-engine.js — Live AI for the "Describe what I am teaching" flow.
// Exposes window.LabsterAI with:
//   prefilter(text)       → narrows the 311-sim catalog to top candidates (recall step)
//   converse(history)     → calls Claude with the system prompt + candidates, returns
//                           { type:"reply", text } | { type:"recommendations", intro, strong, partial }
//
// The catalog (window.SIMS_CATALOG) is loaded from sims-catalog.js.

(function () {
  // ── Verbatim system prompt (from the uploaded brief) ──────────────────────
  const SYSTEM_PROMPT = `You are a knowledgeable US higher education STEM Educational Content Specialist specializing in finding or curating relevant educational materials. Maintain a balanced, educational tone, always keeping scientific rigor in your conversations. Be concise and helpful.

Your domain knowledge centers on curriculum mapping, pedagogical alignment, and digital literacy. Your core expertise involves identifying, evaluating, and integrating high-quality educational resources into higher education and high school STEM courses. You clearly understand how to embed simulations into high school and university-level syllabi.

Purpose: Your sole function is to help instructors find Labster simulations that fit their teaching needs. Every response should move toward that goal. Stay focused on content discovery — if the conversation drifts elsewhere, acknowledge briefly and redirect warmly.

Gathering context: Before returning recommendations, check whether the user's request covers these five factors:
- Discipline
- Educational level
- Topics covered
- Learning objectives
- Relevant learning standards

If any are missing, work through them one at a time — one question per message, in the order listed above. This is a brief intake, not an interrogation. Keep each question to one sentence.

If the user answers "no," "don't know," or anything dismissive, accept it immediately, mark that factor as collected, and move to the next missing one or return results. Never revisit a factor the user has already addressed.

Once all five have been either answered or declined, return recommendations. Do not return recommendations before then unless the user explicitly asks you to skip ahead.

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
- Never ask more than one clarifying question at a time.
- Never re-ask a question the user has already answered or declined to answer.
- Never push back if the user says they don't know — accept it and move forward.
- Never stall with filler responses before showing results.
- Never return recommendations before all five factors have been addressed or declined.

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

  // ── Output contract appended to the system message ────────────────────────
  const OUTPUT_CONTRACT = `OUTPUT FORMAT — STRICT
You are powering a UI, so you must respond with a SINGLE JSON object and nothing else (no markdown, no code fences, no text before or after).

Use exactly one of these two shapes:

1) A conversational turn — clarifying question, standards check, boundary redirect, or a no-results message:
{"type":"reply","text":"<your message, one idea, concise>"}

2) Final recommendations, once you have enough to recommend:
{"type":"recommendations","intro":"<one short sentence introducing the results>","strong":[{"code":"<SIM CODE>","reason":"<one-line why it matches>"}],"partial":[{"code":"<SIM CODE>","reason":"<one-line why it is a partial match>"}]}

Rules for recommendations:
- Choose "code" values ONLY from the CANDIDATE SIMULATIONS list below. Never invent a code or a simulation.
- "strong" = 80–100% coverage; "partial" = 60–79%. Omit anything below 60%. Either array may be empty.
- Do not repeat a code across strong and partial.
- Keep each "reason" to one line, grounded in the simulation's actual learning objectives. Do not restate the title.
- If nothing clears 60%, do NOT return recommendations — return a {"type":"reply"} that says so plainly and offers to refine.
- Follow the system prompt's pacing: work through the five factors (discipline, level, topics, objectives, standards) one at a time in order, asking about each missing one with a {"type":"reply"}. Do NOT return recommendations until all five have been answered or declined, unless the user explicitly asks to skip ahead.`;

  // ── Local prefilter: narrow catalog → candidates (recall, not ranking) ─────
  const STOP = new Set(("a an and the of to for in on with at by from is are be this that my our your i we teaching teach class course students student level want need cover covering topics topic about would like help find show me my".split(" ")));
  const DISCIPLINES = ["chemistry","biology","physics","medicine","health","engineering","general science","anatomy","physiology","biochemistry","microbiology","genetics","ecology"];

  function tokens(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter(w => w.length >= 3 && !STOP.has(w));
  }

  function prefilter(text, limit) {
    limit = limit || 90;
    const cat = window.SIMS_CATALOG || [];
    const qt = tokens(text);
    const qset = new Set(qt);
    const ql = (text || "").toLowerCase();
    const mentionedDisc = DISCIPLINES.filter(d => ql.includes(d));

    const scored = cat.map(sim => {
      const name = (sim.n || "").toLowerCase();
      const lo = (sim.o || "").toLowerCase();
      const disc = ((sim.s || "") + " " + (sim.d || "")).toLowerCase();
      const tech = (sim.k || "").toLowerCase();
      let score = 0;
      for (const w of qset) {
        if (name.includes(w)) score += 5;
        if (lo.includes(w)) score += 3;
        if (tech.includes(w)) score += 2;
        if (disc.includes(w)) score += 1;
      }
      // Discipline baseline so the right section is well-represented in the pool
      if (mentionedDisc.some(d => disc.includes(d))) score += 2;
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
      return {
        type: "recommendations",
        intro: obj.intro || "",
        strong: Array.isArray(obj.strong) ? obj.strong : [],
        partial: Array.isArray(obj.partial) ? obj.partial : []
      };
    }
    return { type: "reply", text: obj.text || t };
  }

  // history: [{ role:"user"|"assistant", content:"..." }]
  async function converse(history) {
    if (!(window.claude && typeof window.claude.complete === "function")) {
      throw new Error("NO_CLAUDE");
    }
    // Build candidates from everything the user has said so far.
    const userText = history.filter(m => m.role === "user").map(m => m.content).join("  ");
    const cands = prefilter(userText);
    const system = SYSTEM_PROMPT + "\n\n" + OUTPUT_CONTRACT + "\n\n" + candidateBlock(cands);

    // The built-in helper accepts only a prompt string or { messages } — there is
    // no `system` field, so we MUST fold the instructions into the message array.
    if (!history.length) return { type: "reply", text: "Tell me what you're teaching and I'll find simulations that fit." };
    const primer = system + "\n\n---\nBegin the conversation. Respond ONLY with the single JSON object specified above. The instructor's first message follows.\n\n";
    const messages = history.map((m, i) =>
      i === 0 ? { role: m.role, content: primer + m.content } : { role: m.role, content: m.content }
    );

    const raw = await window.claude.complete({ messages });
    return parseResponse(raw);
  }

  // Look up full sim record by code, for rendering cards.
  function byCode(code) {
    return (window.SIMS_CATALOG || []).find(s => s.c === code) || null;
  }

  window.LabsterAI = { SYSTEM_PROMPT, OUTPUT_CONTRACT, prefilter, converse, byCode };
})();
