'use client'

import { motion } from 'framer-motion'
import { Music, Home, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
            {/* Animated background gradients */}
            <div className="absolute inset-0">
                <motion.div
                    className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
            </div>

            <div className="relative z-10 text-center px-4 max-w-2xl">
                {/* Animated 404 */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="mb-8"
                >
                    <div className="relative inline-block">


                        <h1 className="text-9xl md:text-[12rem] font-black bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
                            404
                        </h1>
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                boxShadow: [
                                    '0 0 60px rgba(34, 197, 94, 0.3)',
                                    '0 0 100px rgba(34, 197, 94, 0.5)',
                                    '0 0 60px rgba(34, 197, 94, 0.3)',
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>

                {/* Floating music note */}
                <motion.div
                    className="flex justify-center mb-8"
                    animate={{
                        y: [-10, 10, -10],
                        rotate: [-5, 5, -5]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    <div className="relative">
                        <Music className="w-20 h-20 text-green-500" strokeWidth={1.5} />
                        <motion.div
                            className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 0.2, 0.5]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>

                {/* Text content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-xl text-zinc-400 mb-8 max-w-md mx-auto">
                        Looks like this track got skipped. The page you're looking for doesn't exist.
                    </p>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link href="/">
                        <Button
                            size="lg"
                            className="group bg-green-500 hover:bg-green-600 text-black font-semibold px-8 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Button>
                    </Link>

                    <Link href="/search">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-zinc-700 hover:border-green-500 hover:text-green-500 bg-zinc-900/50 backdrop-blur-sm px-8"
                        >
                            <Search className="w-5 h-5 mr-2" />
                            Search Music
                        </Button>
                    </Link>
                </motion.div>

                {/* Decorative elements */}
                <motion.div
                    className="mt-16 flex justify-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-gradient-to-t from-green-500/50 to-green-500/0 rounded-full"
                            animate={{
                                height: [20, 40, 20],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
