'use client'

import { useState } from 'react'
import { updateGuildSettings } from '@/lib/bot-api'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, CheckCircle2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SettingsFormProps {
    guildId: string
    settings: {
        prefix?: string
        welcomeMessage?: string
        moderationEnabled?: boolean
    }
}

export default function SettingsForm({ guildId, settings }: SettingsFormProps) {
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const data = {
            prefix: formData.get('prefix'),
            welcomeMessage: formData.get('welcomeMessage'),
            moderationEnabled: formData.get('moderationEnabled') === 'on',
        }

        try {
            await updateGuildSettings(guildId, data)
            setMessage({ type: 'success', text: 'Settings saved successfully!' })
        } catch {
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-zinc-800/50 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle>General Configuration</CardTitle>
                    <CardDescription>Basic settings for your server</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="prefix" className="text-sm font-medium text-zinc-300">
                            Command Prefix
                        </label>
                        <Input
                            id="prefix"
                            name="prefix"
                            defaultValue={settings.prefix || '!'}
                            placeholder="!"
                            className="max-w-xs"
                        />
                        <p className="text-xs text-zinc-500">The character used to trigger bot commands.</p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="welcomeMessage" className="text-sm font-medium text-zinc-300">
                            Welcome Message
                        </label>
                        <Input
                            id="welcomeMessage"
                            name="welcomeMessage"
                            defaultValue={settings.welcomeMessage || ''}
                            placeholder="Welcome to the server, {user}!"
                        />
                        <p className="text-xs text-zinc-500">Use {'{user}'} to mention the new member.</p>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50 mt-4">
                        <div className="space-y-0.5">
                            <label htmlFor="moderationEnabled" className="text-sm font-medium text-zinc-300 block">
                                Enable Moderation
                            </label>
                            <p className="text-xs text-zinc-500">Allow the bot to perform moderation actions.</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                            <input
                                type="checkbox"
                                id="moderationEnabled"
                                name="moderationEnabled"
                                defaultChecked={settings.moderationEnabled}
                                className="absolute w-6 h-6 opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between">
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`flex items-center gap-2 text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
                        >
                            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button type="submit" disabled={saving} className="ml-auto min-w-[120px]">
                    {saving ? (
                        "Saving..."
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
