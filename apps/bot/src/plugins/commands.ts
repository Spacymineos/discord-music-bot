import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { i18n } from '../lib/i18n'

const commandsPlugin: FastifyPluginAsync = async (fastify) => {
    // Helper to get guild language
    const getLanguage = async (guildId: string | null): Promise<string> => {
        if (!guildId) return 'en'
        try {
            const guild = await fastify.prisma.guild.findUnique({
                where: { id: guildId },
                select: { language: true }
            })
            return guild?.language || 'en'
        } catch {
            return 'en'
        }
    }

    const commands = [
        new SlashCommandBuilder()
            .setName('play')
            .setDescription('🎵 Play a song or playlist')
            .addStringOption(option =>
                option.setName('query')
                    .setDescription('Song name, URL, or playlist')
                    .setRequired(true)
                    .setAutocomplete(true)
            ),
        new SlashCommandBuilder()
            .setName('pause')
            .setDescription('⏸️ Pause or resume playback'),
        new SlashCommandBuilder()
            .setName('skip')
            .setDescription('⏭️ Skip the current track'),
        new SlashCommandBuilder()
            .setName('stop')
            .setDescription('⏹️ Stop playback and clear queue'),
        new SlashCommandBuilder()
            .setName('queue')
            .setDescription('📝 Show the current queue'),
        new SlashCommandBuilder()
            .setName('nowplaying')
            .setDescription('🎶 Show currently playing track'),
        new SlashCommandBuilder()
            .setName('volume')
            .setDescription('🔊 Set playback volume')
            .addIntegerOption(option =>
                option.setName('level')
                    .setDescription('Volume level (0-100)')
                    .setRequired(true)
                    .setMinValue(0)
                    .setMaxValue(100)
            ),
        new SlashCommandBuilder()
            .setName('language')
            .setDescription('🌐 Set bot language')
            .addStringOption(option =>
                option.setName('lang')
                    .setDescription('Language code (en, fr)')
                    .setRequired(true)
                    .addChoices(
                        { name: 'English', value: 'en' },
                        { name: 'Français', value: 'fr' }
                    )
            ),
    ]

    fastify.discord.once('ready', async () => {
        try {
            fastify.log.info('Registering slash commands...')
            await fastify.discord.application?.commands.set(commands.map(cmd => cmd.toJSON()))
            fastify.log.info('Slash commands registered')
        } catch (error: any) {
            fastify.log.error({ err: error }, 'Failed to register commands')
        }
    })

    fastify.discord.on('interactionCreate', async (interaction) => {
        if (interaction.isAutocomplete()) {
            if (interaction.commandName === 'play') {
                const focusedValue = interaction.options.getFocused()
                if (!focusedValue) return interaction.respond([])

                try {
                    if (!fastify.music.shoukaku.nodes.size) {
                        return interaction.respond([])
                    }

                    let result = await fastify.music.search(focusedValue, { requester: { userId: interaction.user.id } })

                    // Fallback to SoundCloud if no results
                    if (!result.tracks.length) {
                        result = await fastify.music.search(`scsearch:${focusedValue}`, { requester: { userId: interaction.user.id } })
                    }

                    await interaction.respond(
                        result.tracks.slice(0, 25).map((track: any) => ({
                            name: `${track.title.substring(0, 80)} - ${track.author}`.substring(0, 100),
                            value: track.uri || track.title
                        }))
                    )
                } catch (error: any) {
                    fastify.log.error({ err: error }, 'Autocomplete failed')
                    await interaction.respond([])
                }
            }
            return
        }

        if (!interaction.isChatInputCommand()) return

        const lang = await getLanguage(interaction.guildId)
        const player = fastify.music.players.get(interaction.guildId!)

        try {
            if (interaction.commandName === 'language') {
                const newLang = interaction.options.getString('lang', true)
                await fastify.prisma.guild.upsert({
                    where: { id: interaction.guildId! },
                    create: {
                        id: interaction.guildId!,
                        name: interaction.guild?.name || 'Unknown',
                        ownerId: interaction.guild?.ownerId || 'Unknown',
                        language: newLang
                    },
                    update: { language: newLang }
                })

                const embed = new EmbedBuilder()
                    .setColor('#10B981')
                    .setTitle('🌐 Language Changed')
                    .setDescription(`Language set to \`${newLang === 'en' ? 'English' : 'Français'}\``)
                    .setTimestamp()

                await interaction.reply({ embeds: [embed] })
                return
            }

            if (interaction.commandName === 'play') {
                const query = interaction.options.getString('query', true)
                await interaction.deferReply()

                const member: any = interaction.member
                const voiceChannel = member?.voice?.channel

                if (!voiceChannel) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#EF4444')
                        .setDescription(i18n.t('errors.no_voice', lang))
                    return interaction.editReply({ embeds: [errorEmbed] })
                }

                const permissions = voiceChannel.permissionsFor(interaction.client.user)
                if (!permissions?.has('Connect') || !permissions?.has('Speak')) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#EF4444')
                        .setDescription(i18n.t('errors.no_permission', lang))
                    return interaction.editReply({ embeds: [errorEmbed] })
                }

                try {
                    let result = await fastify.music.search(query, { requester: { userId: interaction.user.id } })

                    // Fallback to SoundCloud if no results found
                    if (!result.tracks.length) {
                        result = await fastify.music.search(`scsearch:${query}`, { requester: { userId: interaction.user.id } })
                    }

                    if (!result.tracks.length) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#EF4444')
                            .setDescription(i18n.t('errors.no_results', lang, { query }))
                        return interaction.editReply({ embeds: [errorEmbed] })
                    }

                    const track = result.tracks[0]

                    // Create player if not exists
                    // Create player if not exists
                    const newPlayer = await fastify.music.createPlayer({
                        guildId: interaction.guildId!,
                        textId: interaction.channelId,
                        voiceId: voiceChannel.id,
                        volume: 50
                    })

                    // Add to queue
                    newPlayer.queue.add(track)

                    // If not playing, play
                    if (!newPlayer.playing && !newPlayer.paused && !newPlayer.queue.totalSize) {
                        await newPlayer.play()
                    }

                    const durationMs = track.length || (track as any).duration || 0
                    const duration = durationMs ? new Date(durationMs).toISOString().substr(14, 5) : 'Unknown'

                    const trackEmbed = new EmbedBuilder()
                        .setColor('#10B981')
                        .setTitle(i18n.t('commands.play.added', lang))
                        .setDescription(`**[${track.title}](${track.uri})**`)
                        .addFields(
                            { name: i18n.t('music.track.artist', lang), value: `\`${track.author}\``, inline: true },
                            { name: i18n.t('music.track.duration', lang), value: `\`${duration}\``, inline: true },
                            { name: i18n.t('music.track.position', lang), value: `\`${newPlayer.queue.size}\``, inline: true }
                        )
                        .setFooter({
                            text: i18n.t('common.footer', lang, { user: interaction.user.tag }),
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setThumbnail(track.thumbnail || null)
                        .setTimestamp()

                    await interaction.editReply({ embeds: [trackEmbed] })

                } catch (error: any) {
                    fastify.log.error(error)
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#EF4444')
                        .setDescription(i18n.t('errors.generic', lang, { error: error.message }))
                    await interaction.editReply({ embeds: [errorEmbed] })
                }
            }
            else if (interaction.commandName === 'pause') {
                if (!player) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#EF4444')
                        .setDescription(i18n.t('errors.no_player', lang))
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
                }

                player.pause(!player.paused)
                const embed = new EmbedBuilder()
                    .setColor('#F59E0B')
                    .setTitle(player.paused ? i18n.t('commands.pause.paused', lang) : i18n.t('commands.pause.resumed', lang))
                    .setTimestamp()

                await interaction.reply({ embeds: [embed] })
            }
            else if (interaction.commandName === 'skip') {
                if (!player) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#EF4444')
                        .setDescription(i18n.t('errors.no_player', lang))
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
                }

                player.skip()
                const embed = new EmbedBuilder()
                    .setColor('#10B981')
                    .setTitle(i18n.t('commands.skip.skipped', lang))
                    .setTimestamp()

                await interaction.reply({ embeds: [embed] })
            }
            else if (interaction.commandName === 'stop') {
                if (!player) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#EF4444')
                        .setDescription(i18n.t('errors.no_player', lang))
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
                }

                player.destroy()
                // fastify.music.leaveVoiceChannel(interaction.guildId!) // destroy() handles leaving

                const embed = new EmbedBuilder()
                    .setColor('#EF4444')
                    .setTitle(i18n.t('commands.stop.stopped', lang))
                    .setTimestamp()

                await interaction.reply({ embeds: [embed] })
            }
            else if (interaction.commandName === 'queue') {
                if (!player || player.queue.size === 0) {
                    const embed = new EmbedBuilder()
                        .setColor('#3B82F6')
                        .setTitle(i18n.t('commands.queue.title', lang))
                        .setDescription(i18n.t('commands.queue.empty', lang))
                    return interaction.reply({ embeds: [embed] })
                }

                const queue = player.queue
                const tracks = Array.from(queue).slice(0, 10)
                const description = tracks.map((track: any, index) =>
                    `**${index + 1}.** [${track.title}](${track.uri}) - \`${track.author}\``
                ).join('\n')

                const embed = new EmbedBuilder()
                    .setColor('#3B82F6')
                    .setTitle(i18n.t('commands.queue.title', lang))
                    .setDescription(description)
                    .setFooter({ text: `Total: ${queue.size} tracks` })
                    .setTimestamp()

                await interaction.reply({ embeds: [embed] })
            }
            else if (interaction.commandName === 'nowplaying') {
                if (!player || !player.queue.current) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#EF4444')
                        .setDescription(i18n.t('errors.no_player', lang))
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
                }

                const track = player.queue.current
                if (!track) return

                // KazagumoTrack uses 'length' for duration, but sometimes it might be mapped differently.
                // Using 'length' as per standard, or falling back to 'duration' if it exists on the raw track.
                const durationMs = track.length || (track as any).duration || 0
                const duration = durationMs ? new Date(durationMs).toISOString().substr(14, 5) : 'Unknown'
                const position = player.position ? new Date(player.position).toISOString().substr(14, 5) : '00:00'

                const embed = new EmbedBuilder()
                    .setColor('#8B5CF6')
                    .setTitle(i18n.t('commands.nowplaying.title', lang))
                    .setDescription(`**[${track.title}](${track.uri})**`)
                    .addFields(
                        { name: i18n.t('music.track.artist', lang), value: `\`${track.author}\``, inline: true },
                        { name: i18n.t('music.track.duration', lang), value: `\`${position} / ${duration}\``, inline: true },
                        { name: i18n.t('music.track.requested_by', lang), value: `<@${(track as any).requester?.userId}>`, inline: true }
                    )
                    .setThumbnail(track.thumbnail || null)
                    .setTimestamp()

                await interaction.reply({ embeds: [embed] })
            }
            else if (interaction.commandName === 'volume') {
                if (!player) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#EF4444')
                        .setDescription(i18n.t('errors.no_player', lang))
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
                }

                const level = interaction.options.getInteger('level', true)
                player.setVolume(level)

                const embed = new EmbedBuilder()
                    .setColor('#10B981')
                    .setTitle(i18n.t('commands.volume.set', lang, { volume: level }))
                    .setTimestamp()

                await interaction.reply({ embeds: [embed] })
            }
        } catch (error: any) {
            fastify.log.error(error)
            const errorEmbed = new EmbedBuilder()
                .setColor('#EF4444')
                .setDescription(i18n.t('errors.generic', lang, { error: error.message }))
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] })
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
            }
        }
    })
}

export default fp(commandsPlugin, {
    name: 'commands',
    dependencies: ['discord']
})
