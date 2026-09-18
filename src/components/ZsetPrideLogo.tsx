import React from 'react';

interface ZsetPrideLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'flag' | 'icon-only' | 'rainbow-circuit';
  className?: string;
  showText?: boolean;
}

export const ZsetPrideLogo: React.FC<ZsetPrideLogoProps> = ({
  size = 'md',
  variant = 'badge',
  className = '',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  // Exact ZSET circuit mark from the user's uploaded logo
  const ZsetCircuitMark = ({ strokeColor = '#ffffff' }: { strokeColor?: string }) => (
    <g stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* Outer concentric circuit ring with nodes */}
      <circle cx="100" cy="100" r="88" strokeWidth="2.2" strokeDasharray="50 14 90 20 80 16" />
      {/* Outer circuit nodes */}
      <circle cx="100" cy="12" r="3.8" fill={strokeColor} />
      <circle cx="178" cy="55" r="3.8" fill={strokeColor} />
      <circle cx="190" cy="108" r="3.8" fill={strokeColor} />
      <circle cx="158" cy="165" r="3.8" fill={strokeColor} />
      <circle cx="20" cy="65" r="3.8" fill={strokeColor} />
      <circle cx="45" cy="160" r="3.8" fill={strokeColor} />

      {/* Middle concentric circuit ring */}
      <circle cx="100" cy="100" r="70" strokeWidth="2.4" strokeDasharray="110 18 80 22 70 12" />
      {/* Middle circuit nodes */}
      <circle cx="160" cy="60" r="3.4" fill={strokeColor} />
      <circle cx="170" cy="100" r="3.4" fill={strokeColor} />
      <circle cx="40" cy="100" r="3.4" fill={strokeColor} />

      {/* Inner concentric ring */}
      <circle cx="100" cy="100" r="52" strokeWidth="2.6" />

      {/* Circuit letter 'T' (ZSET monogram) */}
      {/* Top bar of T with nodes */}
      <line x1="58" y1="62" x2="142" y2="62" strokeWidth="4.2" />
      <circle cx="58" cy="62" r="4.2" fill={strokeColor} />
      <circle cx="142" cy="62" r="4.2" fill={strokeColor} />
      
      {/* Small circuit spur on left top */}
      <line x1="58" y1="62" x2="58" y2="82" strokeWidth="3.2" />
      <line x1="58" y1="82" x2="110" y2="82" strokeWidth="3.2" />
      <circle cx="58" cy="82" r="3.2" fill={strokeColor} />
      <circle cx="110" cy="82" r="3.2" fill={strokeColor} />

      {/* Small circuit spur on right top */}
      <line x1="142" y1="62" x2="142" y2="84" strokeWidth="3.2" />
      <line x1="142" y1="84" x2="128" y2="84" strokeWidth="3.2" />
      <circle cx="128" cy="84" r="3.2" fill={strokeColor} />

      {/* Vertical stem of 'T' that hooks back up with a terminal circuit dot */}
      <path
        d="M 100 82 L 100 138 L 112 138 L 112 104"
        strokeWidth="4"
      />
      <circle cx="112" cy="104" r="4" fill={strokeColor} />
    </g>
  );

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${dimension} flex-shrink-0 select-none`}>
        {variant === 'flag' ? (
          /* Rectangular LGBT flag with ZSET logo */
          <div className="w-full h-full rounded-xl overflow-hidden shadow-md border border-white/20 relative flex items-center justify-center">
            <svg viewBox="0 0 200 140" className="w-full h-full" preserveAspectRatio="none">
              <rect width="200" height="23.33" y="0" fill="#e40303" />
              <rect width="200" height="23.33" y="23.33" fill="#ff8c00" />
              <rect width="200" height="23.33" y="46.66" fill="#ffed00" />
              <rect width="200" height="23.33" y="70" fill="#008026" />
              <rect width="200" height="23.33" y="93.33" fill="#24408e" />
              <rect width="200" height="23.34" y="116.66" fill="#732982" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center p-1 bg-black/15">
              <svg viewBox="0 0 200 200" className="w-4/5 h-4/5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <ZsetCircuitMark strokeColor="#ffffff" />
              </svg>
            </div>
          </div>
        ) : variant === 'rainbow-circuit' ? (
          /* Dark badge with rainbow circuit traces */
          <div className="w-full h-full rounded-2xl bg-slate-950 p-1 shadow-lg shadow-purple-950/40 border border-slate-800 flex items-center justify-center relative overflow-hidden">
            {/* Rainbow subtle background glow */}
            <div className="absolute -inset-2 opacity-30 blur-md bg-gradient-to-r from-red-500 via-yellow-400 to-purple-600" />
            <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              <defs>
                <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e40303" />
                  <stop offset="20%" stopColor="#ff8c00" />
                  <stop offset="40%" stopColor="#ffed00" />
                  <stop offset="60%" stopColor="#008026" />
                  <stop offset="80%" stopColor="#24408e" />
                  <stop offset="100%" stopColor="#732982" />
                </linearGradient>
              </defs>
              <ZsetCircuitMark strokeColor="url(#rainbowGrad)" />
            </svg>
          </div>
        ) : (
          /* Default Circular Pride Badge: Rainbow 6 stripes circle with crisp white ZSET circuit logo */
          <div className="w-full h-full rounded-full overflow-hidden shadow-lg border-2 border-white/30 relative flex items-center justify-center ring-2 ring-purple-500/20">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <clipPath id="circleClip">
                  <circle cx="100" cy="100" r="100" />
                </clipPath>
              </defs>
              <g clipPath="url(#circleClip)">
                <rect width="200" height="33.33" y="0" fill="#e40303" />
                <rect width="200" height="33.33" y="33.33" fill="#ff8c00" />
                <rect width="200" height="33.33" y="66.66" fill="#ffed00" />
                <rect width="200" height="33.33" y="100" fill="#008026" />
                <rect width="200" height="33.33" y="133.33" fill="#24408e" />
                <rect width="200" height="33.34" y="166.66" fill="#732982" />
                {/* Semi-transparent dark circular plate for high contrast readability of the circuit */}
                <circle cx="100" cy="100" r="76" fill="#000e24" fillOpacity="0.45" />
              </g>
              {/* White ZSET circuit mark */}
              <g className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                <ZsetCircuitMark strokeColor="#ffffff" />
              </g>
            </svg>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-black tracking-tight text-slate-900 dark:text-white leading-tight font-display">
            <span>ZSET</span>
            <span className="text-purple-600 dark:text-purple-400">LESZNO</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-red-500 via-amber-400 to-indigo-500 text-white font-bold tracking-wider uppercase ml-1">
              GAYSPACE
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Społeczność uczniów ZSET Leszno
          </span>
        </div>
      )}
    </div>
  );
};
