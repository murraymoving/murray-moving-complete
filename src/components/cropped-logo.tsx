import React from 'react';

interface CroppedLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function CroppedLogo({ className, style }: CroppedLogoProps) {
  return (
    <div className={className} style={style}>
      <svg
        viewBox="0 0 450 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* NJ letters with truck design */}
        <text
          x="10"
          y="70"
          fill="white"
          fontSize="64"
          fontWeight="900"
          fontFamily="Arial Black, sans-serif"
          style={{ letterSpacing: '-2px' }}
        >
          NJ
        </text>
        
        {/* Truck icon integrated in the J */}
        <rect x="80" y="45" width="20" height="12" fill="white" />
        <rect x="100" y="42" width="12" height="18" fill="white" />
        <circle cx="88" cy="62" r="3" fill="black" />
        <circle cx="105" cy="62" r="3" fill="black" />
        
        {/* MURRAY text */}
        <text
          x="135"
          y="45"
          fill="white"
          fontSize="32"
          fontWeight="900"
          fontFamily="Arial Black, sans-serif"
          style={{ letterSpacing: '1px' }}
        >
          MURRAY
        </text>
        
        {/* MOVING text */}
        <text
          x="135"
          y="80"
          fill="white"
          fontSize="32"
          fontWeight="900"
          fontFamily="Arial Black, sans-serif"
          style={{ letterSpacing: '1px' }}
        >
          MOVING
        </text>
      </svg>
    </div>
  );
}