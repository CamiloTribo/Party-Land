'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '~/components/ui/Button'
import PinkPantherPlayer from '../PinkPantherPlayer'
import AnimatedObstacle from '../AnimatedObstacle'
import { SoundManager } from '~/lib/sounds'
import { drawThemeDecorations } from './ThemeDecorations'

interface GameScreenProps {
  onGameOver: (score: number) => void
  onVictory: (score: number) => void
  soundEnabled: boolean
  selectedSkin: string
  selectedTheme: string
}

interface Floor {
  y: number
  gapPosition: number
  gapSize: number
  hasObstacle: boolean
  obstacleType?: 'guard' | 'dog'
  obstacleX?: number
  obstacleDirection?: number
}

const getThemeColors = (theme: string) => {
  const themeMap: Record<string, { top: string; bottom: string; decorations?: string[] }> = {
    // Free token themes
    'classic-pink': { top: '#831843', bottom: '#be185d' },
    'ocean-blue': { top: '#0c4a6e', bottom: '#0369a1' },
    'forest-green': { top: '#14532d', bottom: '#15803d' },
    'sunset-orange': { top: '#7c2d12', bottom: '#c2410c' },
    // Premium token themes
    'royal-purple': { top: '#581c87', bottom: '#6b21a8' },
    'fire-red': { top: '#7f1d1d', bottom: '#991b1b' },
    'cyber-neon': { top: '#164e63', bottom: '#6b21a8' },
    'golden-luxury': { top: '#713f12', bottom: '#a16207' },
    'midnight-dark': { top: '#334155', bottom: '#0f172a' },
    'candy-pop': { top: '#ec4899', bottom: '#3b82f6' },
    'toxic-slime': { top: '#65a30d', bottom: '#15803d' },
    'arctic-ice': { top: '#67e8f9', bottom: '#0ea5e9' },
    'lava-flow': { top: '#ea580c', bottom: '#18181b' },
    'galaxy-space': { top: '#312e81', bottom: '#ec4899' },
    'rainbow-dream': { top: '#ef4444', bottom: '#8b5cf6' },
    'diamond-shine': { top: '#e5e7eb', bottom: '#a78bfa' },
    // USDC exclusive themes with decorations
    'gotham-city': {
      top: '#232526',
      bottom: '#434343',
      decorations: ['bat-signal', 'city-silhouette']
    },
    'metropolis-sky': {
      top: '#2563eb',
      bottom: '#f43f5e',
      decorations: ['s-symbol', 'clouds']
    },
    'spider-web': {
      top: '#be123c',
      bottom: '#2563eb',
      decorations: ['web-pattern', 'spider']
    },
    'arc-reactor': {
      top: '#f59e42',
      bottom: '#be123c',
      decorations: ['arc-reactor', 'tech-grid']
    },
    'gamma-rage': {
      top: '#22d3ee',
      bottom: '#a21caf',
      decorations: ['fist', 'cracks']
    },
    'asgard-thunder': {
      top: '#fbbf24',
      bottom: '#2563eb',
      decorations: ['hammer', 'lightning']
    },
    'hogwarts-magic': {
      top: '#f59e42',
      bottom: '#be123c',
      decorations: ['wand', 'stars', 'castle']
    },
    'the-force': {
      top: '#2563eb',
      bottom: '#be123c',
      decorations: ['lightsaber', 'death-star']
    },
    'matrix-code': {
      top: '#0f2027',
      bottom: '#00ff99',
      decorations: ['green-code', 'matrix-rain']
    },
    'chaotic-madness': {
      top: '#a21caf',
      bottom: '#22d3ee',
      decorations: ['cards', 'smile']
    },
    'speed-force': {
      top: '#fbbf24',
      bottom: '#be123c',
      decorations: ['lightning-bolt', 'speed-lines']
    },
    'merc-style': {
      top: '#be123c',
      bottom: '#0f172a',
      decorations: ['swords', 'logo']
    },
    'amazonian-warrior': {
      top: '#f43f5e',
      bottom: '#2563eb',
      decorations: ['tiara', 'stars', 'lasso']
    },
    'star-spangled': {
      top: '#2563eb',
      bottom: '#f43f5e',
      decorations: ['shield', 'star']
    },
    'sonic-boom': {
      top: '#2563eb',
      bottom: '#fbbf24',
      decorations: ['rings', 'speed-blur']
    },
    'mushroom-kingdom': {
      top: '#be123c',
      bottom: '#22c55e',
      decorations: ['mushroom', 'coin', 'brick']
    },
  }
  return themeMap[theme] || themeMap['classic-pink']
}

export default function GameScreen({ onGameOver, onVictory, soundEnabled, selectedSkin, selectedTheme }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number | null>(null)
  const [currentFloor, setCurrentFloor] = useState(100)
  const [floorsDescended, setFloorsDescended] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(3)

  const [playerScreenPos, setPlayerScreenPos] = useState({ x: 150, y: 100 })
  const [isMoving, setIsMoving] = useState(false)
  const [isFalling, setIsFalling] = useState(false)
  const [playerDirection, setPlayerDirection] = useState<'left' | 'right'>('right')

  const gameStateRef = useRef({
    playerX: 150,
    playerY: 100,
    playerVelocityY: 0,
    floors: [] as Floor[],
    cameraY: 0,
    isGameOver: false,
    currentFloor: 100,
    playerWidth: 40,
    playerHeight: 50,
    floorHeight: 20,
    gravity: 0.8,
    moveSpeed: 16,
    isMovingLeft: false,
    isMovingRight: false,
    gameStarted: false,
    isOnGround: false,
    laserY: -200,
    laserSpeed: 2,
    laserActive: false,
    laserActivationDelay: 2000,
    isSlowed: false,
    slowEndTime: 0,
    normalMoveSpeed: 16,
  })

  const generateFloor = useCallback((floorNumber: number): Floor => {
    const difficulty = Math.max(0, (100 - floorNumber) / 100)
    const gapSize = 80 - difficulty * 30
    const hasObstacle = Math.random() < difficulty * 0.8

    let obstacleType: 'guard' | 'dog' | undefined
    if (hasObstacle) {
      const rand = Math.random()
      if (rand < 0.6) obstacleType = 'guard'
      else obstacleType = 'dog'
    }

    return {
      y: (100 - floorNumber) * 100,
      gapPosition: Math.floor(Math.random() * 3),
      gapSize,
      hasObstacle,
      obstacleType,
      obstacleX: Math.random() * 200 + 50,
      obstacleDirection: Math.random() > 0.5 ? 1 : -1,
    }
  }, [])

  const soundManagerRef = useRef<SoundManager>(new SoundManager(soundEnabled))

  useEffect(() => {
    soundManagerRef.current.setEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    const floors: Floor[] = []
    for (let i = 100; i >= 0; i--) {
      floors.push(generateFloor(i))
    }
    gameStateRef.current.floors = floors
  }, [generateFloor])

  useEffect(() => {
    if (countdown === null) return

    if (countdown > 0) {
      soundManagerRef.current.countdown()
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      soundManagerRef.current.countdownGo()
      const timer = setTimeout(() => {
        setCountdown(null)
        gameStateRef.current.gameStarted = true

        setTimeout(() => {
          gameStateRef.current.laserActive = true
        }, 2000)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const drawBrickPlatform = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    const brickWidth = 30
    const brickHeight = 10
    const mortarSize = 2

    ctx.fillStyle = '#92400e'
    ctx.fillRect(x, y, width, height)

    for (let row = 0; row < Math.ceil(height / brickHeight); row++) {
      const offsetX = (row % 2) * (brickWidth / 2)
      for (let col = 0; col < Math.ceil((width + brickWidth) / brickWidth); col++) {
        const brickX = x + col * brickWidth + offsetX
        const brickY = y + row * brickHeight

        if (brickX >= x + width) continue

        ctx.fillStyle = '#78350f'
        ctx.fillRect(
          brickX,
          brickY,
          Math.min(brickWidth - mortarSize, x + width - brickX),
          brickHeight - mortarSize
        )

        ctx.fillStyle = '#451a03'
        ctx.fillRect(brickX, brickY, Math.min(brickWidth - mortarSize, x + width - brickX), 2)
        ctx.fillRect(brickX, brickY, 2, brickHeight - mortarSize)
      }
    }
  }, [])

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = gameStateRef.current
    if (state.isGameOver) return

    const themeColors = getThemeColors(selectedTheme)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, themeColors.top)
    gradient.addColorStop(1, themeColors.bottom)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw theme decorations for USDC premium themes
    drawThemeDecorations(ctx, selectedTheme, themeColors, canvas.width, canvas.height, state.cameraY)

    if (!state.gameStarted) {
      drawBrickPlatform(ctx, 0, 180, canvas.width, 20)
      setPlayerScreenPos({ x: state.playerX, y: state.playerY })
      requestRef.current = requestAnimationFrame(gameLoop)
      return
    }

    if (state.laserActive) {
      const progress = (100 - state.currentFloor) / 100
      state.laserSpeed = 2.5 + progress * 5
      state.laserY += state.laserSpeed
    }

    if (state.isSlowed && Date.now() > state.slowEndTime) {
      state.isSlowed = false
      state.moveSpeed = state.normalMoveSpeed
    }

    state.playerVelocityY += state.gravity

    if (state.isMovingLeft) {
      state.playerX -= state.moveSpeed
      setPlayerDirection('left')
    }
    if (state.isMovingRight) {
      state.playerX += state.moveSpeed
      setPlayerDirection('right')
    }

    setIsMoving(state.isMovingLeft || state.isMovingRight)
    setIsFalling(!state.isOnGround)

    state.playerX = Math.max(20, Math.min(canvas.width - 60, state.playerX))
    state.playerY += state.playerVelocityY
    state.isOnGround = false

    for (const floor of state.floors) {
      const floorTop = floor.y
      const floorBottom = floor.y + state.floorHeight

      if (state.playerVelocityY > 0 &&
        state.playerY + state.playerHeight >= floorTop &&
        state.playerY + state.playerHeight <= floorBottom + 10) {

        let gapLeft = 0
        let gapRight = 0

        if (floor.gapPosition === 0) {
          gapLeft = 0
          gapRight = floor.gapSize
        } else if (floor.gapPosition === 1) {
          gapLeft = (canvas.width - floor.gapSize) / 2
          gapRight = gapLeft + floor.gapSize
        } else {
          gapLeft = canvas.width - floor.gapSize
          gapRight = canvas.width
        }

        const playerCenter = state.playerX + state.playerWidth / 2

        if (playerCenter < gapLeft || playerCenter > gapRight) {
          state.playerY = floorTop - state.playerHeight
          state.playerVelocityY = 0
          state.isOnGround = true

          const floorNumber = 100 - Math.round((floor.y / 100))
          if (floorNumber !== state.currentFloor) {
            state.currentFloor = floorNumber
            setCurrentFloor(floorNumber)
            const descended = 100 - floorNumber
            setFloorsDescended(descended)
            soundManagerRef.current.floorPass()
          }

          break
        }
      }

      if (floor.hasObstacle && state.gameStarted) {
        const obstacleX = floor.obstacleX || 0
        const obstacleY = floor.y - 40

        if (state.playerX < obstacleX + 40 &&
          state.playerX + state.playerWidth > obstacleX &&
          state.playerY < obstacleY + 40 &&
          state.playerY + state.playerHeight > obstacleY) {

          if (!state.isSlowed) {
            state.isSlowed = true
            state.slowEndTime = Date.now() + 1000
            state.moveSpeed = state.normalMoveSpeed * 0.4
            soundManagerRef.current.collision()
          }
        }

        if (floor.obstacleType === 'guard') {
          floor.obstacleX = obstacleX + (floor.obstacleDirection || 1) * 4
          if (floor.obstacleX < 20 || floor.obstacleX > canvas.width - 60) {
            floor.obstacleDirection = -(floor.obstacleDirection || 1)
          }
        }
      }
    }

    if (state.laserActive && state.gameStarted) {
      const laserHeight = 5

      if (state.playerY < state.laserY + laserHeight &&
        state.playerY + state.playerHeight > state.laserY) {
        state.isGameOver = true
        soundManagerRef.current.gameOver()
        onGameOver(floorsDescended)
        return
      }
    }

    if (state.playerY >= 10000) {
      state.isGameOver = true
      soundManagerRef.current.victory()
      onVictory(100)
      return
    }

    state.cameraY = state.playerY - 250

    ctx.save()

    for (let i = 100; i >= 0; i -= 5) {
      if (i === 0 || i === 100) continue

      const floorY = (100 - i) * 100
      const screenY = floorY - state.cameraY

      if (screenY < -100 || screenY > canvas.height + 100) continue

      const plaqueWidth = 160
      const plaqueHeight = 50
      const plaqueX = canvas.width / 2 - plaqueWidth / 2
      const plaqueY = screenY - 25

      ctx.fillStyle = 'rgba(30, 58, 138, 0.9)'
      ctx.fillRect(plaqueX, plaqueY, plaqueWidth, plaqueHeight)

      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 3
      ctx.strokeRect(plaqueX, plaqueY, plaqueWidth, plaqueHeight)

      ctx.strokeStyle = '#1e3a8a'
      ctx.lineWidth = 1
      ctx.strokeRect(plaqueX + 4, plaqueY + 4, plaqueWidth - 8, plaqueHeight - 8)

      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillText(`FLOOR ${i}`, canvas.width / 2 + 2, screenY + 2)

      ctx.fillStyle = '#fbbf24'
      ctx.fillText(`FLOOR ${i}`, canvas.width / 2, screenY)
    }
    ctx.restore()

    for (const floor of state.floors) {
      const floorScreenY = floor.y - state.cameraY

      if (floorScreenY < -50 || floorScreenY > canvas.height + 50) continue

      let gapLeft = 0
      let gapRight = 0

      if (floor.gapPosition === 0) {
        gapLeft = 0
        gapRight = floor.gapSize
      } else if (floor.gapPosition === 1) {
        gapLeft = (canvas.width - floor.gapSize) / 2
        gapRight = gapLeft + floor.gapSize
      } else {
        gapLeft = canvas.width - floor.gapSize
        gapRight = canvas.width
      }

      if (gapLeft > 0) {
        drawBrickPlatform(ctx, 0, floorScreenY, gapLeft, state.floorHeight)
      }

      if (gapRight < canvas.width) {
        drawBrickPlatform(ctx, gapRight, floorScreenY, canvas.width - gapRight, state.floorHeight)
      }
    }

    if (state.laserActive) {
      const laserScreenY = state.laserY - state.cameraY

      ctx.shadowBlur = 20
      ctx.shadowColor = '#ef4444'

      ctx.fillStyle = '#ef4444'
      ctx.fillRect(0, laserScreenY - 2, canvas.width, 5)

      ctx.shadowBlur = 0

      ctx.fillStyle = '#fef08a'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⚠ LASER ⚠', canvas.width / 2, laserScreenY - 15)
    }

    const playerScreenY = state.playerY - state.cameraY
    setPlayerScreenPos({ x: state.playerX, y: playerScreenY })

    requestRef.current = requestAnimationFrame(gameLoop)
  }, [onGameOver, onVictory, floorsDescended, drawBrickPlatform, selectedTheme])

  const handleLeftPress = () => {
    gameStateRef.current.isMovingLeft = true
  }

  const handleLeftRelease = () => {
    gameStateRef.current.isMovingLeft = false
  }

  const handleRightPress = () => {
    gameStateRef.current.isMovingRight = true
  }

  const handleRightRelease = () => {
    gameStateRef.current.isMovingRight = false
  }

  const handleTouchStart = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      handleLeftPress()
    } else {
      handleRightPress()
    }
  }

  const handleTouchEnd = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      handleLeftRelease()
    } else {
      handleRightRelease()
    }
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [gameLoop])

  return (
    <div
      className="fixed inset-0 flex flex-col bg-slate-900 select-none touch-none"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        touchAction: 'none'
      }}
    >
      {countdown !== null && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center">
            {countdown > 0 ? (
              <div className="text-9xl font-black text-yellow-300 drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] animate-pulse">
                {countdown}
              </div>
            ) : (
              <div className="text-7xl font-black text-pink-500 drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] animate-bounce">
                GO!
              </div>
            )}
          </div>
        </div>
      )}

      {/* UI Overlay */}
      <div className="absolute top-4 left-0 w-full flex justify-center pointer-events-none z-20">
        <div className="bg-pink-600 text-white px-8 py-2 rounded-3xl font-black text-xl shadow-lg border-4 border-white/20 flex flex-col items-center min-w-[160px]">
          <div className="text-2xl drop-shadow-md">FLOOR {currentFloor}</div>
          <div className="text-white/90 text-sm font-bold">
            Score: {floorsDescended}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <canvas
          ref={canvasRef}
          width={360}
          height={640}
          className="border-4 border-pink-600 rounded-lg shadow-2xl max-h-[90vh] bg-slate-800"
        />

        <div className="absolute" style={{
          width: '360px',
          height: '640px',
          pointerEvents: 'none',
        }}>
          {gameStateRef.current.floors.map((floor, index) => {
            if (!floor.hasObstacle) return null

            const floorScreenY = floor.y - gameStateRef.current.cameraY
            if (floorScreenY < -100 || floorScreenY > 700) return null

            const obstacleScreenY = floorScreenY - 40

            return (
              <AnimatedObstacle
                key={index}
                x={floor.obstacleX || 0}
                y={obstacleScreenY}
                type={floor.obstacleType || 'guard'}
                direction={floor.obstacleDirection}
              />
            )
          })}
        </div>

        <div className="absolute" style={{
          width: '360px',
          height: '640px',
          pointerEvents: 'none',
        }}>
          <PinkPantherPlayer
            x={playerScreenPos.x}
            y={playerScreenPos.y}
            isMoving={isMoving}
            isSlowed={gameStateRef.current.isSlowed}
            isFalling={isFalling}
            direction={playerDirection}
            skin={selectedSkin}
          />
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-32 px-8 z-20">
        <Button
          size="lg"
          className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 hover:from-pink-400 hover:to-pink-600 shadow-[0_8px_30px_rgba(236,72,153,0.5)] active:scale-90 transition-all select-none touch-manipulation border-4 border-white/30 flex items-center justify-center"
          onMouseDown={handleLeftPress}
          onMouseUp={handleLeftRelease}
          onMouseLeave={handleLeftRelease}
          onTouchStart={() => handleTouchStart('left')}
          onTouchEnd={() => handleTouchEnd('left')}
        >
          <ChevronLeft className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={3} />
        </Button>

        <Button
          size="lg"
          className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 hover:from-pink-400 hover:to-pink-600 shadow-[0_8px_30px_rgba(236,72,153,0.5)] active:scale-90 transition-all select-none touch-manipulation border-4 border-white/30 flex items-center justify-center"
          onMouseDown={handleRightPress}
          onMouseUp={handleRightRelease}
          onMouseLeave={handleRightRelease}
          onTouchStart={() => handleTouchStart('right')}
          onTouchEnd={() => handleTouchEnd('right')}
        >
          <ChevronRight className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={3} />
        </Button>
      </div>
    </div>
  )
}
