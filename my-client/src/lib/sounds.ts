/**
 * SketchRace — Procedural Audio Engine
 * Uses Web Audio API to generate all sound effects and background music.
 * No external audio files needed!
 */

let audioCtx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let masterGain: GainNode | null = null;
let musicPlaying = false;
let musicOscillators: OscillatorNode[] = [];
let musicTimeout: ReturnType<typeof setTimeout> | null = null;

// State
let _muted = false;
let _volume = 0.5;
let _musicEnabled = true;

function getCtx(): AudioContext {
    if (!audioCtx) {
        audioCtx = new AudioContext();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = _volume;
        masterGain.connect(audioCtx.destination);

        sfxGain = audioCtx.createGain();
        sfxGain.gain.value = 1;
        sfxGain.connect(masterGain);

        musicGain = audioCtx.createGain();
        musicGain.gain.value = 0.25; // Music quieter than SFX
        musicGain.connect(masterGain);
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

// ─── PUBLIC API ───────────────────────────────────────────

export function setMuted(muted: boolean) {
    _muted = muted;
    if (masterGain) {
        masterGain.gain.value = muted ? 0 : _volume;
    }
    if (muted) stopMusic();
}

export function isMuted(): boolean {
    return _muted;
}

export function setVolume(vol: number) {
    _volume = Math.max(0, Math.min(1, vol));
    if (masterGain && !_muted) {
        masterGain.gain.value = _volume;
    }
}

export function setMusicEnabled(enabled: boolean) {
    _musicEnabled = enabled;
    if (!enabled) stopMusic();
}

export function isMusicEnabled(): boolean {
    return _musicEnabled;
}

// ─── TONE HELPERS ─────────────────────────────────────────

function playTone(
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.3,
    delay = 0,
    target?: GainNode
) {
    const ctx = getCtx();
    if (_muted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(target || sfxGain!);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
}

function playNoise(duration: number, volume = 0.1, delay = 0) {
    const ctx = getCtx();
    if (_muted) return;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain!);

    source.start(ctx.currentTime + delay);
}

// ─── SOUND EFFECTS ────────────────────────────────────────

/** 🎉 Correct guess — happy ascending chime */
export function playCorrectGuess() {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
        playTone(freq, 0.3, "sine", 0.25, i * 0.1);
    });
}

/** 🏴‍☠️ Steal — dramatic stinger */
export function playSteal() {
    playTone(220, 0.15, "sawtooth", 0.2, 0);
    playTone(277, 0.15, "sawtooth", 0.2, 0.12);
    playTone(330, 0.15, "sawtooth", 0.2, 0.24);
    playTone(440, 0.4, "sawtooth", 0.25, 0.36);
}

/** ⏱️ Timer tick — subtle click for last 10 seconds */
export function playTick() {
    playTone(800, 0.05, "sine", 0.15);
    playTone(400, 0.03, "square", 0.05, 0.02);
}

/** ⏰ Time's up buzzer */
export function playBuzzer() {
    playTone(200, 0.6, "sawtooth", 0.2);
    playTone(150, 0.6, "sawtooth", 0.15, 0.1);
    playNoise(0.3, 0.08);
}

/** 🎮 Game started fanfare */
export function playGameStart() {
    const notes = [392, 523, 659, 784]; // G4, C5, E5, G5
    notes.forEach((freq, i) => {
        playTone(freq, 0.25, "triangle", 0.2, i * 0.15);
    });
    // Final chord
    playTone(523, 0.5, "sine", 0.15, 0.7);
    playTone(659, 0.5, "sine", 0.15, 0.7);
    playTone(784, 0.5, "sine", 0.15, 0.7);
}

/** 🏆 Victory jingle */
export function playVictory() {
    const melody = [523, 587, 659, 784, 659, 784, 1047];
    melody.forEach((freq, i) => {
        const dur = i === melody.length - 1 ? 0.6 : 0.2;
        playTone(freq, dur, "triangle", 0.2, i * 0.15);
    });
}

/** 👤 Player joined — gentle ping */
export function playPlayerJoin() {
    playTone(880, 0.15, "sine", 0.12);
    playTone(1100, 0.2, "sine", 0.12, 0.1);
}

/** 👤 Player left — descending tone */
export function playPlayerLeft() {
    playTone(600, 0.15, "sine", 0.1);
    playTone(400, 0.2, "sine", 0.1, 0.1);
}

/** 🎨 Word selected — soft notification */
export function playWordSelected() {
    playTone(660, 0.12, "sine", 0.15);
    playTone(880, 0.18, "sine", 0.15, 0.08);
}

/** 💬 Chat message — tiny pop */
export function playChatPop() {
    playTone(1200, 0.04, "sine", 0.08);
}

/** 🔔 Choose word prompt */
export function playChooseWord() {
    playTone(440, 0.15, "triangle", 0.15);
    playTone(554, 0.15, "triangle", 0.15, 0.15);
    playTone(659, 0.25, "triangle", 0.15, 0.3);
}

/** ❌ Error sound */
export function playError() {
    playTone(200, 0.2, "square", 0.15);
    playTone(150, 0.3, "square", 0.12, 0.15);
}

// ─── BACKGROUND MUSIC ─────────────────────────────────────

const MUSIC_NOTES = [
    // Chill lo-fi inspired progression in C major / Am
    // Each entry: [freq, duration in beats]
    [261, 2], [329, 2], [392, 2], [329, 2],   // C E G E
    [349, 2], [440, 2], [523, 2], [440, 2],   // F A C5 A
    [392, 2], [494, 2], [587, 2], [494, 2],   // G B D5 B
    [261, 2], [329, 2], [392, 4],             // C E G (hold)
    [220, 2], [261, 2], [329, 2], [261, 2],   // A3 C E C
    [349, 2], [440, 2], [349, 2], [261, 2],   // F A F C
    [294, 2], [349, 2], [440, 2], [349, 2],   // D F A F
    [329, 2], [392, 2], [523, 4],             // E G C5 (hold)
] as const;

const BEAT_DURATION = 0.35; // seconds per beat — chill tempo

export function startMusic() {
    if (!_musicEnabled || musicPlaying) return;
    getCtx(); // ensure audio context
    musicPlaying = true;
    playMusicLoop();
}

export function stopMusic() {
    musicPlaying = false;
    musicOscillators.forEach((osc) => {
        try { osc.stop(); } catch (_e) { /* already stopped */ }
    });
    musicOscillators = [];
    if (musicTimeout) {
        clearTimeout(musicTimeout);
        musicTimeout = null;
    }
}

function playMusicLoop() {
    if (!musicPlaying || !musicGain || _muted) return;

    const ctx = getCtx();
    let time = ctx.currentTime;

    MUSIC_NOTES.forEach(([freq, beats]) => {
        const duration = beats * BEAT_DURATION;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq as number;

        // Soft envelope
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.08, time + 0.05);
        gain.gain.setValueAtTime(0.08, time + duration - 0.1);
        gain.gain.linearRampToValueAtTime(0, time + duration);

        osc.connect(gain);
        gain.connect(musicGain!);

        osc.start(time);
        osc.stop(time + duration);
        musicOscillators.push(osc);

        time += duration;
    });

    // Schedule next loop
    const loopDuration = MUSIC_NOTES.reduce((sum, [, beats]) => sum + (beats as number) * BEAT_DURATION, 0);
    musicTimeout = setTimeout(() => {
        musicOscillators = [];
        if (musicPlaying) playMusicLoop();
    }, loopDuration * 1000);
}

// ─── INIT ─────────────────────────────────────────────────

/** Call this on first user interaction to unlock AudioContext */
export function initAudio() {
    getCtx();
}
