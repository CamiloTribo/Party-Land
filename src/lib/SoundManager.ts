'use client';

class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement>;
    private enabled: boolean = true;

    private constructor() {
        this.sounds = new Map();
        if (typeof window !== 'undefined') {
            console.log('🔈 [SoundManager] Initializing sounds...');
            this.loadSound('click', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); // Snappy blup (the one from Play Now)
            this.loadSound('bubble', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); // Snappy blup alias
            this.loadSound('coin', 'https://assets.mixkit.co/active_storage/sfx/2635/2635-preview.mp3'); // Coin collect
            this.loadSound('victory', 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'); // Happy win
            this.loadSound('start', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); // Game start
        }
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private loadSound(name: string, url: string) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.sounds.set(name, audio);
    }

    public play(name: string) {
        if (!this.enabled) {
            console.log(`🔇 SoundManager: ${name} skipped (muted)`);
            return;
        }
        const sound = this.sounds.get(name);
        if (sound) {
            console.log(`🔊 SoundManager: playing ${name}`);
            sound.currentTime = 0;
            sound.play().catch(err => console.log(`Audio play failed (${name}):`, err));
        } else {
            console.warn(`⚠️ SoundManager: sound ${name} not found`);
        }
    }

    public toggle(enabled?: boolean) {
        this.enabled = enabled ?? !this.enabled;
    }

    public isEnabled() {
        return this.enabled;
    }
}

export const soundManager = SoundManager.getInstance();
