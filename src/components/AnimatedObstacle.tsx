// AnimatedObstacle component for GameScreen
'use client';

interface AnimatedObstacleProps {
  x: number;
  y: number;
  type: 'guard' | 'dog';
  direction?: number;
}

export default function AnimatedObstacle({ x, y, type, direction = 1 }: AnimatedObstacleProps) {
  if (type === 'guard') {
    // Inspector cartoon character
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '40px',
          height: '50px',
          transform: direction < 0 ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      >
        <svg width="40" height="50" viewBox="0 0 40 50" className="drop-shadow-lg">
          {/* Legs */}
          <line x1="16" y1="42" x2="16" y2="50" stroke="#000" strokeWidth="3" />
          <line x1="24" y1="42" x2="24" y2="50" stroke="#000" strokeWidth="3" />
          <line x1="14" y1="50" x2="18" y2="50" stroke="#000" strokeWidth="3" />
          <line x1="22" y1="50" x2="26" y2="50" stroke="#000" strokeWidth="3" />

          {/* Trench Coat */}
          <path d="M 10 22 L 8 42 L 32 42 L 30 22 Z" fill="#d4a373" />
          <line x1="20" y1="22" x2="20" y2="42" stroke="#a67c52" strokeWidth="1" />
          <path d="M 10 22 L 8 28 L 12 26" fill="#d4a373" /> {/* Sleeve L */}
          <path d="M 30 22 L 32 28 L 28 26" fill="#d4a373" /> {/* Sleeve R */}

          {/* Head */}
          <circle cx="20" cy="15" r="8" fill="#fcd5b5" />

          {/* Nose - Big and prominent */}
          <ellipse cx="26" cy="15" rx="5" ry="3" fill="#fcd5b5" />

          {/* Mustache */}
          <path d="M 22 19 Q 26 20 28 19" stroke="#000" strokeWidth="1.5" fill="none" />

          {/* Eye - suspicious look */}
          <circle cx="22" cy="12" r="2.5" fill="#fff" />
          <circle cx="23" cy="12" r="1" fill="#000" />
          <path d="M 19 10 L 25 11" stroke="#000" strokeWidth="1" /> {/* Eyebrow */}

          {/* Hat */}
          <ellipse cx="20" cy="9" rx="12" ry="3" fill="#c58f5e" /> {/* Brim */}
          <path d="M 12 9 L 14 2 Q 20 0 26 2 L 28 9" fill="#c58f5e" /> {/* Crown */}
          <path d="M 13 8 L 27 8" stroke="#5d4037" strokeWidth="2" /> {/* Band */}

          {/* Magnifying Glass Arm */}
          <path d="M 10 25 Q 5 32 12 32" stroke="#d4a373" strokeWidth="4" fill="none" strokeLinecap="round" />

          {/* Magnifying Glass */}
          <line x1="12" y1="32" x2="12" y2="26" stroke="#333" strokeWidth="2" />
          <circle cx="12" cy="22" r="4" stroke="#94a3b8" strokeWidth="1.5" fill="rgba(200,230,255,0.4)" />
        </svg>
      </div>
    );
  } else {
    // Dog cartoon character
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '40px',
          height: '40px',
          transform: direction < 0 ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" className="drop-shadow-lg">
          {/* Tail - Thin and wagging */}
          <path d="M 4 20 Q 0 15 2 10" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round">
            <animate attributeName="d" values="M 4 20 Q 0 15 2 10; M 4 20 Q 8 15 6 10; M 4 20 Q 0 15 2 10" dur="0.15s" repeatCount="indefinite" />
          </path>

          {/* Back Leg */}
          <path d="M 8 32 L 8 38 L 10 38 L 12 34" fill="#fff" stroke="#e5e7eb" strokeWidth="1" />

          {/* Body - White and small */}
          <ellipse cx="18" cy="25" rx="10" ry="8" fill="#fff" />

          {/* Front Leg */}
          <path d="M 22 30 L 22 38 L 24 38 L 26 32" fill="#fff" stroke="#e5e7eb" strokeWidth="1" />

          {/* Neck/Collar Area */}
          <rect x="22" y="18" width="6" height="8" fill="#fff" transform="rotate(-15 25 22)" />
          <rect x="23" y="20" width="6" height="3" fill="#ef4444" transform="rotate(-15 25 22)" /> {/* Red Collar */}

          {/* Head - White with big snout */}
          <circle cx="28" cy="16" r="9" fill="#fff" />
          <ellipse cx="34" cy="18" rx="6" ry="5" fill="#fff" /> {/* Snout */}

          {/* Nose - Big Black Nose */}
          <ellipse cx="38" cy="16" rx="2.5" ry="3.5" fill="#000" />

          {/* Mouth - Happy */}
          <path d="M 32 21 Q 35 24 38 21" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M 34 22 Q 36 26 37 22" fill="#f472b6" /> {/* Tongue */}

          {/* Ear - Black and pointy */}
          <path d="M 24 10 L 22 2 L 28 8 Z" fill="#000" />
          <path d="M 28 8 L 32 2 L 30 10 Z" fill="#000" />

          {/* Eye - Big and curious */}
          <ellipse cx="28" cy="14" rx="3" ry="4" fill="#fff" stroke="#000" strokeWidth="0.5" />
          <circle cx="29" cy="14" r="1" fill="#000" />
        </svg>
      </div>
    );
  }
}
