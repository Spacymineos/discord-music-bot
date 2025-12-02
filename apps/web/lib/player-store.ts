import { create } from 'zustand'

interface Track {
    title: string
    author: string
    url: string
    duration: number
    thumbnail: string | null
}

export type RepeatMode = 'off' | 'one' | 'all'

interface PlayerState {
    guildId: string | null
    currentTrack: Track | null
    queue: Track[]
    volume: number
    paused: boolean
    playing: boolean
    shuffle: boolean
    repeat: RepeatMode
    position: number

    setGuildId: (id: string) => void
    setCurrentTrack: (track: Track | null) => void
    setQueue: (queue: Track[]) => void
    setVolume: (volume: number) => void
    setPaused: (paused: boolean) => void
    setPlaying: (playing: boolean) => void
    setShuffle: (shuffle: boolean) => void
    setRepeat: (repeat: RepeatMode) => void
    setPosition: (position: number) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
    guildId: null,
    currentTrack: null,
    queue: [],
    volume: 50,
    paused: false,
    playing: false,
    shuffle: false,
    repeat: 'off',
    position: 0,

    setGuildId: (id) => set({ guildId: id }),
    setCurrentTrack: (track) => set({ currentTrack: track }),
    setQueue: (queue) => set({ queue }),
    setVolume: (volume) => set({ volume }),
    setPaused: (paused) => set({ paused }),
    setPlaying: (playing) => set({ playing }),
    setShuffle: (shuffle) => set({ shuffle }),
    setRepeat: (repeat) => set({ repeat }),
    setPosition: (position) => set({ position }),
}))
