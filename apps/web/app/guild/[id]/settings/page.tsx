import { authOptions } from "@/auth"
import { getServerSession } from "next-auth"
import Image from "next/image"
import { redirect } from "next/navigation"
import { getGuild, getGuildSettings } from '@/lib/bot-api'
import { getUserGuilds, hasManagePermissions } from '@/lib/discord'
import { Guild } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Settings, LayoutDashboard, LogOut } from "lucide-react"
import Link from "next/link"
import SettingsForm from "./settings-form"
import { SignOutButton } from "@/components/sign-out-button"

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const userGuilds = await getUserGuilds(session.accessToken as string)
    const userGuild = userGuilds.find((g: Guild) => g.id === id)

    if (!userGuild || !hasManagePermissions(userGuild.permissions || '0')) {
        redirect("/")
    }

    const guild = await getGuild(id)
    const settings = await getGuildSettings(id)

    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl fixed h-full">
                <div className="p-6 border-b border-zinc-800/50">
                    <div className="flex items-center gap-3">
                        {guild.icon ? (
                            <Image
                                src={guild.icon}
                                alt={guild.name}
                                width={40}
                                height={40}
                                className="rounded-xl shadow-lg"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold">
                                {guild.name.charAt(0)}
                            </div>
                        )}
                        <span className="font-bold truncate">{guild.name}</span>
                    </div>
                </div>
                <nav className="p-4 space-y-2">
                    <Link href={`/guild/${id}`}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Overview
                        </Button>
                    </Link>
                    <Link href={`/guild/${id}/settings`}>
                        <Button variant="secondary" className="w-full justify-start gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-zinc-800/50">
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start gap-2 text-zinc-400 hover:text-white">
                            <LogOut className="w-4 h-4" />
                            Back to Guilds
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Settings</h1>
                            <p className="text-zinc-400 mt-1">Configure your bot preferences</p>
                        </div>
                        <SignOutButton />
                    </div>

                    <SettingsForm guildId={id} settings={settings} />
                </div>
            </main>
        </div>
    )
}
