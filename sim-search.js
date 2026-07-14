// sim-search.js — production-like keyword search over window.SIMS_CATALOG.
// Mimics an Algolia index: NO natural-language / intent parsing. Pure token
// matching, ranked by (1) searchable-attribute order and (2) word proximity.
//
// Searchable attributes, in RANKING ORDER (earlier attribute wins):
//   1. name                 (n)
//   2. marketing description (desc)  — not present in the current dataset
//   3. learning objectives  (o)
//   4. learning standards    (std)   — AP / College-University etc.
// Learning outcomes are intentionally NOT indexed.
(function () {
  const WORD_RE = /[a-z0-9]+/g;
  const words = (text) => ((text || "").toLowerCase().match(WORD_RE) || []);
  const tokens = (q) => words(q);

  // Attribute accessors in ranking order. Marketing description + standards
  // (Advanced Placement / College-University) come from the enrichment map
  // extracted from the source spreadsheet (columns AC / BO / BP), keyed by code.
  const fields = (s) => (window.SIM_SEARCH_FIELDS && window.SIM_SEARCH_FIELDS[s.c]) || {};
  const ATTRS = [
    (s) => s.n || "",
    (s) => fields(s).desc || "",
    (s) => s.o || "",
    (s) => (fields(s).standards || []).map((x) => x.value).join(" ") || s.std || "",
  ];

  const startsWithAny = (attrWords, tok) => attrWords.some((w) => w.startsWith(tok));

  // If every token prefix-matches a word inside this attribute, return the
  // positional span (proximity) and first match position; else null.
  function attrMatch(attrWords, toks) {
    const positions = [];
    for (const tok of toks) {
      let pos = -1;
      for (let i = 0; i < attrWords.length; i++) {
        if (attrWords[i].startsWith(tok)) { pos = i; break; }
      }
      if (pos < 0) return null;
      positions.push(pos);
    }
    return { span: Math.max(...positions) - Math.min(...positions), firstPos: Math.min(...positions) };
  }

  function score(sim, toks) {
    const attrWords = ATTRS.map((f) => words(f(sim)));
    // Record matches only if EVERY query token appears in SOME attribute (AND).
    for (const tok of toks) {
      if (!attrWords.some((aw) => startsWithAny(aw, tok))) return null;
    }
    // Best (lowest-index) attribute that contains ALL tokens, with its proximity.
    let attr = ATTRS.length, span = Infinity, firstPos = Infinity;
    for (let ai = 0; ai < attrWords.length; ai++) {
      const m = attrMatch(attrWords[ai], toks);
      if (m && ai < attr) { attr = ai; span = m.span; firstPos = m.firstPos; }
    }
    // Fallback ordering for records whose tokens are split across attributes.
    let anyAttr = ATTRS.length;
    for (let ai = 0; ai < attrWords.length; ai++) {
      if (toks.some((t) => startsWithAny(attrWords[ai], t))) { anyAttr = ai; break; }
    }
    return { attr, span, firstPos, anyAttr };
  }

  // Full search → ranked array of sim records.
  function search(q) {
    const toks = tokens(q);
    if (!toks.length) return [];
    const cat = window.SIMS_CATALOG || [];
    const hits = [];
    for (const sim of cat) {
      const sc = score(sim, toks);
      if (sc) hits.push({ sim, sc });
    }
    hits.sort((a, a2) => {
      const x = a.sc, y = a2.sc;
      if (x.attr !== y.attr) return x.attr - y.attr;       // 1. attribute order
      if (x.span !== y.span) return x.span - y.span;       // 2. proximity (closer = better)
      if (x.firstPos !== y.firstPos) return x.firstPos - y.firstPos; // 3. earlier position
      if (x.anyAttr !== y.anyAttr) return x.anyAttr - y.anyAttr;     // 4. cross-attribute fallback
      return (a.sim.n || "").localeCompare(a2.sim.n || "");         // 5. stable
    });
    return hits.map((h) => h.sim);
  }

  // Dropdown autocomplete: up to `limit` sims whose NAME matches the query.
  function nameSuggestions(q, limit) {
    const toks = tokens(q);
    if (!toks.length) return [];
    const qn = q.trim().toLowerCase();
    const cat = window.SIMS_CATALOG || [];
    const hits = [];
    for (const sim of cat) {
      const m = attrMatch(words(sim.n || ""), toks);
      if (m) hits.push({ sim, starts: (sim.n || "").toLowerCase().startsWith(qn) ? 0 : 1, span: m.span, firstPos: m.firstPos });
    }
    hits.sort((a, b) =>
      a.starts - b.starts || a.firstPos - b.firstPos || a.span - b.span ||
      (a.sim.n || "").localeCompare(b.sim.n || "")
    );
    return hits.slice(0, limit || 5).map((h) => h.sim);
  }

  window.SimSearch = { search, nameSuggestions };
})();
