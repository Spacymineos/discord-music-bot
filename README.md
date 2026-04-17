# 🎵 Discord Music Bot - Full Stack Monorepo

<div align="center">

![Discord Music Bot](https://img.shields.io/badge/Discord-Music%20Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)

**A premium Discord music bot with a modern web dashboard, built with TypeScript and Next.js**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Configuration](#-configuration) • [Development](#-development)

</div>

---

## ✨ Features

## 📜 Previous Versions

**Spacyminos (Deprecated Archive)**  
The legacy Discord music bot project that inspired this monorepo. Archived and unmaintained—use this modern version for production. Key improvements include Turborepo, Next.js 16 dashboard, and enhanced Lavalink integration.[web:6][web:28]

### 🎵 Music Playback
- **High-Quality Audio** - Powered by Lavalink for superior sound quality
- **YouTube Integration** - Direct search and playback using `youtube-sr`
- **Advanced Queue Management** - Shuffle, repeat, skip, and clear queue
- **Artist Profiles** - Beautiful artist pages with top tracks and banners
- **Real-time Controls** - Play, pause, skip, volume, and more

### 🖥️ Web Dashboard
- **Modern UI** - Built with Next.js 16 and Tailwind CSS 4
- **Real-time Updates** - Live queue and playback status via WebSockets
- **Responsive Design** - Glassmorphism effects and smooth animations
- **Session Management** - Discord OAuth2 authentication
- **Server Management** - Configure settings, view stats, manage playlists

### 🎮 Discord Commands
- `/play` - Play a song or playlist
- `/skip` - Skip the current track
- `/queue` - View the current queue
- `/nowplaying` - Show currently playing track
- `/shuffle` - Shuffle the queue
- `/loop` - Toggle loop mode (track/queue/off)
- `/clear` - Clear the queue
- `/volume` - Adjust playback volume

### 🔧 Technical Highlights
- **Monorepo Architecture** - Turborepo for efficient builds
- **Type-Safe** - Full TypeScript coverage
- **Modern Stack** - Next.js 16, Discord.js 14, Fastify
- **Database** - PostgreSQL with Prisma ORM
- **Audio Engine** - Lavalink + Kazagumo
- **Real-time** - Socket.IO for live updates

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **pnpm** 9.x or higher
- **PostgreSQL** 15.x or higher
- **Java** 17+ (for Lavalink)
- **Discord Bot Token** - [Create a bot](https://discord.com/developers/applications)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/discord-bot-monorepo.git
cd discord-bot-monorepo
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Create `.env` files in both `apps/bot` and `apps/web`:

**`apps/bot/.env`**
```env
# Discord Bot
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_client_id

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/musicbot

# Lavalink
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass

# Web Dashboard
DASHBOARD_URL=http://localhost:3000
```

**`apps/web/.env`**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/musicbot

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Bot API
NEXT_PUBLIC_BOT_API=http://localhost:3001
```

4. **Set up the database**
```bash
cd apps/bot
pnpm prisma migrate deploy
pnpm prisma generate
```

5. **Download Lavalink**
```bash
cd apps/lavalink
# Download the latest Lavalink.jar from GitHub releases
# https://github.com/lavalink-devs/Lavalink/releases
# Place Lavalink.jar in apps/lavalink/
```

6. **Start Lavalink**
```bash
cd apps/lavalink
java -jar Lavalink.jar
```

7. **Start the development servers**
```bash
# From the root directory
pnpm dev
```

This will start:
- **Bot** on `http://localhost:3001`
- **Web Dashboard** on `http://localhost:3000`

---

## 🏗️ Architecture

```
discord-bot-monorepo/
├── apps/
│   ├── bot/              # Discord bot application
│   │   ├── src/
│   │   │   ├── commands/ # Slash commands
│   │   │   ├── events/   # Discord events
│   │   │   ├── routes/   # API routes (Fastify)
│   │   │   ├── plugins/  # Bot plugins
│   │   │   └── index.ts  # Entry point
│   │   ├── prisma/       # Database schema
│   │   └── package.json
│   │
│   ├── web/              # Next.js web dashboard
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── package.json
│   │
│   └── lavalink/         # Lavalink audio server
│       └── application.yml
│
├── packages/
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # Shared ESLint config
│   └── typescript-config/ # Shared TS config
│
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # PNPM workspace config
└── package.json          # Root package.json
```

### Technology Stack

#### Bot (apps/bot)
- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Discord.js 14
- **API**: Fastify
- **Database**: PostgreSQL + Prisma
- **Audio**: Lavalink + Kazagumo
- **Search**: youtube-sr

#### Dashboard (apps/web)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI**: Custom components + Framer Motion
- **Auth**: NextAuth.js (Discord OAuth2)
- **Real-time**: Socket.IO Client

---

## ⚙️ Configuration

### Bot Configuration

Edit `apps/bot/src/config.ts`:

```typescript
export const config = {
  prefix: '!',
  defaultVolume: 50,
  maxQueueSize: 100,
  leaveOnEmpty: true,
  leaveOnEmptyDelay: 30000, // 30 seconds
}
```

### Lavalink Configuration

Edit `apps/lavalink/application.yml`:

```yaml
server:
  port: 2333
  address: 0.0.0.0

lavalink:
  server:
    password: "youshallnotpass"
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      http: true
```

---

## 🛠️ Development

### Available Commands

```bash
# Start all services in development mode
pnpm dev

# Build all apps for production
pnpm build

# Run linting
pnpm lint

# Type check
pnpm type-check

# Run Prisma Studio
cd apps/bot && pnpm prisma studio
```

### Adding New Commands

1. Create a new file in `apps/bot/src/commands/`:
```typescript
import { SlashCommandBuilder } from 'discord.js'
import type { Command } from '../types'

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('My command description'),
    
  async execute(interaction) {
    await interaction.reply('Hello!')
  }
}
```

2. The command will be automatically registered

### Database Migrations

```bash
cd apps/bot

# Create a new migration
pnpm prisma migrate dev --name migration_name

# Apply migrations
pnpm prisma migrate deploy

# Reset database (CAUTION)
pnpm prisma migrate reset
```

---

## 📦 Deployment

### Production Build

```bash
# Build all apps
pnpm build

# Start in production mode
cd apps/bot && pnpm start
cd apps/web && pnpm start
```

### Environment Variables for Production

Make sure to set all environment variables in your production environment:

- `NODE_ENV=production`
- Update all URLs to production URLs
- Use strong passwords and secrets
- Enable HTTPS for the web dashboard

### Docker Deployment (Coming Soon)

Docker Compose support is planned for easy deployment.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [Lavalink](https://github.com/lavalink-devs/Lavalink) - Audio streaming
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - ORM
- [Turborepo](https://turbo.build/) - Monorepo tooling

---

## 📧 Support

For support, please open an issue .

---

<div align="center">

**Made with ❤️ by Amineos**

⭐ Star this repository if you find it helpful!

</div>
