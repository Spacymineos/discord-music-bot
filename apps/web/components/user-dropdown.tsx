'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { Session } from 'next-auth'

interface UserDropdownProps {
    session: Session
    onSettingsClick?: () => void
}

export default function UserDropdown({ session }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-white/10 transition-colors group"
            >
                <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center text-black font-bold text-sm overflow-hidden ring-2 ring-transparent group-hover:ring-white/20 transition-all">
                        {session.user?.image ? (
                            <Image
                                src={session.user.image}
                                alt={session.user.name || 'User'}
                                width={36}
                                height={36}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            session.user?.name?.charAt(0)
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white group-hover:text-green-400 transition-colors">
                        {session.user?.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                        Online
                    </p>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                        <div className="p-2">
                            <button
                                onClick={() => signOut()}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 transition-colors group"
                            >
                                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
