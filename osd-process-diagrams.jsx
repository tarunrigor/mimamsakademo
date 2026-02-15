import { useState } from "react";

const TABS = ["A. Client Retention", "B. Prospect Conversion"];
const VIEWS = ["Current (Old)", "Proposed (New)"];

// ─── COLOR SYSTEM ───
const C = {
  bg: "#08090D",
  surface: "#0F1118",
  card: "#141720",
  border: "#1C2030",
  text: "#D4DAE8",
  muted: "#5A6580",
  dim: "#2A3148",
  // Role colors
  am: { bg: "#0C2A1E", border: "#16654A", text: "#34D399", dot: "#10B981" },       // Account Manager - green
  al: { bg: "#1A1640", border: "#4338CA", text: "#818CF8", dot: "#6366F1" },        // Account Lead - indigo
  hod: { bg: "#2D1B0E", border: "#B45309", text: "#FBBF24", dot: "#F59E0B" },       // HOD - amber
  ceo: { bg: "#2D0E1B", border: "#BE185D", text: "#F472B6", dot: "#EC4899" },       // CEO - pink
  board: { bg: "#1E0E2D", border: "#7C3AED", text: "#A78BFA", dot: "#8B5CF6" },     // Board - violet
  sales: { bg: "#0D2440", border: "#1D6EB5", text: "#60A5FA", dot: "#3B82F6" },     // Sales - blue
  ops: { bg: "#0D3636", border: "#0E7490", text: "#22D3EE", dot: "#06B6D4" },       // Ops - cyan
  team: { bg: "#1A2E1A", border: "#4D7C0F", text: "#A3E635", dot: "#84CC16" },      // Full Team - lime
  client: { bg: "#2A1A0A", border: "#92400E", text: "#FCD34D", dot: "#FBBF24" },    // Client/Prospect - gold
  old: { bg: "#1A1114", border: "#7F1D1D", text: "#FCA5A5", dot: "#EF4444" },       // Old/problem - red
  grey: { bg: "#14161E", border: "#2A3148", text: "#64748B", dot: "#475569" },       // Neutral
};

// ─── NODE + CONNECTION DATA ───

// A. RETENTION - OLD
const retOldNodes = [
  { id: "r1", x: 400, y: 30, w: 200, title: "Client Onboarded", owner: "Ad-hoc", c: C.grey },
  { id: "r2", x: 140, y: 140, w: 220, title: "Metrics Promised", sub: "Only targets shared", owner: "Account Mgr", c: C.old },
  { id: "r3", x: 620, y: 140, w: 220, title: "Campaign Runs", sub: "Algo learning not explained", owner: "Ops Team", c: C.old },
  { id: "r4", x: 80, y: 280, w: 230, title: "Client Expects Results", sub: "No timeline context given", owner: "Client", c: C.client },
  { id: "r5", x: 620, y: 280, w: 230, title: "Results Lag Behind", sub: "Normal algo ramp misread as failure", owner: "Ops Team", c: C.old },
  { id: "r6", x: 350, y: 400, w: 250, title: "Client Frustrated", sub: "No escalation path exists", owner: "—", c: C.old },
  { id: "r7", x: 80, y: 520, w: 250, title: "Competitor Pitches", sub: "Unrealistic promises go unchallenged", owner: "Competitor", c: C.old },
  { id: "r8", x: 560, y: 520, w: 250, title: "Decision-Maker Unaware", sub: "Never had a direct touchpoint", owner: "Director (client)", c: C.old },
  { id: "r9", x: 320, y: 640, w: 280, title: "CLIENT CHURNS", sub: "No documented moats to defend value", owner: "—", c: { bg: "#2D0A0A", border: "#DC2626", text: "#FCA5A5", dot: "#EF4444" } },
];
const retOldConns = [
  ["r1", "r2"], ["r1", "r3"], ["r2", "r4"], ["r3", "r5"],
  ["r4", "r6"], ["r5", "r6"], ["r6", "r7"], ["r6", "r8"],
  ["r7", "r9"], ["r8", "r9"],
];

// A. RETENTION - NEW
const retNewNodes = [
  // Weekly rhythm
  { id: "w1", x: 30, y: 30, w: 210, title: "Listen: Understand Expectations", sub: "What does POC expect this week?", owner: "Account Manager", c: C.am, badge: "Weekly" },
  { id: "w2", x: 30, y: 160, w: 210, title: "Plan: Gap Analysis", sub: "Document gap + co-create activity plan", owner: "Account Manager", c: C.am, badge: "Weekly" },
  { id: "w3", x: 30, y: 290, w: 210, title: "Align: POC Approval", sub: "Get sign-off before execution", owner: "Account Manager", c: C.am, badge: "Weekly" },

  // Monthly rhythm
  { id: "m1", x: 320, y: 30, w: 230, title: "Report: Effort + Results", sub: "Make value visible with data", owner: "Account Manager", c: C.am, badge: "Monthly" },
  { id: "m2", x: 320, y: 160, w: 230, title: "Frame as POC's Win", sub: "POC presents as their achievement", owner: "Account Manager", c: C.am, badge: "Monthly" },
  { id: "m3", x: 320, y: 290, w: 230, title: "Highlight Long-Term Assets", sub: "Data models, algo maturity, audiences", owner: "Account Manager", c: C.am, badge: "Monthly" },
  { id: "m4", x: 320, y: 410, w: 230, title: "Summary to Decision-Maker", sub: "Director stays in the loop", owner: "Account Lead", c: C.al, badge: "Monthly" },

  // Quarterly rhythm
  { id: "q1", x: 630, y: 30, w: 240, title: "Vision Meeting", sub: "POC + Director: present accumulated assets", owner: "Account Lead / HOD", c: C.hod, badge: "Quarterly" },
  { id: "q2", x: 630, y: 160, w: 240, title: "Co-Plan Next Quarter", sub: "What's achievable vs needs investment", owner: "Account Lead + Team", c: C.al, badge: "Quarterly" },
  { id: "q3", x: 630, y: 290, w: 240, title: "Share Moat Document", sub: "Context, processes, data = switching cost", owner: "Account Manager", c: C.am, badge: "Quarterly" },

  // Idea Diligence
  { id: "id1", x: 630, y: 420, w: 240, title: "Idea Diligence Process", sub: "Every idea → approval with POC + Director", owner: "Account Manager", c: C.am, badge: "Ongoing" },

  // Escalation
  { id: "e1", x: 960, y: 30, w: 200, title: "Escalation: Team Lead", sub: "Adjust approach, reallocate", owner: "Team Lead", c: C.team },
  { id: "e2", x: 960, y: 150, w: 200, title: "Escalation: HOD", sub: "Authorize resources, modify scope", owner: "HOD", c: C.hod },
  { id: "e3", x: 960, y: 270, w: 200, title: "Escalation: CEO", sub: "Commercial decisions, exec engagement", owner: "CEO", c: C.ceo },
  { id: "e4", x: 960, y: 390, w: 200, title: "Escalation: Board", sub: "Investment threshold policy", owner: "Board", c: C.board },
  { id: "e5", x: 960, y: 510, w: 200, title: "Scenario Library", sub: "Every resolution = org wisdom", owner: "Full Team", c: C.team },

  // Outcome
  { id: "out", x: 400, y: 550, w: 260, title: "CLIENT RETAINED", sub: "Partnership seen as irreplaceable investment", owner: "—", c: { bg: "#0A2D1A", border: "#16A34A", text: "#4ADE80", dot: "#22C55E" } },
];
const retNewConns = [
  // Weekly flow
  ["w1", "w2"], ["w2", "w3"],
  // Weekly feeds monthly
  ["w3", "m1"],
  // Monthly flow
  ["m1", "m2"], ["m2", "m3"], ["m3", "m4"],
  // Monthly feeds quarterly
  ["m4", "q1"],
  // Quarterly flow
  ["q1", "q2"], ["q2", "q3"], ["q3", "id1"],
  // Escalation chain
  ["w1", "e1"], ["e1", "e2"], ["e2", "e3"], ["e3", "e4"],
  // Escalation → scenario library
  ["e1", "e5"], ["e2", "e5"], ["e3", "e5"], ["e4", "e5"],
  // Outcome
  ["q1", "out"], ["id1", "out"], ["e5", "out"],
];

// B. CONVERSION - OLD
const convOldNodes = [
  { id: "c1", x: 370, y: 30, w: 200, title: "Prospect Identified", owner: "Sales", c: C.grey },
  { id: "c2", x: 370, y: 150, w: 200, title: "Cold Call / Email", sub: "No ICP qualification", owner: "Sales", c: C.old },
  { id: "c3", x: 370, y: 270, w: 220, title: "Dashboard Walkthrough", sub: "Dry, one-directional pitch", owner: "Sales / Ops", c: C.old },
  { id: "c4", x: 130, y: 390, w: 220, title: "No Documentation", sub: "Call insights lost", owner: "—", c: C.old },
  { id: "c5", x: 570, y: 390, w: 220, title: "Generic Proposal", sub: "Not based on actual needs", owner: "Sales", c: C.old },
  { id: "c6", x: 130, y: 520, w: 220, title: "Prospect Ghosts", sub: "Felt talked at, not heard", owner: "Prospect", c: C.old },
  { id: "c7", x: 570, y: 520, w: 220, title: "Price Objection", sub: "Value never established first", owner: "Prospect", c: C.old },
  { id: "c8", x: 340, y: 650, w: 260, title: "LOW CONVERSION", sub: "No feedback loop → same mistakes repeat", owner: "—", c: { bg: "#2D0A0A", border: "#DC2626", text: "#FCA5A5", dot: "#EF4444" } },
];
const convOldConns = [
  ["c1", "c2"], ["c2", "c3"], ["c3", "c4"], ["c3", "c5"],
  ["c4", "c6"], ["c5", "c7"], ["c6", "c8"], ["c7", "c8"],
];

// B. CONVERSION - NEW
const convNewNodes = [
  // Funnel
  { id: "f1", x: 30, y: 30, w: 210, title: "Contact → Lead", sub: "Interested in Amazon advertising?", owner: "Sales", c: C.sales, badge: "Gate" },
  { id: "f2", x: 30, y: 160, w: 210, title: "Lead → MQL", sub: "Fits ICP? Min spend? Can wait 2-3mo?", owner: "Sales + Ops", c: C.sales, badge: "Gate" },
  { id: "f3", x: 30, y: 290, w: 210, title: "MQL → Requirements", sub: "AIKSUE+C framework call", owner: "Ops", c: C.ops, badge: "Gate" },
  { id: "f4", x: 30, y: 430, w: 210, title: "Requirements → Proposal", sub: "Budget + tailored proposal", owner: "Sales + Ops", c: C.sales, badge: "Gate" },

  // AIKSUE+C expanded
  { id: "a1", x: 330, y: 30, w: 200, title: "A — Appreciation", sub: "Acknowledge what's going well", owner: "Ops", c: C.ops, badge: "AIKSUE+C" },
  { id: "a2", x: 330, y: 120, w: 200, title: "I — Icebreaker", sub: "How do they feel about Amazon?", owner: "Ops", c: C.ops, badge: "AIKSUE+C" },
  { id: "a3", x: 330, y: 210, w: 200, title: "K — Kickstart", sub: "What do you most want to improve?", owner: "Ops", c: C.ops, badge: "AIKSUE+C" },
  { id: "a4", x: 330, y: 300, w: 200, title: "S — Suggest", sub: "Offer 2-3 approaches, ask what fits", owner: "Ops", c: C.ops, badge: "AIKSUE+C" },
  { id: "a5", x: 330, y: 390, w: 200, title: "U — Understand", sub: "Listen for concerns, don't rush", owner: "Ops", c: C.ops, badge: "AIKSUE+C" },
  { id: "a6", x: 330, y: 480, w: 200, title: "E — Evolve", sub: "Refine based on feedback", owner: "Ops", c: C.ops, badge: "AIKSUE+C" },
  { id: "a7", x: 330, y: 570, w: 200, title: "C — Converge", sub: "Shared solution with buy-in", owner: "Ops", c: C.ops, badge: "AIKSUE+C" },

  // Documentation engine
  { id: "d1", x: 620, y: 80, w: 220, title: "Document Call (24hrs)", sub: "AIKSUE+C format", owner: "Ops Member", c: C.ops, badge: "Per Call" },
  { id: "d2", x: 620, y: 200, w: 220, title: "Share Summary", sub: "Follow-up to prospect", owner: "Ops Member", c: C.ops, badge: "Per Call" },
  { id: "d3", x: 620, y: 320, w: 220, title: "Dual Perspective", sub: "Sales + Ops both submit views", owner: "Sales + Ops", c: C.sales, badge: "Per Call" },
  { id: "d4", x: 620, y: 440, w: 220, title: "QA Review + Coaching", sub: "Sample calls reviewed", owner: "HOD / Team Lead", c: C.hod, badge: "Bi-weekly" },

  // Feedback loop
  { id: "fb1", x: 930, y: 80, w: 220, title: "Review Conversion Data", sub: "Which MQLs converted and why", owner: "Sales + Ops HODs", c: C.hod, badge: "Monthly" },
  { id: "fb2", x: 930, y: 220, w: 220, title: "Update ICP + Questions", sub: "Sharpen qualification criteria", owner: "Sales + Ops HODs", c: C.hod, badge: "Quarterly" },
  { id: "fb3", x: 930, y: 360, w: 220, title: "Review Divergent Cases", sub: "What market wants that we can't deliver", owner: "Full Team", c: C.team, badge: "Quarterly" },
  { id: "fb4", x: 930, y: 500, w: 220, title: "Scenario Library", sub: "Divergent cases = learning data", owner: "Full Team", c: C.team },

  // Outcome
  { id: "out", x: 380, y: 690, w: 280, title: "HIGH CONVERSION", sub: "Qualified prospects, emotional buy-in, documented", owner: "—", c: { bg: "#0A2D1A", border: "#16A34A", text: "#4ADE80", dot: "#22C55E" } },
];
const convNewConns = [
  // Funnel
  ["f1", "f2"], ["f2", "f3"], ["f3", "f4"],
  // Funnel → AIKSUE+C
  ["f3", "a1"],
  // AIKSUE+C chain
  ["a1", "a2"], ["a2", "a3"], ["a3", "a4"], ["a4", "a5"], ["a5", "a6"], ["a6", "a7"],
  // AIKSUE+C → documentation
  ["a7", "d1"],
  // Documentation flow
  ["d1", "d2"], ["d1", "d3"], ["d3", "d4"],
  // Documentation → feedback
  ["d4", "fb1"],
  // Feedback loop
  ["fb1", "fb2"], ["fb2", "fb3"], ["fb3", "fb4"],
  // Feedback loops back
  ["fb2", "f2"],
  ["fb4", "fb1"],
  // Converge → proposal
  ["a7", "f4"],
  // Outcome
  ["f4", "out"], ["d2", "out"],
];

// ─── RENDERING HELPERS ───

function getCenter(node) {
  const h = node.sub ? 80 : 52;
  return { x: node.x + node.w / 2, y: node.y + h / 2 };
}

function getEdgePoint(from, to) {
  const fh = from.sub ? 80 : 52;
  const th = to.sub ? 80 : 52;
  const fc = { x: from.x + from.w / 2, y: from.y + fh / 2 };
  const tc = { x: to.x + to.w / 2, y: to.y + th / 2 };
  const dx = tc.x - fc.x;
  const dy = tc.y - fc.y;

  let sx, sy, ex, ey;
  // Source point
  if (Math.abs(dy) * from.w > Math.abs(dx) * fh) {
    sy = dy > 0 ? from.y + fh : from.y;
    sx = fc.x + (dx / Math.abs(dy)) * (fh / 2);
    sx = Math.max(from.x, Math.min(from.x + from.w, sx));
  } else {
    sx = dx > 0 ? from.x + from.w : from.x;
    sy = fc.y + (dy / Math.abs(dx)) * (from.w / 2);
    sy = Math.max(from.y, Math.min(from.y + fh, sy));
  }
  // Target point
  if (Math.abs(dy) * to.w > Math.abs(dx) * th) {
    ey = dy > 0 ? to.y : to.y + th;
    ex = tc.x - (dx / Math.abs(dy)) * (th / 2);
    ex = Math.max(to.x, Math.min(to.x + to.w, ex));
  } else {
    ex = dx > 0 ? to.x : to.x + to.w;
    ey = tc.y - (dy / Math.abs(dx)) * (to.w / 2);
    ey = Math.max(to.y, Math.min(to.y + th, ey));
  }
  return { sx, sy, ex, ey };
}

function curvePath(sx, sy, ex, ey) {
  const dx = ex - sx;
  const dy = ey - sy;
  if (Math.abs(dx) > Math.abs(dy)) {
    const mx = sx + dx * 0.5;
    return `M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}`;
  }
  const my = sy + dy * 0.5;
  return `M${sx},${sy} C${sx},${my} ${ex},${my} ${ex},${ey}`;
}

// ─── COMPONENTS ───

function ProcessNode({ node, isOld }) {
  const h = node.sub ? 80 : 52;
  const c = node.c;
  return (
    <g>
      <rect x={node.x} y={node.y} width={node.w} height={h} rx={10}
        fill={c.bg} stroke={c.border} strokeWidth={1.2} strokeOpacity={0.6} />
      {/* top accent */}
      <line x1={node.x + 12} y1={node.y + 1} x2={node.x + node.w - 12} y2={node.y + 1}
        stroke={c.dot} strokeWidth={2} strokeLinecap="round" strokeOpacity={0.5} />
      {/* title */}
      <text x={node.x + 14} y={node.y + 22} fontSize={11.5} fontWeight={700} fill={c.text}>
        {node.title}
      </text>
      {/* subtitle */}
      {node.sub && (
        <text x={node.x + 14} y={node.y + 40} fontSize={9.5} fill="#5A6580">
          {node.sub.length > 35 ? node.sub.slice(0, 35) + "…" : node.sub}
        </text>
      )}
      {/* owner */}
      <text x={node.x + 14} y={node.y + h - 10} fontSize={8.5} fill="#3A4560" fontWeight={600}>
        {node.owner}
      </text>
      {/* badge */}
      {node.badge && (
        <g>
          <rect x={node.x + node.w - 58} y={node.y + h - 22} width={48} height={16} rx={4}
            fill={c.dot} fillOpacity={0.15} />
          <text x={node.x + node.w - 34} y={node.y + h - 11} fontSize={8} fontWeight={700}
            fill={c.dot} textAnchor="middle">{node.badge}</text>
        </g>
      )}
      {/* role dot */}
      <circle cx={node.x + node.w - 12} cy={node.y + 14} r={4} fill={c.dot} opacity={0.7} />
    </g>
  );
}

function Connection({ from, to, nodes, color }) {
  const fromNode = nodes.find(n => n.id === from);
  const toNode = nodes.find(n => n.id === to);
  if (!fromNode || !toNode) return null;
  const { sx, sy, ex, ey } = getEdgePoint(fromNode, toNode);
  const markerId = `arr-${from}-${to}`;
  return (
    <g>
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 L1.5,3 Z" fill={color || "#3A4560"} fillOpacity={0.7} />
        </marker>
      </defs>
      <path d={curvePath(sx, sy, ex, ey)} fill="none" stroke={color || "#3A4560"}
        strokeWidth={1.5} strokeOpacity={0.4} markerEnd={`url(#${markerId})`} />
    </g>
  );
}

function DiagramView({ nodes, connections, isOld, svgW, svgH }) {
  return (
    <div style={{
      flex: 1, overflow: "auto", background: C.bg,
      border: `1px solid ${C.border}`, borderRadius: 14,
    }}>
      <svg width={svgW} height={svgH} style={{ display: "block" }}>
        <defs>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="#151A28" />
          </pattern>
        </defs>
        <rect width={svgW} height={svgH} fill="url(#dots)" />

        {/* Section labels for new diagrams */}
        {!isOld && nodes === retNewNodes && (
          <>
            <rect x={18} y={12} width={228} height={390} rx={12} fill="#10B981" fillOpacity={0.03}
              stroke="#10B981" strokeOpacity={0.08} strokeDasharray="4 4" />
            <text x={132} y={410} fontSize={10} fill="#10B981" textAnchor="middle" fontWeight={700} opacity={0.4}>WEEKLY RHYTHM</text>

            <rect x={308} y={12} width={258} height={510} rx={12} fill="#6366F1" fillOpacity={0.03}
              stroke="#6366F1" strokeOpacity={0.08} strokeDasharray="4 4" />
            <text x={437} y={530} fontSize={10} fill="#6366F1" textAnchor="middle" fontWeight={700} opacity={0.4}>MONTHLY RHYTHM</text>

            <rect x={618} y={12} width={258} height={510} rx={12} fill="#F59E0B" fillOpacity={0.03}
              stroke="#F59E0B" strokeOpacity={0.08} strokeDasharray="4 4" />
            <text x={747} y={530} fontSize={10} fill="#F59E0B" textAnchor="middle" fontWeight={700} opacity={0.4}>QUARTERLY + ONGOING</text>

            <rect x={948} y={12} width={218} height={610} rx={12} fill="#EC4899" fillOpacity={0.03}
              stroke="#EC4899" strokeOpacity={0.08} strokeDasharray="4 4" />
            <text x={1057} y={630} fontSize={10} fill="#EC4899" textAnchor="middle" fontWeight={700} opacity={0.4}>ESCALATION PATH</text>
          </>
        )}
        {!isOld && nodes === convNewNodes && (
          <>
            <rect x={18} y={12} width={228} height={520} rx={12} fill="#3B82F6" fillOpacity={0.03}
              stroke="#3B82F6" strokeOpacity={0.08} strokeDasharray="4 4" />
            <text x={132} y={565} fontSize={10} fill="#3B82F6" textAnchor="middle" fontWeight={700} opacity={0.4}>CONVERSION FUNNEL</text>

            <rect x={318} y={12} width={218} height={660} rx={12} fill="#06B6D4" fillOpacity={0.03}
              stroke="#06B6D4" strokeOpacity={0.08} strokeDasharray="4 4" />
            <text x={427} y={680} fontSize={10} fill="#06B6D4" textAnchor="middle" fontWeight={700} opacity={0.4}>AIKSUE+C FRAMEWORK</text>

            <rect x={608} y={60} width={240} height={500} rx={12} fill="#F59E0B" fillOpacity={0.03}
              stroke="#F59E0B" strokeOpacity={0.08} strokeDasharray="4 4" />
            <text x={728} y={572} fontSize={10} fill="#F59E0B" textAnchor="middle" fontWeight={700} opacity={0.4}>DOCUMENTATION ENGINE</text>

            <rect x={918} y={60} width={240} height={560} rx={12} fill="#84CC16" fillOpacity={0.03}
              stroke="#84CC16" strokeOpacity={0.08} strokeDasharray="4 4" />
            <text x={1038} y={632} fontSize={10} fill="#84CC16" textAnchor="middle" fontWeight={700} opacity={0.4}>FEEDBACK LOOP</text>
          </>
        )}

        {connections.map(([from, to], i) => {
          const fromNode = nodes.find(n => n.id === from);
          return <Connection key={i} from={from} to={to} nodes={nodes}
            color={isOld ? "#EF4444" : fromNode?.c?.dot || "#3A4560"} />;
        })}
        {nodes.map(n => <ProcessNode key={n.id} node={n} isOld={isOld} />)}
      </svg>
    </div>
  );
}

export default function OSDDiagrams() {
  const [tab, setTab] = useState(0);
  const [view, setView] = useState(0);

  const configs = [
    // Retention
    [
      { nodes: retOldNodes, conns: retOldConns, w: 960, h: 750 },
      { nodes: retNewNodes, conns: retNewConns, w: 1200, h: 700 },
    ],
    // Conversion
    [
      { nodes: convOldNodes, conns: convOldConns, w: 900, h: 760 },
      { nodes: convNewNodes, conns: convNewConns, w: 1200, h: 790 },
    ],
  ];

  const current = configs[tab][view];

  return (
    <div style={{
      width: "100%", height: "100vh", background: "#06070B",
      fontFamily: "'Söhne', 'SF Pro Display', -apple-system, sans-serif",
      display: "flex", flexDirection: "column", color: C.text,
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: "#fff",
          }}>DT</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Operating System Design</div>
            <div style={{ fontSize: 10.5, color: C.muted }}>DeepThought — Layer 3 — Process Diagrams</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{
            padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: view === 0 ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
            color: view === 0 ? "#FCA5A5" : "#4ADE80",
            border: `1px solid ${view === 0 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
          }}>
            {view === 0 ? "⚠ Problems Identified" : "✓ System Designed"}
          </div>
        </div>
      </div>

      {/* Tab + View selector */}
      <div style={{
        padding: "12px 24px", display: "flex", gap: 24, alignItems: "center",
        background: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 4, background: C.card, borderRadius: 8, padding: 3 }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => { setTab(i); setView(0); }} style={{
              padding: "7px 16px", borderRadius: 6, border: "none",
              background: tab === i ? (i === 0 ? "#10B981" : "#3B82F6") : "transparent",
              color: tab === i ? "#fff" : C.muted,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: C.border }} />

        <div style={{ display: "flex", gap: 4, background: C.card, borderRadius: 8, padding: 3 }}>
          {VIEWS.map((v, i) => (
            <button key={i} onClick={() => setView(i)} style={{
              padding: "7px 16px", borderRadius: 6, border: "none",
              background: view === i ? (i === 0 ? "#DC2626" : "#16A34A") : "transparent",
              color: view === i ? "#fff" : C.muted,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s",
            }}>{v}</button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ fontSize: 11, color: C.muted }}>
          {current.nodes.length} nodes · {current.conns.length} connections
        </div>
      </div>

      {/* Subtitle */}
      <div style={{
        padding: "10px 24px", fontSize: 12, color: C.muted,
        background: view === 0 ? "rgba(239,68,68,0.04)" : "rgba(34,197,94,0.04)",
        borderBottom: `1px solid ${C.border}`, flexShrink: 0,
      }}>
        {tab === 0 && view === 0 && "Current state: ad-hoc client management with no structured rhythms, invisible value, and no escalation path → churn"}
        {tab === 0 && view === 1 && "Proposed: Weekly Listen→Plan→Align | Monthly Showcase→Empower→Inform | Quarterly Vision→Deepen→Protect + Escalation Path"}
        {tab === 1 && view === 0 && "Current state: unqualified outreach, dry dashboard pitches, no documentation, no feedback → low conversion"}
        {tab === 1 && view === 1 && "Proposed: Structured funnel with AIKSUE+C framework, documentation engine, and qualification feedback loop"}
      </div>

      {/* Diagram */}
      <div style={{ flex: 1, padding: 16, overflow: "hidden", display: "flex" }}>
        <DiagramView
          nodes={current.nodes}
          connections={current.conns}
          isOld={view === 0}
          svgW={current.w}
          svgH={current.h}
        />
      </div>
    </div>
  );
}
