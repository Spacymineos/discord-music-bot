import { FastifyPluginAsync } from 'fastify'

const lyrics: FastifyPluginAsync = async (fastify) => {
    fastify.get('/:guildId/search', async (request, reply) => {
        const { query } = request.query as { query: string }

        // Mock lyrics response for now
        // In a real app, you would call a lyrics API here (e.g. Genius, Musixmatch)

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500))

        if (!query) {
            return { lyrics: null }
        }

        // Return dummy lyrics
        return {
            lyrics: `[Verse 1]
This is a sample lyrics response
For the song you requested: "${query}"
We are mocking this data
To demonstrate the UI capabilities

[Chorus]
Singing along to the code
Building features, node by node
The interface is looking clean
Best music bot you've ever seen

[Verse 2]
Imagine real lyrics here
Synced perfectly to your ear
Scrolling down as time goes by
Underneath the digital sky

[Bridge]
(Instrumental Break)
...
...

[Chorus]
Singing along to the code
Building features, node by node
The interface is looking clean
Best music bot you've ever seen

[Outro]
Fade out...
`
        }
    })
}

export default lyrics
export const autoPrefix = '/lyrics'
