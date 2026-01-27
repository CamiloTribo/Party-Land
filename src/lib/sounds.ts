// Sound effects utility
export class SoundManager {
  private enabled: boolean = true
  
  constructor(enabled: boolean = true) {
    this.enabled = enabled
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  // Simple beep sounds using Web Audio API
  private playBeep(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.enabled || typeof window === 'undefined') return

    try {
      const audioContext = new (
        window.AudioContext ||
        (window.hasOwnProperty('webkitAudioContext')
          ? ((window as unknown) as Window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          : undefined)
      )()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (e) {
      console.error('Audio playback error:', e)
    }
  }

  countdown() {
    this.playBeep(600, 0.1)
  }

  countdownGo() {
    this.playBeep(800, 0.2)
  }

  collision() {
    this.playBeep(200, 0.15, 0.4)
  }

  gameOver() {
    setTimeout(() => this.playBeep(400, 0.2), 0)
    setTimeout(() => this.playBeep(300, 0.2), 150)
    setTimeout(() => this.playBeep(200, 0.4), 300)
  }

  victory() {
    setTimeout(() => this.playBeep(523, 0.15), 0)
    setTimeout(() => this.playBeep(659, 0.15), 150)
    setTimeout(() => this.playBeep(784, 0.3), 300)
  }

  floorPass() {
    this.playBeep(450, 0.05, 0.2)
  }
}
