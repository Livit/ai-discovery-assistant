// ux-overlay.jsx — UX suggestions toggle and pin overlay

const { useState: uS, useEffect: uE } = React;

function UXSuggestions({ on, onToggle, page }) {
  const [active, setActive] = uS(null);
  const notes = (window.LP_DATA.UX_NOTES[page] || []);

  uE(() => { setActive(null); }, [page]);

  return (
    <>
      <button className={`uxToggle ${on ? "on" : ""}`} onClick={onToggle}>
        <i data-lucide="sparkles" className="icon"></i>
        UX suggestions
        <span className="switch"></span>
      </button>

      {on && (
        <div className="ux-overlay">
          {notes.map((n, idx) => (
            <UXPin key={n.id} n={n} idx={idx + 1} active={active === n.id} onClick={() => setActive(active === n.id ? null : n.id)}/>
          ))}
        </div>
      )}
    </>
  );
}

function UXPin({ n, idx, active, onClick }) {
  const [pos, setPos] = uS(null);

  uE(() => {
    function update() {
      const els = document.querySelectorAll(n.target);
      if (!els.length) return setPos(null);
      const el = els[0];
      const r = el.getBoundingClientRect();
      const xPct = parseFloat(n.x) / 100;
      const yPct = parseFloat(n.y) / 100;
      setPos({
        left: r.left + r.width * xPct,
        top: r.top + r.height * yPct,
        boxLeft: r.left,
        boxTop: r.top,
        boxW: r.width,
        boxH: r.height,
      });
    }
    update();
    const main = document.querySelector(".app-main");
    main && main.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    const t = setInterval(update, 500);
    return () => {
      main && main.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearInterval(t);
    };
  }, [n.target, n.x, n.y]);

  if (!pos) return null;

  return (
    <>
      {active && (
        <div className="ux-highlight" style={{
          left: pos.boxLeft, top: pos.boxTop, width: pos.boxW, height: pos.boxH,
          position: "fixed",
        }}></div>
      )}
      <div className="ux-pin"
           style={{ position: "fixed", left: pos.left - 14, top: pos.top - 14, pointerEvents: "auto" }}
           onClick={onClick}>
        {idx}
      </div>
      {active && (
        <div className="ux-tooltip" style={{
          left: Math.min(window.innerWidth - 340, pos.left + 24),
          top: Math.max(20, pos.top - 20),
        }}>
          <div className="ux-tooltip-close" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <i data-lucide="x" className="icon"></i>
          </div>
          <div className="ux-tooltip-tag">Suggestion #{idx}</div>
          <div className="ux-tooltip-title">{n.title}</div>
          <p className="ux-tooltip-body">{n.body}</p>
        </div>
      )}
    </>
  );
}

window.UXSuggestions = UXSuggestions;
