'use client';

class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement>;
    private enabled: boolean = true;

    private constructor() {
        this.sounds = new Map();
        if (typeof window !== 'undefined') {
            this.loadSound('click', 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'); // Arcade blip
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
        if (!this.enabled) return;
        const sound = this.sounds.get(name);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(err => console.log('Audio play failed:', err));
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
