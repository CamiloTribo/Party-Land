/**
 * Draws theme-specific decorations on the game canvas
 * Used for USDC-exclusive premium themes
 */
export const drawThemeDecorations = (
  ctx: CanvasRenderingContext2D,
  theme: string,
  themeInfo: { top: string; bottom: string; decorations?: string[] },
  canvasWidth: number,
  canvasHeight: number,
  cameraY: number
) => {
  if (!themeInfo.decorations) return

  ctx.save()

  // Draw decorations every 3 floors so they appear frequently
  for (let floorNum = 0; floorNum <= 100; floorNum += 3) {
    const decorationY = (100 - floorNum) * 100 - cameraY

    // Only draw decorations visible on screen
    if (decorationY < -200 || decorationY > canvasHeight + 200) continue

    ctx.globalAlpha = 0.2 + (Math.sin(floorNum) * 0.05)

    for (const decoration of themeInfo.decorations) {
      // Vary horizontal position based on floor number
      const offsetX = (floorNum % 3) * 80

      switch (decoration) {
        case 'bat-signal':
          ctx.fillStyle = '#fbbf24'
          ctx.beginPath()
          ctx.arc(canvasWidth - 50 - offsetX, decorationY + 50, 30, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#000000'
          ctx.fillRect(canvasWidth - 60 - offsetX, decorationY + 45, 20, 10)
          ctx.fillRect(canvasWidth - 50 - offsetX, decorationY + 40, 15, 5)
          break

        case 'city-silhouette':
          ctx.fillStyle = '#000000'
          for (let i = 0; i < 3; i++) {
            const x = i * 100 + offsetX
            if (x > canvasWidth) continue
            const height = 60 + (floorNum % 3) * 20
            ctx.fillRect(x, decorationY + 100, 80, height)
            ctx.fillStyle = '#fbbf24'
            for (let w = 0; w < 3; w++) {
              for (let h = 0; h < 3; h++) {
                if (Math.random() > 0.6) {
                  ctx.fillRect(x + 10 + w * 20, decorationY + 110 + h * 15, 8, 10)
                }
              }
            }
            ctx.fillStyle = '#000000'
          }
          break

        case 's-symbol':
          ctx.fillStyle = '#fbbf24'
          ctx.beginPath()
          ctx.moveTo(50 + offsetX, decorationY + 50)
          ctx.lineTo(70 + offsetX, decorationY + 30)
          ctx.lineTo(90 + offsetX, decorationY + 50)
          ctx.lineTo(90 + offsetX, decorationY + 90)
          ctx.lineTo(70 + offsetX, decorationY + 110)
          ctx.lineTo(50 + offsetX, decorationY + 90)
          ctx.closePath()
          ctx.fill()
          ctx.fillStyle = '#dc2626'
          ctx.font = 'bold 40px serif'
          ctx.fillText('S', 60 + offsetX, decorationY + 80)
          break

        case 'clouds':
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(50 + offsetX, decorationY, 15, 0, Math.PI * 2)
          ctx.arc(65 + offsetX, decorationY, 20, 0, Math.PI * 2)
          ctx.arc(80 + offsetX, decorationY, 15, 0, Math.PI * 2)
          ctx.fill()
          break

        case 'web-pattern':
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          const webX = 40 + offsetX
          const webY = decorationY + 40
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            ctx.beginPath()
            ctx.moveTo(webX, webY)
            ctx.lineTo(webX + Math.cos(angle) * 50, webY + Math.sin(angle) * 50)
            ctx.stroke()
          }
          for (let r = 12; r < 50; r += 12) {
            ctx.beginPath()
            ctx.arc(webX, webY, r, 0, Math.PI * 2)
            ctx.stroke()
          }
          break

        case 'spider':
          ctx.fillStyle = '#000000'
          const spiderX = canvasWidth - 40 - offsetX
          ctx.beginPath()
          ctx.arc(spiderX, decorationY + 40, 6, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 2
          for (let i = 0; i < 4; i++) {
            ctx.beginPath()
            ctx.moveTo(spiderX, decorationY + 40)
            ctx.lineTo(spiderX - 15 + i * 3, decorationY + 30 - i * 2)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(spiderX, decorationY + 40)
            ctx.lineTo(spiderX + 5 - i * 3, decorationY + 30 - i * 2)
            ctx.stroke()
          }
          break

        case 'arc-reactor':
          const reactorX = canvasWidth / 2 + (floorNum % 2 === 0 ? 80 : -80)
          ctx.fillStyle = '#60a5fa'
          ctx.beginPath()
          ctx.arc(reactorX, decorationY + 50, 20, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(reactorX, decorationY + 50, 8, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#60a5fa'
          ctx.lineWidth = 2
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            ctx.beginPath()
            ctx.moveTo(reactorX + Math.cos(angle) * 12, decorationY + 50 + Math.sin(angle) * 12)
            ctx.lineTo(reactorX + Math.cos(angle) * 20, decorationY + 50 + Math.sin(angle) * 20)
            ctx.stroke()
          }
          break

        case 'tech-grid':
          ctx.strokeStyle = '#60a5fa'
          ctx.lineWidth = 1
          ctx.globalAlpha = 0.1
          for (let i = 0; i < canvasWidth; i += 30) {
            ctx.beginPath()
            ctx.moveTo(i, decorationY)
            ctx.lineTo(i, decorationY + 100)
            ctx.stroke()
          }
          ctx.globalAlpha = 0.2
          break

        case 'hammer':
          const hammerX = canvasWidth - 70 - offsetX
          ctx.fillStyle = '#94a3b8'
          ctx.fillRect(hammerX, decorationY + 30, 15, 50)
          ctx.fillRect(hammerX - 8, decorationY + 20, 30, 25)
          ctx.fillStyle = '#fbbf24'
          ctx.fillRect(hammerX - 2, decorationY + 22, 20, 3)
          break

        case 'lightning':
          ctx.strokeStyle = '#fbbf24'
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.moveTo(60 + offsetX, decorationY)
          ctx.lineTo(50 + offsetX, decorationY + 30)
          ctx.lineTo(60 + offsetX, decorationY + 30)
          ctx.lineTo(50 + offsetX, decorationY + 60)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(canvasWidth - 60 - offsetX, decorationY + 20)
          ctx.lineTo(canvasWidth - 70 - offsetX, decorationY + 50)
          ctx.lineTo(canvasWidth - 60 - offsetX, decorationY + 50)
          ctx.lineTo(canvasWidth - 70 - offsetX, decorationY + 80)
          ctx.stroke()
          break

        case 'wand':
          ctx.strokeStyle = '#92400e'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(40 + offsetX, decorationY + 60)
          ctx.lineTo(55 + offsetX, decorationY + 20)
          ctx.stroke()
          ctx.fillStyle = '#fbbf24'
          ctx.beginPath()
          ctx.arc(55 + offsetX, decorationY + 20, 4, 0, Math.PI * 2)
          ctx.fill()
          // Sparkles
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = '#fbbf24'
            ctx.beginPath()
            ctx.arc(60 + offsetX + i * 8, decorationY + 15 - i * 5, 2, 0, Math.PI * 2)
            ctx.fill()
          }
          break

        case 'stars':
          ctx.fillStyle = '#fbbf24'
          for (let i = 0; i < 5; i++) {
            const starX = 40 + i * 60 + offsetX
            const starY = decorationY + 30 + (i % 2) * 20
            if (starX > canvasWidth) continue
            ctx.beginPath()
            ctx.moveTo(starX, starY - 4)
            ctx.lineTo(starX + 1.5, starY)
            ctx.lineTo(starX + 4, starY)
            ctx.lineTo(starX + 1.5, starY + 1.5)
            ctx.lineTo(starX + 2.5, starY + 4)
            ctx.lineTo(starX, starY + 2.5)
            ctx.lineTo(starX - 2.5, starY + 4)
            ctx.lineTo(starX - 1.5, starY + 1.5)
            ctx.lineTo(starX - 4, starY)
            ctx.lineTo(starX - 1.5, starY)
            ctx.closePath()
            ctx.fill()
          }
          break

        case 'castle':
          ctx.fillStyle = '#1c1917'
          const castleX = canvasWidth - 100 - offsetX
          ctx.fillRect(castleX, decorationY + 50, 80, 100)
          ctx.fillRect(castleX + 10, decorationY + 30, 15, 20)
          ctx.fillRect(castleX + 35, decorationY + 40, 15, 15)
          ctx.fillRect(castleX + 55, decorationY + 20, 15, 30)
          // Windows
          ctx.fillStyle = '#fbbf24'
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(castleX + 15 + i * 20, decorationY + 70, 8, 12)
            ctx.fillRect(castleX + 15 + i * 20, decorationY + 100, 8, 12)
          }
          break

        case 'lightsaber':
          ctx.lineWidth = 5
          ctx.strokeStyle = '#3b82f6'
          ctx.beginPath()
          ctx.moveTo(40 + offsetX, decorationY + 20)
          ctx.lineTo(80 + offsetX, decorationY + 80)
          ctx.stroke()
          ctx.strokeStyle = '#dc2626'
          ctx.beginPath()
          ctx.moveTo(80 + offsetX, decorationY + 20)
          ctx.lineTo(40 + offsetX, decorationY + 80)
          ctx.stroke()
          break

        case 'death-star':
          const deathStarX = canvasWidth - 50 - offsetX
          ctx.fillStyle = '#64748b'
          ctx.beginPath()
          ctx.arc(deathStarX, decorationY + 40, 25, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#475569'
          ctx.beginPath()
          ctx.arc(deathStarX - 5, decorationY + 45, 7, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#334155'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(deathStarX, decorationY + 40, 25, 0, Math.PI * 2)
          ctx.stroke()
          break

        case 'green-code':
        case 'matrix-rain':
          ctx.fillStyle = '#22c55e'
          ctx.font = '10px monospace'
          for (let i = 0; i < 10; i++) {
            const x = i * 35 + offsetX
            if (x > canvasWidth) continue
            for (let j = 0; j < 4; j++) {
              ctx.fillText(String.fromCharCode(33 + Math.random() * 94), x, decorationY + j * 20)
            }
          }
          break

        case 'cards':
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(30 + offsetX, decorationY + 40, 18, 26)
          ctx.fillRect(55 + offsetX, decorationY + 45, 18, 26)
          ctx.fillStyle = '#dc2626'
          ctx.font = '14px sans-serif'
          ctx.fillText('A♥', 33 + offsetX, decorationY + 58)
          ctx.fillText('J♠', 58 + offsetX, decorationY + 63)
          break

        case 'smile':
          ctx.strokeStyle = '#dc2626'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(canvasWidth / 2, decorationY + 50, 35, 0, Math.PI)
          ctx.stroke()
          ctx.fillStyle = '#fbbf24'
          ctx.beginPath()
          ctx.arc(canvasWidth / 2 - 15, decorationY + 40, 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(canvasWidth / 2 + 15, decorationY + 40, 4, 0, Math.PI * 2)
          ctx.fill()
          break

        case 'lightning-bolt':
          ctx.fillStyle = '#fbbf24'
          const boltX = canvasWidth / 2 + (floorNum % 2 === 0 ? 70 : -70)
          ctx.beginPath()
          ctx.moveTo(boltX, decorationY + 20)
          ctx.lineTo(boltX - 12, decorationY + 45)
          ctx.lineTo(boltX + 3, decorationY + 45)
          ctx.lineTo(boltX - 8, decorationY + 70)
          ctx.lineTo(boltX + 15, decorationY + 35)
          ctx.lineTo(boltX + 8, decorationY + 35)
          ctx.closePath()
          ctx.fill()
          break

        case 'speed-lines':
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          for (let i = 0; i < 6; i++) {
            const y = decorationY + 30 + i * 10
            ctx.beginPath()
            ctx.moveTo(offsetX, y)
            ctx.lineTo(offsetX + 40, y + 3)
            ctx.stroke()
          }
          break

        case 'swords':
          ctx.strokeStyle = '#94a3b8'
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.moveTo(35 + offsetX, decorationY + 20)
          ctx.lineTo(50 + offsetX, decorationY + 70)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(60 + offsetX, decorationY + 20)
          ctx.lineTo(45 + offsetX, decorationY + 70)
          ctx.stroke()
          ctx.fillStyle = '#dc2626'
          ctx.fillRect(40 + offsetX, decorationY + 16, 15, 6)
          break

        case 'logo':
          const logoX = canvasWidth - 45 - offsetX
          ctx.fillStyle = '#dc2626'
          ctx.beginPath()
          ctx.arc(logoX, decorationY + 50, 20, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#000000'
          ctx.beginPath()
          ctx.arc(logoX, decorationY + 50, 12, 0, Math.PI * 2)
          ctx.fill()
          break

        case 'tiara':
          const tiaraX = canvasWidth / 2
          ctx.fillStyle = '#fbbf24'
          ctx.beginPath()
          ctx.moveTo(tiaraX - 18, decorationY + 50)
          ctx.lineTo(tiaraX, decorationY + 30)
          ctx.lineTo(tiaraX + 18, decorationY + 50)
          ctx.lineTo(tiaraX + 14, decorationY + 55)
          ctx.lineTo(tiaraX - 14, decorationY + 55)
          ctx.closePath()
          ctx.fill()
          ctx.fillStyle = '#dc2626'
          ctx.beginPath()
          ctx.arc(tiaraX, decorationY + 40, 4, 0, Math.PI * 2)
          ctx.fill()
          break

        case 'lasso':
          ctx.strokeStyle = '#fbbf24'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(70 + offsetX, decorationY + 50, 25, 0, Math.PI * 2)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(70 + offsetX, decorationY + 50, 15, 0, Math.PI)
          ctx.stroke()
          break

        case 'shield':
          const shieldX = canvasWidth / 2 + (floorNum % 2 === 0 ? 80 : -80)
          ctx.fillStyle = '#dc2626'
          ctx.beginPath()
          ctx.arc(shieldX, decorationY + 50, 35, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(shieldX, decorationY + 50, 26, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#3b82f6'
          ctx.beginPath()
          ctx.arc(shieldX, decorationY + 50, 17, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 18px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('★', shieldX, decorationY + 58)
          break

        case 'star':
          ctx.fillStyle = '#ffffff'
          const starLargeX = 50 + offsetX
          ctx.beginPath()
          ctx.moveTo(starLargeX, decorationY + 30)
          ctx.lineTo(starLargeX + 4, decorationY + 38)
          ctx.lineTo(starLargeX + 12, decorationY + 38)
          ctx.lineTo(starLargeX + 6, decorationY + 43)
          ctx.lineTo(starLargeX + 8, decorationY + 51)
          ctx.lineTo(starLargeX, decorationY + 46)
          ctx.lineTo(starLargeX - 8, decorationY + 51)
          ctx.lineTo(starLargeX - 6, decorationY + 43)
          ctx.lineTo(starLargeX - 12, decorationY + 38)
          ctx.lineTo(starLargeX - 4, decorationY + 38)
          ctx.closePath()
          ctx.fill()
          break

        case 'rings':
          ctx.strokeStyle = '#fbbf24'
          ctx.lineWidth = 3
          for (let i = 0; i < 3; i++) {
            const ringX = 50 + i * 50 + offsetX
            if (ringX > canvasWidth - 20) continue
            ctx.beginPath()
            ctx.arc(ringX, decorationY + 50, 12, 0, Math.PI * 2)
            ctx.stroke()
          }
          break

        case 'speed-blur':
          ctx.fillStyle = '#3b82f6'
          ctx.globalAlpha = 0.08
          for (let i = 0; i < 8; i++) {
            ctx.fillRect(i * 40 + offsetX, decorationY + 50 + i * 3, 25, 3)
          }
          ctx.globalAlpha = 0.2
          break

        case 'mushroom':
          const mushroomX = 50 + offsetX
          ctx.fillStyle = '#dc2626'
          ctx.beginPath()
          ctx.arc(mushroomX, decorationY + 45, 18, Math.PI, 0)
          ctx.fill()
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(mushroomX - 8, decorationY + 42, 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(mushroomX + 8, decorationY + 42, 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#fbbf24'
          ctx.fillRect(mushroomX - 5, decorationY + 45, 10, 13)
          break

        case 'coin':
          const coinX = canvasWidth - 50 - offsetX
          ctx.fillStyle = '#fbbf24'
          ctx.beginPath()
          ctx.arc(coinX, decorationY + 50, 13, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#92400e'
          ctx.font = 'bold 14px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('?', coinX, decorationY + 56)
          break

        case 'brick':
          const brickX = canvasWidth / 2 - 12
          ctx.fillStyle = '#92400e'
          ctx.fillRect(brickX, decorationY + 40, 25, 25)
          ctx.strokeStyle = '#451a03'
          ctx.lineWidth = 2
          ctx.strokeRect(brickX, decorationY + 40, 25, 25)
          ctx.fillStyle = '#fbbf24'
          ctx.font = 'bold 18px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('?', brickX + 12, decorationY + 58)
          break

        case 'fist':
          ctx.fillStyle = '#22c55e'
          const fistX = 35 + offsetX
          ctx.fillRect(fistX, decorationY + 40, 25, 50)
          ctx.fillRect(fistX - 4, decorationY + 32, 33, 25)
          ctx.fillStyle = '#15803d'
          ctx.fillRect(fistX + 5, decorationY + 37, 4, 8)
          ctx.fillRect(fistX + 12, decorationY + 37, 4, 8)
          break

        case 'cracks':
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(offsetX, decorationY + 80)
          ctx.lineTo(offsetX + 50, decorationY + 70)
          ctx.lineTo(offsetX + 80, decorationY + 75)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(offsetX + 30, decorationY + 80)
          ctx.lineTo(offsetX + 60, decorationY + 90)
          ctx.stroke()
          break
      }
    }
  }

  ctx.restore()
}
