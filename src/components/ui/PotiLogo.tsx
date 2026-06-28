'use client';

import React from 'react';

export function PotiLogo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Geometric Rising Sun (Segmented Radial Data) ── */}
      <circle cx="50" cy="40" r="22" stroke="#D4A017" strokeWidth="2.5" strokeDasharray="3 4" opacity="0.8" />
      <circle cx="50" cy="40" r="14" stroke="#D4A017" strokeWidth="2" strokeDasharray="6 3" />
      <circle cx="50" cy="40" r="7" fill="#D4A017" />
      
      {/* ── Geometric Cliffs (Falésias as Bar Chart Polygons) ── */}
      {/* Cliff 1 (Left): Petroleum Blue */}
      <path d="M15 72 L32 48 L48 72 Z" fill="#0F6B6D" opacity="0.9" />
      {/* Cliff 2 (Right): Deep Teal */}
      <path d="M38 72 L62 40 L80 72 Z" fill="#0E3B3F" />
      
      {/* ── Geometric Sea (Mar as Wavy Chart Lines) ── */}
      {/* Wave Line 1: Data Cyan */}
      <path d="M10 74 Q 25 71, 40 74 T 70 74 T 90 74" stroke="#4CB3B6" strokeWidth="2.5" strokeLinecap="round" />
      {/* Wave Line 2: Ice Blue */}
      <path d="M10 80 Q 25 78, 40 80 T 70 80 T 90 80" stroke="#CDE6E6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      {/* Grid line (base) */}
      <line x1="10" y1="86" x2="90" y2="86" stroke="#4CB3B6" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
      
      {/* ── Geometric Boat (Barco as Data Node / Sail) ── */}
      {/* Triangular Sail representing a GPS node or pointer */}
      <path d="M68 62 L74 50 L77 62 Z" fill="#D4A017" />
      {/* Boat hull */}
      <path d="M65 64 L80 64 L77 67 L68 67 Z" fill="#F7F4EE" />
      {/* Small node connection line */}
      <line x1="74" y1="50" x2="62" y2="40" stroke="#4CB3B6" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
    </svg>
  );
}
