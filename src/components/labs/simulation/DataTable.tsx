"use client";

import React from "react";
import { Download, Copy, Table, HelpCircle } from "lucide-react";
import { DataPoint } from "./LiveGraph";

interface DataTableProps {
  dataPoints: DataPoint[];
  onExportCSV: () => void;
  onCopyData: () => void;
}

export default function DataTable({
  dataPoints,
  onExportCSV,
  onCopyData,
}: DataTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full select-none">
      
      {/* Table Header Section */}
      <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-slate-50">
        <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Table className="w-5 h-5 text-indigo-500" />
          ตารางบันทึกผลการทดลอง
        </h3>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onCopyData}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            <span>คัดลอกข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Table Data View */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-100/80 flex-1 flex flex-col bg-slate-50/20">
        {dataPoints.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-1.5 py-12 min-h-[220px]">
            <HelpCircle className="w-8 h-8 text-slate-300 animate-pulse" />
            <p className="text-xs font-semibold text-center px-4">ยังไม่มีข้อมูลบันทึก กดปุ่มเริ่มหรือเพิ่มข้อมูล</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[260px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50/50 border-b border-slate-100 text-slate-500 font-bold text-xs sm:text-sm">
                  <th className="py-3 px-4">เวลา (นาที)</th>
                  <th className="py-3 px-4">อุณหภูมิของวัตถุ (°C)</th>
                  <th className="py-3 px-4">อุณหภูมิสิ่งแวดล้อม (°C)</th>
                  <th className="py-3 px-4">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-semibold text-slate-600">
                {dataPoints.map((p, idx) => {
                  let note = "—";
                  if (idx === 0) note = "เริ่มต้น";
                  else if (p.temp - p.ambient < 1.0) note = "ใกล้เคียง Ts";

                  return (
                    <tr key={idx} className="hover:bg-blue-50/20 transition-all duration-150">
                      <td className="py-2.5 px-4 font-mono">{p.time.toFixed(1)}</td>
                      <td className="py-2.5 px-4 font-mono text-rose-600">{p.temp.toFixed(1)}</td>
                      <td className="py-2.5 px-4 font-mono text-blue-600">{p.ambient.toFixed(1)}</td>
                      <td className="py-2.5 px-4 text-xs font-bold text-slate-400">{note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
