import { useState, useEffect, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   VENKATTECH MEDIA STUDIO — FULL DASHBOARD + SIDEBAR
   · Sidebar + Theme toggle merged in one component
   · Vibrant chart colours (indigo/emerald/amber, not monochrome)
   · Avatars randomly shuffled per session — no static naming
   · Company-scoped data isolation (each company sees only its data)
   · 4K / 8K CSS scaling via clamp() throughout
═══════════════════════════════════════════════════════════════ */

// ─── Themes ────────────────────────────────────────────────────
const THEMES = {
  light: {
    bg:"#f4f5f7", fg:"#0a0a0a", card:"#ffffff", border:"#e4e6ea",
    secondary:"#f0f1f3", muted:"#6b7280", input:"#f0f1f3",
    sidebar:"#0f0f11", sidebarFg:"#ffffff", sidebarAccent:"#1e1e21",
    sidebarBorder:"#2b2b2f", sidebarMuted:"#9ca3af",
  },
  dark: {
    bg:"#09090b", fg:"#f0f0f2", card:"#131315", border:"#222226",
    secondary:"#1a1a1e", muted:"#9ca3af", input:"#1a1a1e",
    sidebar:"#050507", sidebarFg:"#ffffff", sidebarAccent:"#0f0f12",
    sidebarBorder:"#181819", sidebarMuted:"#6b7280",
  },
};

// ─── Vibrant chart palette (not monochrome) ────────────────────
const C = {
  swaps:  "#6366f1",  // indigo
  images: "#10b981",  // emerald
  videos: "#f59e0b",  // amber
  avatar: "#ec4899",  // pink
  bulk:   "#8b5cf6",  // violet
};

// ─── Nav structure ──────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard",        icon:"home"     },
  { id:"swap",      label:"Face Swap",         icon:"refresh"  },
  { id:"image",     label:"Image Generation",  icon:"image"    },
  { id:"video",     label:"Video Generation",  icon:"video"    },
  { id:"avatar",    label:"Avatar Generation", icon:"user"     },
  { id:"reshoot",   label:"Virtual Reshoot",   icon:"shirt"    },
  { id:"__adv",     label:"ADVANCED",          type:"divider"  },
  { id:"bulk",      label:"Bulk Generation",   icon:"layers"   },
  { id:"failed",    label:"Failed Jobs",       icon:"alert"    },
  { id:"analytics", label:"Analytics",         icon:"bar"      },
  { id:"__manage",  label:"MANAGE",            type:"divider"  },
  { id:"users",     label:"Users",             icon:"users"    },
  { id:"companies", label:"Companies",         icon:"building" },
  { id:"billing",   label:"Billing",           icon:"card"     },
  { id:"audit",     label:"Audit Logs",        icon:"shield"   },
  { id:"__end",     label:"",                  type:"divider"  },
  { id:"settings",  label:"Settings",          icon:"settings" },
];

// ─── Company-scoped mock data — no overlap between companies ───
const COMPANIES = {
  "demo-co": {
    name:"Demo Corporation", plan:"Professional",
    credits:8240, creditLimit:10000,
    users:[
      { id:"d1", name:"Company Admin", email:"company.admin@demo.com",  role:"company_admin", credits:2000, status:"active"    },
      { id:"d2", name:"Demo User",     email:"user@demo.com",           role:"user",          credits:150,  status:"active"    },
      { id:"d3", name:"Alice Johnson", email:"alice@demo.com",          role:"user",          credits:320,  status:"active"    },
    ],
    jobs:[
      { id:"D-4821", type:"Face Swap",   user:"Alice J.",  time:"2m ago",  status:"done"    },
      { id:"D-4820", type:"Image Gen",   user:"Demo User", time:"8m ago",  status:"done"    },
      { id:"D-4819", type:"Avatar Gen",  user:"Alice J.",  time:"15m ago", status:"running" },
    ],
  },
  "acme-co": {
    name:"Acme Corp", plan:"Enterprise",
    credits:18500, creditLimit:20000,
    users:[
      { id:"a1", name:"Acme Admin",  email:"admin@acme.com",  role:"company_admin", credits:5000, status:"active"    },
      { id:"a2", name:"Bob Smith",   email:"bob@acme.com",    role:"user",          credits:890,  status:"active"    },
      { id:"a3", name:"Carol Lee",   email:"carol@acme.com",  role:"user",          credits:45,   status:"suspended" },
    ],
    jobs:[
      { id:"A-2201", type:"Bulk Gen",  user:"Bob Smith",  time:"1m ago",  status:"done"    },
      { id:"A-2200", type:"Video Gen", user:"Carol Lee",  time:"6m ago",  status:"failed"  },
      { id:"A-2199", type:"Face Swap", user:"Bob Smith",  time:"20m ago", status:"done"    },
    ],
  },
  "global": {
    name:"VenkatTech (Super Admin)", plan:"Super Admin",
    credits:99999, creditLimit:99999,
    users:[
      { id:"s1", name:"Venkat Admin", email:"admin@venkattech.com",     role:"super_admin", credits:99999, status:"active" },
      { id:"s2", name:"Test Admin",   email:"test.admin@venkattech.com",role:"test_admin",  credits:9999,  status:"active" },
    ],
    jobs:[
      { id:"G-9001", type:"Face Swap",  user:"Venkat Admin", time:"just now", status:"done"    },
      { id:"G-9000", type:"Bulk Gen",   user:"Test Admin",   time:"3m ago",   status:"done"    },
      { id:"G-8999", type:"Video Gen",  user:"Venkat Admin", time:"7m ago",   status:"running" },
    ],
  },
};

const ALL_USERS = [
  { id:"s1", name:"Venkat Admin",  email:"admin@venkattech.com",      role:"super_admin",   co:"global",   credits:99999, status:"active"    },
  { id:"s2", name:"Test Admin",    email:"test.admin@venkattech.com", role:"test_admin",    co:"global",   credits:9999,  status:"active"    },
  { id:"d1", name:"Company Admin", email:"company.admin@demo.com",    role:"company_admin", co:"demo-co",  credits:2000,  status:"active"    },
  { id:"d2", name:"Demo User",     email:"user@demo.com",             role:"user",          co:"demo-co",  credits:150,   status:"active"    },
  { id:"d3", name:"Alice Johnson", email:"alice@demo.com",            role:"user",          co:"demo-co",  credits:320,   status:"active"    },
  { id:"a1", name:"Acme Admin",    email:"admin@acme.com",            role:"company_admin", co:"acme-co",  credits:5000,  status:"active"    },
  { id:"a2", name:"Bob Smith",     email:"bob@acme.com",              role:"user",          co:"acme-co",  credits:890,   status:"active"    },
  { id:"a3", name:"Carol Lee",     email:"carol@acme.com",            role:"user",          co:"acme-co",  credits:45,    status:"suspended" },
];

// ─── Charts data (static seed — no Math.random at module level) ─
const WEEKLY = [
  { day:"Mon", swaps:42, images:18, videos:6  },
  { day:"Tue", swaps:58, images:24, videos:9  },
  { day:"Wed", swaps:35, images:15, videos:4  },
  { day:"Thu", swaps:71, images:30, videos:12 },
  { day:"Fri", swaps:84, images:36, videos:15 },
  { day:"Sat", swaps:29, images:12, videos:3  },
  { day:"Sun", swaps:22, images:9,  videos:2  },
];
const MONTHLY = [112,180,95,210,143,88,175,220,67,195,134,158,201,79,163,240,110,185,92,207,148,173,99,216,131,189,105,228,142,177];

// ─── Random avatar pool (shuffled on every session mount) ───────
const AVATAR_POOL = [
  { emoji:"🧑‍💼", hue:240 }, { emoji:"👩‍🦰", hue:350 }, { emoji:"👨‍🦱", hue:160 },
  { emoji:"👩‍🦳", hue:280 }, { emoji:"🧑🏿‍💻", hue:200 }, { emoji:"👩🏽‍🎨", hue:30  },
  { emoji:"🧑🏻‍🔬", hue:140 }, { emoji:"👨🏾‍🚀", hue:60  }, { emoji:"👩🏼‍🏫", hue:320 },
  { emoji:"🧑🏾‍⚕️", hue:180 }, { emoji:"👨🏻‍🎤", hue:0   }, { emoji:"👩🏿‍🔧", hue:100 },
  { emoji:"🧑🏼‍🍳", hue:25  }, { emoji:"👨🏽‍🎨", hue:260 }, { emoji:"👩🏻‍🔬", hue:80  },
  { emoji:"🧑🏾‍🚒", hue:10  },
];
function useShuffledAvatars() {
  return useMemo(() => {
    const a = [...AVATAR_POOL];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, 12);
  }, []); // stable per mount, changes on re-mount/shuffle
}

// ─── SVG icon helper ────────────────────────────────────────────
const PATHS = {
  home:     ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"],
  refresh:  ["M23 4v6h-6","M1 20v-6h6","M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"],
  image:    ["M3 3h18v18H3z","M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z","M21 15l-5-5L5 21"],
  video:    ["M23 7l-7 5 7 5V7z","M1 5h15v14H1z"],
  user:     ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 3a4 4 0 110 8 4 4 0 010-8z"],
  shirt:    ["M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"],
  layers:   ["M12 2L2 7l10 5 10-5-10-5z","M2 17l10 5 10-5","M2 12l10 5 10-5"],
  alert:    ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"],
  bar:      ["M18 20V10","M12 20V4","M6 20v-6"],
  users:    ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M9 3a4 4 0 110 8 4 4 0 010-8z","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75"],
  building: ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"],
  card:     ["M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2z","M1 10h22"],
  shield:   ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  settings: ["M12 15a3 3 0 100-6 3 3 0 000 6z","M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"],
  sun:      ["M12 2v2","M12 20v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M2 12h2","M20 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42","M12 17a5 5 0 100-10 5 5 0 000 10z"],
  moon:     ["M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"],
  monitor:  ["M2 3h20a2 2 0 012 2v14a2 2 0 01-2 2H2a2 2 0 01-2-2V5a2 2 0 012-2z","M8 21h8","M12 17v4"],
  zap:      ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  logout:   ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4","M16 17l5-5-5-5","M21 12H9"],
  chevL:    ["M15 18l-6-6 6-6"],
  chevR:    ["M9 18l6-6-6-6"],
  menu:     ["M3 12h18","M3 6h18","M3 18h18"],
  x:        ["M18 6L6 18","M6 6l12 12"],
  coins:    ["M12 2a10 10 0 110 20A10 10 0 0112 2z","M12 6v6l4 2"],
  plus:     ["M12 5v14","M5 12h14"],
  check:    ["M20 6L9 17l-5-5"],
  upload:   ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"],
  download: ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  search:   ["M11 17a6 6 0 100-12 6 6 0 000 12z","M21 21l-4.35-4.35"],
  bell:     ["M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 01-3.46 0"],
  key:      ["M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"],
  globe:    ["M12 2a10 10 0 110 20A10 10 0 0112 2z","M2 12h20","M12 2a15.3 15.3 0 010 20","M12 2a15.3 15.3 0 000 20"],
  trash:    ["M3 6h18","M19 6l-1 14H6L5 6","M8 6V4h8v2"],
};
function Ic({ k, size = 16, style: s = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink:0, ...s }}>
      {(PATHS[k] || []).map((d, i) => <path key={i} d={d}/>)}
    </svg>
  );
}

// ─── Badge ──────────────────────────────────────────────────────
function Badge({ label, bg = "#dcfce7", color = "#15803d", style: s = {} }) {
  return <span style={{ padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:bg, color, whiteSpace:"nowrap", ...s }}>{label}</span>;
}
const SS = {
  done:      { bg:"#dcfce7", color:"#15803d" },
  running:   { bg:"#fef9c3", color:"#854d0e" },
  failed:    { bg:"#fee2e2", color:"#b91c1c"  },
  active:    { bg:"#dcfce7", color:"#15803d" },
  suspended: { bg:"#fee2e2", color:"#b91c1c"  },
};
const RS = {
  super_admin:   { bg:"#0f0f11", color:"#fff" },
  test_admin:    { bg:"#fef9c3", color:"#854d0e" },
  company_admin: { bg:"#e0f2fe", color:"#0369a1" },
  user:          { bg:"#f1f3f5", color:"#374151" },
};

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENTS
═══════════════════════════════════════════════════════════════ */

// ── Dashboard ────────────────────────────────────────────────────
function DashboardPage({ t, coId }) {
  const co = COMPANIES[coId] || COMPANIES["global"];
  const pct = Math.round((co.credits / co.creditLimit) * 100);
  const creditColor = pct > 60 ? C.images : pct > 25 ? C.videos : "#ef4444";
  const maxBar = Math.max(...WEEKLY.map(d => d.swaps + d.images + d.videos));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"clamp(14px,1.5vw,24px)" }}>

      {/* Company banner — updates with switcher */}
      <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,16px)", padding:"clamp(16px,1.5vw,24px)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontSize:"clamp(18px,1.8vw,26px)", fontWeight:900, letterSpacing:"-0.03em", color:t.fg }}>{co.name}</div>
          <div style={{ fontSize:"clamp(11px,0.85vw,13px)", color:t.muted, marginTop:3 }}>
            Plan: <strong style={{ color:t.fg, textTransform:"capitalize" }}>{co.plan}</strong> &nbsp;·&nbsp; {co.users.length} members
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Ic k="coins" size={16} style={{ color:creditColor }}/>
          <div>
            <div style={{ fontSize:"clamp(14px,1.2vw,18px)", fontWeight:900, color:creditColor }}>
              {co.credits.toLocaleString()}
              <span style={{ fontSize:"clamp(10px,0.75vw,12px)", color:t.muted, fontWeight:400 }}> / {co.creditLimit.toLocaleString()} credits</span>
            </div>
            <div style={{ height:5, width:"clamp(100px,8vw,160px)", background:t.secondary, borderRadius:99, overflow:"hidden", marginTop:4 }}>
              <div style={{ height:"100%", width:`${pct}%`, background:creditColor, borderRadius:99, transition:"width 600ms" }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(clamp(160px,14vw,220px),1fr))", gap:"clamp(10px,1vw,16px)" }}>
        {[
          { label:"Total Swaps",  value:"12,847", change:"+18%", color:C.swaps,  positive:true  },
          { label:"Credits Used", value:co.credits.toLocaleString(), change:"+12%", color:C.images, positive:true  },
          { label:"Active Users", value:co.users.filter(u=>u.status==="active").length, change:"+5%", color:C.videos, positive:true  },
          { label:"Failed Jobs",  value:"3",      change:"-8%",  color:"#ef4444", positive:false },
        ].map(s => (
          <div key={s.label} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,14px)", padding:"clamp(14px,1.2vw,20px)", borderTop:`3px solid ${s.color}`, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-10, right:-10, width:70, height:70, background:s.color, opacity:0.06, borderRadius:"50%" }}/>
            <div style={{ fontSize:"clamp(10px,0.75vw,11px)", color:t.muted, marginBottom:6, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</div>
            <div style={{ fontSize:"clamp(22px,2vw,30px)", fontWeight:900, letterSpacing:"-0.03em", color:t.fg }}>{s.value}</div>
            <div style={{ fontSize:"clamp(10px,0.75vw,12px)", marginTop:4, color:s.positive?"#10b981":"#ef4444", fontWeight:700 }}>{s.change} vs last week</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(clamp(280px,40%,600px),1fr))", gap:"clamp(10px,1vw,16px)" }}>

        {/* Vibrant weekly bar chart */}
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,16px)", padding:"clamp(16px,1.5vw,24px)" }}>
          <div style={{ fontSize:"clamp(13px,1vw,15px)", fontWeight:800, color:t.fg, marginBottom:16 }}>Weekly Operations</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"clamp(4px,0.5vw,10px)", height:"clamp(100px,9vw,140px)" }}>
            {WEEKLY.map(d => (
              <div key={d.day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:2, justifyContent:"flex-end", height:"clamp(80px,7.5vw,115px)" }}>
                  {/* Swaps — indigo */}
                  <div title={`Swaps: ${d.swaps}`} style={{ background:C.swaps, borderRadius:"4px 4px 0 0", height:`${(d.swaps/maxBar)*55}%`, minHeight:3, transition:"height 500ms ease" }}/>
                  {/* Images — emerald */}
                  <div title={`Images: ${d.images}`} style={{ background:C.images, height:`${(d.images/maxBar)*35}%`, minHeight:2, transition:"height 500ms ease" }}/>
                  {/* Videos — amber */}
                  <div title={`Videos: ${d.videos}`} style={{ background:C.videos, height:`${(d.videos/maxBar)*20}%`, minHeight:2, transition:"height 500ms ease" }}/>
                </div>
                <div style={{ fontSize:"clamp(9px,0.65vw,11px)", color:t.muted, fontWeight:600 }}>{d.day}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap" }}>
            {[["Swaps",C.swaps],["Images",C.images],["Videos",C.videos]].map(([l,c]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:"clamp(10px,0.7vw,12px)", color:t.muted }}>
                <div style={{ width:10, height:10, borderRadius:3, background:c }}/>
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Recent jobs — scoped to company */}
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,16px)", padding:"clamp(16px,1.5vw,24px)" }}>
          <div style={{ fontSize:"clamp(13px,1vw,15px)", fontWeight:800, color:t.fg, marginBottom:14 }}>
            Recent Jobs
            <span style={{ fontSize:"clamp(10px,0.75vw,12px)", color:t.muted, fontWeight:400, marginLeft:8 }}>— {co.name}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {co.jobs.map(j => (
              <div key={j.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"clamp(9px,0.8vw,12px) clamp(11px,1vw,14px)", background:t.secondary, borderRadius:"clamp(7px,0.5vw,10px)" }}>
                <div>
                  <div style={{ fontSize:"clamp(11px,0.85vw,13px)", fontWeight:800, color:t.fg }}>{j.id}</div>
                  <div style={{ fontSize:"clamp(10px,0.75vw,12px)", color:t.muted }}>{j.type} · {j.user}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:"clamp(10px,0.7vw,11px)", color:t.muted }}>{j.time}</span>
                  <Badge label={j.status} {...(SS[j.status]||{})}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Face Swap — avatars randomly shuffled each session ──────────
function FaceSwapPage({ t }) {
  const [uploaded,   setUploaded]  = useState(false);
  const [selected,   setSelected]  = useState(null);
  const [done,       setDone]      = useState(false);
  const [shuffleKey, setShuffleKey]= useState(0);

  // Re-mount hook on shuffle to get fresh avatars
  function Avatars() {
    const pool = useShuffledAvatars();
    return (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"clamp(6px,0.6vw,10px)" }}>
        {pool.map((av, i) => (
          <div key={i} onClick={() => setSelected(i)}
            style={{
              background: selected===i ? `hsl(${av.hue},55%,92%)` : t.secondary,
              border:`2px solid ${selected===i ? `hsl(${av.hue},65%,55%)` : "transparent"}`,
              borderRadius:"clamp(8px,0.6vw,12px)", padding:"clamp(8px,0.8vw,12px) 4px",
              textAlign:"center", cursor:"pointer", transition:"all 150ms",
              transform: selected===i ? "scale(1.05)" : "scale(1)",
            }}>
            <div style={{ fontSize:"clamp(20px,2vw,30px)", marginBottom:4 }}>{av.emoji}</div>
            <div style={{ fontSize:"clamp(9px,0.65vw,11px)", fontWeight:700, color:selected===i?`hsl(${av.hue},55%,30%)`:t.muted }}>
              Avatar {i+1}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"clamp(14px,1.2vw,20px)" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"clamp(12px,1.2vw,20px)" }}>
        {/* Upload zone */}
        <div onClick={() => { setUploaded(true); setDone(false); }}
          style={{ background:t.card, border:`2px dashed ${uploaded?C.swaps:t.border}`, borderRadius:"clamp(10px,0.8vw,16px)",
            padding:"clamp(24px,2.5vw,48px)", textAlign:"center", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
            minHeight:"clamp(160px,14vw,240px)", transition:"border-color 200ms" }}>
          {uploaded
            ? <div style={{ fontSize:"clamp(40px,4.5vw,64px)" }}>🧑</div>
            : <Ic k="upload" size={32} style={{ color:t.muted }}/>}
          <div style={{ fontSize:"clamp(12px,0.9vw,14px)", fontWeight:700, color:uploaded?t.fg:t.muted }}>
            {uploaded ? "model_photo.jpg ✓" : "Upload Model Image"}
          </div>
          {!uploaded && <div style={{ fontSize:"clamp(10px,0.75vw,12px)", color:t.muted }}>Click or drag · JPG / PNG · Max 20 MB</div>}
        </div>

        {/* Avatar panel */}
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,16px)", padding:"clamp(14px,1.2vw,20px)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:"clamp(12px,0.9vw,14px)", fontWeight:800, color:t.fg }}>Select Avatar</div>
            <button onClick={() => { setShuffleKey(k => k+1); setSelected(null); setDone(false); }}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", background:t.secondary, border:`1px solid ${t.border}`, borderRadius:8, cursor:"pointer", fontSize:"clamp(10px,0.75vw,12px)", fontWeight:700, color:t.muted }}>
              <Ic k="refresh" size={11}/> Shuffle
            </button>
          </div>
          {/* key forces remount → new shuffle */}
          <div key={shuffleKey}><Avatars/></div>
        </div>
      </div>

      {/* Swap CTA */}
      <button onClick={() => { if (uploaded && selected!==null) setDone(true); }}
        disabled={!uploaded || selected===null}
        style={{ padding:"clamp(10px,0.9vw,14px) clamp(20px,2vw,36px)",
          background:(!uploaded||selected===null)?t.secondary:C.swaps,
          color:(!uploaded||selected===null)?t.muted:"#fff",
          border:"none", borderRadius:"clamp(8px,0.6vw,12px)", fontWeight:800,
          fontSize:"clamp(13px,1vw,15px)", cursor:(!uploaded||selected===null)?"not-allowed":"pointer",
          display:"flex", alignItems:"center", gap:10, alignSelf:"flex-start", transition:"all 150ms" }}>
        <Ic k="refresh" size={16}/> Swap Face · 2 Credits
      </button>

      {done && (
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,16px)", padding:"clamp(16px,1.5vw,24px)", display:"flex", gap:16, alignItems:"center" }}>
          <div style={{ fontSize:"clamp(32px,3vw,48px)" }}>✅</div>
          <div>
            <div style={{ fontWeight:800, fontSize:"clamp(13px,1vw,16px)", color:t.fg, marginBottom:4 }}>Swap Complete!</div>
            <div style={{ fontSize:"clamp(11px,0.8vw,13px)", color:t.muted }}>2 credits deducted · Result ready to download</div>
          </div>
          <button style={{ marginLeft:"auto", padding:"clamp(7px,0.6vw,10px) clamp(14px,1.2vw,20px)", background:C.images, color:"#fff", border:"none", borderRadius:"clamp(7px,0.5vw,10px)", fontWeight:700, fontSize:"clamp(11px,0.8vw,13px)", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <Ic k="download" size={13}/> Download
          </button>
        </div>
      )}
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────────
function AnalyticsPage({ t }) {
  const maxM = Math.max(...MONTHLY);
  const pts  = MONTHLY.map((v,i) => `${(i/(MONTHLY.length-1))*300},${100-(v/maxM)*88}`).join(" ");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"clamp(12px,1.2vw,18px)" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(clamp(150px,13vw,200px),1fr))", gap:"clamp(10px,1vw,14px)" }}>
        {[
          { label:"Total Operations", value:"1,284", change:"+12%", color:C.swaps  },
          { label:"Credits Used",     value:"2,568", change:"+8%",  color:C.images },
          { label:"Success Rate",     value:"97.2%", change:"+0.3%",color:C.videos },
          { label:"Avg Response",     value:"2.4s",  change:"−0.2s",color:C.avatar },
        ].map(c => (
          <div key={c.label} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,14px)", padding:"clamp(14px,1.2vw,20px)", borderTop:`3px solid ${c.color}` }}>
            <div style={{ fontSize:"clamp(10px,0.75vw,11px)", color:t.muted, marginBottom:6, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>{c.label}</div>
            <div style={{ fontSize:"clamp(22px,2vw,30px)", fontWeight:900, color:t.fg, letterSpacing:"-0.03em" }}>{c.value}</div>
            <div style={{ fontSize:"clamp(10px,0.75vw,12px)", color:"#10b981", marginTop:4, fontWeight:700 }}>{c.change}</div>
          </div>
        ))}
      </div>
      {/* Line chart */}
      <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,16px)", padding:"clamp(16px,1.5vw,24px)" }}>
        <div style={{ fontSize:"clamp(13px,1vw,15px)", fontWeight:800, color:t.fg, marginBottom:14 }}>Credits Used (30 days)</div>
        <svg width="100%" height="clamp(80px,8vw,120px)" viewBox="0 0 300 100" preserveAspectRatio="none" style={{ overflow:"visible" }}>
          <defs>
            <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.swaps} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={C.swaps} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={`M ${pts}`} fill="none" stroke={C.swaps} strokeWidth="2.5" strokeLinejoin="round"/>
          <path d={`M 0,100 L ${pts} L 300,100 Z`} fill="url(#lg1)"/>
        </svg>
      </div>
      {/* Breakdown */}
      <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,16px)", padding:"clamp(16px,1.5vw,24px)" }}>
        <div style={{ fontSize:"clamp(13px,1vw,15px)", fontWeight:800, color:t.fg, marginBottom:14 }}>Operations Breakdown</div>
        <div style={{ display:"flex", flexDirection:"column", gap:"clamp(8px,0.7vw,12px)" }}>
          {[
            { label:"Face Swap", pct:48, color:C.swaps  },
            { label:"Images",    pct:24, color:C.images },
            { label:"Videos",    pct:14, color:C.videos },
            { label:"Avatar",    pct:9,  color:C.avatar },
            { label:"Bulk",      pct:5,  color:C.bulk   },
          ].map(item => (
            <div key={item.label} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:"clamp(60px,5vw,90px)", fontSize:"clamp(11px,0.8vw,13px)", color:t.fg, fontWeight:600 }}>{item.label}</div>
              <div style={{ flex:1, height:"clamp(6px,0.5vw,9px)", background:t.secondary, borderRadius:99, overflow:"hidden" }}>
                <div style={{ width:`${item.pct}%`, height:"100%", background:item.color, borderRadius:99, transition:"width 800ms ease" }}/>
              </div>
              <div style={{ fontSize:"clamp(11px,0.8vw,13px)", fontWeight:800, color:item.color, width:32, textAlign:"right" }}>{item.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Users — strict company isolation ────────────────────────────
function UsersPage({ t, coId }) {
  const [search, setSearch] = useState("");
  const isSuperAdmin = coId === "global";
  // Super admin sees all; company admin sees only their company
  const visible = isSuperAdmin ? ALL_USERS : ALL_USERS.filter(u => u.co === coId);
  const filtered = visible.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {!isSuperAdmin && (
        <div style={{ padding:"8px 14px", background:"#fef9c3", border:"1px solid #fde68a", borderRadius:8, fontSize:"clamp(11px,0.8vw,13px)", color:"#854d0e", fontWeight:600 }}>
          🔒 Scoped to <strong>{COMPANIES[coId]?.name}</strong> — users from other companies are not visible
        </div>
      )}
      <div style={{ display:"flex", gap:10 }}>
        <div style={{ position:"relative", flex:1 }}>
          <Ic k="search" size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:t.muted }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users…"
            style={{ width:"100%", height:"clamp(36px,3vw,42px)", paddingLeft:36, paddingRight:12, background:t.input, border:`1px solid ${t.border}`, borderRadius:8, fontSize:"clamp(12px,0.85vw,14px)", color:t.fg, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <button style={{ padding:"0 clamp(14px,1.2vw,20px)", background:C.swaps, color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:"clamp(12px,0.85vw,14px)", cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
          <Ic k="plus" size={14}/> Add User
        </button>
      </div>
      <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,14px)", overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:600 }}>
            <thead>
              <tr style={{ background:t.secondary }}>
                {["Name","Email","Role","Company","Credits","Status",""].map(h => (
                  <th key={h} style={{ textAlign:"left", fontSize:"clamp(10px,0.72vw,11px)", fontWeight:800, color:t.muted, padding:"clamp(9px,0.75vw,12px) clamp(10px,0.9vw,16px)", letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderTop:`1px solid ${t.border}` }}>
                  <td style={{ padding:"clamp(10px,0.8vw,14px) clamp(10px,0.9vw,16px)", fontSize:"clamp(12px,0.85vw,14px)", fontWeight:700, color:t.fg, whiteSpace:"nowrap" }}>{u.name}</td>
                  <td style={{ padding:"clamp(10px,0.8vw,14px) clamp(10px,0.9vw,16px)", fontSize:"clamp(11px,0.78vw,13px)", color:t.muted }}>{u.email}</td>
                  <td style={{ padding:"clamp(10px,0.8vw,14px) clamp(10px,0.9vw,16px)" }}><Badge label={u.role.replace(/_/g," ")} {...(RS[u.role]||{})}/></td>
                  <td style={{ padding:"clamp(10px,0.8vw,14px) clamp(10px,0.9vw,16px)", fontSize:"clamp(11px,0.78vw,13px)", color:t.muted, whiteSpace:"nowrap" }}>{COMPANIES[u.co]?.name||"—"}</td>
                  <td style={{ padding:"clamp(10px,0.8vw,14px) clamp(10px,0.9vw,16px)", fontSize:"clamp(12px,0.85vw,14px)", fontWeight:800, color:t.fg }}>{u.credits.toLocaleString()}</td>
                  <td style={{ padding:"clamp(10px,0.8vw,14px) clamp(10px,0.9vw,16px)" }}><Badge label={u.status} {...(SS[u.status]||{})}/></td>
                  <td style={{ padding:"clamp(10px,0.8vw,14px) clamp(10px,0.9vw,16px)" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button style={{ padding:"4px 10px", background:t.secondary, border:"none", borderRadius:6, cursor:"pointer", color:t.fg, fontSize:"clamp(10px,0.72vw,12px)", fontWeight:600 }}>Edit</button>
                      <button style={{ padding:"4px 10px", background:"rgba(239,68,68,0.08)", border:"none", borderRadius:6, cursor:"pointer", color:"#ef4444", fontSize:"clamp(10px,0.72vw,12px)", fontWeight:600 }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Billing ───────────────────────────────────────────────────────
function BillingPage({ t }) {
  const [billing,  setBilling] = useState("monthly");
  const [selected, setSelected]= useState("professional");
  const plans = [
    { id:"starter",      name:"Starter",      price:29,  priceY:24,  credits:"1,000",  users:"5",  storage:"10 GB"  },
    { id:"professional", name:"Professional", price:79,  priceY:66,  credits:"5,000",  users:"25", storage:"50 GB"  },
    { id:"enterprise",   name:"Enterprise",   price:199, priceY:166, credits:"20,000", users:"∞",  storage:"500 GB" },
  ];
  const planColors = { starter:C.images, professional:C.swaps, enterprise:C.bulk };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"clamp(14px,1.2vw,20px)" }}>
      <div style={{ display:"flex", gap:4, background:t.secondary, borderRadius:10, padding:4, alignSelf:"flex-start" }}>
        {["monthly","yearly"].map(b => (
          <button key={b} onClick={() => setBilling(b)}
            style={{ padding:"7px 20px", borderRadius:7, border:"none", cursor:"pointer", fontWeight:700, fontSize:"clamp(12px,0.85vw,13px)", background:billing===b?t.fg:"transparent", color:billing===b?t.bg:t.muted, transition:"all 150ms" }}>
            {b.charAt(0).toUpperCase()+b.slice(1)}
            {b==="yearly" && <span style={{ fontSize:10, color:billing==="yearly"?C.images:"#10b981", marginLeft:4 }}>−20%</span>}
          </button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(clamp(200px,18vw,280px),1fr))", gap:"clamp(12px,1vw,18px)" }}>
        {plans.map(p => {
          const isCur = p.id === selected;
          const col   = planColors[p.id];
          return (
            <div key={p.id} onClick={() => setSelected(p.id)}
              style={{ background:isCur?col:t.card, border:`2px solid ${isCur?col:t.border}`,
                borderRadius:"clamp(12px,1vw,18px)", padding:"clamp(20px,2vw,30px)", cursor:"pointer",
                transition:"all 180ms", color:isCur?"#fff":t.fg, position:"relative", overflow:"hidden" }}>
              {isCur && <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, background:"rgba(255,255,255,0.08)", borderRadius:"50%" }}/>}
              <div style={{ fontSize:"clamp(10px,0.75vw,12px)", fontWeight:900, marginBottom:8, opacity:0.7, letterSpacing:"0.08em" }}>{p.name.toUpperCase()}</div>
              <div style={{ fontSize:"clamp(30px,3vw,42px)", fontWeight:900, letterSpacing:"-0.04em", marginBottom:4 }}>
                ${billing==="yearly"?p.priceY:p.price}
                <span style={{ fontSize:"clamp(12px,0.85vw,14px)", fontWeight:400, opacity:0.6 }}>/mo</span>
              </div>
              {[`${p.credits} credits/mo`,`Up to ${p.users} users`,`${p.storage} storage`].map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:"clamp(11px,0.82vw,13px)", marginTop:10, opacity:0.85 }}>
                  <Ic k="check" size={13}/> {f}
                </div>
              ))}
              {isCur && <div style={{ marginTop:16, padding:"6px 0", textAlign:"center", fontSize:"clamp(10px,0.72vw,12px)", fontWeight:800, opacity:0.65, letterSpacing:"0.06em" }}>CURRENT PLAN</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────
function SettingsPage({ t, theme, setTheme }) {
  const [tab,   setTab]   = useState("profile");
  const [saved, setSaved] = useState(false);
  function save() { setSaved(true); setTimeout(() => setSaved(false), 1800); }
  const tabs = [
    {id:"profile",  label:"Profile",       icon:"user"    },
    {id:"security", label:"Security",      icon:"shield"  },
    {id:"appear",   label:"Appearance",    icon:"monitor" },
    {id:"notif",    label:"Notifications", icon:"bell"    },
    {id:"api",      label:"API Keys",      icon:"key"     },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"clamp(150px,13vw,200px) 1fr", gap:"clamp(12px,1.2vw,20px)", alignItems:"start" }}>
      <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,14px)", padding:6 }}>
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            style={{ display:"flex", alignItems:"center", gap:8, width:"100%",
              padding:"clamp(7px,0.6vw,10px) 10px", borderRadius:8,
              background:tab===tb.id?C.swaps:"transparent",
              color:tab===tb.id?"#fff":t.muted,
              border:"none", cursor:"pointer",
              fontSize:"clamp(12px,0.85vw,14px)", fontWeight:tab===tb.id?700:400,
              marginBottom:2, transition:"all 120ms", textAlign:"left" }}>
            <Ic k={tb.icon} size={14}/> {tb.label}
          </button>
        ))}
      </div>
      <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,14px)", padding:"clamp(20px,2vw,32px)" }}>
        {tab==="profile" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ fontSize:"clamp(14px,1.1vw,17px)", fontWeight:900, color:t.fg }}>Profile Settings</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[["Full Name","Venkat Admin"],["Email","admin@venkattech.com"],["Phone","+1 555 0100"],["Timezone","UTC"]].map(([l,v]) => (
                <div key={l}>
                  <label style={{ fontSize:"clamp(10px,0.72vw,11px)", fontWeight:700, color:t.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</label>
                  <input defaultValue={v} style={{ width:"100%", height:"clamp(36px,3vw,42px)", padding:"0 12px", background:t.input, border:`1.5px solid ${t.border}`, borderRadius:8, fontSize:"clamp(12px,0.85vw,14px)", color:t.fg, outline:"none", boxSizing:"border-box" }}/>
                </div>
              ))}
            </div>
            <button onClick={save} style={{ padding:"clamp(8px,0.7vw,11px) clamp(18px,1.5vw,24px)", background:C.swaps, color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:"clamp(12px,0.85vw,14px)", cursor:"pointer", alignSelf:"flex-start", display:"flex", alignItems:"center", gap:8 }}>
              {saved?<><Ic k="check" size={13}/> Saved!</>:"Save Changes"}
            </button>
          </div>
        )}
        {tab==="appear" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ fontSize:"clamp(14px,1.1vw,17px)", fontWeight:900, color:t.fg }}>Appearance</div>
            <div style={{ fontSize:"clamp(12px,0.85vw,14px)", color:t.muted }}>Changes apply instantly — no reload needed.</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, maxWidth:420 }}>
              {[{id:"light",label:"Light",icon:"sun"},{id:"dark",label:"Dark",icon:"moon"},{id:"system",label:"System",icon:"monitor"}].map(o => (
                <button key={o.id} onClick={() => setTheme(o.id)}
                  style={{ padding:"clamp(12px,1vw,18px) 8px", border:`2px solid ${theme===o.id?C.swaps:t.border}`,
                    borderRadius:10, background:theme===o.id?C.swaps:t.bg,
                    color:theme===o.id?"#fff":t.fg, cursor:"pointer", textAlign:"center", transition:"all 150ms" }}>
                  <Ic k={o.icon} size={20} style={{ display:"block", margin:"0 auto 6px" }}/>
                  <div style={{ fontSize:"clamp(11px,0.8vw,13px)", fontWeight:800 }}>{o.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {tab==="security" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ fontSize:"clamp(14px,1.1vw,17px)", fontWeight:900, color:t.fg }}>Security</div>
            {["Current Password","New Password","Confirm Password"].map(l => (
              <div key={l}>
                <label style={{ fontSize:"clamp(10px,0.72vw,11px)", fontWeight:700, color:t.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</label>
                <input type="password" placeholder="••••••••" style={{ width:"100%", height:"clamp(36px,3vw,42px)", padding:"0 12px", background:t.input, border:`1.5px solid ${t.border}`, borderRadius:8, fontSize:"clamp(12px,0.85vw,14px)", color:t.fg, outline:"none", boxSizing:"border-box" }}/>
              </div>
            ))}
            <button onClick={save} style={{ padding:"clamp(8px,0.7vw,11px) clamp(18px,1.5vw,24px)", background:C.swaps, color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:"clamp(12px,0.85vw,14px)", cursor:"pointer", alignSelf:"flex-start" }}>
              {saved?"Updated!":"Update Password"}
            </button>
          </div>
        )}
        {tab==="notif" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ fontSize:"clamp(14px,1.1vw,17px)", fontWeight:900, color:t.fg }}>Notifications</div>
            {[
              ["Email notifications",  "Receive updates via email",              true ],
              ["Low credit alerts",    "Alert when credits drop below 20%",      true ],
              ["Job completion",       "Notify when generation jobs finish",      true ],
              ["Weekly report",        "Summary of usage every Monday",           false],
            ].map(([l, d, def]) => {
              const [on, setOn] = useState(def);
              return (
                <div key={l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"clamp(10px,0.9vw,14px) clamp(12px,1vw,16px)", background:t.secondary, borderRadius:10 }}>
                  <div>
                    <div style={{ fontSize:"clamp(12px,0.85vw,14px)", fontWeight:700, color:t.fg }}>{l}</div>
                    <div style={{ fontSize:"clamp(10px,0.72vw,12px)", color:t.muted }}>{d}</div>
                  </div>
                  <button onClick={()=>setOn(!on)} style={{ width:44, height:24, borderRadius:99, border:"none", cursor:"pointer", background:on?C.swaps:t.border, position:"relative", transition:"background 200ms", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:3, left:on?23:3, width:18, height:18, background:"white", borderRadius:"50%", transition:"left 200ms", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {tab==="api" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ fontSize:"clamp(14px,1.1vw,17px)", fontWeight:900, color:t.fg }}>API Keys</div>
            <div>
              <label style={{ fontSize:"clamp(10px,0.72vw,11px)", fontWeight:700, color:t.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Live API Key</label>
              <div style={{ display:"flex", gap:8 }}>
                <input readOnly value="vt_live_sk_••••••••••••••••••••••••••••••••"
                  style={{ flex:1, height:"clamp(36px,3vw,42px)", padding:"0 12px", background:t.input, border:`1.5px solid ${t.border}`, borderRadius:8, fontSize:"clamp(11px,0.78vw,13px)", color:t.muted, outline:"none", fontFamily:"monospace", boxSizing:"border-box" }}/>
                <button style={{ padding:"0 clamp(12px,1vw,18px)", background:C.swaps, color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:"clamp(11px,0.78vw,13px)", cursor:"pointer" }}>Copy</button>
              </div>
              <div style={{ fontSize:"clamp(10px,0.72vw,12px)", color:t.muted, marginTop:6 }}>Never share your key publicly or commit it to source control.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceholderPage({ label, icon, t }) {
  return (
    <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"clamp(10px,0.8vw,16px)", padding:"clamp(40px,5vw,80px)", textAlign:"center" }}>
      <Ic k={icon||"bar"} size={40} style={{ color:t.muted, display:"block", margin:"0 auto 16px" }}/>
      <div style={{ fontSize:"clamp(16px,1.5vw,22px)", fontWeight:900, color:t.fg, marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:"clamp(12px,0.9vw,14px)", color:t.muted }}>Fully implemented in the production codebase.</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT — Sidebar + Header + Dashboard merged in one file
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [theme,      setThemeState]  = useState("light");
  const [page,       setPage]        = useState("dashboard");
  const [collapsed,  setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen]  = useState(false);
  const [hovered,    setHovered]     = useState(null);
  // Company switcher — controls data scope across all pages
  const [coId,       setCoId]        = useState("demo-co");

  const t  = THEMES[theme] || THEMES.light;
  const SW = collapsed ? 64 : 240;
  const co = COMPANIES[coId] || COMPANIES["demo-co"];

  const setTheme = useCallback((v) => {
    const r = v === "system"
      ? (window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light")
      : v;
    setThemeState(r);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [page]);

  const pageLabel = NAV.find(n => n.id === page)?.label ?? "Dashboard";
  const creditPct = Math.round((co.credits / co.creditLimit) * 100);
  const creditColor = creditPct > 60 ? C.images : creditPct > 25 ? C.videos : "#ef4444";

  // ─ Sidebar content component ──────────────────────────────────
  function SidebarInner() {
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%", background:t.sidebar, overflowX:"hidden" }}>

        {/* Logo */}
        <div style={{ height:60, display:"flex", alignItems:"center", gap:collapsed?0:12, padding:collapsed?"0":"0 clamp(14px,1.2vw,20px)", justifyContent:collapsed?"center":undefined, borderBottom:`1px solid ${t.sidebarBorder}`, flexShrink:0 }}>
          <div style={{ width:34, height:34, background:C.swaps, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ic k="zap" size={18} style={{ color:"#fff" }}/>
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight:900, fontSize:14, color:t.sidebarFg, letterSpacing:"-0.025em" }}>VenkatTech</div>
              <div style={{ fontSize:10, color:t.sidebarMuted }}>Media Studio</div>
            </div>
          )}
        </div>

        {/* Company scope selector */}
        {!collapsed && (
          <div style={{ padding:"10px 10px 4px" }}>
            <div style={{ fontSize:9, fontWeight:900, letterSpacing:"0.12em", color:t.sidebarMuted, opacity:0.45, marginBottom:5, userSelect:"none" }}>COMPANY SCOPE</div>
            <select value={coId} onChange={e=>setCoId(e.target.value)}
              style={{ width:"100%", background:t.sidebarAccent, border:`1px solid ${t.sidebarBorder}`, borderRadius:8, padding:"6px 10px", color:t.sidebarFg, fontSize:12, fontWeight:700, cursor:"pointer", outline:"none" }}>
              <option value="demo-co">Demo Corporation</option>
              <option value="acme-co">Acme Corp</option>
              <option value="global">VenkatTech (Super Admin)</option>
            </select>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:"6px 6px", overflowY:"auto", overflowX:"hidden" }}>
          {NAV.map(item => {
            if (item.type === "divider") {
              return collapsed
                ? <div key={item.id} style={{ height:1, background:t.sidebarBorder, margin:"5px 8px" }}/>
                : item.label
                  ? <div key={item.id} style={{ padding:"10px 10px 3px", fontSize:9, fontWeight:900, letterSpacing:"0.12em", color:t.sidebarMuted, opacity:0.4, userSelect:"none" }}>{item.label}</div>
                  : <div key={item.id} style={{ height:4 }}/>;
            }
            const active = page === item.id;
            const isHov  = hovered === item.id;
            return (
              <button key={item.id}
                onClick={()=>setPage(item.id)}
                onMouseEnter={()=>setHovered(item.id)}
                onMouseLeave={()=>setHovered(null)}
                title={collapsed?item.label:undefined}
                style={{ display:"flex", alignItems:"center", gap:10, width:"100%",
                  padding:collapsed?"10px":"8px 10px", borderRadius:8, marginBottom:1,
                  border:"none", cursor:"pointer", textAlign:"left",
                  background:active?t.sidebarAccent:isHov?"rgba(255,255,255,0.06)":"transparent",
                  color:active||isHov?t.sidebarFg:t.sidebarMuted,
                  fontSize:13, fontWeight:active?700:400,
                  justifyContent:collapsed?"center":undefined,
                  transition:"all 120ms", position:"relative" }}>
                {active && <div style={{ position:"absolute", left:0, top:"18%", bottom:"18%", width:3, background:C.swaps, borderRadius:"0 3px 3px 0" }}/>}
                <Ic k={item.icon} size={15} style={{ opacity:active?1:0.65 }}/>
                {!collapsed && <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Theme 3-way toggle */}
        <div style={{ padding:collapsed?"0 6px 8px":"0 8px 10px" }}>
          {!collapsed && <div style={{ fontSize:9, fontWeight:900, letterSpacing:"0.12em", color:t.sidebarMuted, opacity:0.38, marginBottom:6, paddingLeft:2, userSelect:"none" }}>THEME</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:t.sidebarAccent, borderRadius:8, padding:3, gap:2 }}>
            {[{id:"light",icon:"sun",label:"Light"},{id:"dark",icon:"moon",label:"Dark"},{id:"system",icon:"monitor",label:"Auto"}].map(o => (
              <button key={o.id} onClick={() => setTheme(o.id)} title={o.label}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3,
                  padding:collapsed?"10px 0":"6px 0",
                  background:theme===o.id?"white":"transparent",
                  border:"none", borderRadius:6, cursor:"pointer",
                  color:theme===o.id?t.sidebar:t.sidebarMuted,
                  transition:"all 150ms", fontSize:9, fontWeight:700 }}>
                <Ic k={o.icon} size={12}/>
                {!collapsed && <span>{o.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* User + logout */}
        <div style={{ borderTop:`1px solid ${t.sidebarBorder}`, padding:"10px 6px 8px" }}>
          {!collapsed && (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"4px 6px 10px" }}>
              <div style={{ width:32, height:32, background:C.swaps, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:12, flexShrink:0 }}>V</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:t.sidebarFg, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Venkat Admin</div>
                <div style={{ fontSize:10, color:t.sidebarMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>admin@venkattech.com</div>
              </div>
            </div>
          )}
          <button
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.18)";e.currentTarget.style.color="#fca5a5";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=t.sidebarMuted;}}
            style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:collapsed?"10px":"8px 10px",
              borderRadius:8, border:"none", background:"transparent", color:t.sidebarMuted,
              cursor:"pointer", fontSize:13, justifyContent:collapsed?"center":undefined, transition:"all 120ms" }}>
            <Ic k="logout" size={15}/>
            {!collapsed && "Sign out"}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={()=>setCollapsed(c=>!c)}
          style={{ position:"absolute", top:"50%", right:-13, transform:"translateY(-50%)",
            width:26, height:26, background:t.sidebar, border:`1px solid ${t.sidebarBorder}`,
            borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            color:t.sidebarFg, zIndex:10, boxShadow:"0 2px 8px rgba(0,0,0,0.4)" }}>
          <Ic k={collapsed?"chevR":"chevL"} size={12}/>
        </button>
      </div>
    );
  }

  // ─ Page render ────────────────────────────────────────────────
  function renderPage() {
    switch(page) {
      case "dashboard": return <DashboardPage t={t} coId={coId}/>;
      case "swap":      return <FaceSwapPage  t={t}/>;
      case "analytics": return <AnalyticsPage t={t}/>;
      case "users":     return <UsersPage t={t} coId={coId}/>;
      case "billing":   return <BillingPage t={t}/>;
      case "settings":  return <SettingsPage t={t} theme={theme} setTheme={setTheme}/>;
      default: {
        const item = NAV.find(n => n.id === page);
        return <PlaceholderPage t={t} label={item?.label} icon={item?.icon}/>;
      }
    }
  }

  return (
    <div style={{ fontFamily:"'DM Sans',ui-sans-serif,system-ui,sans-serif", background:t.bg, minHeight:"100vh", color:t.fg }}>

      {/* Desktop sidebar */}
      <aside style={{ position:"fixed", top:0, left:0, bottom:0, width:SW,
        transition:"width 220ms cubic-bezier(.4,0,.2,1)", zIndex:40, overflow:"visible" }}>
        <div style={{ position:"relative", height:"100%" }}><SidebarInner/></div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div onClick={()=>setMobileOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", zIndex:45 }}/>
          <aside style={{ position:"fixed", top:0, left:0, bottom:0, width:240, zIndex:50, boxShadow:"4px 0 24px rgba(0,0,0,0.3)" }}>
            <div style={{ position:"relative", height:"100%" }}><SidebarInner/></div>
            <button onClick={()=>setMobileOpen(false)} style={{ position:"absolute", top:16, right:-44, background:"rgba(255,255,255,0.1)", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"white" }}>
              <Ic k="x" size={16}/>
            </button>
          </aside>
        </>
      )}

      {/* Top header — stays on top, no duplicate sidebar */}
      <header style={{ position:"fixed", top:0, left:SW, right:0, height:60,
        background:t.bg, borderBottom:`1px solid ${t.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 clamp(16px,2vw,28px)", zIndex:30,
        transition:"left 220ms cubic-bezier(.4,0,.2,1)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={()=>setMobileOpen(true)} className="mob-btn"
            style={{ padding:7, background:t.secondary, border:`1px solid ${t.border}`, borderRadius:8, cursor:"pointer", display:"none", alignItems:"center", justifyContent:"center", color:t.fg }}>
            <Ic k="menu" size={18}/>
          </button>
          <h1 style={{ fontSize:"clamp(15px,1.3vw,18px)", fontWeight:900, letterSpacing:"-0.025em", color:t.fg }}>{pageLabel}</h1>
          <Badge label={co.name} bg={t.secondary} color={t.muted} style={{ fontSize:"clamp(10px,0.72vw,11px)" }}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"clamp(6px,0.8vw,12px)" }}>
          {/* Credits */}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px clamp(10px,1vw,16px)", background:t.secondary, borderRadius:10 }}>
            <Ic k="coins" size={14} style={{ color:creditColor }}/>
            <div>
              <div style={{ display:"flex", gap:4, alignItems:"baseline" }}>
                <span style={{ fontSize:"clamp(12px,0.9vw,14px)", fontWeight:800, color:creditColor }}>{co.credits.toLocaleString()}</span>
                <span style={{ fontSize:"clamp(10px,0.72vw,11px)", color:t.muted }}>/ {co.creditLimit.toLocaleString()}</span>
              </div>
              <div style={{ height:3, background:t.border, borderRadius:99, overflow:"hidden", width:"clamp(48px,4vw,72px)" }}>
                <div style={{ height:"100%", width:`${creditPct}%`, background:creditColor, borderRadius:99, transition:"width 400ms" }}/>
              </div>
            </div>
          </div>
          {/* Theme quick-toggle */}
          <button onClick={()=>setTheme(theme==="dark"?"light":"dark")}
            title={theme==="dark"?"Switch to light":"Switch to dark"}
            style={{ width:36, height:36, background:t.secondary, border:`1px solid ${t.border}`, borderRadius:9, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:t.fg, transition:"background 150ms" }}>
            <Ic k={theme==="dark"?"sun":"moon"} size={15}/>
          </button>
          {/* Bell */}
          <button style={{ width:36, height:36, background:t.secondary, border:`1px solid ${t.border}`, borderRadius:9, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:t.fg }}>
            <Ic k="bell" size={15}/>
          </button>
          {/* User */}
          <div style={{ width:36, height:36, background:C.swaps, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:14 }}>V</div>
        </div>
      </header>

      {/* Main */}
      <main style={{ marginLeft:SW, paddingTop:60, minHeight:"100vh", transition:"margin-left 220ms cubic-bezier(.4,0,.2,1)", boxSizing:"border-box" }}>
        <div style={{ padding:"clamp(16px,2vw,28px)", maxWidth:1600, margin:"0 auto", boxSizing:"border-box" }}>
          {renderPage()}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800;9..40,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.22); border-radius: 99px; }
        /* 4K */
        @media (min-width: 3840px) { html { font-size: 22px; } ::-webkit-scrollbar { width: 10px; } }
        /* 8K */
        @media (min-width: 7680px) { html { font-size: 36px; } ::-webkit-scrollbar { width: 16px; } }
        @media (max-width: 1023px) {
          aside:first-of-type { display: none !important; }
          .mob-btn { display: flex !important; }
          main { margin-left: 0 !important; }
          header { left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
