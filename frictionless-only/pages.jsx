// pages.jsx — Home, Catalog, Account, Admin pages

const { useState: useS, useMemo: useM } = React;
const I = window.LPIcon;

// ============================================================
// HOME
// ============================================================
function HomePage({ onNav }) {
  const { MY_COURSES, RECOMMENDED } = window.LP_DATA;
  return (
    <div className="page" data-screen-label="01 Home">
      <h1 className="page-title">Home</h1>

      <div className="home-banner">
        <div>
          <h2>Maximize Learning Outcomes With Labster</h2>
          <p>Find Inspiration in Our Instructor Resources and Boost Student Engagement.</p>
        </div>
        <button className="btn btn-secondary">Instructor Resources</button>
      </div>

      <div className="section-head">
        <h3>My Courses</h3>
        <button className="btn btn-primary"><I name="plus"/>Add New Course</button>
      </div>

      {MY_COURSES.map(c => (
        <div key={c.id} className="course-card">
          <div className="course-card-head">
            <h4 className="course-card-title">{c.name}</h4>
            <div className="course-card-actions">
              <button className="btn btn-secondary">See Overview</button>
              <button className="btn btn-secondary">See Grades</button>
            </div>
          </div>
          <div className="course-card-stats">
            <div className="stat-block">
              <div className="label"><I name="layers"/>Simulations</div>
              <div className="value">{c.sims.played} / {c.sims.total}</div>
              <div className="sub">Published / All</div>
              <a className="link">View Simulations</a>
            </div>
            <div className="stat-block">
              <div className="label"><I name="user"/>Students</div>
              <div className="value">{c.students.active} / {c.students.invited}</div>
              <div className="sub">Active / Invited</div>
              <a className="link">View Students</a>
            </div>
            <div className="stat-block">
              <div className="label"><I name="users"/>Co-Instructors</div>
              <div className="value">{c.coInstructors.active} / {c.coInstructors.invited}</div>
              <div className="sub">Active / Invited</div>
              <a className="link">Add Co-Instructor</a>
            </div>
            <div className="stat-block stat-validity">
              <div className="label"><I name="calendar"/>License Validity</div>
              <div className="dates">From: {c.validity.from}<br/>To: {c.validity.to}</div>
            </div>
            <div></div>
          </div>
        </div>
      ))}

      <div style={{marginTop: 40}}>
        <div className="section-head">
          <h3>Recommended Simulations</h3>
          <a className="btn btn-tertiary" onClick={() => onNav("catalog")}>Browse All<I name="arrow-right"/></a>
        </div>
        <div className="rec-grid">
          {RECOMMENDED.map(r => <RecCard key={r.id} sim={r}/>)}
        </div>
      </div>
    </div>
  );
}

function RecCard({ sim }) {
  const palette = {
    chem:    { from: "#1F86E0", to: "#002F56" },
    bio:     { from: "#19AF78", to: "#0E5C40" },
    physics: { from: "#EB415A", to: "#7A1226" },
  };
  const p = palette[sim.color];
  return (
    <div className="rec-card">
      <div className="rec-thumb" style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}>
        <svg className="bg" viewBox="0 0 200 140" preserveAspectRatio="none">
          <circle cx="160" cy="20" r="60" fill="rgba(255,255,255,0.08)"/>
          <circle cx="40" cy="120" r="50" fill="rgba(255,255,255,0.06)"/>
          <circle cx="100" cy="70" r="30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        </svg>
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{position:"relative",zIndex:1,opacity:0.9}}>
          {sim.color === "chem" && <><path d="M9 3h6"/><path d="M10 3v8.5L4 21h16l-6-9.5V3"/></>}
          {sim.color === "bio" && <><path d="M5 3c4 4 10 4 14 0"/><path d="M5 21c4-4 10-4 14 0"/><path d="M5 9c4 4 10 4 14 0"/><path d="M5 15c4-4 10-4 14 0"/></>}
          {sim.color === "physics" && <><circle cx="12" cy="12" r="2"/><path d="M3 12a9 4 0 0 0 18 0a9 4 0 0 0 -18 0"/><path d="M3 12a9 4 0 0 1 18 0" transform="rotate(60 12 12)"/><path d="M3 12a9 4 0 0 1 18 0" transform="rotate(-60 12 12)"/></>}
        </svg>
        {sim.new && <span className="badge">New</span>}
        <span className="duration"><I name="clock"/>{sim.duration}</span>
      </div>
      <div className="rec-body">
        <div className="rec-discipline">
          <I name={sim.color === "chem" ? "flask-conical" : sim.color === "bio" ? "dna" : "atom"}/>
          {sim.discipline}
        </div>
        <h4 className="rec-title">{sim.title}</h4>
        <div className="rec-meta">
          <span><I name="signal"/>{sim.level}</span>
          <span><I name="play"/>Preview</span>
        </div>
      </div>
    </div>
  );
}

// CATALOG lives in catalog.jsx (window.CatalogPage)

// ============================================================
// ACCOUNT AND SETTINGS
// ============================================================
function AccountPage() {
  const [tab, setTab] = useS("Profile");
  return (
    <div className="page" data-screen-label="03 Account and Settings">
      <h1 className="page-title">Account and Settings</h1>
      <div className="admin-tabs">
        {["Profile", "License", "Help and Support"].map(t => (
          <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "Profile" && <AccountProfile/>}
      {tab === "License" && <AdminLicenseCard hideActions/>}
      {tab === "Help and Support" && <AccountHelp/>}
    </div>
  );
}

function AccountProfile() {
  const { USER } = window.LP_DATA;
  return (
    <>
      <div className="profile-card">
        <div className="profile-identity">
          <div className="profile-avatar">{USER.initials}</div>
          <div className="profile-name-block">
            <div className="profile-name">{USER.name}</div>
            <div className="profile-email">{USER.email}</div>
          </div>
          <button className="btn btn-secondary profile-edit">Edit</button>
        </div>
        <div className="profile-fields">
          <div className="profile-field">
            <div className="profile-field-label">First Name</div>
            <div className="profile-field-value">{USER.firstName}</div>
          </div>
          <div className="profile-field-sep"><I name="more-horizontal"/></div>
          <div className="profile-field">
            <div className="profile-field-label">Last Name</div>
            <div className="profile-field-value">{USER.lastName}</div>
          </div>
          <div className="profile-field" style={{marginLeft:"auto"}}>
            <div className="profile-field-label">Time Zone</div>
            <div className="profile-field-value">Europe/Madrid (GMT+01:00)</div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-sub-card">
          <div className="profile-sub-head">
            <div className="profile-sub-icon"><I name="languages"/></div>
            <h3 className="profile-sub-title">Language</h3>
          </div>
          <div className="profile-language-row">
            <div className="profile-language-col">
              <div className="profile-eyebrow">Display Language</div>
              <div className="profile-language-pick">
                <span className="flag">🇺🇸</span>
                <span>English (US)</span>
                <button className="icon-btn"><I name="pencil"/></button>
              </div>
            </div>
            <div className="profile-language-col">
              <div className="profile-eyebrow">Simulations</div>
              <div className="profile-language-pick">
                <span className="flag">🇺🇸</span>
                <span>English (US)</span>
                <button className="icon-btn"><I name="pencil"/></button>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-sub-card">
          <div className="profile-sub-head">
            <div className="profile-sub-icon"><I name="accessibility"/></div>
            <h3 className="profile-sub-title">Accessible Simulations</h3>
          </div>
          <p className="profile-sub-desc">Enable Features Such as Keyboard Navigation, Screen Reader and Resizable Text for Supported Simulations.</p>
          <a className="profile-learn-more">Learn More</a>
          <div className="profile-toggle-row">
            <span>Accessibility Mode</span>
            <ToggleSwitch defaultOn/>
          </div>
        </div>

        <div className="profile-sub-card">
          <div className="profile-sub-head">
            <div className="profile-sub-icon"><I name="lock"/></div>
            <h3 className="profile-sub-title">Security</h3>
          </div>
          <p className="profile-sub-desc">Change Your Account Password Often to Prevent Unauthorized Access to Your Account.</p>
          <div className="profile-eyebrow">Password</div>
          <button className="btn btn-secondary" style={{marginTop:8}}>Change Password</button>
        </div>
      </div>
    </>
  );
}

function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useS(!!defaultOn);
  return (
    <button className={`toggle-switch ${on ? "on" : ""}`} onClick={() => setOn(o => !o)}>
      <span className="thumb"></span>
    </button>
  );
}

function AccountHelp() {
  return (
    <div className="account-card">
      <div className="account-card-head">
        <div className="account-card-icon"><I name="headphones"/></div>
        <h3 className="account-card-title">Help and Support</h3>
      </div>
      <div className="account-row">
        <span className="k"><strong>Help Center:</strong> Find Your Answers in Labster's Knowledge Base</span>
        <span className="v"><a className="link">Help Center</a><I name="external-link"/></span>
      </div>
      <div className="account-row">
        <span className="k"><strong>Technical Support Chat:</strong> Text With a Live Person by Clicking on the Bottom Right's Chat Icon</span>
        <span className="v"><a className="link">Open Support Chat</a><I name="message-circle"/></span>
      </div>
      <div className="account-row">
        <span className="k"><strong>Customer Success:</strong> For Further Assistance, Contact Customer Success and Get Access to a Wide Range of Expertise</span>
        <span className="v" style={{flexDirection:"column",alignItems:"flex-end",gap:2}}>
          <span style={{fontWeight:600}}>Labster Customer Success</span>
          <span style={{display:"flex",alignItems:"center",gap:6,color:"var(--blue-6)"}}>customersuccess@labster.com<I name="copy"/></span>
        </span>
      </div>
    </div>
  );
}

function SeatRing({ used, total }) {
  const pct = used / total;
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22">
      <circle cx="11" cy="11" r={r} fill="none" stroke="#EEF0F1" strokeWidth="3"/>
      <circle cx="11" cy="11" r={r} fill="none" stroke="#FBBC19" strokeWidth="3"
              strokeDasharray={`${c*pct} ${c}`} transform="rotate(-90 11 11)" strokeLinecap="round"/>
    </svg>
  );
}

// ============================================================
// ADMIN
// ============================================================
function AdminPage() {
  const [tab, setTab] = useS("License");
  return (
    <div className="page" data-screen-label="04 Admin">
      <h1 className="page-title">Admin</h1>
      <div className="admin-tabs">
        {["License", "Dashboard", "Users"].map(t => (
          <div key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {tab === "License" && <AdminLicense/>}
      {tab === "Dashboard" && <AdminDashboard/>}
      {tab === "Users" && <AdminUsers/>}
    </div>
  );
}

function AdminOverview_REMOVED() {
  return null;
}

function _removed_AdminOverview() {
  return (
    <div className="overview-row">
      <div className="overview-card">
        <div className="overview-card-head">
          <div className="overview-card-eyebrow">License</div>
        </div>
        <div className="overview-rows">
          <div className="overview-row-item"><div className="k">Name</div><div className="v">CSI College of Sciences</div></div>
          <div className="overview-row-item"><div className="k">Start and End Date</div><div className="v">11/1/2025 — 11/1/2026</div></div>
          <div className="overview-row-item"><div className="k">Usage</div><div className="v">90 Seats Used · 10 Seats Available</div></div>
        </div>
      </div>
      <div className="overview-card">
        <div className="overview-card-head">
          <div className="overview-card-eyebrow">Dashboard</div>
          <span className="overview-card-tag">Last 6 Months</span>
        </div>
        <div className="overview-rows">
          <div className="overview-row-item"><div className="k">Active Courses</div><div className="v">18</div></div>
          <div className="overview-row-item"><div className="k">Simulations Played</div><div className="v">210</div></div>
          <div className="overview-row-item"><div className="k">Students Using Labster</div><div className="v">200</div></div>
        </div>
      </div>
      <div className="overview-card">
        <div className="overview-card-head">
          <div className="overview-card-eyebrow">Users</div>
        </div>
        <div className="overview-rows">
          <div className="overview-row-item"><div className="k">Instructors</div><div className="v">15 Active · 20 Invited</div></div>
          <div className="overview-row-item"><div className="k">Students</div><div className="v">200 Active · 240 Invited</div></div>
          <div className="overview-row-item"><div className="k">Co-Instructors</div><div className="v">5 Active · 10 Invited</div></div>
        </div>
      </div>
    </div>
  );
}

function AdminLicense() {
  return <AdminLicenseCard/>;
}

function AdminLicenseCard({ hideActions }) {
  return (
    <div className="admin-card">
      <div className="admin-card-head">
        <h3 className="admin-card-title">License Details</h3>
        {!hideActions && <button className="btn btn-primary">Upgrade Plan</button>}
      </div>
      <div className="license-row"><span className="k">Organization Name</span><span className="v">CSI College of Sciences</span></div>
      <div className="license-row"><span className="k">Current Plan</span><span className="v">Course Access</span></div>
      <div className="license-row"><span className="k">Subscription Start and End Date</span><span className="v">11/1/2025 — 11/1/2026</span></div>
      <div className="license-row"><span className="k">Payment Method</span><span className="v">Institution Pay</span></div>

      <div style={{marginTop: 32}}>
        <div className="admin-card-head">
          <h3 className="admin-card-title">License Usage</h3>
          {!hideActions && (
            <span className="ds-tooltip-wrap">
              <a className="btn btn-tertiary"><I name="download"/>Download Report</a>
              <span className="ds-tooltip">Download License Usage report as .csv</span>
            </span>
          )}
        </div>
        <div className="license-row"><span className="k">Usage Period</span><span className="v">1/3/2026 — 1/3/2027</span></div>
        <div className="license-row"><span className="k">Usage Type</span><span className="v">Course Enrolment</span></div>
        <div className="license-row">
          <span className="k">Usage (Updated Daily)</span>
          <span className="v">
            <SeatRing used={90} total={100}/>
            <span>Seats Used 90 / 100</span>
            <span className="warning-chip">10% Left</span>
          </span>
        </div>
        <div className="license-row"><span className="k">Unique Students (Updated Daily)</span><span className="v">78</span></div>
      </div>
    </div>
  );
}

function BarChart({ data, scale }) {
  const max = scale || Math.max(...data);
  const { MONTHS } = window.LP_DATA;
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120,padding:"0 4px"}}>
      {data.map((v, i) => (
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,height:"100%"}}>
          <div style={{flex:1,width:"100%",display:"flex",alignItems:"flex-end"}}>
            <div style={{
              width:"100%",
              height:`${(v/max)*100}%`,
              background:"var(--blue-5)",
              borderRadius:"3px 3px 0 0",
              minHeight: 2,
            }}></div>
          </div>
          <div style={{fontSize:10,color:"var(--grey-7)"}}>{MONTHS[i]}</div>
        </div>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const [breakdown, setBreakdown] = useS("course");
  const { CHART_DATA, DASH_COURSES } = window.LP_DATA;
  return (
    <>
      <div className="dash-toolbar">
        <div className="dash-input">
          <I name="calendar"/>
          <div className="col"><span className="label">Select Time Range</span><span className="value">Last 12 Months</span></div>
          <I name="chevron-down"/>
        </div>
        <div className="dash-input">
          <I name="search"/>
          <div className="col"><span className="label">Search by Course</span><span className="value">Course One, Course Two…</span></div>
        </div>
        <span className="ds-tooltip-wrap right">
          <a className="btn btn-tertiary"><I name="download"/>Download Report</a>
          <span className="ds-tooltip">Download Overall Usage and Usage breakdown report for the date and courses selected as .csv</span>
        </span>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <h3 className="admin-card-title">Usage Overview</h3>
          <span style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontStyle:"italic",color:"var(--grey-7)"}}>
            <I name="info"/>Updated Daily
          </span>
        </div>
        <div className="kpi-row">
          <div className="kpi"><div className="v">15</div><div className="k">Active Staff <I name="info"/></div></div>
          <div className="kpi"><div className="v">200</div><div className="k">Active Students <I name="info"/></div></div>
          <div className="kpi"><div className="v">18</div><div className="k">Active Courses <I name="info"/></div></div>
          <div className="kpi"><div className="v">210</div><div className="k">Simulations Played <I name="info"/></div></div>
          <div className="kpi"><div className="v">12,800</div><div className="k">Simulation Attempts <I name="info"/></div></div>
        </div>
        <div className="charts-grid">
          <div className="chart"><h4>Active Staff</h4><BarChart data={CHART_DATA.staff}/></div>
          <div className="chart"><h4>Active Students</h4><BarChart data={CHART_DATA.students}/></div>
          <div className="chart"><h4>Simulations Played</h4><BarChart data={CHART_DATA.simsPlayed}/></div>
          <div className="chart"><h4>Simulation Attempts</h4><BarChart data={CHART_DATA.attempts}/></div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <h3 className="admin-card-title">Usage Breakdown</h3>
          <div className="segmented">
            <button className={breakdown === "course" ? "active" : ""} onClick={() => setBreakdown("course")}>By Course</button>
            <button className={breakdown === "sim" ? "active" : ""} onClick={() => setBreakdown("sim")}>By Simulation</button>
          </div>
        </div>
        <table className="table">
          <thead><tr>
            <th>Course Name</th><th>Instructors</th><th>Students</th><th>Attempts</th><th>Average Score</th>
          </tr></thead>
          <tbody>
            {DASH_COURSES.map((c, i) => (
              <tr key={i}>
                <td style={{fontWeight:600,color:"var(--grey-10)"}}>{c.name}</td>
                <td style={{color:"var(--grey-8)",fontSize:13,maxWidth:280,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.instructors}</td>
                <td>{c.students}</td>
                <td>{c.attempts.toLocaleString()}</td>
                <td><ScoreCircle pct={c.score}/></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <div className="page-btn"><I name="chevron-left"/></div>
          <div className="page-btn active">1</div>
          <div className="page-btn">2</div>
          <div className="page-btn">3</div>
          <div className="page-btn">4</div>
          <div className="page-btn">5</div>
          <div className="page-btn">…</div>
          <div className="page-btn">42</div>
          <div className="page-btn"><I name="chevron-right"/></div>
        </div>
      </div>
    </>
  );
}

function ScoreCircle({ pct }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <span className="score-pill">
      <svg width="22" height="22" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r={r} fill="none" stroke="#E5F3FF" strokeWidth="3"/>
        <circle cx="11" cy="11" r={r} fill="none" stroke="#006FCC" strokeWidth="3"
                strokeDasharray={`${c*pct/100} ${c}`} transform="rotate(-90 11 11)" strokeLinecap="round"/>
      </svg>
      {pct}%
    </span>
  );
}

function AdminUsers() {
  const [seg, setSeg] = useS("instructors");
  const { INSTRUCTORS, STUDENTS } = window.LP_DATA;
  const list = seg === "instructors" ? INSTRUCTORS : STUDENTS;
  return (
    <div className="admin-card">
      <div className="admin-card-head">
        <div className="segmented">
          <button className={seg === "instructors" ? "active" : ""} onClick={() => setSeg("instructors")}>Instructors</button>
          <button className={seg === "students" ? "active" : ""} onClick={() => setSeg("students")}>Students</button>
        </div>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <a className="btn btn-tertiary"><I name="download"/>Download {seg === "instructors" ? "Instructor" : "Student"} List</a>
          {seg === "instructors" && <button className="btn btn-primary"><I name="user-plus"/>Invite Instructor</button>}
        </div>
      </div>
      <table className="table">
        <thead><tr><th>Name</th><th>Email</th><th>Last Login</th><th>Status</th></tr></thead>
        <tbody>
          {list.map((u, i) => (
            <tr key={i}>
              <td style={{fontWeight:600,color:"var(--grey-10)"}}>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.lastLogin}</td>
              <td><span className={`status-pill ${u.status}`}><span className="status-dot"></span>{u.status[0].toUpperCase()+u.status.slice(1)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { HomePage, AccountPage, AdminPage });
