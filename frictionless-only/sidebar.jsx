// sidebar.jsx — Labster sidebar with license switcher + reorderable nav items
// Drag-and-drop is intentionally invisible: no handle, no cursor change.
// Click & hold on any item then drag to reorder. Order persists in localStorage.

const { useState, useRef, useEffect } = React;

function toPascal(s) { return s.split("-").map(p => p[0].toUpperCase()+p.slice(1)).join(""); }
function Icon({ name, className }) {
  const node = window.lucide && window.lucide.icons && window.lucide.icons[toPascal(name)];
  if (!node) return <span className={`icon ${className||""}`} style={{display:"inline-block",width:18,height:18}}></span>;
  const [tag, attrs, children] = node;
  const svgAttrs = {...attrs, className: `icon ${className||""}`, key: name};
  if (svgAttrs["stroke-width"]) { svgAttrs.strokeWidth = svgAttrs["stroke-width"]; delete svgAttrs["stroke-width"]; }
  if (svgAttrs["stroke-linecap"]) { svgAttrs.strokeLinecap = svgAttrs["stroke-linecap"]; delete svgAttrs["stroke-linecap"]; }
  if (svgAttrs["stroke-linejoin"]) { svgAttrs.strokeLinejoin = svgAttrs["stroke-linejoin"]; delete svgAttrs["stroke-linejoin"]; }
  return React.createElement(tag, svgAttrs, ...(children || []).map((c, i) => {
    const [t, a] = c;
    const ca = {...a, key: i};
    Object.keys(ca).forEach(k => {
      if (k.includes("-")) {
        const nk = k.replace(/-([a-z])/g, (_,l) => l.toUpperCase());
        ca[nk] = ca[k]; delete ca[k];
      }
    });
    return React.createElement(t, ca);
  }));
}

// ============================================================
// Item registry — every reorderable thing in the sidebar
// type: "nav" (clickable destination) | "divider" | "courses" (the My Courses + nested list group)
// ============================================================
const ITEM_REGISTRY = {
  "home":      { type: "nav", icon: "house",        label: "Home",            id: "home" },
  "catalog":   { type: "nav", icon: "book-open",    label: "Catalog",         id: "catalog" },
  "admin":     { type: "nav", icon: "shield-check", label: "Admin",           id: "admin" },
  "create":    { type: "nav", icon: "circle-plus",  label: "Create a Course", id: "create" },
  "courses":   { type: "courses" },
  "archive":   { type: "nav", icon: "archive",      label: "Archive",         id: "archive", expandable: true },
  "div-1":     { type: "divider" },
  "div-2":     { type: "divider" },
  "div-3":     { type: "divider" },
};

// Default order — matches reference screenshots
const DEFAULT_ORDER = [
  "home",
  "catalog",
  "div-1",
  "create",
  "courses",
  "archive",
  "div-2",
  "admin",
];

function loadOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem("lp_sb_order") || "null");
    if (Array.isArray(saved) && saved.every(k => ITEM_REGISTRY[k])) return saved;
  } catch {}
  return DEFAULT_ORDER;
}

function Sidebar({ active, onNav, license, onLicense, onAccountAction, activeCourseId }) {
  const { LICENSES, USER } = window.LP_DATA;
  const [licOpen, setLicOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(true);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [order, setOrder] = useState(loadOrder);
  const [dragKey, setDragKey] = useState(null);
  const [overKey, setOverKey] = useState(null);
  const licRef = useRef(null);
  const acctRef = useRef(null);

  // Persist order
  useEffect(() => {
    localStorage.setItem("lp_sb_order", JSON.stringify(order));
  }, [order]);

  useEffect(() => {
    function onClick(e) {
      if (licRef.current && !licRef.current.contains(e.target)) setLicOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target)) setAcctOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ============================================================
  // Drag handlers — invisible to the user, only on the bound rows
  // ============================================================
  const handleDragStart = (key) => (e) => {
    setDragKey(key);
    e.dataTransfer.effectAllowed = "move";
    // Use a transparent drag image so the page doesn't show a ghost
    try {
      const img = new Image();
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      e.dataTransfer.setDragImage(img, 0, 0);
    } catch {}
  };
  const handleDragOver = (key) => (e) => {
    e.preventDefault();
    if (key !== overKey) setOverKey(key);
  };
  const handleDrop = (targetKey) => (e) => {
    e.preventDefault();
    if (!dragKey || dragKey === targetKey) { setDragKey(null); setOverKey(null); return; }
    setOrder(prev => {
      const next = prev.filter(k => k !== dragKey);
      const idx = next.indexOf(targetKey);
      if (idx === -1) return prev;
      next.splice(idx, 0, dragKey);
      return next;
    });
    setDragKey(null); setOverKey(null);
  };
  const handleDragEnd = () => { setDragKey(null); setOverKey(null); };

  // ============================================================
  // Render a single item by key
  // ============================================================
  const renderItem = (key) => {
    const item = ITEM_REGISTRY[key];
    if (!item) return null;

    const dragProps = {
      draggable: true,
      onDragStart: handleDragStart(key),
      onDragOver: handleDragOver(key),
      onDrop: handleDrop(key),
      onDragEnd: handleDragEnd,
    };

    const dragClass = (dragKey === key ? " dragging" : "") + (overKey === key && dragKey && dragKey !== key ? " drag-over" : "");

    if (item.type === "divider") {
      return (
        <div key={key} className={`sb-section-divider${dragClass}`} {...dragProps}></div>
      );
    }

    if (item.type === "courses") {
      return (
        <div key={key} className={`sb-courses-group${dragClass}`} {...dragProps}>
          <button className={`sb-item ${active === "my-courses" || active === "course" ? "active" : ""}`}
                  onClick={() => setCoursesOpen(o => !o)}>
            <Icon name="monitor"/>
            <span className="label">My Courses</span>
            <Icon name={coursesOpen ? "chevron-down" : "chevron-right"} className="chevron"/>
          </button>
          {coursesOpen && (
            <div className="sb-sub">
              {window.LP_DATA.MY_COURSES.map(c => (
                <div key={c.id}
                     className={`sb-sub-item ${active === "course" && activeCourseId === c.id ? "active" : ""}`}
                     onClick={() => onNav("course", c)}>
                  <Icon name="dot" className="icon"/>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // nav item
    if (item.expandable && item.id === "archive") {
      return (
        <div key={key} className={`sb-nav-wrap${dragClass}`} {...dragProps}>
          <button className={`sb-item ${active === item.id ? "active" : ""}`}
                  onClick={() => setArchiveOpen(o => !o)}>
            <Icon name={item.icon}/>
            <span className="label">{item.label}</span>
            <Icon name={archiveOpen ? "chevron-down" : "chevron-right"} className="chevron"/>
          </button>
          {archiveOpen && (
            <div className="sb-sub">
              <div className="sb-sub-item">Spring 2025 — CHEM 101</div>
              <div className="sb-sub-item">Fall 2024 — BIO 150</div>
            </div>
          )}
        </div>
      );
    }

    return (
      <button key={key}
              className={`sb-item ${active === item.id ? "active" : ""}${dragClass}`}
              onClick={() => onNav(item.id)}
              {...dragProps}>
        <Icon name={item.icon}/>
        <span className="label">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sb-header">
        <div className="sb-logo">
          <svg className="mark" viewBox="0 0 32 32" fill="none">
            <path d="M6 4 H10 V24 H22 V28 H6 Z" fill="#002F56"/>
            <path d="M22 4 L28 10 V20 L22 26 Z" fill="#006FCC"/>
          </svg>
          <span className="word">Labster</span>
        </div>
      </div>

      <div className="sb-nav">
        {/* license switcher — pinned, not reorderable */}
        <div className="sb-license" onClick={() => setLicOpen(o => !o)} ref={licRef}>
          <Icon name="building-2"/>
          <span className="lic-name">{license.name}</span>
          <Icon name="chevrons-up-down" className="chevrons"/>
          {licOpen && (
            <div className="sb-license-popup" onClick={e => e.stopPropagation()}>
              <div className="sb-license-popup-title">Switch License</div>
              {LICENSES.map(l => (
                <div key={l.id}
                     className={`sb-license-popup-item ${l.id === license.id ? "selected" : ""}`}
                     onClick={() => { onLicense(l); setLicOpen(false); }}>
                  <div className="lic-info">
                    <div className="n">{l.name}</div>
                    <div className="s">{l.plan} · {l.role}</div>
                  </div>
                  {l.id === license.id && <Icon name="check" className="check"/>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sb-section-divider sb-fixed-divider"></div>

        {/* Reorderable items */}
        {order.map(renderItem)}
      </div>

      <div className="sb-spacer"></div>

      <div className="sb-footer">
        <button className="sb-item" onClick={() => onAccountAction("resources")}>
          <Icon name="lightbulb"/>
          <span className="label">Instructor Resources</span>
        </button>
        <button className="sb-item" onClick={() => onAccountAction("help")}>
          <Icon name="circle-help"/>
          <span className="label">Help</span>
        </button>
        <button className={`sb-item ${active === "account" ? "active" : ""}`} onClick={() => onNav("account")}>
          <Icon name="circle-user-round"/>
          <span className="label">Account and Settings</span>
        </button>
      </div>

      <div className="sb-account" ref={acctRef}>
        {acctOpen && (
          <div className="sb-account-menu">
            <div className="menu-item" onClick={() => { onAccountAction("logout"); setAcctOpen(false); }}>
              <Icon name="log-out"/>Log Out
            </div>
          </div>
        )}
        <div className="sb-account-row" onClick={() => setAcctOpen(o => !o)}>
          <div className="avatar">{USER.initials}</div>
          <div className="info">
            <div className="n">{USER.name}</div>
            <div className="e">{USER.email}</div>
          </div>
          <Icon name="chevrons-up-down" className="chevrons"/>
        </div>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
window.LPIcon = Icon;
