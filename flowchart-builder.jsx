import { useState, useRef, useCallback, useEffect } from "react";

const ROLE_COLORS = {
  "Data Systems": { bg: "#0D2847", border: "#1E6CB6", text: "#5BA8F5", accent: "#1E6CB6", dot: "#3B9AFF" },
  "Sales Executive": { bg: "#0D3B2A", border: "#1A7A52", text: "#4ADE80", accent: "#1A7A52", dot: "#34D399" },
  "Sales Manager": { bg: "#3B1D0D", border: "#B45309", text: "#FBBF24", accent: "#B45309", dot: "#F59E0B" },
  "HR": { bg: "#2D1640", border: "#7C3AED", text: "#A78BFA", accent: "#7C3AED", dot: "#8B5CF6" },
  "Director": { bg: "#3B0D1D", border: "#BE185D", text: "#F472B6", accent: "#BE185D", dot: "#EC4899" },
  "Marketing": { bg: "#0D3B3B", border: "#0E7490", text: "#22D3EE", accent: "#0E7490", dot: "#06B6D4" },
  "Finance": { bg: "#1A2E1A", border: "#4D7C0F", text: "#A3E635", accent: "#4D7C0F", dot: "#84CC16" },
};

const INITIAL_NODES = [
  { id: "n1", title: "CRM Data Extract", owner: "Data Systems", desc: "Extract outreach data from CRM", x: 80, y: 60 },
  { id: "n2", title: "Lead Scoring", owner: "Data Systems", desc: "Score & segment leads by priority", x: 80, y: 220 },
  { id: "n3", title: "Outreach — Region A", owner: "Sales Executive", desc: "Email campaigns for Region A", x: 360, y: 60 },
  { id: "n4", title: "Outreach — Region B", owner: "Sales Executive", desc: "Email campaigns for Region B", x: 360, y: 220 },
  { id: "n5", title: "Outreach — Region C", owner: "Sales Executive", desc: "Email campaigns for Region C", x: 360, y: 380 },
  { id: "n6", title: "Follow-up & Pipeline", owner: "Sales Executive", desc: "Nurture leads, update pipeline", x: 640, y: 140 },
  { id: "n7", title: "Individual Reports", owner: "Sales Executive", desc: "Prepare individual activity reports", x: 640, y: 330 },
  { id: "n8", title: "Team Consolidation", owner: "Sales Manager", desc: "Aggregate team data into report", x: 920, y: 140 },
  { id: "n9", title: "Performance Review", owner: "Sales Manager", desc: "Review individual performance", x: 920, y: 330 },
  { id: "n10", title: "PMS Evaluation", owner: "HR", desc: "Evaluate manager & exec work", x: 1200, y: 380 },
  { id: "n11", title: "Director Review", owner: "Director", desc: "Review manager + full team", x: 1200, y: 140 },
  { id: "n12", title: "Strategy Feedback", owner: "Marketing", desc: "Adjust campaigns from insights", x: 1480, y: 60 },
  { id: "n13", title: "Revenue Forecast", owner: "Finance", desc: "Project revenue from pipeline", x: 1480, y: 280 },
];

const INITIAL_CONNECTIONS = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3" },
  { from: "n2", to: "n4" },
  { from: "n2", to: "n5" },
  { from: "n3", to: "n6" },
  { from: "n4", to: "n6" },
  { from: "n5", to: "n7" },
  { from: "n6", to: "n7" },
  { from: "n6", to: "n8" },
  { from: "n7", to: "n8" },
  { from: "n7", to: "n9" },
  { from: "n8", to: "n11" },
  { from: "n9", to: "n10" },
  { from: "n9", to: "n11" },
  { from: "n11", to: "n12" },
  { from: "n11", to: "n13" },
  { from: "n10", to: "n11" },
  { from: "n8", to: "n13" },
];

const NODE_W = 220;
const NODE_H = 120;
const PORT_R = 7;

function getPortPos(node, type) {
  if (type === "out") return { x: node.x + NODE_W, y: node.y + NODE_H / 2 };
  return { x: node.x, y: node.y + NODE_H / 2 };
}

function buildPath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const midX = x1 + dx * 0.5;
  if (dx > 40) {
    return `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
  }
  const offset = 60;
  return `M${x1},${y1} C${x1 + offset},${y1} ${x1 + offset},${(y1+y2)/2} ${x1 + offset},${(y1+y2)/2} S${x2 - offset},${y2} ${x2},${y2}`;
}

function ArrowHead({ id, color }) {
  return (
    <marker id={id} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
      <path d="M0,0 L10,4 L0,8 L2,4 Z" fill={color} />
    </marker>
  );
}

export default function FlowchartApp() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [dragging, setDragging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("select"); // select | connect | add
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [newNodeForm, setNewNodeForm] = useState({ title: "", owner: "Sales Executive", desc: "" });
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [zoom, setZoom] = useState(0.85);
  const svgRef = useRef(null);

  const toSvg = useCallback((clientX, clientY) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const handleCanvasMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === "rect" && e.target.dataset.bg) {
      setSelected(null);
      if (mode === "select") {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  const handleMouseMove = useCallback((e) => {
    const svgPt = toSvg(e.clientX, e.clientY);
    setMousePos(svgPt);

    if (dragging) {
      setNodes(prev => prev.map(n =>
        n.id === dragging.id
          ? { ...n, x: svgPt.x - dragging.offX, y: svgPt.y - dragging.offY }
          : n
      ));
    }
    if (isPanning && panStart) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [dragging, isPanning, panStart, toSvg]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
    setPanStart(null);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const startDrag = (node, e) => {
    if (mode === "connect") return;
    e.stopPropagation();
    const svgPt = toSvg(e.clientX, e.clientY);
    setDragging({ id: node.id, offX: svgPt.x - node.x, offY: svgPt.y - node.y });
    setSelected(node.id);
  };

  const handlePortClick = (nodeId, type, e) => {
    e.stopPropagation();
    if (mode !== "connect") return;
    if (!connecting) {
      if (type === "out") setConnecting(nodeId);
    } else {
      if (type === "in" && connecting !== nodeId) {
        const exists = connections.some(c => c.from === connecting && c.to === nodeId);
        if (!exists) {
          setConnections(prev => [...prev, { from: connecting, to: nodeId }]);
        }
      }
      setConnecting(null);
    }
  };

  const addNode = () => {
    if (!newNodeForm.title.trim()) return;
    const id = "n" + (nodes.length + 1) + "_" + Date.now();
    const centerX = (-pan.x + 400) / zoom;
    const centerY = (-pan.y + 300) / zoom;
    setNodes(prev => [...prev, { id, title: newNodeForm.title, owner: newNodeForm.owner, desc: newNodeForm.desc, x: centerX, y: centerY }]);
    setNewNodeForm({ title: "", owner: "Sales Executive", desc: "" });
    setShowAddPanel(false);
    setMode("select");
  };

  const deleteSelected = () => {
    if (!selected) return;
    setNodes(prev => prev.filter(n => n.id !== selected));
    setConnections(prev => prev.filter(c => c.from !== selected && c.to !== selected));
    setSelected(null);
  };

  const deleteConnection = (from, to) => {
    setConnections(prev => prev.filter(c => !(c.from === from && c.to === to)));
  };

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const roles = Object.keys(ROLE_COLORS);

  return (
    <div style={{
      width: "100%", height: "100vh", background: "#0A0D14",
      fontFamily: "'Söhne', 'Euclid Circular A', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden", color: "#E2E8F0",
    }}>
      {/* TOP BAR */}
      <div style={{
        height: 56, background: "#0F1219", borderBottom: "1px solid #1E2433",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", flexShrink: 0, zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700,
          }}>⬡</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px" }}>
              Process Flow Builder
            </div>
            <div style={{ fontSize: 11, color: "#64748B" }}>Value Chain — Sales Operations</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64748B", marginRight: 8 }}>{nodes.length} nodes · {connections.length} connections</span>
          <ToolBtn label="Zoom −" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} />
          <span style={{ fontSize: 11, color: "#94A3B8", minWidth: 40, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <ToolBtn label="Zoom +" onClick={() => setZoom(z => Math.min(2, z + 0.1))} />
          <div style={{ width: 1, height: 24, background: "#1E2433", margin: "0 6px" }} />
          <ToolBtn label="Fit" onClick={() => { setZoom(0.85); setPan({ x: 0, y: 0 }); }} />
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* LEFT TOOLBAR */}
        <div style={{
          width: 56, background: "#0F1219", borderRight: "1px solid #1E2433",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "16px 0", gap: 4, flexShrink: 0, zIndex: 10,
        }}>
          <ToolbarIcon icon="☝" label="Select" active={mode === "select"} onClick={() => { setMode("select"); setConnecting(null); }} />
          <ToolbarIcon icon="↗" label="Connect" active={mode === "connect"} onClick={() => { setMode("connect"); setConnecting(null); }} />
          <ToolbarIcon icon="＋" label="Add" active={showAddPanel} onClick={() => { setShowAddPanel(!showAddPanel); setMode("select"); }} />
          <div style={{ flex: 1 }} />
          <ToolbarIcon icon="🗑" label="Delete" active={false} onClick={deleteSelected} disabled={!selected} />
        </div>

        {/* ADD NODE PANEL */}
        {showAddPanel && (
          <div style={{
            width: 280, background: "#111621", borderRight: "1px solid #1E2433",
            padding: 20, flexShrink: 0, zIndex: 10, overflowY: "auto",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "#CBD5E1" }}>
              Add New Node
            </div>
            <label style={labelStyle}>Title</label>
            <input
              value={newNodeForm.title}
              onChange={e => setNewNodeForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Data Validation"
              style={inputStyle}
            />
            <label style={labelStyle}>Owner / Role</label>
            <select
              value={newNodeForm.owner}
              onChange={e => setNewNodeForm(f => ({ ...f, owner: e.target.value }))}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <label style={labelStyle}>Description</label>
            <textarea
              value={newNodeForm.desc}
              onChange={e => setNewNodeForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="What this step does..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
            <button onClick={addNode} style={{
              width: "100%", padding: "10px 0", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #3B82F6, #6366F1)", color: "#fff",
              fontWeight: 600, fontSize: 13, cursor: "pointer", marginTop: 8,
            }}>
              Add to Canvas
            </button>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #1E2433" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                Role Legend
              </div>
              {roles.map(r => (
                <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: ROLE_COLORS[r].dot }} />
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CANVAS */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {mode === "connect" && (
            <div style={{
              position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
              background: "#1E293B", border: "1px solid #334155", borderRadius: 8,
              padding: "8px 16px", fontSize: 12, color: "#94A3B8", zIndex: 5,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ color: "#3B82F6" }}>●</span>
              {connecting
                ? "Now click an INPUT port (left side) of the target node"
                : "Click an OUTPUT port (right side) to start a connection"
              }
            </div>
          )}

          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{
              cursor: mode === "connect" ? "crosshair" : isPanning ? "grabbing" : "grab",
              background: "#0A0D14",
            }}
            onMouseDown={handleCanvasMouseDown}
          >
            <defs>
              {Object.entries(ROLE_COLORS).map(([role, c]) => (
                <ArrowHead key={role} id={`arrow-${role.replace(/\s/g, "")}`} color={c.dot} />
              ))}
              <ArrowHead id="arrow-default" color="#475569" />
              <ArrowHead id="arrow-temp" color="#3B82F6" />
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#1a1f2e" />
              </pattern>
            </defs>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              <rect data-bg="true" x="-5000" y="-5000" width="15000" height="15000" fill="url(#grid)" />

              {/* CONNECTIONS */}
              {connections.map((conn, i) => {
                const fromNode = nodeMap[conn.from];
                const toNode = nodeMap[conn.to];
                if (!fromNode || !toNode) return null;
                const p1 = getPortPos(fromNode, "out");
                const p2 = getPortPos(toNode, "in");
                const fromColor = ROLE_COLORS[fromNode.owner];
                const markerId = `arrow-${fromNode.owner.replace(/\s/g, "")}`;
                return (
                  <g key={i}>
                    <path
                      d={buildPath(p1.x, p1.y, p2.x, p2.y)}
                      fill="none"
                      stroke={fromColor?.dot || "#475569"}
                      strokeWidth={2}
                      strokeOpacity={0.5}
                      markerEnd={`url(#${markerId})`}
                    />
                    {/* invisible thick path for click target */}
                    <path
                      d={buildPath(p1.x, p1.y, p2.x, p2.y)}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={14}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => { e.stopPropagation(); deleteConnection(conn.from, conn.to); }}
                    >
                      <title>Click to delete connection</title>
                    </path>
                  </g>
                );
              })}

              {/* TEMP CONNECTION LINE */}
              {connecting && nodeMap[connecting] && (
                <path
                  d={buildPath(
                    getPortPos(nodeMap[connecting], "out").x,
                    getPortPos(nodeMap[connecting], "out").y,
                    mousePos.x, mousePos.y
                  )}
                  fill="none" stroke="#3B82F6" strokeWidth={2} strokeDasharray="6 4"
                  markerEnd="url(#arrow-temp)"
                  pointerEvents="none"
                />
              )}

              {/* NODES */}
              {nodes.map(node => {
                const colors = ROLE_COLORS[node.owner] || ROLE_COLORS["Sales Executive"];
                const isSelected = selected === node.id;
                const isConnSource = connecting === node.id;
                return (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                    {/* Glow */}
                    {isSelected && (
                      <rect x={-3} y={-3} width={NODE_W + 6} height={NODE_H + 6} rx={14}
                        fill="none" stroke={colors.dot} strokeWidth={2} strokeOpacity={0.4} />
                    )}

                    {/* Card body */}
                    <rect
                      width={NODE_W} height={NODE_H} rx={12}
                      fill={colors.bg}
                      stroke={isSelected ? colors.dot : colors.border}
                      strokeWidth={isSelected ? 1.5 : 1}
                      strokeOpacity={isSelected ? 0.8 : 0.4}
                      style={{ cursor: mode === "select" ? "move" : "default", filter: isConnSource ? "brightness(1.3)" : "none" }}
                      onMouseDown={e => startDrag(node, e)}
                      onClick={e => { e.stopPropagation(); setSelected(node.id); }}
                    />

                    {/* Top accent line */}
                    <rect x={0} y={0} width={NODE_W} height={3} rx={1.5}
                      fill={colors.dot} opacity={0.7}
                      style={{ clipPath: "inset(0 round 12px 12px 0 0)" }}
                    />
                    <line x1={16} y1={3} x2={NODE_W - 16} y2={3} stroke={colors.dot} strokeWidth={2.5} strokeOpacity={0.6} strokeLinecap="round" />

                    {/* Content */}
                    <text x={16} y={30} fontSize={12.5} fontWeight={700} fill={colors.text}>{node.title}</text>
                    <text x={16} y={48} fontSize={10} fill="#64748B" fontWeight={600}>{node.owner}</text>
                    <text x={16} y={70} fontSize={10} fill="#475569">{
                      node.desc.length > 30 ? node.desc.slice(0, 30) + "…" : node.desc
                    }</text>

                    {/* Role dot */}
                    <circle cx={NODE_W - 18} cy={24} r={4} fill={colors.dot} />

                    {/* Node ID */}
                    <text x={16} y={NODE_H - 12} fontSize={9} fill="#334155" fontWeight={600}>
                      {node.id.toUpperCase()}
                    </text>

                    {/* INPUT PORT (left) */}
                    <g
                      style={{ cursor: mode === "connect" ? "pointer" : "default" }}
                      onClick={e => handlePortClick(node.id, "in", e)}
                    >
                      <circle cx={0} cy={NODE_H / 2} r={PORT_R + 4} fill="transparent" />
                      <circle cx={0} cy={NODE_H / 2} r={PORT_R} fill="#0F1219" stroke={colors.border} strokeWidth={1.5} />
                      <circle cx={0} cy={NODE_H / 2} r={3} fill={mode === "connect" && connecting ? colors.dot : "#1E2433"} />
                    </g>

                    {/* OUTPUT PORT (right) */}
                    <g
                      style={{ cursor: mode === "connect" ? "pointer" : "default" }}
                      onClick={e => handlePortClick(node.id, "out", e)}
                    >
                      <circle cx={NODE_W} cy={NODE_H / 2} r={PORT_R + 4} fill="transparent" />
                      <circle cx={NODE_W} cy={NODE_H / 2} r={PORT_R} fill="#0F1219" stroke={colors.border} strokeWidth={1.5} />
                      <polygon
                        points={`${NODE_W - 2.5},${NODE_H / 2 - 3} ${NODE_W + 3},${NODE_H / 2} ${NODE_W - 2.5},${NODE_H / 2 + 3}`}
                        fill={isConnSource ? "#3B82F6" : colors.dot}
                        opacity={mode === "connect" ? 1 : 0.5}
                      />
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* BOTTOM STATUS */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 36,
            background: "linear-gradient(transparent, #0A0D14)",
            display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 10,
          }}>
            <div style={{
              background: "#111621", border: "1px solid #1E2433", borderRadius: 6,
              padding: "4px 14px", fontSize: 11, color: "#475569",
              display: "flex", gap: 16,
            }}>
              <span>Drag to pan</span>
              <span>•</span>
              <span>Click node to select</span>
              <span>•</span>
              <span>Click connection to delete</span>
            </div>
          </div>
        </div>
      </div>

      {/* SELECTED NODE DETAIL */}
      {selected && nodeMap[selected] && (
        <div style={{
          position: "absolute", bottom: 20, right: 20,
          width: 300, background: "#111621", border: "1px solid #1E2433",
          borderRadius: 14, padding: 20, zIndex: 20,
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: ROLE_COLORS[nodeMap[selected].owner]?.text || "#E2E8F0" }}>
                {nodeMap[selected].title}
              </div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>{nodeMap[selected].owner}</div>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16 }}
            >✕</button>
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 10, lineHeight: 1.6 }}>{nodeMap[selected].desc}</div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #1E2433" }}>
            <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Connections</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>
              <div style={{ marginBottom: 4 }}>
                <strong style={{ color: "#94A3B8" }}>Inputs:</strong>{" "}
                {connections.filter(c => c.to === selected).map(c => nodeMap[c.from]?.title || c.from).join(", ") || "None"}
              </div>
              <div>
                <strong style={{ color: "#94A3B8" }}>Outputs:</strong>{" "}
                {connections.filter(c => c.from === selected).map(c => nodeMap[c.to]?.title || c.to).join(", ") || "None"}
              </div>
            </div>
          </div>
          <button onClick={deleteSelected} style={{
            marginTop: 14, width: "100%", padding: "8px 0", borderRadius: 8,
            border: "1px solid #7F1D1D", background: "#1C0F0F", color: "#FCA5A5",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            Delete Node
          </button>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 };
const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid #1E2433", background: "#0A0D14", color: "#E2E8F0",
  fontSize: 13, outline: "none",
};

function ToolbarIcon({ icon, label, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        width: 40, height: 40, borderRadius: 10, border: "none",
        background: active ? "#1E293B" : "transparent",
        color: disabled ? "#1E2433" : active ? "#E2E8F0" : "#64748B",
        fontSize: 18, cursor: disabled ? "not-allowed" : "pointer",
        display: "grid", placeItems: "center",
        transition: "all 0.15s",
        outline: active ? "1px solid #334155" : "none",
      }}
    >{icon}</button>
  );
}

function ToolBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 10px", borderRadius: 6, border: "1px solid #1E2433",
      background: "#111621", color: "#94A3B8", fontSize: 11,
      cursor: "pointer", fontWeight: 500,
    }}>{label}</button>
  );
}
