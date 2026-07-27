"use client";

/* Hallmark · pre-emit critique: P5 H4 E5 S5 R5 V4 */
/* Hallmark · component: loading indicator · genre: playful · theme: Scisiam */
export default function LabLoadingAtom() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-blue-100 bg-white/95 px-6 py-7 text-center shadow-2xl shadow-slate-950/15 backdrop-blur">
      <div className="relative grid h-24 w-28 place-items-center" aria-hidden="true">
        <span className="lab-atom-shadow absolute bottom-1 h-2.5 w-14 rounded-full bg-blue-950/12 blur-[1px]" />
        <svg
          className="lab-atom-bounce h-20 w-20 overflow-visible"
          viewBox="0 0 96 96"
          fill="none"
        >
          <g className="lab-atom-orbits" stroke="#60A5FA" strokeWidth="3">
            <ellipse cx="48" cy="48" rx="38" ry="15" />
            <ellipse cx="48" cy="48" rx="38" ry="15" transform="rotate(60 48 48)" />
            <ellipse cx="48" cy="48" rx="38" ry="15" transform="rotate(120 48 48)" />
          </g>

          <g className="lab-atom-electrons">
            <circle cx="86" cy="48" r="5.5" fill="#2563EB" stroke="white" strokeWidth="2.5" />
            <circle cx="29" cy="15" r="5.5" fill="#38BDF8" stroke="white" strokeWidth="2.5" />
            <circle cx="29" cy="81" r="5.5" fill="#818CF8" stroke="white" strokeWidth="2.5" />
          </g>

          <circle cx="48" cy="48" r="18" fill="#2563EB" />
          <circle cx="42" cy="44" r="3.4" fill="white" />
          <circle cx="54" cy="44" r="3.4" fill="white" />
          <circle cx="42" cy="44" r="1.5" fill="#0F172A" />
          <circle cx="54" cy="44" r="1.5" fill="#0F172A" />
          <path
            d="M41 52.5C43.2 56.4 52.8 56.4 55 52.5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="mt-2 text-lg font-extrabold leading-[1.5] text-slate-950">
        กำลังเตรียมห้องแล็บ
      </p>
      <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
        น้องอะตอมกำลังจัดอุปกรณ์ให้พร้อม
      </p>
      <span className="sr-only" role="status" aria-live="polite">
        กำลังโหลดห้องแล็บทดลอง
      </span>

      <style jsx>{`
        .lab-atom-bounce {
          animation: lab-atom-bounce 900ms cubic-bezier(0.34, 1.56, 0.64, 1)
            infinite;
          transform-origin: 50% 82%;
        }

        .lab-atom-orbits {
          transform-box: view-box;
          transform-origin: center;
          animation: lab-atom-spin 2.4s linear infinite;
        }

        .lab-atom-electrons {
          transform-box: view-box;
          transform-origin: center;
          animation: lab-atom-spin 1.7s linear infinite reverse;
        }

        .lab-atom-shadow {
          animation: lab-atom-shadow 900ms ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes lab-atom-bounce {
          0%,
          100% {
            transform: translateY(5px) scaleX(1.04) scaleY(0.96);
          }
          48% {
            transform: translateY(-12px) scaleX(0.98) scaleY(1.02);
          }
        }

        @keyframes lab-atom-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes lab-atom-shadow {
          0%,
          100% {
            opacity: 0.5;
            transform: scaleX(1);
          }
          48% {
            opacity: 0.2;
            transform: scaleX(0.58);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lab-atom-bounce,
          .lab-atom-orbits,
          .lab-atom-electrons,
          .lab-atom-shadow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
