'use client'

import { useEffect } from 'react'
import type { RepeatMode } from '@/lib/player-store'
import { usePlayerStore } from '@/lib/player-store'
import { togglePause, skipTrack, setVolume as setVolumeApi } from '@/lib/music-api'
import { showToast } from '@/components/ui/toaster'

interface UseKeyboardShortcutsProps {
    guildId: string
    enabled?: boolean
    onShowShortcuts?: () => void
}

export function useKeyboardShortcuts({ guildId, enabled = true, onShowShortcuts }: UseKeyboardShortcutsProps) {
    const {
        currentTrack, paused, volume, shuffle, repeat,
        setPaused, setVolume, setShuffle, setRepeat
    } = usePlayerStore()

    useEffect(() => {
        if (!enabled) return

        const handleKeyPress = async (e: KeyboardEvent) => {
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return
            }

            const shortcuts = [' ', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 's', 'r', 'l', 'm', '?']
            if (shortcuts.includes(e.key)) {
                e.preventDefault()
            }

            try {
                switch (e.key) {
                    case '?':
                        if (onShowShortcuts) onShowShortcuts()
                        break

                    case ' ':
                        if (!currentTrack) return
                        await togglePause(guildId)
                        setPaused(!paused)
                        showToast.info(paused ? '▶️ Playing' : '⏸️ Paused', '')
                        break

                    case 'ArrowRight':
                        if (!currentTrack) return
                        await skipTrack(guildId)
                        showToast.info('⏭️ Skipped', 'Playing next track')
                        break

                    case 'ArrowLeft':
                        if (!currentTrack) return
                        showToast.info('⏮️ Restart', 'Track restarted')
                        break

                    case 'ArrowUp': {
                        if (!currentTrack) return
                        const newVolumeUp = Math.min(100, volume + 5)
                        await setVolumeApi(guildId, newVolumeUp)
                        setVolume(newVolumeUp)
                        showToast.info('🔊 Volume', `${newVolumeUp}%`)
                        break
                    }

                    case 'ArrowDown': {
                        if (!currentTrack) return
                        const newVolumeDown = Math.max(0, volume - 5)
                        await setVolumeApi(guildId, newVolumeDown)
                        setVolume(newVolumeDown)
                        showToast.info('🔉 Volume', `${newVolumeDown}%`)
                        break
                    }

                    case 's':
                    case 'S':
                        setShuffle(!shuffle)
                        showToast.info(
                            !shuffle ? '🔀 Shuffle On' : '🔀 Shuffle Off',
                            !shuffle ? 'Playing tracks randomly' : 'Playing in order'
                        )
                        break

                    case 'r':
                    case 'R': {
                        const modes: RepeatMode[] = ['off', 'all', 'one']
                        const currentIndex = modes.indexOf(repeat)
                        const nextIndex = (currentIndex + 1) % modes.length
                        const nextMode: RepeatMode = modes[nextIndex] as RepeatMode
                        setRepeat(nextMode)

                        const modeText: Record<RepeatMode, string> = {
                            off: '🔁 Repeat Off',
                            all: '🔁 Repeat All',
                            one: '🔂 Repeat One'
                        }
                        showToast.info(modeText[nextMode], '')
                        break
                    }

                    case 'l':
                    case 'L':
                        showToast.info('📄 Lyrics', 'Press the lyrics button to view')
                        break

                    case 'm':
                    case 'M': {
                        if (!currentTrack) return
                        const muteVolume = volume > 0 ? 0 : 50
                        await setVolumeApi(guildId, muteVolume)
                        setVolume(muteVolume)
                        showToast.info(muteVolume === 0 ? '🔇 Muted' : '🔊 Unmuted', '')
                        break
                    }
                }
            } catch (error) {
                console.error('Keyboard shortcut error:', error)
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [guildId, enabled, currentTrack, paused, volume, shuffle, repeat, setPaused, setVolume, setShuffle, setRepeat, onShowShortcuts])
}
