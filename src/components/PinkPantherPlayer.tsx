'use client'

interface PinkPantherPlayerProps {
  x: number
  y: number
  isSlowed: boolean
  isMoving: boolean
  isFalling: boolean
  direction: 'left' | 'right'
  skin?: string
}

export default function PinkPantherPlayer({
  x,
  y,
  isSlowed,
  isMoving,
  direction,
  skin = 'classic'
}: PinkPantherPlayerProps) {
  const scale = direction === 'left' ? -1 : 1
  
  const skins: Record<string, { body: string; dark: string; accent: string }> = {
    classic: { body: '#ff69b4', dark: '#ff1493', accent: '#ffb6c1' },
    inspector: { body: '#ff69b4', dark: '#ff1493', accent: '#8b4513' },
    miami: { body: '#ff69b4', dark: '#ff1493', accent: '#ffd700' },
    golden: { body: '#ffd700', dark: '#ffa500', accent: '#ffffe0' },
    ninja: { body: '#2c2c2c', dark: '#000000', accent: '#ff0000' },
    cyber: { body: '#00ffff', dark: '#0080ff', accent: '#ff00ff' },
    royal: { body: '#9370db', dark: '#4b0082', accent: '#ffd700' },
    space: { body: '#1e1e3f', dark: '#000033', accent: '#00ff00' },
    vampire: { body: '#8b0000', dark: '#4b0000', accent: '#ffffff' },
    pirate: { body: '#d2691e', dark: '#8b4513', accent: '#000000' },
    wizard: { body: '#4169e1', dark: '#00008b', accent: '#ffd700' },
    knight: { body: '#c0c0c0', dark: '#808080', accent: '#ffd700' },
    samurai: { body: '#ff0000', dark: '#8b0000', accent: '#000000' },
    robot: { body: '#708090', dark: '#2f4f4f', accent: '#00ff00' },
    diamond: { body: '#e0ffff', dark: '#87ceeb', accent: '#ffffff' },
    legendary: { body: '#ff1493', dark: '#8b008b', accent: '#ffd700' },
    // USDC Exclusive skins (WLD before)
    superman: { body: '#0047ab', dark: '#003080', accent: '#dc143c' },
    'harry-potter': { body: '#740001', dark: '#4d0001', accent: '#d3a625' },
    batman: { body: '#2c2c2c', dark: '#000000', accent: '#ffd700' },
    spiderman: { body: '#e62429', dark: '#b81e24', accent: '#2b3784' },
    'iron-man': { body: '#dc143c', dark: '#a00000', accent: '#ffd700' },
    'captain-america': { body: '#0047ab', dark: '#003080', accent: '#dc143c' },
    thor: { body: '#c0c0c0', dark: '#808080', accent: '#dc143c' },
    hulk: { body: '#228b22', dark: '#006400', accent: '#8b008b' },
    'wonder-woman': { body: '#dc143c', dark: '#a00000', accent: '#ffd700' },
    flash: { body: '#dc143c', dark: '#a00000', accent: '#ffd700' },
    deadpool: { body: '#dc143c', dark: '#a00000', accent: '#000000' },
    joker: { body: '#9370db', dark: '#4b0082', accent: '#228b22' },
    'luke-skywalker': { body: '#f5deb3', dark: '#d2b48c', accent: '#87ceeb' },
    'darth-vader': { body: '#000000', dark: '#1c1c1c', accent: '#dc143c' },
    mario: { body: '#dc143c', dark: '#a00000', accent: '#0047ab' },
    sonic: { body: '#0047ab', dark: '#003080', accent: '#ffd700' }
  }
  
  const colors = skins[skin] || skins.classic
  
  
  return (
    <div
      className="absolute pointer-events-none transition-opacity duration-200"
      style={{
        left: x - 20,
        top: y,
        transform: `scaleX(${scale})`,
        opacity: isSlowed ? 0.7 : 1,
      }}
    >
      <svg width="40" height="50" viewBox="0 0 40 50" className={isMoving ? 'animate-bounce' : ''}>
        {/* Pink Panther Character */}
        
        {/* Tail */}
        <path
          d="M 5 35 Q 0 30, 2 25"
          stroke={colors.dark}
          strokeWidth="2"
          fill="none"
          className={isMoving ? 'animate-pulse' : ''}
        />
        
        {/* Body */}
        <ellipse cx="20" cy="30" rx="8" ry="12" fill={colors.body} stroke={colors.dark} strokeWidth="1.5" />
        
        {/* Head */}
        <ellipse cx="20" cy="15" rx="10" ry="9" fill={colors.body} stroke={colors.dark} strokeWidth="1.5" />
        
        {/* Snout/Muzzle - lighter area */}
        <ellipse cx="20" cy="18" rx="6" ry="5" fill={colors.accent} stroke={colors.dark} strokeWidth="1" />
        
        {/* Nose - small pink triangle */}
        <path d="M 20 16 L 18 19 L 22 19 Z" fill={colors.dark} />
        
        {/* Eyes - iconic Pink Panther eyes */}
        <g>
          {/* Left eye */}
          <ellipse cx="16" cy="12" rx="3" ry="4" fill="white" stroke={colors.dark} strokeWidth="1" />
          <ellipse cx="16" cy="13" rx="1.5" ry="2" fill="black" />
          
          {/* Right eye */}
          <ellipse cx="24" cy="12" rx="3" ry="4" fill="white" stroke={colors.dark} strokeWidth="1" />
          <ellipse cx="24" cy="13" rx="1.5" ry="2" fill="black" />
          
          {/* Eyebrows */}
          <path d="M 13 9 Q 16 8, 18 9" stroke={colors.dark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 22 9 Q 24 8, 27 9" stroke={colors.dark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
        
        {/* Ears */}
        <ellipse cx="12" cy="8" rx="3" ry="4" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
        <ellipse cx="28" cy="8" rx="3" ry="4" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
        
        {/* Whiskers */}
        <line x1="8" y1="18" x2="12" y2="18" stroke="black" strokeWidth="0.5" />
        <line x1="8" y1="20" x2="12" y2="19" stroke="black" strokeWidth="0.5" />
        <line x1="28" y1="18" x2="32" y2="18" stroke="black" strokeWidth="0.5" />
        <line x1="28" y1="19" x2="32" y2="20" stroke="black" strokeWidth="0.5" />
        
        {/* Arms */}
        <g className={isMoving ? 'animate-pulse' : ''}>
          <ellipse cx="13" cy="28" rx="2" ry="8" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
          <ellipse cx="27" cy="28" rx="2" ry="8" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
        </g>
        
        {/* Legs - animated when moving */}
        <g className={isMoving ? 'animate-bounce' : ''}>
          <ellipse cx="16" cy="42" rx="2.5" ry="7" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
          <ellipse cx="24" cy="42" rx="2.5" ry="7" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
          
          <ellipse cx="16" cy="50" rx="3" ry="2" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
          <ellipse cx="24" cy="50" rx="3" ry="2" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
        </g>
        
        {/* Token Skins Accessories */}
        {skin === 'inspector' && (
          <>
            <rect x="13" y="3" width="14" height="5" rx="1" fill="#8b4513" stroke="black" strokeWidth="1" />
            <rect x="10" y="7" width="20" height="2" fill="#8b4513" stroke="black" strokeWidth="1" />
          </>
        )}
        
        {skin === 'miami' && (
          <>
            <rect x="13" y="11" width="6" height="4" rx="1" fill="#222" stroke="black" strokeWidth="1" />
            <rect x="21" y="11" width="6" height="4" rx="1" fill="#222" stroke="black" strokeWidth="1" />
            <line x1="19" y1="13" x2="21" y2="13" stroke="black" strokeWidth="1" />
          </>
        )}
        
        {skin === 'ninja' && (
          <>
            <rect x="12" y="10" width="16" height="8" fill="#000" stroke="#ff0000" strokeWidth="1" />
            <line x1="8" y1="25" x2="8" y2="35" stroke="#c0c0c0" strokeWidth="2" />
          </>
        )}
        
        {skin === 'cyber' && (
          <>
            <rect x="12" y="11" width="16" height="4" rx="2" fill="#00ffff" stroke="#0080ff" strokeWidth="1" opacity="0.7" />
            <line x1="15" y1="30" x2="18" y2="33" stroke="#ff00ff" strokeWidth="0.5" />
            <line x1="22" y1="30" x2="25" y2="33" stroke="#ff00ff" strokeWidth="0.5" />
          </>
        )}
        
        {skin === 'royal' && (
          <>
            <path d="M 12 7 L 14 3 L 16 6 L 20 2 L 24 6 L 26 3 L 28 7 Z" fill="#ffd700" stroke="#ffa500" strokeWidth="1" />
            <path d="M 12 28 Q 8 35, 10 40 L 15 38 Z" fill="#800080" stroke="#4b0082" strokeWidth="1" />
          </>
        )}
        
        {skin === 'space' && (
          <>
            <ellipse cx="20" cy="15" rx="12" ry="11" fill="none" stroke="#00ff00" strokeWidth="1.5" opacity="0.5" />
            <line x1="20" y1="4" x2="20" y2="1" stroke="#00ff00" strokeWidth="1" />
            <circle cx="20" cy="1" r="1.5" fill="#00ff00" />
          </>
        )}
        
        {skin === 'vampire' && (
          <>
            <path d="M 10 22 L 8 28 L 12 26 Z" fill="#000" stroke="#8b0000" strokeWidth="1" />
            <path d="M 30 22 L 32 28 L 28 26 Z" fill="#000" stroke="#8b0000" strokeWidth="1" />
            <path d="M 18 20 L 17 22 L 19 21 Z" fill="white" />
            <path d="M 22 20 L 23 22 L 21 21 Z" fill="white" />
          </>
        )}
        
        {skin === 'pirate' && (
          <>
            <path d="M 10 7 L 12 4 L 28 4 L 30 7 Z" fill="#000" stroke="#8b4513" strokeWidth="1" />
            <ellipse cx="24" cy="12" rx="4" ry="4" fill="#000" />
            <line x1="20" y1="10" x2="28" y2="10" stroke="#000" strokeWidth="1" />
          </>
        )}
        
        {skin === 'wizard' && (
          <>
            <path d="M 20 0 L 12 8 L 28 8 Z" fill="#4169e1" stroke="#00008b" strokeWidth="1" />
            <ellipse cx="20" cy="8" rx="10" ry="2" fill="#ffd700" />
            <text x="18" y="6" fontSize="4" fill="#ffd700">★</text>
          </>
        )}
        
        {skin === 'knight' && (
          <>
            <rect x="14" y="8" width="12" height="10" rx="2" fill="#c0c0c0" stroke="#808080" strokeWidth="1" />
            <rect x="16" y="12" width="8" height="2" fill="#000" />
            <ellipse cx="10" cy="30" rx="3" ry="4" fill="#ffd700" stroke="#808080" strokeWidth="1" />
          </>
        )}
        
        {skin === 'samurai' && (
          <>
            <path d="M 12 8 L 10 5 L 15 5 L 20 3 L 25 5 L 30 5 L 28 8 Z" fill="#ff0000" stroke="#8b0000" strokeWidth="1" />
            <rect x="10" y="4" width="2" height="4" fill="#ffd700" />
            <rect x="28" y="4" width="2" height="4" fill="#ffd700" />
            <line x1="30" y1="25" x2="35" y2="30" stroke="#c0c0c0" strokeWidth="2" />
          </>
        )}
        
        {skin === 'robot' && (
          <>
            <line x1="20" y1="4" x2="20" y2="0" stroke="#708090" strokeWidth="1.5" />
            <circle cx="20" cy="0" r="2" fill="#00ff00" />
            <rect x="14" y="11" width="4" height="3" fill="#00ff00" />
            <rect x="22" y="11" width="4" height="3" fill="#00ff00" />
            <line x1="15" y1="30" x2="25" y2="30" stroke="#2f4f4f" strokeWidth="1" />
            <line x1="15" y1="33" x2="25" y2="33" stroke="#2f4f4f" strokeWidth="1" />
          </>
        )}
        
        {skin === 'diamond' && (
          <>
            <text x="10" y="10" fontSize="5" fill="#ffffff">✦</text>
            <text x="26" y="10" fontSize="5" fill="#ffffff">✦</text>
            <text x="18" y="22" fontSize="4" fill="#ffffff">✦</text>
            <ellipse cx="25" cy="15" rx="2" ry="2" fill="#ffffff" opacity="0.6" />
            <ellipse cx="15" cy="32" rx="1.5" ry="1.5" fill="#ffffff" opacity="0.6" />
          </>
        )}
        
        {skin === 'legendary' && (
          <>
            <ellipse cx="20" cy="30" rx="10" ry="14" fill="none" stroke="#ffd700" strokeWidth="2" opacity="0.4" className="animate-pulse" />
            <path d="M 12 7 L 14 2 L 16 6 L 20 1 L 24 6 L 26 2 L 28 7 Z" fill="#ffd700" stroke="#ff1493" strokeWidth="1" />
            <text x="8" y="15" fontSize="4" fill="#ffd700" className="animate-pulse">★</text>
            <text x="28" y="15" fontSize="4" fill="#ffd700" className="animate-pulse">★</text>
            <text x="18" y="25" fontSize="3" fill="#ffd700" className="animate-pulse">★</text>
            <path d="M 8 28 Q 4 30, 6 34 L 12 30 Z" fill="#ff1493" opacity="0.5" />
            <path d="M 32 28 Q 36 30, 34 34 L 28 30 Z" fill="#ff1493" opacity="0.5" />
          </>
        )}
        
        
        {skin === 'superman' && (
          <>
            {/* Superman Cape */}
            <path d="M 10 24 Q 4 30, 6 38 L 12 32 Z" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
            <path d="M 30 24 Q 36 30, 34 38 L 28 32 Z" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
            {/* S Symbol on chest */}
            <path d="M 17 28 L 18 26 L 22 26 L 23 28 L 21 30 L 19 30 Z" fill="#ffd700" stroke="#dc143c" strokeWidth="1" />
            <text x="18.5" y="29" fontSize="4" fill="#dc143c" fontWeight="bold">S</text>
            {/* Hair curl */}
            <path d="M 18 8 Q 17 6, 18 5" stroke={colors.dark} strokeWidth="1.5" fill="none" />
          </>
        )}
        
        {skin === 'harry-potter' && (
          <>
            {/* Wizard Robe */}
            <rect x="12" y="26" width="16" height="18" rx="2" fill="#740001" stroke="#4d0001" strokeWidth="1" />
            {/* Gryffindor Scarf */}
            <rect x="18" y="22" width="4" height="8" fill="#740001" />
            <line x1="18" y1="24" x2="22" y2="24" stroke="#d3a625" strokeWidth="1" />
            <line x1="18" y1="26" x2="22" y2="26" stroke="#d3a625" strokeWidth="1" />
            {/* Round Glasses */}
            <circle cx="16" cy="12" r="3" fill="none" stroke="#000" strokeWidth="1.5" />
            <circle cx="24" cy="12" r="3" fill="none" stroke="#000" strokeWidth="1.5" />
            <line x1="19" y1="12" x2="21" y2="12" stroke="#000" strokeWidth="1" />
            {/* Lightning Scar */}
            <path d="M 18 7 L 19 9 L 18 10" stroke="#dc143c" strokeWidth="1" fill="none" />
            {/* Magic Wand */}
            <line x1="8" y1="32" x2="5" y2="38" stroke="#8b4513" strokeWidth="1.5" />
          </>
        )}
        
        {skin === 'batman' && (
          <>
            {/* Batman Cape */}
            <path d="M 12 24 L 6 28 L 4 36 L 8 40 L 14 34 Z" fill="#000" stroke="#1c1c1c" strokeWidth="1" />
            <path d="M 28 24 L 34 28 L 36 36 L 32 40 L 26 34 Z" fill="#000" stroke="#1c1c1c" strokeWidth="1" />
            {/* Batman Mask */}
            <rect x="12" y="8" width="16" height="12" fill="#000" stroke="#1c1c1c" strokeWidth="1" />
            <ellipse cx="16" cy="13" rx="2" ry="3" fill="white" />
            <ellipse cx="24" cy="13" rx="2" ry="3" fill="white" />
            {/* Bat Ears */}
            <path d="M 12 8 L 10 2 L 14 6 Z" fill="#000" />
            <path d="M 28 8 L 30 2 L 26 6 Z" fill="#000" />
            {/* Bat Symbol */}
            <path d="M 20 30 L 17 28 L 15 30 L 17 32 L 20 33 L 23 32 L 25 30 L 23 28 Z" fill="#ffd700" stroke="#000" strokeWidth="0.5" />
          </>
        )}
        
        {skin === 'spiderman' && (
          <>
            {/* Spider Web Pattern on body */}
            <line x1="20" y1="22" x2="20" y2="38" stroke="#000" strokeWidth="0.5" />
            <line x1="15" y1="26" x2="25" y2="26" stroke="#000" strokeWidth="0.5" />
            <line x1="15" y1="30" x2="25" y2="30" stroke="#000" strokeWidth="0.5" />
            <line x1="15" y1="34" x2="25" y2="34" stroke="#000" strokeWidth="0.5" />
            {/* Spider Web on head */}
            <circle cx="20" cy="15" r="8" fill="none" stroke="#000" strokeWidth="0.5" />
            <line x1="20" y1="7" x2="20" y2="23" stroke="#000" strokeWidth="0.5" />
            <line x1="12" y1="15" x2="28" y2="15" stroke="#000" strokeWidth="0.5" />
            {/* Big Spider Eyes */}
            <ellipse cx="15" cy="12" rx="4" ry="5" fill="white" stroke="#000" strokeWidth="1" />
            <ellipse cx="25" cy="12" rx="4" ry="5" fill="white" stroke="#000" strokeWidth="1" />
            {/* Web shooters */}
            <rect x="10" y="28" width="2" height="3" fill="#2b3784" />
            <rect x="28" y="28" width="2" height="3" fill="#2b3784" />
          </>
        )}
        
        {skin === 'iron-man' && (
          <>
            {/* Iron Man Armor Lines */}
            <rect x="17" y="28" width="6" height="10" rx="1" fill="#ffd700" stroke="#a00000" strokeWidth="1" />
            <circle cx="20" cy="30" r="2" fill="#87ceeb" className="animate-pulse" />
            {/* Face Plate */}
            <rect x="14" y="10" width="12" height="8" rx="2" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
            <ellipse cx="17" cy="14" rx="2" ry="3" fill="#87ceeb" className="animate-pulse" />
            <ellipse cx="23" cy="14" rx="2" ry="3" fill="#87ceeb" className="animate-pulse" />
            {/* Glowing Arc Reactor */}
            <circle cx="20" cy="30" r="3" fill="none" stroke="#87ceeb" strokeWidth="1" className="animate-pulse" />
            {/* Repulsors on hands */}
            <circle cx="10" cy="32" r="1.5" fill="#87ceeb" className="animate-pulse" />
            <circle cx="30" cy="32" r="1.5" fill="#87ceeb" className="animate-pulse" />
          </>
        )}
        
        {skin === 'captain-america' && (
          <>
            {/* Shield on arm */}
            <circle cx="8" cy="30" r="5" fill="#dc143c" stroke="#003080" strokeWidth="1.5" />
            <circle cx="8" cy="30" r="3" fill="white" />
            <circle cx="8" cy="30" r="1.5" fill="#0047ab" />
            <text x="7" y="31" fontSize="3" fill="white">★</text>
            {/* Helmet with A */}
            <rect x="14" y="8" width="12" height="10" rx="2" fill="#0047ab" stroke="#003080" strokeWidth="1" />
            <text x="18" y="15" fontSize="5" fill="white" fontWeight="bold">A</text>
            {/* Wings on helmet */}
            <path d="M 13 12 L 10 13 L 12 14 Z" fill="white" />
            <path d="M 27 12 L 30 13 L 28 14 Z" fill="white" />
            {/* Stripes on body */}
            <line x1="15" y1="30" x2="25" y2="30" stroke="white" strokeWidth="1" />
            <line x1="15" y1="33" x2="25" y2="33" stroke="white" strokeWidth="1" />
          </>
        )}
        
        {skin === 'thor' && (
          <>
            {/* Mjolnir Hammer */}
            <rect x="30" y="30" width="6" height="4" rx="1" fill="#808080" stroke="#000" strokeWidth="1" />
            <line x1="33" y1="34" x2="33" y2="40" stroke="#8b4513" strokeWidth="2" />
            {/* Viking Helmet */}
            <rect x="14" y="8" width="12" height="8" rx="2" fill="#c0c0c0" stroke="#808080" strokeWidth="1" />
            {/* Horns */}
            <path d="M 14 10 Q 10 8, 10 5" stroke="#ffd700" strokeWidth="2" fill="none" />
            <path d="M 26 10 Q 30 8, 30 5" stroke="#ffd700" strokeWidth="2" fill="none" />
            {/* Cape */}
            <path d="M 12 24 Q 6 30, 8 38 L 14 32 Z" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
            <path d="M 28 24 Q 34 30, 32 38 L 26 32 Z" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
            {/* Lightning */}
            <path d="M 35 20 L 33 24 L 34 24 L 32 28" stroke="#ffd700" strokeWidth="1.5" fill="none" />
          </>
        )}
        
        {skin === 'hulk' && (
          <>
            {/* Torn Purple Pants */}
            <path d="M 14 38 L 14 46 L 16 48" fill="#8b008b" stroke="#4b0052" strokeWidth="1" />
            <path d="M 26 38 L 26 46 L 24 48" fill="#8b008b" stroke="#4b0052" strokeWidth="1" />
            {/* Angry Eyebrows */}
            <path d="M 13 10 L 17 11" stroke="#006400" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 27 10 L 23 11" stroke="#006400" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Clenched Fists */}
            <circle cx="10" cy="32" r="3" fill={colors.body} stroke={colors.dark} strokeWidth="1.5" />
            <circle cx="30" cy="32" r="3" fill={colors.body} stroke={colors.dark} strokeWidth="1.5" />
            {/* Muscles */}
            <ellipse cx="20" cy="30" rx="9" ry="13" fill="none" stroke="#006400" strokeWidth="1" />
          </>
        )}
        
        {skin === 'wonder-woman' && (
          <>
            {/* Tiara */}
            <rect x="14" y="8" width="12" height="2" fill="#ffd700" stroke="#a00000" strokeWidth="1" />
            <text x="18.5" y="9.5" fontSize="3" fill="#dc143c">★</text>
            {/* Lasso of Truth */}
            <path d="M 30 30 Q 35 32, 36 36 Q 34 38, 32 36" stroke="#ffd700" strokeWidth="1.5" fill="none" className="animate-pulse" />
            {/* Bracers */}
            <rect x="10" y="30" width="3" height="4" fill="#c0c0c0" stroke="#808080" strokeWidth="1" />
            <rect x="27" y="30" width="3" height="4" fill="#c0c0c0" stroke="#808080" strokeWidth="1" />
            {/* Cape */}
            <path d="M 12 24 Q 8 32, 10 38 L 14 32 Z" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
            <path d="M 28 24 Q 32 32, 30 38 L 26 32 Z" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
          </>
        )}
        
        {skin === 'flash' && (
          <>
            {/* Lightning Bolt Emblem */}
            <path d="M 21 26 L 19 30 L 21 30 L 19 34 L 23 30 L 21 30 Z" fill="#ffd700" stroke="#dc143c" strokeWidth="1" />
            {/* Winged Helmet */}
            <rect x="14" y="9" width="12" height="7" rx="2" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
            {/* Wings on sides */}
            <path d="M 13 12 Q 8 12, 7 14 Q 9 13, 13 14 Z" fill="#ffd700" stroke="#a00000" strokeWidth="0.5" />
            <path d="M 27 12 Q 32 12, 33 14 Q 31 13, 27 14 Z" fill="#ffd700" stroke="#a00000" strokeWidth="0.5" />
            {/* Speed Lines */}
            <line x1="5" y1="25" x2="10" y2="25" stroke="#ffd700" strokeWidth="1" opacity="0.7" />
            <line x1="4" y1="30" x2="9" y2="30" stroke="#ffd700" strokeWidth="1" opacity="0.7" />
            <line x1="5" y1="35" x2="10" y2="35" stroke="#ffd700" strokeWidth="1" opacity="0.7" />
          </>
        )}
        
        {skin === 'deadpool' && (
          <>
            {/* Deadpool Mask */}
            <ellipse cx="20" cy="15" rx="10" ry="9" fill="#dc143c" stroke="#a00000" strokeWidth="1.5" />
            {/* Eye Patches - big white ovals */}
            <ellipse cx="16" cy="13" rx="4" ry="5" fill="white" stroke="#000" strokeWidth="1.5" />
            <ellipse cx="24" cy="13" rx="4" ry="5" fill="white" stroke="#000" strokeWidth="1.5" />
            <ellipse cx="16" cy="13" rx="2" ry="3" fill="black" />
            <ellipse cx="24" cy="13" rx="2" ry="3" fill="black" />
            {/* Katanas on back */}
            <line x1="25" y1="20" x2="28" y2="10" stroke="#c0c0c0" strokeWidth="2" />
            <line x1="27" y1="20" x2="30" y2="10" stroke="#c0c0c0" strokeWidth="2" />
            {/* Belt with pouches */}
            <rect x="16" y="36" width="8" height="2" fill="#000" />
            <rect x="17" y="35" width="2" height="4" fill="#ffd700" />
            <rect x="21" y="35" width="2" height="4" fill="#ffd700" />
          </>
        )}
        
        {skin === 'joker' && (
          <>
            {/* Green Hair */}
            <ellipse cx="12" cy="6" rx="4" ry="3" fill="#228b22" stroke="#006400" strokeWidth="1" />
            <ellipse cx="20" cy="4" rx="5" ry="3" fill="#228b22" stroke="#006400" strokeWidth="1" />
            <ellipse cx="28" cy="6" rx="4" ry="3" fill="#228b22" stroke="#006400" strokeWidth="1" />
            {/* Wide Grin */}
            <path d="M 14 18 Q 20 22, 26 18" stroke="#dc143c" strokeWidth="2" fill="none" />
            <line x1="14" y1="18" x2="13" y2="16" stroke="#dc143c" strokeWidth="1.5" />
            <line x1="26" y1="18" x2="27" y2="16" stroke="#dc143c" strokeWidth="1.5" />
            {/* Playing Card */}
            <rect x="28" y="28" width="6" height="8" rx="1" fill="white" stroke="#000" strokeWidth="1" />
            <text x="29.5" y="33" fontSize="3" fill="#dc143c">HA</text>
            {/* Purple Suit */}
            <rect x="16" y="26" width="8" height="3" fill="#9370db" stroke="#4b0082" strokeWidth="1" />
          </>
        )}
        
        {skin === 'luke-skywalker' && (
          <>
            {/* Jedi Robe */}
            <rect x="12" y="26" width="16" height="18" rx="2" fill="#f5deb3" stroke="#d2b48c" strokeWidth="1" />
            {/* Belt */}
            <rect x="16" y="36" width="8" height="2" fill="#8b4513" />
            {/* Lightsaber - Blue */}
            <rect x="30" y="28" width="2" height="8" fill="#87ceeb" className="animate-pulse" stroke="#0047ab" strokeWidth="1" />
            <rect x="30" y="36" width="2" height="3" fill="#808080" stroke="#000" strokeWidth="1" />
            {/* Blonde Hair */}
            <ellipse cx="12" cy="8" rx="3" ry="4" fill="#ffd700" stroke="#d2b48c" strokeWidth="1" />
            <ellipse cx="28" cy="8" rx="3" ry="4" fill="#ffd700" stroke="#d2b48c" strokeWidth="1" />
            <ellipse cx="20" cy="6" rx="5" ry="2" fill="#ffd700" stroke="#d2b48c" strokeWidth="1" />
          </>
        )}
        
        {skin === 'darth-vader' && (
          <>
            {/* Black Cape */}
            <path d="M 10 24 L 4 28 L 2 38 L 8 42 L 14 36 Z" fill="#000" stroke="#1c1c1c" strokeWidth="1" />
            <path d="M 30 24 L 36 28 L 38 38 L 32 42 L 26 36 Z" fill="#000" stroke="#1c1c1c" strokeWidth="1" />
            {/* Vader Helmet */}
            <ellipse cx="20" cy="15" rx="10" ry="9" fill="#000" stroke="#1c1c1c" strokeWidth="1.5" />
            {/* Face Mask */}
            <rect x="16" y="12" width="8" height="8" rx="1" fill="#1c1c1c" stroke="#808080" strokeWidth="1" />
            {/* Triangular Mouth Piece */}
            <path d="M 18 16 L 20 20 L 22 16 Z" fill="#808080" />
            {/* Eyes - red glow */}
            <ellipse cx="17" cy="13" rx="2" ry="2" fill="#dc143c" className="animate-pulse" />
            <ellipse cx="23" cy="13" rx="2" ry="2" fill="#dc143c" className="animate-pulse" />
            {/* Control Panel on Chest */}
            <rect x="17" y="28" width="6" height="4" fill="#808080" stroke="#000" strokeWidth="1" />
            <circle cx="19" cy="30" r="0.5" fill="#dc143c" className="animate-pulse" />
            <circle cx="21" cy="30" r="0.5" fill="#00ff00" />
            {/* Red Lightsaber */}
            <rect x="6" y="28" width="2" height="8" fill="#dc143c" className="animate-pulse" stroke="#a00000" strokeWidth="1" />
            <rect x="6" y="36" width="2" height="3" fill="#808080" stroke="#000" strokeWidth="1" />
          </>
        )}
        
        {skin === 'mario' && (
          <>
            {/* Mario Hat - Red with M */}
            <ellipse cx="20" cy="8" rx="10" ry="3" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
            <rect x="14" y="8" width="12" height="5" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
            <circle cx="20" cy="10" r="3" fill="white" stroke="#000" strokeWidth="1" />
            <text x="18.5" y="11.5" fontSize="3" fill="#dc143c" fontWeight="bold">M</text>
            {/* Mustache */}
            <ellipse cx="16" cy="17" rx="3" ry="2" fill="#000" />
            <ellipse cx="24" cy="17" rx="3" ry="2" fill="#000" />
            {/* Overalls */}
            <rect x="16" y="26" width="8" height="12" fill="#0047ab" stroke="#003080" strokeWidth="1" />
            <circle cx="18" cy="28" r="1" fill="#ffd700" />
            <circle cx="22" cy="28" r="1" fill="#ffd700" />
            {/* Gloves */}
            <ellipse cx="10" cy="30" rx="3" ry="2" fill="white" stroke="#000" strokeWidth="1" />
            <ellipse cx="30" cy="30" rx="3" ry="2" fill="white" stroke="#000" strokeWidth="1" />
          </>
        )}
        
        {skin === 'sonic' && (
          <>
            {/* Spiky Blue Hair */}
            <path d="M 15 8 L 12 4 L 15 6 Z" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
            <path d="M 20 5 L 18 1 L 20 3 Z" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
            <path d="M 25 8 L 28 4 L 25 6 Z" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
            <path d="M 10 12 L 7 10 L 10 11 Z" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
            <path d="M 30 12 L 33 10 L 30 11 Z" fill={colors.body} stroke={colors.dark} strokeWidth="1" />
            {/* Bigger eyes - Sonic style */}
            <ellipse cx="16" cy="13" rx="4" ry="5" fill="white" stroke={colors.dark} strokeWidth="1.5" />
            <ellipse cx="24" cy="13" rx="4" ry="5" fill="white" stroke={colors.dark} strokeWidth="1.5" />
            <ellipse cx="16" cy="14" rx="2" ry="3" fill="#00ff00" />
            <ellipse cx="24" cy="14" rx="2" ry="3" fill="#00ff00" />
            <ellipse cx="17" cy="13" rx="1" ry="1.5" fill="black" />
            <ellipse cx="25" cy="13" rx="1" ry="1.5" fill="black" />
            {/* Red Shoes */}
            <ellipse cx="16" cy="50" rx="4" ry="2.5" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
            <ellipse cx="24" cy="50" rx="4" ry="2.5" fill="#dc143c" stroke="#a00000" strokeWidth="1" />
            <ellipse cx="16" cy="49" rx="3" ry="1.5" fill="white" />
            <ellipse cx="24" cy="49" rx="3" ry="1.5" fill="white" />
            {/* Speed Lines */}
            <line x1="2" y1="28" x2="8" y2="28" stroke={colors.accent} strokeWidth="1" opacity="0.7" />
            <line x1="1" y1="32" x2="7" y2="32" stroke={colors.accent} strokeWidth="1" opacity="0.7" />
          </>
        )}
        
        {isSlowed && (
          <text x="20" y="5" textAnchor="middle" fontSize="8" fill="#3b82f6">💫</text>
        )}
      </svg>
    </div>
  )
}
