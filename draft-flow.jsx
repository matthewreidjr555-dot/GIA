import React, { useState, useEffect, useRef } from "react";
import {
  Paperclip, Bot, Globe, ArrowUp, X, UserPlus, Check, Link2, Search,
  Mic, MicOff, Video, VideoOff, MessageSquare, ScreenShare, PhoneOff, Send,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, LogIn, LogOut, User,
  Home, Users, Share2, Wallet,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------
const G = {
  bg: "#08080A",
  canvas: "#111113",
  panel: "#1B1B1F",
  panelHi: "#232328",
  hair: "rgba(255,255,255,0.10)",
  hairSoft: "rgba(255,255,255,0.05)",
  ink: "#F4F4F6",
  inkSoft: "#C6C6CC",
  inkMute: "#87878F",
  inkFaint: "#4C4C52",
};
const EASE = "cubic-bezier(0.16,1,0.3,1)";

const PEOPLE = [
  { id: "ada", name: "Ada", city: "London", tone: "#DADADE", speaking: true, status: "active", role: "builder" },
  { id: "you", name: "You", city: "—", tone: "#B0B0B8", speaking: false, status: "active", role: "builder" },
  { id: "kenji", name: "Kenji", city: "Tokyo", tone: "#8C8C94", speaking: false, status: "idle", role: "builder" },
  { id: "priya", name: "Priya", city: "Singapore", tone: "#87878F", speaking: false, status: "idle", role: "tester" },
  { id: "marcus", name: "Marcus", city: "San Francisco", tone: "#C6C6CC", speaking: false, status: "active", role: "investor" },
];

const MESSAGES = [
  { who: "Ada", tone: "#DADADE", text: "moved the auth check up a layer", voice: false },
  { who: "Kenji", tone: "#8C8C94", text: "0:14 voice note", voice: true },
  { who: "You", tone: "#B0B0B8", text: "looks right, shipping it", voice: false },
];

const BUILDERS = [
  { id: "ada", name: "Ada Okafor", handle: "@ada", city: "London", skill: "Systems", rating: "4.9", projects: 24 },
  { id: "kenjis", name: "Kenji Sato", handle: "@kenjis", city: "Tokyo", skill: "Agents", rating: "4.8", projects: 31 },
  { id: "marisolv", name: "Marisol Vega", handle: "@marisolv", city: "Mexico City", skill: "Design", rating: "4.7", projects: 12 },
  { id: "samw", name: "Sam Whitfield", handle: "@samw", city: "New York", skill: "Infra", rating: "4.6", projects: 19 },
  { id: "reyhanp", name: "Reyhan Putri", handle: "@reyhanp", city: "Jakarta", skill: "React", rating: "4.9", projects: 27 },
];

const APP_FILES = [
  { name: "nimbus-crm", source: "GitHub", type: "Repo" },
  { name: "Dashboard v2", source: "Figma", type: "Design" },
  { name: "Product spec", source: "Notion", type: "Doc" },
  { name: "Auth service", source: "GitHub", type: "Repo" },
];

const SUGGESTIONS = ["Build a CRM dashboard", "Find a Rust engineer", "Draft a landing page", "Ship a Stripe checkout"];

const PROJECTS = [
  {
    id: "nimbus",
    name: "Nimbus CRM",
    tag: "A CRM built for indie B2B founders",
    stack: ["React", "Postgres", "Stripe"],
    contributors: [{ name: "Ada", tone: "#DADADE" }, { name: "Kenji", tone: "#8C8C94" }, { name: "You", tone: "#B0B0B8" }],
    activeCap: 6,
    historical: 42,
    forkedFrom: null,
    owned: true,
    raised: "$120k",
    investorCount: 4,
  },
  {
    id: "vertex",
    name: "Vertex Systems",
    tag: "Ops dashboard for logistics teams",
    stack: ["Next.js", "Supabase"],
    contributors: [{ name: "Sam", tone: "#C6C6CC" }, { name: "Reyhan", tone: "#8C8C94" }, { name: "Marisol", tone: "#B0B0B8" }, { name: "Elin", tone: "#87878F" }, { name: "Priya", tone: "#DADADE" }],
    activeCap: 6,
    historical: 18,
    forkedFrom: null,
    owned: false,
  },
  {
    id: "nimbus-mobile",
    name: "Nimbus Mobile",
    tag: "React Native companion for Nimbus CRM",
    stack: ["Expo", "GraphQL"],
    contributors: [{ name: "Tomas", tone: "#B0B0B8" }, { name: "Ada", tone: "#DADADE" }],
    activeCap: 6,
    historical: 6,
    forkedFrom: "Nimbus CRM",
    owned: false,
  },
  {
    id: "delta",
    name: "Delta Checkout",
    tag: "Apple Pay-first checkout flow",
    stack: ["Node", "Stripe"],
    contributors: [{ name: "Sarah", tone: "#C6C6CC" }, { name: "Kenji", tone: "#8C8C94" }, { name: "Priya", tone: "#DADADE" }, { name: "Elin", tone: "#87878F" }],
    activeCap: 6,
    historical: 29,
    forkedFrom: null,
    owned: false,
  },
];

const AGENTS = [
  { name: "Frontend Agent", model: "Claude", category: "React / UI", rating: "4.9", runs: "12.4k", price: "$0.05" },
  { name: "Backend Agent", model: "DeepSeek", category: "API / Server", rating: "4.7", runs: "8.1k", price: "$0.08" },
  { name: "QA Agent", model: "GPT", category: "Testing", rating: "4.8", runs: "5.6k", price: "$0.04" },
  { name: "Design Agent", model: "Claude", category: "UI / UX", rating: "4.9", runs: "9.2k", price: "$0.06" },
  { name: "Deploy Agent", model: "Gemini", category: "Infra", rating: "4.6", runs: "3.3k", price: "$0.10" },
];

const EARNINGS = [
  { project: "Nimbus CRM", role: "Owner", equity: "8%", amount: "$1,240", period: "this month" },
  { project: "Vertex Systems", role: "Contributor", equity: "1.5%", amount: "$310", period: "this month" },
  { project: "Delta Checkout", role: "Contributor", equity: "0.8%", amount: "$95", period: "this month" },
  { project: "Frontend Agent", role: "Agent creator", equity: "—", amount: "$62", period: "this month" },
];

const ACCESS_TIERS = [
  { key: "builder", label: "Builder", desc: "Full access — code, chat, video, tasks, agents." },
  { key: "tester", label: "Tester", desc: "Try the live build and leave feedback. No edit access." },
  { key: "investor", label: "Investor", desc: "View live progress and metrics, and invest in the project." },
];

const SECTIONS = [
  {
    name: "Dashboard",
    cards: [{ label: "MRR", value: "$42.1k" }, { label: "Churn", value: "1.8%" }, { label: "Active", value: "312" }],
    rows: [
      { title: "New signup", meta: "Acme Co", status: "New" },
      { title: "Payment received", meta: "Delta LLC", status: "Paid" },
      { title: "Ticket opened", meta: "Nova Inc", status: "Open" },
      { title: "Deal closed", meta: "Vertex Systems", status: "Won" },
    ],
  },
  {
    name: "Contacts",
    cards: [{ label: "Total", value: "1,204" }, { label: "New", value: "38" }, { label: "Tagged", value: "512" }],
    rows: [
      { title: "Sarah Kim", meta: "Product Lead", status: "Active" },
      { title: "Tomas Reyes", meta: "CTO", status: "Active" },
      { title: "Priya N.", meta: "Founder", status: "New" },
      { title: "Elin Park", meta: "Ops", status: "Active" },
    ],
  },
  {
    name: "Pipeline",
    cards: [{ label: "Open deals", value: "27" }, { label: "Value", value: "$318k" }, { label: "Win rate", value: "34%" }],
    rows: [
      { title: "Acme Co", meta: "Proposal sent", status: "Open" },
      { title: "Delta LLC", meta: "Negotiation", status: "Open" },
      { title: "Nova Inc", meta: "Discovery", status: "Open" },
      { title: "Vertex Systems", meta: "Closed won", status: "Won" },
    ],
  },
  {
    name: "Reports",
    cards: [{ label: "Reports", value: "12" }, { label: "Scheduled", value: "4" }, { label: "Shared", value: "9" }],
    rows: [
      { title: "Q3 revenue breakdown", meta: "Updated 2d ago", status: "" },
      { title: "Churn cohort analysis", meta: "Updated 1w ago", status: "" },
      { title: "Rep performance", meta: "Updated 3d ago", status: "" },
      { title: "Funnel conversion", meta: "Updated 5h ago", status: "" },
    ],
  },
  {
    name: "Settings",
    cards: [{ label: "Users", value: "8" }, { label: "Integrations", value: "5" }, { label: "Plan", value: "Team" }],
    rows: [
      { title: "Billing", meta: "Manage plan & invoices", status: "" },
      { title: "Roles & permissions", meta: "8 members", status: "" },
      { title: "API keys", meta: "2 active", status: "" },
      { title: "Notifications", meta: "Email + Slack", status: "" },
    ],
  },
];

const STEPS = ["Reading your prompt", "Assembling the workspace", "Matching builders nearby", "Waking up agents"];

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------
function Chip({ children, tone, size = "sm" }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full shrink-0 ${size === "sm" ? "px-2 py-1 text-[10px]" : "px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px]"}`}
      style={{ background: G.panel, color: G.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {tone && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tone }} />}
      {children}
    </div>
  );
}

function Waveform({ active }) {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="w-[2px] rounded-full" style={{ background: G.ink, height: active ? undefined : 3, animation: active ? `bar 0.9s ${EASE} ${i * 0.12}s infinite` : "none" }} />
      ))}
    </div>
  );
}

function Fraunces({ children, className = "", style = {} }) {
  return <span className={className} style={{ fontFamily: "'Fraunces', serif", ...style }}>{children}</span>;
}

function Wordmark({ size = "text-[11px]" }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: G.ink }} />
      <span className={`${size} tracking-[0.25em]`} style={{ color: G.inkMute, fontFamily: "'IBM Plex Mono', monospace" }}>GIA</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen 1 — prompt composer
// ---------------------------------------------------------------------------
function ScanSheet({ project, onClose, onInvite }) {
  const [phase, setPhase] = useState("scanning"); // scanning | results
  const [query, setQuery] = useState("");
  const [invited, setInvited] = useState({});

  useEffect(() => {
    const t = setTimeout(() => setPhase("results"), 1300);
    return () => clearTimeout(t);
  }, []);

  const invite = (item) => {
    setInvited((s) => ({ ...s, [item.id]: true }));
    if (onInvite) onInvite(item);
  };

  const all = [
    ...BUILDERS.map((b) => ({ ...b, type: "person" })),
    ...AGENTS.map((a) => ({ ...a, id: a.name, type: "agent" })),
  ];
  const q = query.trim().toLowerCase();
  const filtered = q ? all.filter((i) => i.name.toLowerCase().includes(q)) : all;
  const showList = q.length > 0 || phase === "results";

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 fade-in" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl slide-up flex flex-col" style={{ background: "rgba(27,27,31,0.9)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, maxHeight: "88vh", boxShadow: "0 40px 100px -30px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 shrink-0">
          <div className="text-[10px] tracking-[0.2em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>
            SCAN FOR BUILDERS{project ? ` · ${project.name.toUpperCase()}` : ""}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center -mr-1"><X size={16} style={{ color: G.inkMute }} /></button>
        </div>

        <div className="px-4 sm:px-5 pb-3 shrink-0">
          <div className="flex items-center gap-2 rounded-full px-3 py-2" style={{ background: G.panelHi, border: `1px solid ${G.hair}` }}>
            <Search size={13} style={{ color: G.inkFaint }} className="shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, or let it scan…" className="flex-1 min-w-0 bg-transparent outline-none text-sm" style={{ color: G.ink }} />
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto px-4 sm:px-5 pb-5">
          {!showList ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <span className="relative flex items-center justify-center" style={{ width: 56, height: 56 }}>
                <span className="absolute inline-flex w-full h-full rounded-full pulse-ring" style={{ background: G.inkSoft }} />
                <span className="absolute inline-flex w-full h-full rounded-full pulse-ring" style={{ background: G.inkSoft, animationDelay: "0.6s" }} />
                <span className="relative inline-flex rounded-full items-center justify-center" style={{ width: 40, height: 40, background: G.panelHi, border: `1px solid ${G.hair}` }}>
                  <Globe size={16} style={{ color: G.inkSoft }} />
                </span>
              </span>
              <div className="text-[10px] tracking-[0.15em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>SCANNING THE NETWORK…</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: G.panelHi }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs" style={{ background: `${G.inkSoft}22`, border: `1px solid ${G.inkSoft}55`, color: G.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {item.type === "agent" ? <Bot size={13} /> : item.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate" style={{ color: G.ink }}>{item.name}</div>
                    <div className="text-[10px] truncate" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {item.type === "agent" ? `${item.category} · ★${item.rating} · ${item.runs} runs` : `${item.city} · ${item.skill} · ★${item.rating} · ${item.projects} projects`}
                    </div>
                  </div>
                  <button
                    onClick={() => !invited[item.id] && invite(item)}
                    className="text-[10px] px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1"
                    style={{
                      color: invited[item.id] ? G.inkMute : G.bg,
                      background: invited[item.id] ? "transparent" : G.ink,
                      border: `1px solid ${invited[item.id] ? G.hair : G.ink}`,
                      fontFamily: "'IBM Plex Mono', monospace",
                      transition: `all 0.3s ${EASE}`,
                    }}
                  >
                    {invited[item.id] ? (<><Check size={11} /> Invited</>) : "Invite"}
                  </button>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-xs py-8" style={{ color: G.inkFaint }}>No matches for "{query}"</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilesSheet({ onClose, onPick }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 fade-in" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl slide-up flex flex-col" style={{ background: "rgba(27,27,31,0.9)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, maxHeight: "88vh", boxShadow: "0 40px 100px -30px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 shrink-0">
          <div className="text-[10px] tracking-[0.2em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>CONNECT APP FILES</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center -mr-1"><X size={16} style={{ color: G.inkMute }} /></button>
        </div>

        <div className="min-h-0 overflow-y-auto px-4 sm:px-5 pb-5 flex flex-col gap-2">
          {APP_FILES.map((f, i) => (
            <button key={i} onClick={() => onPick(f)} className="flex items-center gap-3 p-2.5 rounded-lg text-left" style={{ background: G.panelHi }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${G.inkSoft}22`, border: `1px solid ${G.inkSoft}55` }}>
                <Link2 size={13} style={{ color: G.inkSoft }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs" style={{ color: G.ink }}>{f.name}</div>
                <div className="text-[10px]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{f.source} · {f.type}</div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full shrink-0" style={{ color: G.inkMute, border: `1px solid ${G.hair}`, fontFamily: "'IBM Plex Mono', monospace" }}>Connect</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentSheet({ onClose, onPick }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 fade-in" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl slide-up flex flex-col" style={{ background: "rgba(27,27,31,0.9)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, maxHeight: "88vh", boxShadow: "0 40px 100px -30px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 shrink-0">
          <div className="text-[10px] tracking-[0.2em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>AI AGENTS · BRING YOUR OWN</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center -mr-1"><X size={16} style={{ color: G.inkMute }} /></button>
        </div>

        <div className="min-h-0 overflow-y-auto px-4 sm:px-5 pb-5 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[["Claude", "Frontend"], ["DeepSeek", "Backend"], ["GPT", "Brainstorm"]].map(([model, role]) => (
              <span key={model} className="text-[10px] px-2.5 py-1 rounded-full" style={{ color: G.inkMute, border: `1px solid ${G.hair}`, fontFamily: "'IBM Plex Mono', monospace" }}>{model} → {role}</span>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {AGENTS.map((a, i) => (
              <button key={i} onClick={() => onPick(a)} className="flex items-center gap-3 p-2.5 rounded-lg text-left" style={{ background: G.panelHi }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${G.inkSoft}22`, border: `1px solid ${G.inkSoft}55` }}>
                  <Bot size={13} style={{ color: G.inkSoft }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs" style={{ color: G.ink }}>{a.name}</div>
                  <div className="text-[10px] truncate" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{a.category} · {a.model} · ★{a.rating} · {a.runs} runs</div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full shrink-0" style={{ color: G.inkMute, border: `1px solid ${G.hair}`, fontFamily: "'IBM Plex Mono', monospace" }}>{a.price}/run</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectSheet({ project, onClose }) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 fade-in" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl slide-up p-4 sm:p-5" style={{ background: "rgba(27,27,31,0.9)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, boxShadow: "0 40px 100px -30px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] tracking-[0.2em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>PROPOSE A CONNECTION</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center -mr-1"><X size={16} style={{ color: G.inkMute }} /></button>
        </div>
        {sent ? (
          <div className="py-6 flex flex-col items-center gap-2 text-center">
            <Check size={18} style={{ color: G.ink }} />
            <div className="text-sm" style={{ color: G.inkSoft }}>Proposal sent to {project.name}</div>
          </div>
        ) : (
          <>
            <div className="text-sm mb-3" style={{ color: G.ink }}>Connect your build with <span style={{ color: G.inkSoft }}>{project.name}</span></div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Describe the integration or partnership you have in mind…" className="w-full rounded-lg p-3 text-sm bg-transparent outline-none resize-none" style={{ color: G.ink, background: G.panelHi, border: `1px solid ${G.hair}` }} />
            <button onClick={() => setSent(true)} className="w-full mt-3 rounded-full py-2.5 text-[11px]" style={{ background: G.ink, color: G.bg, fontFamily: "'IBM Plex Mono', monospace" }}>Send proposal</button>
          </>
        )}
      </div>
    </div>
  );
}

function Toast({ text }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 slide-down">
      <div className="rounded-full px-4 py-2 text-[11px] flex items-center gap-2" style={{ background: "rgba(27,27,31,0.85)", backdropFilter: "blur(20px)", border: `1px solid ${G.hair}`, color: G.inkSoft, fontFamily: "'IBM Plex Mono', monospace", boxShadow: "0 20px 50px -20px rgba(0,0,0,0.7)" }}>
        <Check size={12} style={{ color: G.ink }} />
        {text}
      </div>
    </div>
  );
}

function AuthSheet({ onClose, onAuth }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = () => {
    onAuth({ name: name.trim() || email.split("@")[0] || "Builder", email: email.trim() || "you@nimbus.app" });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 fade-in" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl slide-up p-4 sm:p-5" style={{ background: "rgba(27,27,31,0.9)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, boxShadow: "0 40px 100px -30px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            {["signin", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="text-[11px] px-3 py-1 rounded-full"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: mode === m ? G.bg : G.inkMute,
                  background: mode === m ? G.ink : "transparent",
                  border: `1px solid ${mode === m ? G.ink : G.hair}`,
                  transition: `all 0.3s ${EASE}`,
                }}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center -mr-1"><X size={16} style={{ color: G.inkMute }} /></button>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <button onClick={submit} className="active:scale-95 flex items-center justify-center gap-2 rounded-full py-2.5 text-[12px]" style={{ background: G.panelHi, color: G.ink, border: `1px solid ${G.hair}`, transition: `transform 0.15s ${EASE}` }}>
            Continue with Google
          </button>
          <button onClick={submit} className="active:scale-95 flex items-center justify-center gap-2 rounded-full py-2.5 text-[12px]" style={{ background: G.panelHi, color: G.ink, border: `1px solid ${G.hair}`, transition: `transform 0.15s ${EASE}` }}>
            Continue with OpenRouter
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="flex-1 h-px" style={{ background: G.hairSoft }} />
          <span className="text-[9px] tracking-[0.15em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>OR</span>
          <span className="flex-1 h-px" style={{ background: G.hairSoft }} />
        </div>

        <div className="flex flex-col gap-2">
          {mode === "signup" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none" style={{ color: G.ink, background: G.panelHi, border: `1px solid ${G.hair}` }} />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none" style={{ color: G.ink, background: G.panelHi, border: `1px solid ${G.hair}` }} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none" style={{ color: G.ink, background: G.panelHi, border: `1px solid ${G.hair}` }} />
        </div>

        <button onClick={submit} className="active:scale-95 w-full mt-3 rounded-full py-2.5 text-[11px]" style={{ background: G.ink, color: G.bg, fontFamily: "'IBM Plex Mono', monospace", transition: `transform 0.15s ${EASE}` }}>
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}

function ProfileSheet({ user, onClose, onSave, onSignOut }) {
  const [name, setName] = useState(user.name);

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 fade-in" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl slide-up p-4 sm:p-5" style={{ background: "rgba(27,27,31,0.9)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, boxShadow: "0 40px 100px -30px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] tracking-[0.2em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>EDIT PROFILE</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center -mr-1"><X size={16} style={{ color: G.inkMute }} /></button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm shrink-0" style={{ background: G.panelHi, border: `1px solid ${G.hair}`, color: G.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>
            {(name || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm truncate" style={{ color: G.ink }}>{name || "Builder"}</div>
            <div className="text-[10px] truncate" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{user.email}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none" style={{ color: G.ink, background: G.panelHi, border: `1px solid ${G.hair}` }} />
        </div>

        <button onClick={() => onSave({ ...user, name: name.trim() || user.name })} className="active:scale-95 w-full rounded-full py-2.5 text-[11px] mb-2" style={{ background: G.ink, color: G.bg, fontFamily: "'IBM Plex Mono', monospace", transition: `transform 0.15s ${EASE}` }}>
          Save changes
        </button>
        <button onClick={onSignOut} className="active:scale-95 w-full rounded-full py-2.5 text-[11px] flex items-center justify-center gap-1.5" style={{ color: G.inkMute, border: `1px solid ${G.hair}`, fontFamily: "'IBM Plex Mono', monospace", transition: `transform 0.15s ${EASE}` }}>
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </div>
  );
}

function ProfileButton({ user, onClick }) {
  return (
    <button
      onClick={onClick}
      className="active:scale-95 w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px]"
      style={{ background: G.panelHi, border: `1px solid ${G.hair}`, color: G.inkSoft, fontFamily: "'IBM Plex Mono', monospace", transition: `transform 0.15s ${EASE}` }}
    >
      {user ? user.name[0].toUpperCase() : <User size={14} />}
    </button>
  );
}

function ProfileMenu({ user, onClose, onHome, onOpenProfile, onOpenContributions, onSignIn, onSignOut }) {
  const NavRow = ({ icon: Icon, label, onClick, sub }) => (
    <button onClick={onClick} className="active:scale-95 w-full flex items-center gap-3 rounded-xl p-3.5 text-left" style={{ background: G.panel, transition: `transform 0.15s ${EASE}` }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: G.panelHi }}>
        <Icon size={15} style={{ color: G.inkSoft }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm" style={{ color: G.ink }}>{label}</div>
        {sub && <div className="text-[10px] mt-0.5" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{sub}</div>}
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 fade-in" style={{ background: G.bg }}>
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <Wordmark />
          <button onClick={onClose} className="active:scale-95 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: G.panelHi, border: `1px solid ${G.hair}` }}>
            <X size={16} style={{ color: G.inkMute }} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-8 shrink-0">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: G.panelHi, border: `1px solid ${G.hair}`, color: G.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>
            {user ? user.name[0].toUpperCase() : <User size={20} />}
          </div>
          <div className="min-w-0">
            <div className="text-base" style={{ color: G.ink }}>{user ? user.name : "Not signed in"}</div>
            <div className="text-xs truncate" style={{ color: G.inkFaint }}>{user ? user.email : "Sign in to save your work and get paid"}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
          <NavRow icon={Home} label="Home" sub="Back to Discover" onClick={onHome} />
          {user ? (
            <>
              <NavRow icon={User} label="Edit profile" onClick={onOpenProfile} />
              <NavRow icon={Wallet} label="Contributions & earnings" sub="See what you're getting paid" onClick={onOpenContributions} />
              <NavRow icon={LogOut} label="Sign out" onClick={onSignOut} />
            </>
          ) : (
            <NavRow icon={LogIn} label="Sign in" sub="Or create an account" onClick={onSignIn} />
          )}
        </div>
      </div>
    </div>
  );
}

function ContributionsSheet({ onClose }) {
  const total = "$1,707";
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 fade-in" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl slide-up flex flex-col" style={{ background: "rgba(27,27,31,0.9)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, maxHeight: "88vh", boxShadow: "0 40px 100px -30px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 shrink-0">
          <div className="text-[10px] tracking-[0.2em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>CONTRIBUTIONS & EARNINGS</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center -mr-1"><X size={16} style={{ color: G.inkMute }} /></button>
        </div>

        <div className="mx-4 sm:mx-5 mb-3 rounded-lg p-4 shrink-0" style={{ background: G.panelHi }}>
          <div className="text-[9px] mb-1" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>TOTAL THIS MONTH</div>
          <div className="text-2xl" style={{ color: G.ink, fontFamily: "'Fraunces', serif" }}>{total}</div>
        </div>

        <div className="min-h-0 overflow-y-auto px-4 sm:px-5 pb-5 flex flex-col gap-2">
          {EARNINGS.map((e, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: G.panelHi }}>
              <div className="flex-1 min-w-0">
                <div className="text-xs" style={{ color: G.ink }}>{e.project}</div>
                <div className="text-[10px] truncate" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{e.role} · {e.equity} equity</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs" style={{ color: G.inkSoft }}>{e.amount}</div>
                <div className="text-[9px]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{e.period}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RosterSheet({ people, onClose, onShareAccess }) {
  const active = people.filter((p) => p.status !== "idle");
  const idle = people.filter((p) => p.status === "idle");
  const roleLabel = { builder: "Builder", tester: "Tester", investor: "Investor" };

  const Row = ({ p }) => (
    <div className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: G.panelHi }}>
      <span className="relative flex items-center justify-center shrink-0" style={{ width: 30, height: 30 }}>
        {p.status !== "idle" && <span className="absolute inline-flex w-full h-full rounded-full pulse-ring" style={{ background: G.inkSoft }} />}
        <span className="relative flex items-center justify-center rounded-full text-[11px]" style={{ width: 30, height: 30, background: `${p.tone}22`, border: `1px solid ${p.tone}55`, color: p.tone, fontFamily: "'IBM Plex Mono', monospace" }}>{p.name[0]}</span>
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-xs" style={{ color: G.ink }}>{p.name}</div>
        <div className="text-[10px] truncate" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{p.city} · {roleLabel[p.role] || "Builder"}</div>
      </div>
      <span className="text-[9px] px-2 py-0.5 rounded-full shrink-0" style={{ color: p.status === "idle" ? G.inkFaint : G.inkSoft, border: `1px solid ${G.hair}`, fontFamily: "'IBM Plex Mono', monospace" }}>
        {p.status === "idle" ? "Idle" : "Active"}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 fade-in" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl slide-up flex flex-col" style={{ background: "rgba(27,27,31,0.9)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, maxHeight: "88vh", boxShadow: "0 40px 100px -30px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 shrink-0">
          <div className="text-[10px] tracking-[0.2em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>CONTRIBUTORS · {people.length} ON THIS BUILD</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center -mr-1"><X size={16} style={{ color: G.inkMute }} /></button>
        </div>

        <div className="min-h-0 overflow-y-auto px-4 sm:px-5 pb-4 flex flex-col gap-4">
          {active.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-[9px] tracking-[0.15em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>ACTIVE NOW</div>
              {active.map((p) => <Row key={p.id} p={p} />)}
            </div>
          )}
          {idle.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-[9px] tracking-[0.15em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>IDLE</div>
              {idle.map((p) => <Row key={p.id} p={p} />)}
            </div>
          )}
        </div>

        {onShareAccess && (
          <div className="px-4 sm:px-5 pb-5 pt-1 shrink-0">
            <button onClick={onShareAccess} className="active:scale-95 w-full flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[11px]" style={{ color: G.inkMute, border: `1px solid ${G.hair}`, fontFamily: "'IBM Plex Mono', monospace", transition: `transform 0.15s ${EASE}` }}>
              <Share2 size={12} /> Share access to this project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ShareAccessSheet({ project, onClose }) {
  const [copied, setCopied] = useState(null);

  const copy = (key) => {
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  };

  const slug = (project.name || "project").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 fade-in" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl slide-up flex flex-col" style={{ background: "rgba(27,27,31,0.9)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, maxHeight: "88vh", boxShadow: "0 40px 100px -30px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 shrink-0">
          <div className="text-[10px] tracking-[0.2em]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>SHARE ACCESS · {project.name.toUpperCase()}</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center -mr-1"><X size={16} style={{ color: G.inkMute }} /></button>
        </div>

        {(project.raised || project.investorCount) && (
          <div className="mx-4 sm:mx-5 mb-3 rounded-lg p-3 flex items-center gap-4 shrink-0" style={{ background: G.panelHi }}>
            {project.raised && (
              <div>
                <div className="text-[9px]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>RAISED</div>
                <div className="text-sm" style={{ color: G.ink }}>{project.raised}</div>
              </div>
            )}
            {project.investorCount != null && (
              <div>
                <div className="text-[9px]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>INVESTORS</div>
                <div className="text-sm" style={{ color: G.ink }}>{project.investorCount}</div>
              </div>
            )}
          </div>
        )}

        <div className="min-h-0 overflow-y-auto px-4 sm:px-5 pb-5 flex flex-col gap-2">
          {ACCESS_TIERS.map((t) => (
            <div key={t.key} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: G.panelHi }}>
              <div className="flex-1 min-w-0">
                <div className="text-xs mb-0.5" style={{ color: G.ink }}>{t.label}</div>
                <div className="text-[10px] mb-1.5" style={{ color: G.inkMute }}>{t.desc}</div>
                <div className="text-[10px] truncate" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>gia.app/p/{slug}/{t.key}</div>
              </div>
              <button
                onClick={() => copy(t.key)}
                className="active:scale-95 text-[10px] px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1"
                style={{ color: copied === t.key ? G.inkMute : G.bg, background: copied === t.key ? "transparent" : G.ink, border: `1px solid ${copied === t.key ? G.hair : G.ink}`, fontFamily: "'IBM Plex Mono', monospace", transition: `all 0.3s ${EASE}` }}
              >
                {copied === t.key ? (<><Check size={11} /> Copied</>) : "Copy link"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectPreview() {
  return (
    <div className="relative rounded-xl overflow-hidden mb-3" style={{ background: G.canvas, border: `1px solid ${G.hairSoft}`, aspectRatio: "16/9" }}>
      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full px-2 py-0.5 z-10" style={{ background: "rgba(0,0,0,0.5)" }}>
        <span className="relative flex items-center justify-center" style={{ width: 5, height: 5 }}>
          <span className="absolute inline-flex w-full h-full rounded-full pulse-ring" style={{ background: G.inkSoft }} />
          <span className="relative inline-flex rounded-full" style={{ width: 5, height: 5, background: G.inkSoft }} />
        </span>
        <span className="text-[8px]" style={{ color: G.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>LIVE</span>
      </div>
      <div className="p-3 flex gap-2 h-full">
        <div className="flex flex-col gap-1.5 shrink-0">
          {[0, 1, 2].map((i) => <div key={i} className="w-3 h-3 rounded" style={{ background: G.panel }} />)}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-5 rounded" style={{ background: G.panel }} />)}
          </div>
          <div className="flex-1 rounded" style={{ background: G.panel }} />
        </div>
      </div>
    </div>
  );
}

function DiscoverScreen({ onCreate, onEnter, user, onOpenMenu }) {
  const [connectProject, setConnectProject] = useState(null);
  const [scanProject, setScanProject] = useState(null);
  const [shareProject, setShareProject] = useState(null);
  const [joinState, setJoinState] = useState({}); // id -> pending | accepted

  const requestJoin = (project) => {
    setJoinState((s) => ({ ...s, [project.id]: "pending" }));
    setTimeout(() => {
      setJoinState((s) => ({ ...s, [project.id]: "accepted" }));
      setTimeout(() => onEnter(project), 700);
    }, 1400);
  };

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 py-10 sm:py-14">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <ProfileButton user={user} onClick={onOpenMenu} />
          <Wordmark />
          <div className="w-9" />
        </div>

        <Fraunces className="block text-center text-2xl sm:text-4xl mb-2 tracking-tight" style={{ color: G.ink, fontWeight: 500 }}>
          Build together.
        </Fraunces>
        <p className="text-center text-sm mb-8" style={{ color: G.inkMute }}>
          Build over posting. Collaborate over following. Bring your own AI.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button onClick={onCreate} className="text-[11px] px-4 py-2 rounded-full" style={{ background: G.ink, color: G.bg, fontFamily: "'IBM Plex Mono', monospace" }}>
            Create project
          </button>
        </div>

        <div className="text-[10px] tracking-[0.2em] mb-3" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>BEING BUILT RIGHT NOW</div>

        <div className="flex flex-col gap-3">
          {PROJECTS.map((p) => {
            const state = joinState[p.id] || "idle";
            return (
              <div key={p.id} className="rounded-2xl p-4 sm:p-5" style={{ background: G.panel, border: `1px solid ${G.hair}` }}>
                <ProjectPreview />

                <div className="mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm" style={{ color: G.ink }}>{p.name}</div>
                    {p.forkedFrom && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: G.inkFaint, border: `1px solid ${G.hair}`, fontFamily: "'IBM Plex Mono', monospace" }}>forked from {p.forkedFrom}</span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: G.inkMute }}>{p.tag}</div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {p.stack.map((s) => (
                    <span key={s} className="text-[10px] px-2 py-1 rounded-full" style={{ color: G.inkMute, border: `1px solid ${G.hair}`, fontFamily: "'IBM Plex Mono', monospace" }}>{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {p.contributors.slice(0, 4).map((c, i) => (
                        <span key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px]" style={{ background: G.panelHi, border: `2px solid ${G.panel}`, color: c.tone, fontFamily: "'IBM Plex Mono', monospace" }}>{c.name[0]}</span>
                      ))}
                    </div>
                    <span className="text-[10px]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{p.contributors.length}/{p.activeCap} active · {p.historical} historical</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setScanProject(p)} title="Find builders for this project" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: G.inkMute, border: `1px solid ${G.hair}` }}>
                      <Globe size={13} />
                    </button>
                    {p.owned && (
                      <button onClick={() => setShareProject(p)} title="Share access" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: G.inkMute, border: `1px solid ${G.hair}` }}>
                        <Share2 size={13} />
                      </button>
                    )}
                    <button onClick={() => setConnectProject(p)} className="text-[10px] px-3 py-1.5 rounded-full" style={{ color: G.inkMute, border: `1px solid ${G.hair}`, fontFamily: "'IBM Plex Mono', monospace" }}>
                      Connect
                    </button>
                    {p.owned ? (
                      <button onClick={() => onEnter(p)} className="text-[10px] px-3.5 py-1.5 rounded-full" style={{ background: G.ink, color: G.bg, fontFamily: "'IBM Plex Mono', monospace" }}>
                        Enter
                      </button>
                    ) : (
                      <button
                        onClick={() => state === "idle" && requestJoin(p)}
                        className="text-[10px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5"
                        style={{ background: state === "idle" ? G.ink : "transparent", color: state === "idle" ? G.bg : G.inkMute, border: `1px solid ${state === "idle" ? G.ink : G.hair}`, fontFamily: "'IBM Plex Mono', monospace", transition: `all 0.3s ${EASE}` }}
                      >
                        {state === "pending" && (
                          <span className="relative flex items-center justify-center" style={{ width: 6, height: 6 }}>
                            <span className="absolute inline-flex w-full h-full rounded-full pulse-ring" style={{ background: G.inkSoft }} />
                            <span className="relative inline-flex rounded-full" style={{ width: 6, height: 6, background: G.inkSoft }} />
                          </span>
                        )}
                        {state === "idle" && "Request to join"}
                        {state === "pending" && "Pending…"}
                        {state === "accepted" && (<><Check size={11} /> Accepted</>)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {scanProject && <ScanSheet project={scanProject} onClose={() => setScanProject(null)} />}
      {connectProject && <ConnectSheet project={connectProject} onClose={() => setConnectProject(null)} />}
      {shareProject && <ShareAccessSheet project={shareProject} onClose={() => setShareProject(null)} />}
    </div>
  );
}

function PromptScreen({ onSubmit, user, onOpenMenu }) {
  const [mode, setMode] = useState("build"); // build | ask
  const [text, setText] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  const go = () => onSubmit(text.trim() || SUGGESTIONS[0], mode);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <ProfileButton user={user} onClick={onOpenMenu} />
          <Wordmark />
          <div className="w-9" />
        </div>

        <Fraunces className="block text-center text-2xl sm:text-4xl mb-3 tracking-tight" style={{ color: G.ink, fontWeight: 500 }}>
          What do you want to build?
        </Fraunces>
        <p className="text-center text-sm mb-8" style={{ color: G.inkMute }}>
          Ask a question, or start a live build — bring your own tools, or find someone who already has them.
        </p>

        {/* composer */}
        <div className="rounded-2xl p-3 sm:p-4" style={{ background: G.panel, border: `1px solid ${G.hair}` }}>
          <div className="flex gap-1.5 mb-3">
            {["build", "ask"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="text-[11px] px-3 py-1 rounded-full capitalize"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: mode === m ? G.bg : G.inkMute,
                  background: mode === m ? G.ink : "transparent",
                  border: `1px solid ${mode === m ? G.ink : G.hair}`,
                  transition: `all 0.35s ${EASE}`,
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === "build" ? "Build a CRM for indie B2B founders…" : "Ask anything about your build…"}
            rows={2}
            className="w-full bg-transparent outline-none resize-none text-sm sm:text-base"
            style={{ color: G.ink }}
          />

          <div className="flex items-center justify-between mt-2 pt-3" style={{ borderTop: `1px solid ${G.hairSoft}` }}>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: G.inkMute }}>
                <Paperclip size={15} />
              </button>
              <button onClick={() => setFilesOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: G.inkMute }}>
                <Link2 size={15} />
              </button>
              <button onClick={() => setAgentOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: G.inkMute }}>
                <Bot size={15} />
              </button>
              <button onClick={() => setScanOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: G.inkMute }}>
                <Globe size={15} />
              </button>
            </div>
            <button
              onClick={go}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: G.ink, color: G.bg, transition: `transform 0.3s ${EASE}` }}
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-5">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => setText(s)} className="text-[11px] px-3 py-1.5 rounded-full" style={{ color: G.inkMute, border: `1px solid ${G.hair}`, fontFamily: "'IBM Plex Mono', monospace" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {scanOpen && <ScanSheet project={null} onClose={() => setScanOpen(false)} onInvite={(item) => setText((t) => `${t} @${(item.handle ? item.handle.replace("@", "") : item.name.replace(/\s+/g, ""))} `)} />}
      {filesOpen && <FilesSheet onClose={() => setFilesOpen(false)} onPick={(f) => { setText((t) => `${t} [${f.name}] `); setFilesOpen(false); }} />}
      {agentOpen && <AgentSheet onClose={() => setAgentOpen(false)} onPick={(a) => { setText((t) => `${t} /${a.name.replace(" ", "")} `); setAgentOpen(false); }} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen 2 — processing / skeleton
// ---------------------------------------------------------------------------
function ProcessingScreen({ onDone, user, onOpenMenu }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= STEPS.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActive((a) => a + 1), 650);
    return () => clearTimeout(t);
  }, [active, onDone]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
      <div className="w-full max-w-lg flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-6">
          <ProfileButton user={user} onClick={onOpenMenu} />
          <Wordmark />
          <div className="w-9" />
        </div>
        <div
          className="relative rounded-2xl overflow-hidden w-full mb-8"
          style={{ background: G.canvas, border: `1px solid ${G.hair}`, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.7)" }}
        >
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: `1px solid ${G.hairSoft}` }}>
            <span className="w-2 h-2 rounded-full" style={{ background: G.inkFaint }} />
            <span className="w-2 h-2 rounded-full" style={{ background: G.inkFaint }} />
            <span className="w-2 h-2 rounded-full" style={{ background: G.inkFaint }} />
          </div>
          <div className="flex p-4 sm:p-5 gap-4">
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((i) => <div key={i} className="w-6 h-6 rounded-lg animate-pulse" style={{ background: G.panel }} />)}
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: G.panel }} />)}
              </div>
              <div className="h-24 rounded-lg animate-pulse" style={{ background: G.panel }} />
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: G.panel, opacity: i <= active ? 1 : 0.4, transition: `opacity 0.4s ${EASE}` }}>
              <span className="relative flex items-center justify-center shrink-0" style={{ width: 14, height: 14 }}>
                {i < active ? (
                  <Check size={13} style={{ color: G.ink }} />
                ) : i === active ? (
                  <>
                    <span className="absolute inline-flex w-full h-full rounded-full pulse-ring" style={{ background: G.ink }} />
                    <span className="relative inline-flex rounded-full" style={{ width: 6, height: 6, background: G.ink }} />
                  </>
                ) : (
                  <span className="rounded-full" style={{ width: 6, height: 6, border: `1px solid ${G.inkFaint}` }} />
                )}
              </span>
              <span className="text-[13px]" style={{ color: i <= active ? G.inkSoft : G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen 3 pages — build / video / chat
// ---------------------------------------------------------------------------
function BuildPage() {
  const [activeNav, setActiveNav] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const section = SECTIONS[activeNav];

  const pick = (i) => {
    setActiveNav(i);
    setSelectedRow(null);
  };

  return (
    <div className={expanded ? "fixed inset-0 z-40 flex flex-col items-center justify-center p-3 sm:p-8 fade-in" : "w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 gap-2.5"} style={expanded ? { background: G.bg } : {}}>
      {!expanded && (
        <div className="text-[10px] tracking-wide" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>
          click around — it's a live, testable preview
        </div>
      )}

      <div className={`relative rounded-2xl overflow-hidden w-full flex flex-col ${expanded ? "h-full max-w-5xl" : "max-w-2xl"}`} style={{ background: G.canvas, border: `1px solid ${G.hair}`, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.7)" }}>
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: `1px solid ${G.hairSoft}` }}>
          <span className="w-2 h-2 rounded-full" style={{ background: G.inkFaint }} />
          <span className="w-2 h-2 rounded-full" style={{ background: G.inkFaint }} />
          <span className="w-2 h-2 rounded-full" style={{ background: G.inkFaint }} />
          <div className="mx-auto text-[10px] truncate" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>nimbus.app / {section.name.toLowerCase()}</div>
          <button onClick={() => setExpanded((v) => !v)} className="active:scale-95 w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ color: G.inkMute, transition: `transform 0.15s ${EASE}` }} title={expanded ? "Minimize" : "Expand"}>
            {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row p-4 sm:p-5 gap-4 flex-1 min-h-0">
          <div className="flex flex-row sm:flex-col gap-2 sm:gap-3">
            {SECTIONS.map((s, i) => (
              <button
                key={s.name}
                onClick={() => pick(i)}
                title={s.name}
                className="w-6 h-6 rounded-lg shrink-0"
                style={{ background: i === activeNav ? G.inkSoft : G.panel, transition: `background 0.3s ${EASE}` }}
              />
            ))}
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              {section.cards.map((c, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: G.panel }}>
                  <div className="text-[9px] sm:text-[10px] mb-1.5" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{c.label}</div>
                  <div className="text-xs sm:text-sm" style={{ color: G.inkSoft }}>{c.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-lg flex-1 flex flex-col" style={{ background: G.panel }}>
              {section.rows.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedRow(i)}
                  className="flex items-center gap-3 p-3 text-left"
                  style={{ borderBottom: i < section.rows.length - 1 ? `1px solid ${G.hairSoft}` : "none", background: selectedRow === i ? G.panelHi : "transparent", transition: `background 0.25s ${EASE}` }}
                >
                  <div className="w-5 h-5 rounded-full shrink-0" style={{ background: G.inkFaint }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] sm:text-xs truncate" style={{ color: G.inkSoft }}>{r.title}</div>
                    <div className="text-[9px] sm:text-[10px] truncate" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{r.meta}</div>
                  </div>
                  {r.status && <span className="text-[9px] px-2 py-0.5 rounded-full shrink-0" style={{ color: G.inkMute, border: `1px solid ${G.hair}`, fontFamily: "'IBM Plex Mono', monospace" }}>{r.status}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeNav === 0 && selectedRow === null && (
          <div className="hidden sm:flex absolute items-center gap-1" style={{ left: "23%", top: "27%", transform: "translateY(-22px)" }}>
            <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: `7px solid ${PEOPLE[0].tone}` }} />
            <Chip>{PEOPLE[0].name}</Chip>
          </div>
        )}

        {selectedRow !== null && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 fade-in" style={{ background: "rgba(8,8,10,0.72)" }} onClick={() => setSelectedRow(null)}>
            <div className="w-full max-w-sm rounded-xl p-4 sm:p-5" style={{ background: G.panelHi, border: `1px solid ${G.hair}` }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm" style={{ color: G.ink }}>{section.rows[selectedRow].title}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{section.rows[selectedRow].meta}</div>
                </div>
                <button onClick={() => setSelectedRow(null)} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: G.panel }}>
                  <X size={13} style={{ color: G.inkMute }} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {[["Status", section.rows[selectedRow].status || "—"], ["Owner", "You"], ["Updated", "just now"]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    <span style={{ color: G.inkFaint }}>{k}</span>
                    <span style={{ color: G.inkSoft }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoFocus({ people, focusedId, onSelect, onClose, camOn }) {
  const idx = Math.max(0, people.findIndex((p) => p.id === focusedId));
  const person = people[idx] || people[0];
  const go = (dir) => {
    const next = (idx + dir + people.length) % people.length;
    onSelect(people[next].id);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col fade-in" style={{ background: G.bg }}>
      <div className="flex items-center justify-between p-4 sm:p-5">
        <Chip tone={person.tone} size="md">{person.name} · {person.city}</Chip>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: G.panelHi, border: `1px solid ${G.hair}` }}>
          <X size={16} style={{ color: G.inkMute }} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 gap-3">
        {people.length > 1 && (
          <button onClick={() => go(-1)} className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center shrink-0" style={{ background: G.panelHi, border: `1px solid ${G.hair}` }}>
            <ChevronLeft size={16} style={{ color: G.inkMute }} />
          </button>
        )}

        <div key={person.id} className="relative rounded-2xl overflow-hidden flex items-center justify-center w-full max-w-md aspect-video fade-in" style={{ background: G.canvas, border: `1px solid ${G.hair}` }}>
          {camOn ? <Fraunces className="text-6xl" style={{ color: person.tone }}>{person.name[0]}</Fraunces> : <VideoOff size={26} style={{ color: G.inkFaint }} />}
          <div className="absolute bottom-3 left-3">
            <Chip tone={person.tone} size="md">
              {person.name}
              <Waveform active={person.speaking && camOn} />
            </Chip>
          </div>
        </div>

        {people.length > 1 && (
          <button onClick={() => go(1)} className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center shrink-0" style={{ background: G.panelHi, border: `1px solid ${G.hair}` }}>
            <ChevronRight size={16} style={{ color: G.inkMute }} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 p-4 sm:p-5 pb-28 overflow-x-auto">
        {people.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="relative rounded-xl overflow-hidden shrink-0 w-14 h-14 flex items-center justify-center"
            style={{ background: G.canvas, border: `1px solid ${p.id === person.id ? G.ink : G.hair}`, transition: `border-color 0.3s ${EASE}` }}
          >
            <Fraunces className="text-sm" style={{ color: p.tone }}>{p.name[0]}</Fraunces>
          </button>
        ))}
      </div>
    </div>
  );
}

function VideoPage({ camOn, people }) {
  const [focused, setFocused] = useState(null);

  return (
    <div className="w-full h-full flex items-center justify-center px-4 sm:px-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg">
        {people.map((p) => (
          <button key={p.id} onClick={() => setFocused(p.id)} className="relative rounded-2xl overflow-hidden flex items-center justify-center aspect-square text-left" style={{ background: G.canvas, border: `1px solid ${p.speaking ? G.inkSoft : G.hair}`, transition: `border-color 0.4s ${EASE}` }}>
            {camOn ? <Fraunces className="text-3xl" style={{ color: p.tone }}>{p.name[0]}</Fraunces> : <VideoOff size={16} style={{ color: G.inkFaint }} />}
            <div className="absolute bottom-2 left-2">
              <Chip tone={p.tone} size="md">
                {p.name}
                <Waveform active={p.speaking && camOn} />
              </Chip>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <Chip size="sm">{p.city}</Chip>
              <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                <Maximize2 size={11} style={{ color: G.inkSoft }} />
              </span>
            </div>
          </button>
        ))}
      </div>

      {focused && <VideoFocus people={people} focusedId={focused} onSelect={setFocused} onClose={() => setFocused(null)} camOn={camOn} />}
    </div>
  );
}

function ChatPage({ people, projectName, messages, onSend }) {
  const [val, setVal] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  const send = () => {
    if (val.trim()) {
      onSend(val.trim());
      setVal("");
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <div key={i} className="flex items-start gap-2.5 rounded-xl px-4 py-3" style={{ background: G.panel }}>
            <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: m.tone }} />
            <div className="min-w-0">
              <div className="text-[10px] mb-0.5" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{m.who.toUpperCase()}</div>
              <div className="text-sm flex items-center gap-2" style={{ color: G.inkSoft }}>
                {m.voice && <Waveform active />}
                {m.text}
              </div>
            </div>
          </div>
        ))}

        <div className="rounded-2xl p-2.5 sm:p-3 mt-1" style={{ background: G.panel }}>
          <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: `1px solid ${G.hairSoft}` }}>
            <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message the room, or type a build prompt…" className="flex-1 min-w-0 bg-transparent outline-none text-sm" style={{ color: G.ink }} />
            <button onClick={send} className="active:scale-95 w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: G.ink, color: G.bg, transition: `transform 0.15s ${EASE}` }}>
              <Send size={13} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: G.inkMute }}>
              <Paperclip size={14} />
            </button>
            <button onClick={() => setFilesOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: G.inkMute }}>
              <Link2 size={14} />
            </button>
            <button onClick={() => setAgentOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: G.inkMute }}>
              <Bot size={14} />
            </button>
            <button onClick={() => setScanOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: G.inkMute }}>
              <Globe size={14} />
            </button>
          </div>
        </div>
      </div>

      {scanOpen && <ScanSheet project={projectName ? { name: projectName } : null} onClose={() => setScanOpen(false)} onInvite={(item) => setVal((t) => `${t} @${(item.handle ? item.handle.replace("@", "") : item.name.replace(/\s+/g, ""))} `)} />}
      {filesOpen && <FilesSheet onClose={() => setFilesOpen(false)} onPick={(f) => { setVal((t) => `${t} [${f.name}] `); setFilesOpen(false); }} />}
      {agentOpen && <AgentSheet onClose={() => setAgentOpen(false)} onPick={(a) => { setVal((t) => `${t} /${a.name.replace(" ", "")} `); setAgentOpen(false); }} />}
    </div>
  );
}

function JoinRequestToast({ person, onAccept, onDecline }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm slide-down">
      <div className="rounded-2xl p-3.5 sm:p-4 flex items-center gap-3" style={{ background: "rgba(27,27,31,0.9)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, boxShadow: "0 24px 60px -20px rgba(0,0,0,0.8)" }}>
        <span className="relative flex items-center justify-center shrink-0" style={{ width: 40, height: 40 }}>
          <span className="absolute inline-flex w-full h-full rounded-full pulse-ring" style={{ background: G.inkSoft }} />
          <span className="relative flex items-center justify-center rounded-full text-sm" style={{ width: 40, height: 40, background: G.panelHi, border: `1px solid ${G.hair}`, color: G.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>
            {person.name[0]}
          </span>
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate" style={{ color: G.ink }}>{person.name}</div>
          <div className="text-[10px]" style={{ color: G.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>wants to join the build</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onDecline} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: G.panelHi, color: G.inkMute }}>
            <X size={15} />
          </button>
          <button onClick={onAccept} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: G.ink, color: G.bg }}>
            <Check size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function LiveTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 shrink-0" style={{ background: G.panel }}>
      <span className="relative flex items-center justify-center" style={{ width: 6, height: 6 }}>
        <span className="absolute inline-flex w-full h-full rounded-full pulse-ring" style={{ background: G.inkSoft }} />
        <span className="relative inline-flex rounded-full" style={{ width: 6, height: 6, background: G.inkSoft }} />
      </span>
      <span className="text-[10px]" style={{ color: G.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>LIVE · {mm}:{ss}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen 3 — the room, swipeable
// ---------------------------------------------------------------------------
function Dock({ mic, setMic, cam, setCam, onLeave, onQuickSend }) {
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");

  const send = () => {
    if (text.trim() && onQuickSend) onQuickSend(text.trim());
    setText("");
    setComposing(false);
  };

  const Btn = ({ on, onIcon: On, offIcon: Off, onClick }) => (
    <button onClick={onClick} className="active:scale-95 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: on ? G.ink : G.panelHi, color: on ? G.bg : G.inkSoft, transition: `all 0.35s ${EASE}` }}>
      {on ? <On size={15} /> : <Off size={15} />}
    </button>
  );

  if (composing) {
    return (
      <div className="fade-in flex items-center gap-2 rounded-full pl-2 pr-2 py-2" style={{ background: "rgba(27,27,31,0.85)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, minWidth: 280, boxShadow: "0 20px 60px -20px rgba(0,0,0,0.7)" }}>
        <button onClick={() => { setComposing(false); setText(""); }} className="active:scale-95 w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ color: G.inkMute }}>
          <X size={15} />
        </button>
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Quick prompt or message…"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm"
          style={{ color: G.ink }}
        />
        <button onClick={send} className="active:scale-95 w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: G.ink, color: G.bg, transition: `transform 0.15s ${EASE}` }}>
          <Send size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 rounded-full px-2 py-2 sm:px-2.5 sm:py-2.5" style={{ background: "rgba(27,27,31,0.85)", backdropFilter: "blur(24px)", border: `1px solid ${G.hair}`, boxShadow: "0 20px 60px -20px rgba(0,0,0,0.7)" }}>
      <Btn on={mic} onIcon={Mic} offIcon={MicOff} onClick={() => setMic((v) => !v)} />
      <Btn on={cam} onIcon={Video} offIcon={VideoOff} onClick={() => setCam((v) => !v)} />
      <button className="active:scale-95 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: G.panelHi, color: G.inkSoft }}>
        <ScreenShare size={15} />
      </button>
      <button onClick={() => setComposing(true)} className="active:scale-95 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: G.panelHi, color: G.inkSoft }}>
        <MessageSquare size={15} />
      </button>
      <span className="w-px h-6 mx-0.5 sm:mx-1 shrink-0" style={{ background: G.hair }} />
      <button onClick={onLeave} className="active:scale-95 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: G.inkSoft, color: G.bg }}>
        <PhoneOff size={15} />
      </button>
    </div>
  );
}

function RoomScreen({ prompt, projectName, onLeave, user, onOpenMenu }) {
  const [view, setView] = useState("build"); // build | video | chat
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [people, setPeople] = useState(PEOPLE);
  const [messages, setMessages] = useState(MESSAGES);
  const [joinRequest, setJoinRequest] = useState(null);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const candidate = BUILDERS.find((p) => !people.some((existing) => existing.name === p.name.split(" ")[0]));
      if (candidate) setJoinRequest(candidate);
    }, 5000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flashToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 2600);
  };

  const acceptJoin = () => {
    if (!joinRequest) return;
    const tones = ["#DADADE", "#B0B0B8", "#8C8C94", "#A0A0A8"];
    const firstName = joinRequest.name.split(" ")[0];
    setPeople((prev) => [
      ...prev,
      { id: joinRequest.handle.replace("@", ""), name: firstName, city: joinRequest.city, tone: tones[prev.length % tones.length], speaking: false, status: "active", role: "builder" },
    ]);
    setJoinRequest(null);
    flashToast(`${firstName} joined the build`);
  };

  const sendMessage = (text) => {
    setMessages((m) => [...m, { who: "You", tone: "#B0B0B8", text, voice: false }]);
  };

  const views = [
    { key: "build", label: "Preview" },
    { key: "video", label: "Video" },
    { key: "chat", label: "Chat" },
  ];

  const shareTarget = PROJECTS.find((p) => p.name === projectName) || { name: projectName };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <ProfileButton user={user} onClick={onOpenMenu} />
          <Chip tone={G.ink} size="md">{projectName}</Chip>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
          <button onClick={() => setRosterOpen(true)} title="Contributors" className="active:scale-95 flex items-center gap-1 rounded-full px-2.5 py-1.5 shrink-0" style={{ color: G.inkMute, border: `1px solid ${G.hair}`, transition: `transform 0.15s ${EASE}` }}>
            <Users size={12} />
            <span className="text-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{people.length}</span>
          </button>
          <button onClick={() => setShareOpen(true)} title="Share access" className="active:scale-95 w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ color: G.inkMute, border: `1px solid ${G.hair}`, transition: `transform 0.15s ${EASE}` }}>
            <Share2 size={12} />
          </button>
          {views.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className="text-[10px] px-3.5 py-1.5 rounded-full shrink-0"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: view === v.key ? G.bg : G.inkMute,
                background: view === v.key ? G.ink : "transparent",
                border: `1px solid ${view === v.key ? G.ink : G.hair}`,
                transition: `all 0.35s ${EASE}`,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div key={view} className="flex-1 flex items-center fade-in pb-28">
        {view === "build" && <BuildPage />}
        {view === "video" && <VideoPage camOn={cam} people={people} />}
        {view === "chat" && <ChatPage people={people} projectName={projectName} messages={messages} onSend={sendMessage} />}
      </div>

      <div
        className="fixed left-1/2 -translate-x-1/2 z-20 px-2 max-w-full"
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <Dock
          mic={mic}
          setMic={setMic}
          cam={cam}
          setCam={setCam}
          onLeave={onLeave}
          onQuickSend={(text) => { sendMessage(text); setView("chat"); }}
        />
      </div>

      {joinRequest && (
        <JoinRequestToast
          person={{ name: joinRequest.name }}
          onAccept={acceptJoin}
          onDecline={() => setJoinRequest(null)}
        />
      )}
      {rosterOpen && (
        <RosterSheet
          people={people}
          onClose={() => setRosterOpen(false)}
          onShareAccess={() => { setRosterOpen(false); setShareOpen(true); }}
        />
      )}
      {shareOpen && <ShareAccessSheet project={shareTarget} onClose={() => setShareOpen(false)} />}
      {toast && <Toast text={toast} />}
    </div>
  );
}

function deriveProjectName(text) {
  const words = text.trim().split(/\s+/).slice(0, 3);
  if (!words.length || !words[0]) return "New Build";
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [screen, setScreen] = useState("home"); // home | prompt | processing | room
  const [prompt, setPrompt] = useState("");
  const [projectName, setProjectName] = useState("");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [contributionsOpen, setContributionsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const flashToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 2400);
  };

  const enterProject = (p) => {
    setProjectName(p.name);
    setPrompt(p.tag);
    setScreen("room");
  };

  return (
    <div className="w-full min-h-screen relative" style={{ background: G.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        .fade-in { animation: fadeIn 0.5s ${EASE}; }
        .slide-up { animation: slideUp 0.45s ${EASE}; }
        .slide-down { animation: slideDown 0.45s ${EASE}; }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity:0.5 } to { transform: translateY(0); opacity:1 } }
        @keyframes slideDown { from { transform: translateY(-24px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        @keyframes bar { 0%,100% { height:3px } 50% { height:12px } }
        .pulse-ring { animation: pulseRing 2.2s ${EASE} infinite; }
        @keyframes pulseRing { 0% { transform: scale(1); opacity:0.6;} 70% { transform: scale(2.4); opacity:0;} 100% { opacity:0; } }
        @media (prefers-reduced-motion: reduce) { .fade-in,.slide-up,.slide-down,.pulse-ring { animation: none !important; } }
      `}</style>

      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: "26px 26px" }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)" }} />

      <div key={screen} className="relative z-10 fade-in">
        {screen === "home" && <DiscoverScreen onCreate={() => setScreen("prompt")} onEnter={enterProject} user={user} onOpenMenu={() => setMenuOpen(true)} />}
        {screen === "prompt" && <PromptScreen onSubmit={(text) => { setPrompt(text); setProjectName(deriveProjectName(text)); setScreen("processing"); }} user={user} onOpenMenu={() => setMenuOpen(true)} />}
        {screen === "processing" && <ProcessingScreen onDone={() => setScreen("room")} user={user} onOpenMenu={() => setMenuOpen(true)} />}
        {screen === "room" && <RoomScreen prompt={prompt} projectName={projectName || "New Build"} onLeave={() => setScreen("home")} user={user} onOpenMenu={() => setMenuOpen(true)} />}
      </div>

      {menuOpen && (
        <ProfileMenu
          user={user}
          onClose={() => setMenuOpen(false)}
          onHome={() => { setScreen("home"); setMenuOpen(false); }}
          onOpenProfile={() => { setMenuOpen(false); setProfileEditOpen(true); }}
          onOpenContributions={() => { setMenuOpen(false); setContributionsOpen(true); }}
          onSignIn={() => { setMenuOpen(false); setAuthOpen(true); }}
          onSignOut={() => { setUser(null); setMenuOpen(false); }}
        />
      )}
      {authOpen && (
        <AuthSheet
          onClose={() => setAuthOpen(false)}
          onAuth={(u) => { setUser(u); setAuthOpen(false); flashToast(`Signed in as ${u.name}`); }}
        />
      )}
      {profileEditOpen && user && (
        <ProfileSheet
          user={user}
          onClose={() => setProfileEditOpen(false)}
          onSave={(u) => { setUser(u); setProfileEditOpen(false); flashToast("Profile updated"); }}
          onSignOut={() => { setUser(null); setProfileEditOpen(false); }}
        />
      )}
      {contributionsOpen && <ContributionsSheet onClose={() => setContributionsOpen(false)} />}
      {toast && <Toast text={toast} />}
    </div>
  );
}
