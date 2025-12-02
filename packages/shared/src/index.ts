export interface GuildSettings {
    guildId: string;
    prefix: string;
    welcomeChannel?: string;
    autoRole?: string;
    moderationEnabled: boolean;
}

export interface User {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
}
