import React from 'react';

export const getProductSvg = (category = '', name = '') => {
  const cat = category.toLowerCase();
  const title = name.toLowerCase();

  // Color combinations based on category
  let gradient = (
    <linearGradient id="grad-cyber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#8b5cf6" />
      <stop offset="100%" stopColor="#3b82f6" />
    </linearGradient>
  );
  let bg = "bg-gradient-to-tr from-violet-900/40 to-indigo-900/40";
  let strokeColor = "#a78bfa";

  if (cat.includes('mobile') || cat.includes('tablet')) {
    gradient = (
      <linearGradient id="grad-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#f43f5e" />
      </linearGradient>
    );
    bg = "bg-gradient-to-tr from-pink-950/20 to-rose-950/20";
    strokeColor = "#fda4af";
  } else if (cat.includes('laptop') || cat.includes('monitor')) {
    gradient = (
      <linearGradient id="grad-laptop" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    );
    bg = "bg-gradient-to-tr from-cyan-950/20 to-blue-950/20";
    strokeColor = "#67e8f9";
  } else if (cat.includes('audio')) {
    gradient = (
      <linearGradient id="grad-audio" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    );
    bg = "bg-gradient-to-tr from-emerald-950/20 to-teal-950/20";
    strokeColor = "#6ee7b7";
  } else if (cat.includes('shoe')) {
    gradient = (
      <linearGradient id="grad-shoe" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
    );
    bg = "bg-gradient-to-tr from-amber-950/20 to-red-950/20";
    strokeColor = "#fde047";
  } else if (cat.includes('camera')) {
    gradient = (
      <linearGradient id="grad-camera" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    );
    bg = "bg-gradient-to-tr from-rose-950/20 to-purple-950/20";
    strokeColor = "#f472b6";
  } else if (cat.includes('gaming')) {
    gradient = (
      <linearGradient id="grad-gaming" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#d946ef" />
      </linearGradient>
    );
    bg = "bg-gradient-to-tr from-indigo-950/20 to-fuchsia-950/20";
    strokeColor = "#a5b4fc";
  }

  const renderIcon = () => {
    if (cat.includes('laptop')) {
      return (
        <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Laptop Screen */}
          <rect x="25" y="20" width="50" height="32" rx="3" />
          {/* Laptop Base */}
          <path d="M15 56h70" />
          <path d="M22 52l3 4h50l3-4" />
          {/* Code Lines inside screen */}
          <path d="M33 28h15" strokeWidth="2" opacity="0.6" />
          <path d="M33 34h24" strokeWidth="2" opacity="0.6" strokeColor="#3b82f6" />
          <path d="M33 40h10" strokeWidth="2" opacity="0.4" />
        </g>
      );
    }

    if (cat.includes('mobile')) {
      return (
        <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Smartphone Body */}
          <rect x="32" y="12" width="36" height="66" rx="6" />
          {/* Screen inner border */}
          <rect x="35" y="15" width="30" height="60" rx="4" opacity="0.4" />
          {/* Dynamic Island */}
          <rect x="45" y="17" width="10" height="3" rx="1.5" fill={strokeColor} />
          {/* Camera Ring */}
          <circle cx="50" cy="40" r="8" opacity="0.5" />
          <circle cx="50" cy="40" r="3" />
        </g>
      );
    }

    if (cat.includes('tablet')) {
      return (
        <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Tablet Body */}
          <rect x="22" y="15" width="56" height="60" rx="5" />
          {/* Screen Inner */}
          <rect x="25" y="18" width="50" height="54" rx="3" opacity="0.4" />
          {/* Stylus simulation */}
          <line x1="68" y1="28" x2="52" y2="44" strokeWidth="3" />
          <line x1="52" y1="44" x2="50" y2="45" strokeWidth="3" fill={strokeColor} />
        </g>
      );
    }

    if (cat.includes('audio')) {
      return (
        <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Headphones Headband */}
          <path d="M25 50c0-18 10-28 25-28s25 10 25 28" />
          {/* Left Ear Cup */}
          <rect x="20" y="44" width="8" height="18" rx="3" fill={strokeColor} />
          {/* Right Ear Cup */}
          <rect x="72" y="44" width="8" height="18" rx="3" fill={strokeColor} />
          {/* Sound wave rings */}
          <path d="M14 42a22 22 0 0 1 0 22" strokeWidth="1.5" opacity="0.5" />
          <path d="M86 42a22 22 0 0 0 0 22" strokeWidth="1.5" opacity="0.5" />
        </g>
      );
    }

    if (cat.includes('shoe')) {
      return (
        <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Sneaker Contour */}
          <path d="M20 54h12l10-18 20 8 18-4 5 12-5 4H20z" />
          {/* Sole */}
          <path d="M20 56c12 2 40 2 60 0" strokeWidth="3.5" />
          {/* Stripes */}
          <path d="M48 42l-5 8M53 44l-5 8" strokeWidth="2" opacity="0.7" />
        </g>
      );
    }

    if (cat.includes('gaming')) {
      return (
        <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Controller Body */}
          <path d="M25 35c8-10 42-10 50 0 4 6 8 20 5 25s-12 5-18-2l-12-8-12 8c-6 7-15 7-18 2s1-19 5-25z" />
          {/* D-Pad */}
          <path d="M36 40v12M30 46h12" strokeWidth="2" />
          {/* Action buttons */}
          <circle cx="64" cy="42" r="2.5" fill={strokeColor} />
          <circle cx="70" cy="48" r="2.5" fill={strokeColor} />
        </g>
      );
    }

    if (cat.includes('watch') || cat.includes('wearable')) {
      return (
        <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Strap */}
          <rect x="42" y="10" width="16" height="80" rx="2" opacity="0.5" />
          {/* Dial outer casing */}
          <circle cx="50" cy="50" r="22" fill="#1e1b4b" />
          <circle cx="50" cy="50" r="22" />
          <circle cx="50" cy="50" r="18" opacity="0.3" />
          {/* Hands */}
          <line x1="50" y1="50" x2="50" y2="38" />
          <line x1="50" y1="50" x2="60" y2="50" strokeWidth="2" />
        </g>
      );
    }

    if (cat.includes('camera')) {
      return (
        <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Camera Body */}
          <rect x="20" y="26" width="60" height="42" rx="4" />
          {/* Top flash protrusion */}
          <path d="M38 26l4-6h16l4 6" />
          {/* Lens outer */}
          <circle cx="50" cy="47" r="15" />
          {/* Lens inner */}
          <circle cx="50" cy="47" r="8" fill={strokeColor} />
          {/* Shutter button */}
          <circle cx="28" cy="20" r="2.5" fill={strokeColor} />
        </g>
      );
    }

    if (cat.includes('monitor')) {
      return (
        <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Screen frame */}
          <rect x="15" y="16" width="70" height="42" rx="4" />
          {/* Stand */}
          <path d="M44 58l-4 12h20l-4-12" />
          <line x1="50" y1="58" x2="50" y2="68" />
          {/* Grid simulation */}
          <path d="M22 24h56M22 36h56" opacity="0.2" />
        </g>
      );
    }

    if (cat.includes('keyboards') || cat.includes('keyboard')) {
      return (
        <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Keyboard chassis */}
          <rect x="15" y="28" width="70" height="34" rx="4" />
          {/* Key rows grid */}
          <path d="M20 36h60M20 44h60M20 52h60" strokeWidth="1.5" opacity="0.6" />
          {/* Vertical key markers */}
          <path d="M26 36v16M38 36v16M50 36v16M62 36v16M74 36v16" strokeWidth="1" opacity="0.3" />
        </g>
      );
    }

    if (cat.includes('storage') || cat.includes('ssd')) {
      return (
        <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* SSD Stick outline */}
          <rect x="18" y="35" width="64" height="20" rx="2" />
          {/* Gold pins */}
          <path d="M22 55v3M26 55v3M30 55v3M34 55v3M38 55v3" strokeWidth="1.5" />
          {/* Logic chips */}
          <rect x="46" y="39" width="10" height="12" fill={strokeColor} opacity="0.8" />
          <rect x="62" y="39" width="12" height="12" fill={strokeColor} opacity="0.8" />
        </g>
      );
    }

    // Default shopping bag for category mismatch
    return (
      <g fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M35 30V22a15 15 0 0 1 30 0v8" />
        <rect x="25" y="30" width="50" height="46" rx="4" />
        <circle cx="42" cy="42" r="3" fill={strokeColor} />
        <circle cx="58" cy="42" r="3" fill={strokeColor} />
      </g>
    );
  };

  return (
    <div className={`w-full h-full flex items-center justify-center ${bg} border border-gray-200/10 rounded-t-xl overflow-hidden transition-all duration-300 relative select-none`}>
      {/* Abstract geometric background elements */}
      <div className="absolute top-2 left-2 w-16 h-16 rounded-full bg-indigo-500/10 blur-xl"></div>
      <div className="absolute bottom-2 right-2 w-16 h-16 rounded-full bg-pink-500/10 blur-xl"></div>

      <svg
        viewBox="0 0 100 90"
        className="w-4/5 h-4/5 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]"
      >
        <defs>{gradient}</defs>
        {renderIcon()}
      </svg>
    </div>
  );
};
