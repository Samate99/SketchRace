import { useState } from "react";
import { Volume2, VolumeOff, Music } from "lucide-react";
import {
    isMuted,
    setMuted,
    isMusicEnabled,
    setMusicEnabled,
    startMusic,
    stopMusic,
    initAudio,
} from "../../lib/sounds";

export default function SoundToggle() {
    const [muted, setMutedState] = useState(isMuted());
    const [music, setMusicState] = useState(isMusicEnabled());

    const toggleMute = () => {
        initAudio();
        const newMuted = !muted;
        setMuted(newMuted);
        setMutedState(newMuted);
        if (!newMuted && music) startMusic();
    };

    const toggleMusic = () => {
        initAudio();
        const newMusic = !music;
        setMusicEnabled(newMusic);
        setMusicState(newMusic);
        if (newMusic && !muted) startMusic();
        else stopMusic();
    };

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={toggleMute}
                className={`p-1.5 rounded-lg transition-all ${muted
                        ? "text-red-400 hover:bg-red-500/20"
                        : "text-slate-400 hover:bg-slate-700"
                    }`}
                title={muted ? "Unmute" : "Mute"}
            >
                {muted ? <VolumeOff className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
                onClick={toggleMusic}
                className={`p-1.5 rounded-lg transition-all ${!music
                        ? "text-slate-600 hover:bg-slate-700"
                        : "text-team-blue hover:bg-team-blue/20"
                    }`}
                title={music ? "Music off" : "Music on"}
            >
                <Music className="w-4 h-4" />
            </button>
        </div>
    );
}
