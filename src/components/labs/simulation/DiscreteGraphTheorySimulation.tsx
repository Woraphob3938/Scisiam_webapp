"use client";

import React, { useState, useMemo } from "react";
import {
  Sliders,
  RotateCcw,
  ClipboardList,
  GitBranch,
  Clipboard,
  Download,
  Trash,
  Target,
  Sparkles,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedGraphRun {
  index: number;
  algorithm: string;
  startNode: string;
  targetNode: string;
  path: string;
  cost: number;
}

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface Edge {
  u: string;
  v: string;
  w: number;
}

const NODES: Node[] = [
  { id: "A", x: 45, y: 150, label: "โหนด A (เริ่ม)" },
  { id: "B", x: 120, y: 70, label: "โหนด B" },
  { id: "C", x: 120, y: 230, label: "โหนด C" },
  { id: "D", x: 200, y: 70, label: "โหนด D" },
  { id: "E", x: 200, y: 230, label: "โหนด E" },
  { id: "F", x: 275, y: 150, label: "โหนด F (ปลาย)" },
];

export default function DiscreteGraphTheorySimulation() {
  const labId = "discrete-graph-theory";

  const [startNode, setStartNode] = useState<string>("A");
  const [targetNode, setTargetNode] = useState<string>("F");
  const [algorithm, setAlgorithm] = useState<"dijkstra" | "bfs" | "dfs">("dijkstra");
  
  // Dynamic weights managed via state
  const [weightAB, setWeightAB] = useState<number>(4);
  const [weightAC, setWeightAC] = useState<number>(2);
  const [weightBC, setWeightBC] = useState<number>(1);
  const [weightBD, setWeightBD] = useState<number>(5);
  const [weightCE, setWeightCE] = useState<number>(3);
  const [weightDE, setWeightDE] = useState<number>(2);
  const [weightDF, setWeightDF] = useState<number>(3);
  const [weightEF, setWeightEF] = useState<number>(6);

  const [loggedRuns, setLoggedRuns] = useState<LoggedGraphRun[]>([]);

  // Collect edges with their weights
  const edges = useMemo<Edge[]>(() => {
    return [
      { u: "A", v: "B", w: weightAB },
      { u: "A", v: "C", w: weightAC },
      { u: "B", v: "C", w: weightBC },
      { u: "B", v: "D", w: weightBD },
      { u: "C", v: "E", w: weightCE },
      { u: "D", v: "E", w: weightDE },
      { u: "D", v: "F", w: weightDF },
      { u: "E", v: "F", w: weightEF },
    ];
  }, [weightAB, weightAC, weightBC, weightBD, weightCE, weightDE, weightDF, weightEF]);

  // Dijkstra Shortest Path Solver
  const solverResults = useMemo(() => {
    // Adjacency list
    const adj: Record<string, { node: string; w: number }[]> = {};
    for (const n of NODES) adj[n.id] = [];
    for (const e of edges) {
      adj[e.u].push({ node: e.v, w: e.w });
      adj[e.v].push({ node: e.u, w: e.w });
    }

    if (algorithm === "dijkstra") {
      const dist: Record<string, number> = {};
      const parent: Record<string, string | null> = {};
      const visited = new Set<string>();

      for (const n of NODES) {
        dist[n.id] = Infinity;
        parent[n.id] = null;
      }
      dist[startNode] = 0;

      for (let step = 0; step < NODES.length; step++) {
        // Find min distance unvisited node
        let u: string | null = null;
        let minDist = Infinity;
        for (const n of NODES) {
          if (!visited.has(n.id) && dist[n.id] < minDist) {
            u = n.id;
            minDist = dist[n.id];
          }
        }

        if (u === null || u === targetNode) break;
        visited.add(u);

        for (const neighbor of adj[u]) {
          if (!visited.has(neighbor.node)) {
            const newDist = dist[u] + neighbor.w;
            if (newDist < dist[neighbor.node]) {
              dist[neighbor.node] = newDist;
              parent[neighbor.node] = u;
            }
          }
        }
      }

      // Reconstruct path
      const path: string[] = [];
      let curr: string | null = targetNode;
      while (curr !== null) {
        path.unshift(curr);
        curr = parent[curr];
      }

      // Check if reachable
      const pathCost = dist[targetNode];
      const isReachable = pathCost !== Infinity && path[0] === startNode;

      return {
        path: isReachable ? path : [],
        cost: isReachable ? pathCost : 0,
        visitedSeq: Array.from(visited),
      };
    } else {
      // BFS or DFS Traversal simulation
      const visitedSeq: string[] = [];
      const parent: Record<string, string | null> = {};
      const container: string[] = [startNode];
      const visitedSet = new Set<string>([startNode]);
      parent[startNode] = null;

      while (container.length > 0) {
        const u = algorithm === "bfs" ? container.shift()! : container.pop()!;
        visitedSeq.push(u);

        if (u === targetNode) break;

        // Sort neighbors alphabetically for consistent traversal order
        const neighbors = adj[u].map((n) => n.node).sort();
        for (const v of neighbors) {
          if (!visitedSet.has(v)) {
            visitedSet.add(v);
            parent[v] = u;
            container.push(v);
          }
        }
      }

      const path: string[] = [];
      let curr: string | null = targetNode;
      if (visitedSet.has(targetNode)) {
        while (curr !== null) {
          path.unshift(curr);
          curr = parent[curr];
        }
      }

      // Calculate simple weight cost of traversal path
      let cost = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const edge = edges.find(
          (e) => (e.u === path[i] && e.v === path[i + 1]) || (e.v === path[i] && e.u === path[i + 1])
        );
        if (edge) cost += edge.w;
      }

      return {
        path,
        cost,
        visitedSeq,
      };
    }
  }, [edges, startNode, targetNode, algorithm]);

  // Check if an edge is part of the computed shortest path
  const isEdgeInPath = (u: string, v: string) => {
    const { path } = solverResults;
    if (path.length < 2) return false;
    for (let i = 0; i < path.length - 1; i++) {
      if ((path[i] === u && path[i + 1] === v) || (path[i] === v && path[i + 1] === u)) {
        return true;
      }
    }
    return false;
  };

  const handleAddLog = () => {
    const run: LoggedGraphRun = {
      index: loggedRuns.length + 1,
      algorithm: algorithm.toUpperCase(),
      startNode,
      targetNode,
      path: solverResults.path.join(" ➔ "),
      cost: solverResults.cost,
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setStartNode("A");
    setTargetNode("F");
    setAlgorithm("dijkstra");
    setWeightAB(4);
    setWeightAC(2);
    setWeightBC(1);
    setWeightBD(5);
    setWeightCE(3);
    setWeightDE(2);
    setWeightDF(3);
    setWeightEF(6);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุด\tอัลกอริทึม\tต้นทาง\tปลายทาง\tเส้นทาง\tระยะทางรวม\n";
    const rows = loggedRuns.map(
      (r) => `${r.index}\t${r.algorithm}\t${r.startNode}\t${r.targetNode}\t${r.path}\t${r.cost}`
    );
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) => `${r.index},${r.algorithm},${r.startNode},${r.targetNode},"${r.path}",${r.cost}`
    );
    const csv = "data:text/csv;charset=utf-8," + ["Index,Algorithm,StartNode,TargetNode,Path,Cost", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "discrete_graph_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกผลการหาเส้นทางกราฟอย่างน้อย 1 ครั้งก่อนส่งออกรายงาน");
      return;
    }
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_discrete_graph_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Discrete Mathematics & Graph Theory",
      variables: { algorithm, startNode, targetNode },
      liveValues: { cost: solverResults.cost, pathLength: solverResults.path.length },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.cost, y: r.cost })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, minCost: Math.min(...loggedRuns.map((r) => r.cost)) },
      score: Math.min(100, Math.max(40, 40 + loggedRuns.length * 15)),
      durationSeconds: null,
    });
    alert("บันทึกการจำลองโครงสร้างกราฟและเครือข่ายสำเร็จ");
  };

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));

  return (
    <SharedSimulationShell
      accent="rose"
      labId={labId}
      category="Mathematics"
      title="Discrete Mathematics & Graph Theory"
      subtitle="เรียนรู้ทฤษฎีกราฟและคณิตศาสตร์ไม่ต่อเนื่อง ผ่านเครือข่ายโหนดน้ำหนัก ค้นหาเส้นทางสั้นที่สุด และการเดินท่องเที่ยวโครงสร้าง"
      statusLabel={`${algorithm.toUpperCase()} | เส้นทาง: ${solverResults.path.join(" ➔ ") || "ไม่มี"} | น้ำหนักเส้นทาง: ${solverResults.cost}`}
      icon={GitBranch}
      sceneTitle="วิชวลแผนผังโครงข่ายกราฟ (Graph Network Viewer)"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-rose-100 bg-[linear-gradient(135deg,#fff8f8_0%,#fff1f2_48%,#fff7f6_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Algorithm selector tabs */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            {(["dijkstra", "bfs", "dfs"] as const).map((alg) => (
              <button
                key={alg}
                onClick={() => setAlgorithm(alg)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-black transition-all ${
                  algorithm === alg ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {alg === "dijkstra" ? "Dijkstra (Shortest Path)" : alg === "bfs" ? "BFS (Breadth)" : "DFS (Depth)"}
              </button>
            ))}
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            <svg viewBox="0 0 320 300" className="w-full max-w-[320px] h-auto overflow-visible rounded-xl bg-white/95 p-3 shadow-inner border border-rose-100">
              {/* Edges representation */}
              {edges.map((e, idx) => {
                const uNode = NODES.find((n) => n.id === e.u)!;
                const vNode = NODES.find((n) => n.id === e.v)!;
                const inPath = isEdgeInPath(e.u, e.v);

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={uNode.x}
                      y1={uNode.y}
                      x2={vNode.x}
                      y2={vNode.y}
                      stroke={inPath ? "#f43f5e" : "#cbd5e1"}
                      strokeWidth={inPath ? "4.5" : "2"}
                      strokeDasharray={!inPath && algorithm !== "dijkstra" ? "3,3" : undefined}
                      className="transition-all duration-300"
                    />
                    {/* Glowing effect line */}
                    {inPath && (
                      <line
                        x1={uNode.x}
                        y1={uNode.y}
                        x2={vNode.x}
                        y2={vNode.y}
                        stroke="#fda4af"
                        strokeWidth="8"
                        opacity="0.3"
                        className="animate-pulse"
                      />
                    )}
                    {/* Edge Weight label */}
                    <rect
                      x={(uNode.x + vNode.x) / 2 - 8}
                      y={(uNode.y + vNode.y) / 2 - 8}
                      width="16"
                      height="16"
                      rx="4"
                      fill={inPath ? "#ffe4e6" : "#f8fafc"}
                      stroke={inPath ? "#f43f5e" : "#94a3b8"}
                      strokeWidth="1"
                    />
                    <text
                      x={(uNode.x + vNode.x) / 2}
                      y={(uNode.y + vNode.y) / 2 + 4}
                      textAnchor="middle"
                      fill={inPath ? "#be123c" : "#475569"}
                      fontSize="9"
                      fontWeight="black"
                    >
                      {e.w}
                    </text>
                  </g>
                );
              })}

              {/* Nodes representation */}
              {NODES.map((n) => {
                const isStart = n.id === startNode;
                const isTarget = n.id === targetNode;
                const inPath = solverResults.path.includes(n.id);
                const visited = solverResults.visitedSeq.includes(n.id);

                let fill = "#ffffff";
                let stroke = "#cbd5e1";
                if (isStart) {
                  fill = "#f43f5e";
                  stroke = "#be123c";
                } else if (isTarget) {
                  fill = "#059669";
                  stroke = "#047857";
                } else if (inPath) {
                  fill = "#ffe4e6";
                  stroke = "#e11d48";
                } else if (visited) {
                  fill = "#f1f5f9";
                  stroke = "#94a3b8";
                }

                return (
                  <g key={`node-${n.id}`} className="transition-all duration-300">
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="16"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth="2.5"
                      className="cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                      onClick={() => {
                        // Click cycles: Set start -> Set target -> do nothing
                        if (n.id === startNode) return;
                        if (startNode === "") setStartNode(n.id);
                        else setTargetNode(n.id);
                      }}
                    />
                    <text
                      x={n.x}
                      y={n.y + 4}
                      textAnchor="middle"
                      fill={isStart || isTarget ? "#ffffff" : "#1e293b"}
                      fontSize="10"
                      fontWeight="black"
                      className="pointer-events-none"
                    >
                      {n.id}
                    </text>
                    {/* Role Labels */}
                    {(isStart || isTarget) && (
                      <text
                        x={n.x}
                        y={n.y - 20}
                        textAnchor="middle"
                        fill={isStart ? "#be123c" : "#047857"}
                        fontSize="8"
                        fontWeight="black"
                        className="bg-white/80 p-0.5 rounded"
                      >
                        {isStart ? "Start" : "Target"}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      }
      controlsTitle="ตั้งค่าน้ำหนักเส้นเชื่อมและโหนดกราฟ"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <GitBranch className="h-4.5 w-4.5 text-rose-500" />
              การเลือกโหนดเชื่อมต่อ
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">โหนดต้นทาง (Start)</label>
                <select
                  value={startNode}
                  onChange={(e) => {
                    setStartNode(e.target.value);
                    if (e.target.value === targetNode) setTargetNode(startNode);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-black text-slate-800 focus:outline-none"
                >
                  {NODES.map((n) => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">โหนดเป้าหมาย (Target)</label>
                <select
                  value={targetNode}
                  onChange={(e) => {
                    setTargetNode(e.target.value);
                    if (e.target.value === startNode) setStartNode(targetNode);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-black text-slate-800 focus:outline-none"
                >
                  {NODES.map((n) => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm max-h-[220px] overflow-y-auto">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-rose-500" />
              กำหนดน้ำหนักเส้นเชื่อม (Weights)
            </h3>
            
            <div className="flex flex-col gap-3">
              <ManualNumberInput label="น้ำหนักเส้น A ➔ B" ariaLabel="น้ำหนัก A ถึง B" value={weightAB} min={1} max={9} step={1} onChange={setWeightAB} tone="pink" />
              <ManualNumberInput label="น้ำหนักเส้น A ➔ C" ariaLabel="น้ำหนัก A ถึง C" value={weightAC} min={1} max={9} step={1} onChange={setWeightAC} tone="pink" />
              <ManualNumberInput label="น้ำหนักเส้น B ➔ C" ariaLabel="น้ำหนัก B ถึง C" value={weightBC} min={1} max={9} step={1} onChange={setWeightBC} tone="pink" />
              <ManualNumberInput label="น้ำหนักเส้น B ➔ D" ariaLabel="น้ำหนัก B ถึง D" value={weightBD} min={1} max={9} step={1} onChange={setWeightBD} tone="pink" />
              <ManualNumberInput label="น้ำหนักเส้น C ➔ E" ariaLabel="น้ำหนัก C ถึง E" value={weightCE} min={1} max={9} step={1} onChange={setWeightCE} tone="orange" />
              <ManualNumberInput label="น้ำหนักเส้น D ➔ E" ariaLabel="น้ำหนัก D ถึง E" value={weightDE} min={1} max={9} step={1} onChange={setWeightDE} tone="orange" />
              <ManualNumberInput label="น้ำหนักเส้น D ➔ F" ariaLabel="น้ำหนัก D ถึง F" value={weightDF} min={1} max={9} step={1} onChange={setWeightDF} tone="amber" />
              <ManualNumberInput label="น้ำหนักเส้น E ➔ F" ariaLabel="น้ำหนัก E ถึง F" value={weightEF} min={1} max={9} step={1} onChange={setWeightEF} tone="amber" />
            </div>
          </section>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-rose-500" />
              บันทึกผลลัพธ์
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-xs font-bold text-rose-700 shadow-sm transition-all hover:bg-rose-50 active:scale-97 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              รีเซ็ตกราฟ
            </button>
          </div>
        </div>
      }
      compactControls={
        <div className="flex items-center gap-2 font-sans flex-wrap">
          <button onClick={() => setAlgorithm("dijkstra")} className={`px-2 py-1 text-xs font-bold rounded ${algorithm === "dijkstra" ? "bg-pink-200 text-pink-900" : "bg-slate-100"}`}>Dijkstra</button>
          <button onClick={() => setAlgorithm("bfs")} className={`px-2 py-1 text-xs font-bold rounded ${algorithm === "bfs" ? "bg-pink-200 text-pink-900" : "bg-slate-100"}`}>BFS</button>
          <button onClick={() => setAlgorithm("dfs")} className={`px-2 py-1 text-xs font-bold rounded ${algorithm === "dfs" ? "bg-pink-200 text-pink-900" : "bg-slate-100"}`}>DFS</button>
        </div>
      }
      metrics={[
        { label: "น้ำหนักเส้นทางทั้งหมด", value: `${solverResults.cost} หน่วย`, tone: "rose" },
        { label: "จำนวนโหนดในเส้นทาง", value: `${solverResults.path.length} โหนด`, tone: "orange" },
        { label: "ลำดับการท่องเที่ยวโหนด", value: solverResults.visitedSeq.join(" ➔ "), tone: "violet" },
        { label: "โหนดประมวลผลปัจจุบัน", value: `${startNode} ➔ ${targetNode}`, tone: undefined },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-rose-600" />
              เปรียบเทียบระยะทางรวม (Path Cost Chart)
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            {loggedRuns.length === 0 ? (
              <div className="text-xs text-slate-400">ทำการคำนวณเส้นทางเพื่อแสดงกราฟเปรียบเทียบ</div>
            ) : (
              <svg viewBox="0 0 200 120" className="w-full max-w-[240px] h-auto">
                <line x1="15" y1="100" x2="185" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="15" y1="10" x2="15" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                {loggedRuns.map((r, i) => {
                  const bw = 12;
                  const bx = 25 + i * 22;
                  const bh = (r.cost / 20) * 80;
                  return (
                    <g key={i}>
                      <rect x={bx} y={100 - bh} width={bw} height={bh} fill="#e11d48" rx="2" />
                      <text x={bx + bw / 2} y={110} textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="bold">#{r.index}</text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <ClipboardList className="h-4.5 w-4.5 text-rose-500" />
              ตารางวิเคราะห์อัลกอริทึม
            </h3>
            {loggedRuns.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={handleCopyData} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Clipboard className="h-3 w-3" /> คัดลอก
                </button>
                <button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Download className="h-3 w-3" /> CSV
                </button>
              </div>
            )}
          </div>
          {loggedRuns.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการบันทึกประวัติการหาเส้นทาง</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ชุด</th>
                    <th className="p-2">อัลกอริทึม</th>
                    <th className="p-2">ต้นทาง ➔ ปลายทาง</th>
                    <th className="p-2">เส้นทางคัดเลือก</th>
                    <th className="p-2">ระยะทางรวม</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2 font-sans font-black text-rose-700">{r.algorithm}</td>
                      <td className="p-2">{r.startNode} ➔ {r.targetNode}</td>
                      <td className="p-2 font-sans">{r.path || "ไม่มี"}</td>
                      <td className="p-2 font-bold">{r.cost}</td>
                      <td className="p-2 text-center">
                        <button onClick={() => handleClearLog(r.index)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                          <Trash className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      }
      learningGoals={[
        "เรียนรู้โครงสร้างกราฟแบบเชื่อมโยงและน้ำหนักของเส้นทางระหว่างโหนดข้อมูล",
        "วิเคราะห์การเปรียบเทียบอัลกอริทึมค้นหาแบบกว้าง (BFS) เชิงลึก (DFS) และแบบสั้นที่สุด (Dijkstra)",
        "ศึกษาการปรับระดับพารามิเตอร์น้ำหนักสายเชื่อมต่อส่งผลต่อทิศทางและระยะทางรวมของโครงข่าย",
      ]}
      steps={[
        { label: "เลือกโหนด Start และ Target ที่ต้องการค้นหาเส้นทางบนเครือข่าย", icon: GitBranch },
        { label: "ปรับน้ำหนักของเส้นเชื่อมต่างๆ เพื่อทดสอบการเปลี่ยนระยะทาง", icon: Sliders },
        { label: "เลือกอัลกอริทึมเพื่อเปรียบเทียบวิธีการคำนวณและลำดับจุดวัด", icon: Target },
        { label: "กดบันทึกผลลัพธ์ของแต่ละรูปแบบเก็บไว้เปรียบเทียบบนสรุปสถิติ", icon: ClipboardList },
      ]}
      progressLabel="ความคืบหน้าวิเคราะห์กราฟ"
      progressValue={
        questProgress === 100
          ? "วิเคราะห์เส้นทางกราฟและเปรียบเทียบสำเร็จ"
          : `บันทึกข้อมูลแล้ว ${loggedRuns.length}/3 เส้นทาง`
      }
      progressPercent={questProgress}
      tips={[
        "Dijkstra จะหาเส้นทางที่สั้นที่สุดและคุ้มค่าที่สุดเสมอเมื่อประเมินจากน้ำหนักรวม",
        "BFS เหมาะสำหรับโครงสร้างกราฟที่กระจายแนวระนาบ โดยตรวจสอบโหนดข้างเคียงก่อนแนวลึก",
        "คุณสามารถคลิกเลือก Start และ Target Node ได้ง่ายๆ ผ่านการกดคลิกที่วงกลมโหนดตรงแผงวิชวล",
      ]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">ทฤษฎีกราฟและอัลกอริทึม (Discrete Graph Theory)</p>
          <p className="mb-3">
            โครงสร้างกราฟประกอบด้วยโหนด (Vertices/Nodes) และเส้นเชื่อมโยง (Edges) มีการนำไปใช้อย่างกว้างขวางในโครงข่ายคอมพิวเตอร์และการคำนวณอัลกอริทึม:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Dijkstra&apos;s Algorithm:</strong> ค้นหาเส้นทางที่สั้นที่สุดจากจุดเริ่มต้นเดี่ยว (Single-Source Shortest Path) โดยการขยายโหนดที่มีน้ำหนักสะสมน้อยที่สุดไปเรื่อยๆ จนถึงเป้าหมาย
            </li>
            <li>
              <strong>Breadth-First Search (BFS):</strong> การท่องโครงสร้างกราฟทีละระดับชั้น (Level-by-Level) เหมาะสำหรับการค้นหาแบบกระจายคลื่นตามรัศมีใกล้ตัว
            </li>
            <li>
              <strong>Depth-First Search (DFS):</strong> การท่องโครงสร้างกราฟลึกสุดขอบสาขาก่อนถอยกลับ (Backtracking) เหมาะกับการเช็คความเชื่อมต่อแบบเชิงลึก
            </li>
          </ul>
        </div>
      }
      onRun={handleAddLog}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
