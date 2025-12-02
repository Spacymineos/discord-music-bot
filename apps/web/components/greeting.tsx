'use client'

import { useEffect, useState } from 'react'
import { Sunrise, Sun, Sunset, Moon, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface GreetingProps {
    userName?: string
}

export default function Greeting({ userName }: GreetingProps) {
    const [greeting, setGreeting] = useState('')
    const [icon, setIcon] = useState<React.ReactNode>(null)
    const [gradient, setGradient] = useState('')

    useEffect(() => {
        const hour = new Date().getHours()

        if (hour >= 5 && hour < 12) {
            setGreeting('Good morning')
            setIcon(<Sunrise className="w-8 h-8" />)
            setGradient('from-orange-400 via-yellow-400 to-amber-500')
        } else if (hour >= 12 && hour < 17) {
            setGreeting('Good afternoon')
            setIcon(<Sun className="w-8 h-8" />)
            setGradient('from-yellow-400 via-orange-400 to-red-400')
        } else if (hour >= 17 && hour < 21) {
            setGreeting('Good evening')
            setIcon(<Sunset className="w-8 h-8" />)
            setGradient('from-orange-500 via-pink-500 to-purple-600')
        } else {
            setGreeting('Good night')
            setIcon(<Moon className="w-8 h-8" />)
            setGradient('from-indigo-500 via-purple-500 to-pink-500')
        }
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-8 mb-8"
        >
            {/* Animated gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`}>
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        background: [
                            'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                        ],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center gap-6">
                {/* Icon with glow */}
                <motion.div
                    className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-2xl`}
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="text-white">
                        {icon}
                    </div>
                </motion.div>

                {/* Text */}
                <div className="flex-1">
                    <motion.h1
                        className="text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {greeting}{userName ? `, ${userName}` : ''}
                    </motion.h1>
                    <motion.p
                        className="text-zinc-400 text-lg flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        What would you like to listen to today?
                    </motion.p>
                </div>

                {/* Decorative elements */}
                <div className="hidden lg:block">
                    <motion.div
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
            </div>

            {/* Bottom shine effect */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-50`} />
        </motion.div>
    )
}
