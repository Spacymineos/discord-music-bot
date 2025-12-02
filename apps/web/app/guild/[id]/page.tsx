import { authOptions } from "@/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { getGuild } from '@/lib/bot-api'
import { getUserGuilds, hasManagePermissions } from '@/lib/discord'
import { Guild } from "@/lib/types"
import GuildDashboard from "@/components/guild-dashboard"

export default async function GuildDashboardPage({ params }: { params: Promise<{ id: string }> }) {
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

    return <GuildDashboard guild={guild} session={session} />
}
