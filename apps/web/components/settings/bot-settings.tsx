'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Crown, Mic2, Volume2, AlertTriangle } from 'lucide-react'

export default function BotSettings() {
    // Mock state for now - would fetch from API
    const [voteSkip, setVoteSkip] = useState(true)
    const [announceSongs, setAnnounceSongs] = useState(false)
    const [djRole, setDjRole] = useState(false)

    return (
        <div className="space-y-8">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-medium text-yellow-500">Admin Only</h4>
                    <p className="text-sm text-yellow-500/80">These settings affect the bot for everyone in the server. Only users with the &quot;Manage Server&quot; permission can change them.</p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-white mb-4">Music Controls</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <Crown className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium text-white">DJ Role Only</p>
                                <p className="text-sm text-zinc-400">Restrict music controls to users with DJ role</p>
                            </div>
                        </div>
                        <Switch checked={djRole} onCheckedChange={setDjRole} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                                <Mic2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Announce Songs</p>
                                <p className="text-sm text-zinc-400">Send a message when a new song starts playing</p>
                            </div>
                        </div>
                        <Switch checked={announceSongs} onCheckedChange={setAnnounceSongs} />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-white mb-4">Queue Management</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                                <Volume2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Vote Skip</p>
                                <p className="text-sm text-zinc-400">Require majority vote to skip songs</p>
                            </div>
                        </div>
                        <Switch checked={voteSkip} onCheckedChange={setVoteSkip} />
                    </div>
                </div>
            </div>
        </div>
    )
}
