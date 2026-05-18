import React from 'react'

export default function LogoIcon({ size = 24, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 90"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="StudyForge"
    >
      {/* Book left page (teal) */}
      <path d="M50 58 L11 45 L11 78 L50 83 Z" fill="#22D3B2"/>
      {/* Book right page (blue) */}
      <path d="M50 58 L89 45 L89 78 L50 83 Z" fill="#29B8F8"/>
      {/* Owl body / book spine */}
      <path d="M44 41 L44 83 Q47 86 50 83 Q53 86 56 83 L56 41 Q53 40 50 39 Q47 40 44 41Z" fill="#1A2847"/>
      {/* Owl head */}
      <ellipse cx="50" cy="28" rx="18" ry="16" fill="#1A2847"/>
      {/* Left eye */}
      <circle cx="42" cy="27" r="6.5" fill="white"/>
      <circle cx="43" cy="27" r="3.5" fill="#1A2847"/>
      {/* Right eye */}
      <circle cx="58" cy="27" r="6.5" fill="white"/>
      <circle cx="59" cy="27" r="3.5" fill="#1A2847"/>
      {/* Graduation cap top */}
      <rect x="36" y="9" width="28" height="11" rx="3" fill="#1A2847"/>
      {/* Graduation cap brim */}
      <rect x="27" y="18" width="46" height="5" rx="2.5" fill="#1A2847"/>
      {/* Tassel cord */}
      <path d="M73 20 Q78 26 76 32" stroke="#1A2847" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Tassel ball */}
      <circle cx="75.5" cy="33" r="2.2" fill="#22D3B2"/>
    </svg>
  )
}
