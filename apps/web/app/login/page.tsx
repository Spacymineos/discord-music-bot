'use client'

import { useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Music } from 'lucide-react'

export default function LoginPage() {
    useEffect(() => {
        // Automatically redirect to Discord OAuth
        signIn('discord', { callbackUrl: '/dashboard' })
    }, [])

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-black">
            {/* Loading animation while redirecting */}
            <div className="text-center">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity
                    }}
                    className="inline-block mb-6"
                >
                    <Music className="w-16 h-16 text-green-500" />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-zinc-400 text-lg"
                >
                    Redirecting to Discord...
                </motion.p>
            </div>
        </main>
    )
}
