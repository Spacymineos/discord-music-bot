import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserSettings {
    autoplay: boolean
    showLyrics: boolean
    videoEnabled: boolean
    defaultVolume: number
    theme: 'dark' | 'light' | 'system'
}

interface SettingsStore extends UserSettings {
    setAutoplay: (enabled: boolean) => void
    setShowLyrics: (enabled: boolean) => void
    setVideoEnabled: (enabled: boolean) => void
    setDefaultVolume: (volume: number) => void
    setTheme: (theme: 'dark' | 'light' | 'system') => void
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            autoplay: false,
            showLyrics: false,
            videoEnabled: false,
            defaultVolume: 50,
            theme: 'dark',

            setAutoplay: (autoplay) => set({ autoplay }),
            setShowLyrics: (showLyrics) => set({ showLyrics }),
            setVideoEnabled: (videoEnabled) => set({ videoEnabled }),
            setDefaultVolume: (defaultVolume) => set({ defaultVolume }),
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'music-bot-settings',
        }
    )
)
