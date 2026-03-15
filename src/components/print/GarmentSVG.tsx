// src/components/print/GarmentSVG.tsx
// Inline SVG garment illustrations — no external images needed.
// Each accepts a `color` hex string and renders an accurate blank garment.

import React from "react";

interface GarmentProps {
  color: string;
  className?: string;
}

// ─── T-SHIRT ────────────────────────────────────────────────────────────────
export function TShirtSVG({ color, className = "" }: GarmentProps) {
  return (
    <svg
      viewBox="0 0 300 340"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Blank T-Shirt"
    >
      {/* Shadow */}
      <ellipse cx="150" cy="335" rx="90" ry="5" fill="rgba(0,0,0,0.08)" />
      {/* Body */}
      <path
        d="M75 60 L30 120 L70 135 L70 310 L230 310 L230 135 L270 120 L225 60 C210 75 185 85 150 85 C115 85 90 75 75 60Z"
        fill={color}
        stroke="#00000022"
        strokeWidth="1.5"
      />
      {/* Left sleeve highlight */}
      <path
        d="M75 60 L30 120 L70 135 L70 105Z"
        fill="rgba(255,255,255,0.08)"
      />
      {/* Collar */}
      <path
        d="M113 60 Q150 90 187 60"
        fill="none"
        stroke="#00000018"
        strokeWidth="2"
      />
      {/* Collar detail */}
      <path
        d="M113 60 Q150 82 187 60"
        fill="none"
        stroke="#00000010"
        strokeWidth="3"
      />
      {/* Fabric shading */}
      <path
        d="M70 135 L70 310 L100 310 L100 135Z"
        fill="rgba(0,0,0,0.03)"
      />
      <path
        d="M200 135 L200 310 L230 310 L230 135Z"
        fill="rgba(0,0,0,0.04)"
      />
      {/* Print area guide (subtle dashed) */}
      <rect
        x="95"
        y="120"
        width="110"
        height="110"
        fill="none"
        stroke="#00000012"
        strokeWidth="1"
        strokeDasharray="4,4"
        rx="2"
      />
    </svg>
  );
}

// ─── HOODIE ─────────────────────────────────────────────────────────────────
export function HoodieSVG({ color, className = "" }: GarmentProps) {
  const shade = "rgba(0,0,0,0.06)";
  return (
    <svg
      viewBox="0 0 300 360"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Blank Hoodie"
    >
      <ellipse cx="150" cy="355" rx="95" ry="5" fill="rgba(0,0,0,0.08)" />
      {/* Body */}
      <path
        d="M70 85 L20 155 L65 170 L65 330 L235 330 L235 170 L280 155 L230 85 C215 102 188 112 150 112 C112 112 85 102 70 85Z"
        fill={color}
        stroke="#00000022"
        strokeWidth="1.5"
      />
      {/* Hood */}
      <path
        d="M112 60 Q100 20 150 15 Q200 20 188 60 Q175 75 150 80 Q125 75 112 60Z"
        fill={color}
        stroke="#00000022"
        strokeWidth="1.5"
      />
      {/* Hood inner */}
      <path
        d="M118 62 Q106 28 150 22 Q194 28 182 62 Q170 74 150 78 Q130 74 118 62Z"
        fill="rgba(0,0,0,0.07)"
      />
      {/* Kangaroo pocket */}
      <path
        d="M105 230 Q150 220 195 230 L195 280 Q150 290 105 280Z"
        fill="rgba(0,0,0,0.06)"
        stroke="#00000015"
        strokeWidth="1"
      />
      {/* Cuffs */}
      <rect x="65" y="318" width="170" height="12" rx="3" fill={shade} />
      <rect x="65" y="168" width="10" height="8" rx="2" fill={shade} />
      <rect x="225" y="168" width="10" height="8" rx="2" fill={shade} />
      {/* Print area */}
      <rect
        x="100"
        y="130"
        width="100"
        height="90"
        fill="none"
        stroke="#00000012"
        strokeWidth="1"
        strokeDasharray="4,4"
        rx="2"
      />
      {/* Zip line */}
      <line
        x1="150"
        y1="80"
        x2="150"
        y2="330"
        stroke="#00000010"
        strokeWidth="1.5"
        strokeDasharray="3,5"
      />
    </svg>
  );
}

// ─── POLO SHIRT ─────────────────────────────────────────────────────────────
export function PoloSVG({ color, className = "" }: GarmentProps) {
  return (
    <svg
      viewBox="0 0 300 340"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Blank Polo Shirt"
    >
      <ellipse cx="150" cy="335" rx="90" ry="5" fill="rgba(0,0,0,0.08)" />
      {/* Body */}
      <path
        d="M78 65 L32 125 L72 138 L72 310 L228 310 L228 138 L268 125 L222 65 C208 80 182 90 150 90 C118 90 92 80 78 65Z"
        fill={color}
        stroke="#00000022"
        strokeWidth="1.5"
      />
      {/* Collar left */}
      <path
        d="M150 65 L120 90 L135 95 L150 75Z"
        fill={color}
        stroke="#00000022"
        strokeWidth="1.2"
      />
      {/* Collar right */}
      <path
        d="M150 65 L180 90 L165 95 L150 75Z"
        fill={color}
        stroke="#00000022"
        strokeWidth="1.2"
      />
      {/* Collar tip shading */}
      <path
        d="M150 65 L120 90 L135 95 L150 75Z"
        fill="rgba(0,0,0,0.05)"
      />
      {/* Placket */}
      <rect
        x="143"
        y="70"
        width="14"
        height="50"
        fill="rgba(0,0,0,0.06)"
        rx="1"
      />
      {/* Buttons */}
      {[85, 98, 111].map((y) => (
        <circle key={y} cx="150" cy={y} r="2" fill="rgba(0,0,0,0.25)" />
      ))}
      {/* Sleeve shading */}
      <path d="M72 138 L72 105 L32 125Z" fill="rgba(255,255,255,0.07)" />
      {/* Print area */}
      <rect
        x="100"
        y="115"
        width="100"
        height="100"
        fill="none"
        stroke="#00000012"
        strokeWidth="1"
        strokeDasharray="4,4"
        rx="2"
      />
    </svg>
  );
}

// ─── CARGO PANTS ────────────────────────────────────────────────────────────
export function CargoPantsSVG({ color, className = "" }: GarmentProps) {
  return (
    <svg
      viewBox="0 0 280 380"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Blank Cargo Pants"
    >
      <ellipse cx="140" cy="375" rx="80" ry="5" fill="rgba(0,0,0,0.08)" />
      {/* Waistband */}
      <rect
        x="45"
        y="20"
        width="190"
        height="28"
        rx="4"
        fill={color}
        stroke="#00000022"
        strokeWidth="1.5"
      />
      {/* Belt loops */}
      {[70, 105, 140, 175, 210].map((x) => (
        <rect
          key={x}
          x={x}
          y="16"
          width="8"
          height="36"
          rx="2"
          fill="rgba(0,0,0,0.12)"
        />
      ))}
      {/* Left leg */}
      <path
        d="M45 48 L45 340 Q45 360 80 360 Q115 360 115 340 L130 140 L140 140 L155 340 Q155 360 190 360 Q225 360 225 340 L225 48Z"
        fill={color}
        stroke="#00000022"
        strokeWidth="1.5"
      />
      {/* Crotch seam */}
      <path
        d="M130 140 Q140 160 150 140"
        fill="none"
        stroke="#00000018"
        strokeWidth="1.5"
      />
      {/* Left cargo pocket */}
      <rect
        x="52"
        y="120"
        width="52"
        height="60"
        rx="3"
        fill="rgba(0,0,0,0.07)"
        stroke="#00000018"
        strokeWidth="1"
      />
      <line
        x1="52"
        y1="148"
        x2="104"
        y2="148"
        stroke="#00000012"
        strokeWidth="1"
      />
      {/* Right cargo pocket */}
      <rect
        x="176"
        y="120"
        width="52"
        height="60"
        rx="3"
        fill="rgba(0,0,0,0.07)"
        stroke="#00000018"
        strokeWidth="1"
      />
      <line
        x1="176"
        y1="148"
        x2="228"
        y2="148"
        stroke="#00000012"
        strokeWidth="1"
      />
      {/* Knee seams */}
      <line
        x1="50"
        y1="220"
        x2="125"
        y2="220"
        stroke="#00000010"
        strokeWidth="1.5"
      />
      <line
        x1="158"
        y1="220"
        x2="222"
        y2="220"
        stroke="#00000010"
        strokeWidth="1.5"
      />
      {/* Cuffs */}
      <path
        d="M45 330 Q62 345 80 350 Q62 355 45 340Z"
        fill="rgba(0,0,0,0.07)"
      />
      <path
        d="M235 330 Q218 345 200 350 Q218 355 235 340Z"
        fill="rgba(0,0,0,0.07)"
      />
      {/* Print area guide */}
      <rect
        x="88"
        y="55"
        width="104"
        height="60"
        fill="none"
        stroke="#00000012"
        strokeWidth="1"
        strokeDasharray="4,4"
        rx="2"
      />
    </svg>
  );
}

// ─── TOTE BAG ────────────────────────────────────────────────────────────────
export function ToteBagSVG({ color, className = "" }: GarmentProps) {
  return (
    <svg
      viewBox="0 0 280 340"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Blank Canvas Tote Bag"
    >
      <ellipse cx="140" cy="335" rx="80" ry="5" fill="rgba(0,0,0,0.08)" />
      {/* Handles */}
      <path
        d="M90 60 Q90 20 115 20 Q140 20 140 60"
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M140 60 Q140 20 165 20 Q190 20 190 60"
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Handle detail lines */}
      <path
        d="M90 60 Q90 20 115 20 Q140 20 140 60"
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M140 60 Q140 20 165 20 Q190 20 190 60"
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Bag body */}
      <path
        d="M35 65 L35 310 Q35 325 50 325 L230 325 Q245 325 245 310 L245 65Z"
        fill={color}
        stroke="#00000022"
        strokeWidth="1.5"
      />
      {/* Top fold */}
      <rect
        x="35"
        y="60"
        width="210"
        height="18"
        rx="0"
        fill="rgba(0,0,0,0.05)"
      />
      {/* Side seams */}
      <line
        x1="50"
        y1="78"
        x2="50"
        y2="322"
        stroke="#00000012"
        strokeWidth="2"
      />
      <line
        x1="230"
        y1="78"
        x2="230"
        y2="322"
        stroke="#00000012"
        strokeWidth="2"
      />
      {/* Bottom seam */}
      <line
        x1="50"
        y1="315"
        x2="230"
        y2="315"
        stroke="#00000012"
        strokeWidth="2"
      />
      {/* Woven texture lines (subtle) */}
      {[100, 130, 160, 190, 220, 250, 280].map((y) => (
        <line
          key={y}
          x1="35"
          y1={y}
          x2="245"
          y2={y}
          stroke="rgba(0,0,0,0.025)"
          strokeWidth="1"
        />
      ))}
      {/* Print area */}
      <rect
        x="75"
        y="110"
        width="130"
        height="130"
        fill="none"
        stroke="#00000015"
        strokeWidth="1"
        strokeDasharray="4,4"
        rx="2"
      />
    </svg>
  );
}

// ─── LOOKUP MAP ─────────────────────────────────────────────────────────────
export const GARMENT_SVG_MAP: Record<
  string,
  (props: GarmentProps) => JSX.Element
> = {
  "classic-tshirt": TShirtSVG,
  "premium-hoodie": HoodieSVG,
  "polo-shirt": PoloSVG,
  "cargo-pants": CargoPantsSVG,
  "canvas-tote": ToteBagSVG,
};
