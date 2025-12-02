'use client'

import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/lib/settings-store'
import { Volume2, Music, Video, Zap } from 'lucide-react'

export default function UserSettings() {
    const {
        autoplay, setAutoplay,
        showLyrics, setShowLyrics,
        videoEnabled, setVideoEnabled,
        defaultVolume, setDefaultVolume
    } = useSettingsStore()

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Playback</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Autoplay</p>
                                <p className="text-sm text-zinc-400">Automatically play similar songs when queue ends</p>
                            </div>
                        </div>
                        <Switch checked={autoplay} onCheckedChange={setAutoplay} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Video className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Video Player</p>
                                <p className="text-sm text-zinc-400">Show music video when available</p>
                            </div>
                        </div>
                        <Switch checked={videoEnabled} onCheckedChange={setVideoEnabled} />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-white mb-4">Interface</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                                <Music className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Show Lyrics</p>
                                <p className="text-sm text-zinc-400">Automatically open lyrics panel when playing</p>
                            </div>
                        </div>
                        <Switch checked={showLyrics} onCheckedChange={setShowLyrics} />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-white mb-4">Defaults</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-700/50 flex items-center justify-center text-zinc-400">
                            <Volume2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-medium text-white">Default Volume</p>
                            <p className="text-sm text-zinc-400">Set the initial volume for new sessions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 px-2">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={defaultVolume}
                            onChange={(e) => setDefaultVolume(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none
                                [&::-webkit-slider-thumb]:w-4
                                [&::-webkit-slider-thumb]:h-4
                                [&::-webkit-slider-thumb]:rounded-full
                                [&::-webkit-slider-thumb]:bg-white
                                [&::-webkit-slider-thumb]:hover:scale-110
                                [&::-webkit-slider-thumb]:transition-transform"
                        />
                        <span className="text-sm font-mono text-zinc-400 w-8">{defaultVolume}%</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
