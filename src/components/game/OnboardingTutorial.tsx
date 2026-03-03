"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Trophy, Users, Coins, Shirt, Palette } from "lucide-react"
import { soundManager } from "~/lib/SoundManager"

interface OnboardingTutorialProps {
    onComplete: (tutorialId: string) => void
    onStepChange?: (stepIndex: number) => void
}

const STEPS = [
    {
        id: "tutorial-balances",
        title: "Your Party Wallet",
        description: "Track your earnings here! Use Tokens for shop items and USDC for exclusive rewards.",
        icon: <Coins className="w-6 h-6 text-yellow-400" />
    },
    {
        id: "tutorial-rankings",
        title: "Global Champions",
        description: "See how you rank against the top players in the world. Fame and glory await!",
        icon: <Trophy className="w-6 h-6 text-indigo-400" />
    },
    {
        id: "tutorial-inventory",
        title: "The Workshop",
        description: "This is where you can customize your panther and the world itself. Magic ahead!",
        icon: <Shirt className="w-6 h-6 text-pink-500" />
    },
    {
        id: "tutorial-shop-skins-grid",
        title: "Epic Skins",
        description: "You start with the Classic Pink, but there are dozens of epic skins to unlock with tokens!",
        icon: <Shirt className="w-6 h-6 text-emerald-400" />
    },
    {
        id: "tutorial-shop-themes-grid",
        title: "Dynamic Worlds",
        description: "Personalize your game world. We've unlocked 4 themes just for you: Pink, Blue, Forest, and Sunset!",
        icon: <Palette className="w-6 h-6 text-purple-400" />
    },
    {
        id: "tutorial-referrals",
        title: "Invite your Squad",
        description: "Referring friends is the fastest way to earn USDC. Grow the Party Land family!",
        icon: <Users className="w-6 h-6 text-pink-400" />
    },
    {
        id: "tutorial-play",
        title: "Let's Get Started!",
        description: "Choose your favorite game and start your journey to the top of the leaderboard.",
        icon: <ChevronRight className="w-6 h-6 text-emerald-400" />
    }
];

export function OnboardingTutorial({ onComplete, onStepChange }: OnboardingTutorialProps) {
    const [step, setStep] = useState(0);
    const [dimensions, setDimensions] = useState<{
        width: number
        height: number
        top: number
        left: number
    } | null>(null)

    const updateDimensions = useCallback(() => {
        const id = STEPS[step].id;
        const element = document.getElementById(id)
        if (element) {
            const rect = element.getBoundingClientRect()
            setDimensions({
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
            })
        }
    }, [step])

    useEffect(() => {
        // Small delay to ensure layout is ready after step transition
        const timer = setTimeout(updateDimensions, 150);
        window.addEventListener("resize", updateDimensions)
        return () => {
            window.removeEventListener("resize", updateDimensions);
            clearTimeout(timer);
        }
    }, [updateDimensions, step])

    const nextStep = () => {
        if (step < STEPS.length - 1) {
            const nextIdx = step + 1;
            setStep(nextIdx);
            onStepChange?.(nextIdx);
            soundManager.play('bubble'); // AAA Feeling: Sound on step change
        } else {
            soundManager.play('start'); // AAA Feeling: Sound on finish
            onComplete("party_land_tutorial_done")
        }
    }

    const prevStep = () => {
        if (step > 0) {
            const prevIdx = step - 1;
            setStep(prevIdx);
            onStepChange?.(prevIdx);
            soundManager.play('click');
        }
    }

    const closeTutorial = () => {
        soundManager.play('click');
        onComplete("party_land_tutorial_done")
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
                {/* SVG Mask Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                    <defs>
                        <mask id="tutorial-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {dimensions && (
                                <motion.rect
                                    initial={false}
                                    animate={{
                                        x: dimensions.left - 6,
                                        y: dimensions.top - 6,
                                        width: dimensions.width + 12,
                                        height: dimensions.height + 12,
                                        rx: 20,
                                    }}
                                    fill="black"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.85)"
                        mask="url(#tutorial-mask)"
                        onClick={closeTutorial}
                    />
                </svg>

                {/* Tutorial Content Card */}
                {dimensions && (
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                        }}
                        style={{
                            position: 'fixed',
                            left: '50%',
                            translateX: '-50%',
                            // Prevent stretching: If we use top, bottom must be auto and vice-versa
                            top: (dimensions.height > window.innerHeight * 0.5 || dimensions.top >= window.innerHeight * 0.5)
                                ? 80 // Element is at bottom or huge -> Card to the top
                                : dimensions.top + dimensions.height + 24, // Element is at top -> Card below it
                            bottom: (dimensions.height > window.innerHeight * 0.5 || dimensions.top >= window.innerHeight * 0.5)
                                ? 'auto'
                                : 'auto', // Explicitly auto to avoid stretching from previous states
                            zIndex: 110
                        }}
                        className="w-[90%] max-w-[340px] bg-indigo-950 border-2 border-pink-500/50 rounded-3xl p-6 shadow-[0_0_40px_rgba(236,72,153,0.4)] pointer-events-auto backdrop-blur-xl"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-xl border border-white/10 shrink-0">
                                    {STEPS[step].icon}
                                </div>
                                <h3 className="text-xl font-black text-white italic tracking-tight">
                                    {STEPS[step].title}
                                </h3>
                            </div>
                            <button
                                onClick={closeTutorial}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
                            >
                                <X className="h-5 w-5 text-white/40" />
                            </button>
                        </div>

                        <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">
                            {STEPS[step].description}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1.5">
                                {STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-pink-500' : 'w-1.5 bg-white/20'}`}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                {step > 0 && (
                                    <button
                                        onClick={prevStep}
                                        className="h-10 px-4 bg-white/5 border border-white/10 text-white rounded-xl font-black text-xs hover:bg-white/10 active:scale-95 transition-all flex items-center gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        BACK
                                    </button>
                                )}
                                <button
                                    onClick={nextStep}
                                    className={`h-10 px-5 rounded-xl font-black text-xs active:scale-95 transition-all flex items-center gap-2 shadow-lg ${step === STEPS.length - 1
                                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                        : 'bg-yellow-400 text-purple-900 shadow-yellow-400/20'
                                        }`}
                                >
                                    {step === STEPS.length - 1 ? "FINISH" : "NEXT"}
                                    {step < STEPS.length - 1 && <ChevronRight className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </AnimatePresence>
    )
}
