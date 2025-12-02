import { authOptions } from "@/auth"
import { getServerSession } from "next-auth"
import Image from "next/image"
import { SignOutButton } from "@/components/sign-out-button"
import { redirect } from "next/navigation"
import { getGuilds } from '@/lib/bot-api'
import Link from 'next/link'
import { Guild } from "@/lib/types"
import { Users, ArrowRight, Music, TrendingUp, Activity } from "lucide-react"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const guilds = await getGuilds()

    return (
        <main className="min-h-screen bg-black text-white overflow-hidden relative">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-black to-purple-500/5" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-[1800px] mx-auto px-8 py-12">
                {/* Header Section */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-sm border border-green-500/30">
                                    <Music className="w-8 h-8 text-green-400" />
                                </div>
                                <h1 className="text-6xl font-black bg-gradient-to-r from-white via-green-200 to-emerald-400 bg-clip-text text-transparent">
                                    Your Servers
                                </h1>
                            </div>
                            <p className="text-zinc-400 text-xl ml-16">
                                Welcome back, <span className="text-green-400 font-semibold">{session.user?.name}</span>
                            </p>
                        </div>
                        <SignOutButton />
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 hover:border-green-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/0 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Total Servers</span>
                                    <TrendingUp className="w-5 h-5 text-green-400" />
                                </div>
                                <div className="text-4xl font-black text-white mb-1">{guilds.length}</div>
                                <div className="text-xs text-zinc-600">Connected & Active</div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 hover:border-emerald-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Total Members</span>
                                    <Users className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="text-4xl font-black text-white mb-1">
                                    {guilds.reduce((sum, g) => sum + (g.memberCount || 0), 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-zinc-600">Across all servers</div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Status</span>
                                    <Activity className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="text-4xl font-black text-white mb-1">100%</div>
                                <div className="text-xs text-zinc-600">All systems operational</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Server Grid */}
                {guilds.length > 0 ? (
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-300 mb-6">Select a Server</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {guilds.map((guild: Guild, index: number) => (
                                <Link
                                    key={guild.id}
                                    href={`/guild/${guild.id}`}
                                    className="group"
                                >
                                    <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-900/60 backdrop-blur-xl border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20">
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-transparent to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-700" />
                                        <div className="absolute -inset-1 bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/20 group-hover:via-emerald-500/20 group-hover:to-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10" />

                                        <div className="relative p-6 h-full flex flex-col">
                                            <div className="relative mb-6">
                                                <div className="relative w-20 h-20 mx-auto">
                                                    {guild.icon ? (
                                                        <Image
                                                            src={guild.icon}
                                                            alt={guild.name}
                                                            width={80}
                                                            height={80}
                                                            className="w-full h-full rounded-2xl shadow-2xl ring-2 ring-white/10 group-hover:ring-green-500/50 transition-all duration-300 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-green-500/50 transition-all duration-300 shadow-2xl group-hover:scale-110">
                                                            <span className="text-3xl font-black text-white">
                                                                {guild.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="absolute -bottom-1 -right-1">
                                                        <div className="relative">
                                                            <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-zinc-900 shadow-lg" />
                                                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center mb-4 flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors line-clamp-2">
                                                    {guild.name}
                                                </h3>
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Administrator</p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5 group-hover:border-green-500/30 transition-all">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-green-400" />
                                                        <span className="text-sm font-medium text-zinc-300">
                                                            {(guild.memberCount || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                                                </div>

                                                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700 group-hover:w-full"
                                                        style={{ width: '60%' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-32">
                        <div className="text-center">
                            <div className="inline-block p-8 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/10 mb-6">
                                <Music className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">No Servers Found</h3>
                                <p className="text-zinc-400 max-w-md">
                                    Add the bot to your Discord server to get started with premium music features
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
