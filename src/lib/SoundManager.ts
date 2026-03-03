'use client';

class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement>;
    private enabled: boolean = true;
    private currentMusic: HTMLAudioElement | null = null;
    private currentMusicName: string | null = null;

    private constructor() {
        this.sounds = new Map();
        if (typeof window !== 'undefined') {
            console.log('🔈 [SoundManager] Initializing sounds...');
            // SFX
            this.loadSound('click', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            this.loadSound('bubble', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            this.loadSound('coin', 'https://assets.mixkit.co/active_storage/sfx/2635/2635-preview.mp3');
            this.loadSound('victory', 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
            this.loadSound('start', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

            // MUSIC
            // Main Hub Theme (Super Mario Land style)
            this.loadSound('main-theme', '/sounds/Super Mario Land Soundtrack - backgroundgeneral.mp3');
            // Game Specific Theme (Pink Panther / 100 Floor Drop)
            this.loadSound('game-theme-panther', '/sounds/background-100floordrop.mp3');
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
            sound.play().catch(err => console.log(`Audio play failed (${name}):`, err));
        }
    }

    public playMusic(name: string) {
        if (this.currentMusicName === name) return;

        this.stopMusic();

        const music = this.sounds.get(name);
        if (music) {
            this.currentMusic = music;
            this.currentMusicName = name;
            music.loop = true;
            music.volume = 0.05; // Set to 5% volume - much more subtle

            if (this.enabled) {
                music.play().catch(err => console.log(`Music play failed (${name}):`, err));
            }
        }
    }

    public stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
            this.currentMusicName = null;
        }
    }

    public toggle(enabled?: boolean) {
        this.enabled = enabled ?? !this.enabled;

        if (!this.enabled) {
            this.stopMusic();
        } else if (this.currentMusicName) {
            // Re-play current music if enabled
            const name = this.currentMusicName;
            this.currentMusicName = null; // reset to force play
            this.playMusic(name);
        }
    }

    public isEnabled() {
        return this.enabled;
    }
}

export const soundManager = SoundManager.getInstance();
