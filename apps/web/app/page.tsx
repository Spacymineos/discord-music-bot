'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Music, Zap, Shield, Users, TrendingUp, Star, ArrowRight, Play, Pause, SkipForward, Volume2, Github, Twitter, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRef, useState, useEffect } from 'react'

export default function LandingPage() {
    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            {/* Hero Section with Parallax */}
            <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <motion.div
                    style={{ y }}
                    className="absolute inset-0 z-0"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-purple-500/10" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

                    {/* Animated Particles */}
                    <div className="absolute inset-0">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-green-400/30 rounded-full"
                                initial={{
                                    x: Math.random() * window.innerWidth,
                                    y: Math.random() * window.innerHeight,
                                }}
                                animate={{
                                    y: [null, Math.random() * window.innerHeight],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: Math.random() * 10 + 10,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Hero Content */}
                <motion.div
                    style={{ opacity }}
                    className="relative z-10 text-center px-4 max-w-5xl mx-auto"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="inline-block p-4 bg-green-500/10 rounded-2xl backdrop-blur-sm border border-green-500/20 mb-6">
                            <Music className="w-16 h-16 text-green-400" />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-green-200 to-emerald-400 bg-clip-text text-transparent leading-tight"
                    >
                        Premium Music
                        <br />
                        For Your Discord
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto"
                    >
                        Experience crystal-clear audio, lightning-fast playback, and a stunning interface.
                        The most advanced Discord music bot.
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link href="/login">
                            <Button
                                size="lg"
                                className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold px-8 py-6 text-lg shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Add to Discord
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <motion.div
                                    className="absolute inset-0 rounded-lg bg-white/20"
                                    animate={{
                                        scale: [1, 1.05, 1],
                                        opacity: [0, 0.5, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity
                                    }}
                                />
                            </Button>
                        </Link>

                        <Button
                            size="lg"
                            variant="outline"
                            className="border-zinc-700 hover:border-green-500 bg-zinc-900/50 backdrop-blur-sm px-8 py-6 text-lg hover:bg-zinc-800/50"
                        >
                            View Features
                        </Button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                    >
                        <StatCard number="10K+" label="Servers" />
                        <StatCard number="1M+" label="Users" />
                        <StatCard number="99.9%" label="Uptime" />
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-zinc-600 rounded-full p-1"
                    >
                        <motion.div
                            animate={{ y: [0, 16, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1.5 h-1.5 bg-green-400 rounded-full mx-auto"
                        />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                            Why Choose Us?
                        </h2>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                            Built with cutting-edge technology to deliver the best music experience
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-8 h-8" />}
                            title="Lightning Fast"
                            description="Instant playback with zero buffering. Our optimized infrastructure ensures smooth streaming."
                            delay={0}
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8" />}
                            title="Always Reliable"
                            description="99.9% uptime guaranteed. Your music never stops with our redundant systems."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Star className="w-8 h-8" />}
                            title="Premium Quality"
                            description="Crystal-clear audio up to 320kbps. Experience music the way it was meant to be heard."
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>

            {/* Player Preview Section */}
            <section className="py-32 px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            Beautiful Interface
                        </h2>
                        <p className="text-xl text-zinc-400">
                            A stunning dashboard that makes managing your music a pleasure
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-green-500/10"
                    >
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-8">
                            <PlayerPreview />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            Ready to Elevate Your Server?
                        </h2>
                        <p className="text-xl text-zinc-400 mb-12">
                            Join thousands of servers already enjoying premium music
                        </p>
                        <Link href="/login">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold px-12 py-6 text-xl shadow-2xl shadow-green-500/50"
                            >
                                Get Started Free
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-900 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Music className="w-6 h-6 text-green-500" />
                                <span className="font-bold text-lg">MusicBot</span>
                            </div>
                            <p className="text-sm text-zinc-500">
                                Premium music for Discord servers
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-sm text-zinc-400">
                                <li><Link href="#" className="hover:text-green-400 transition-colors">Features</Link></li>
                                <li><Link href="#" className="hover:text-green-400 transition-colors">Pricing</Link></li>
                                <li><Link href="#" className="hover:text-green-400 transition-colors">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-sm text-zinc-400">
                                <li><Link href="#" className="hover:text-green-400 transition-colors">Documentation</Link></li>
                                <li><Link href="#" className="hover:text-green-400 transition-colors">Discord</Link></li>
                                <li><Link href="#" className="hover:text-green-400 transition-colors">Status</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Connect</h3>
                            <div className="flex gap-4">
                                <SocialLink icon={<Github className="w-5 h-5" />} href="#" />
                                <SocialLink icon={<Twitter className="w-5 h-5" />} href="#" />
                                <SocialLink icon={<MessageCircle className="w-5 h-5" />} href="#" />
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-zinc-900 pt-8 text-center text-sm text-zinc-500">
                        <p>© 2024 MusicBot. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function StatCard({ number, label }: { number: string; label: string }) {
    return (
        <div className="text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2"
            >
                {number}
            </motion.div>
            <div className="text-sm text-zinc-500 font-medium">{label}</div>
        </div>
    )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="p-8 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 hover:border-green-500/50 transition-all group"
        >
            <div className="inline-block p-3 bg-green-500/10 rounded-xl mb-4 text-green-400 group-hover:bg-green-500/20 transition-colors">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{description}</p>
        </motion.div>
    )
}

function PlayerPreview() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Music className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                    <div className="text-lg font-semibold mb-1">Amazing Song Name</div>
                    <div className="text-sm text-zinc-400">Artist Name</div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-3 hover:bg-white/5 rounded-full transition-colors">
                    <SkipForward className="w-5 h-5 rotate-180" />
                </button>
                <button className="p-4 bg-white rounded-full hover:scale-105 transition-transform">
                    <Play className="w-6 h-6 text-black fill-current" />
                </button>
                <button className="p-3 hover:bg-white/5 rounded-full transition-colors">
                    <SkipForward className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">1:23</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-gradient-to-r from-green-500 to-emerald-400" />
                </div>
                <span className="text-xs text-zinc-500">3:45</span>
            </div>
        </div>
    )
}

function SocialLink({ icon, href }: { icon: React.ReactNode; href: string }) {
    return (
        <a
            href={href}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-green-400"
        >
            {icon}
        </a>
    )
}
