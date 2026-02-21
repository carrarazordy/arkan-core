"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, AtSign, LockOpen, User } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
    const router = useRouter();
    const [time, setTime] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0') + ':' +
                now.getSeconds().toString().padStart(2, '0');
            setTime(timeStr);
        };
        const interval = setInterval(updateClock, 1000);
        updateClock();
        return () => clearInterval(interval);
    }, []);

    const handleSignup = async () => {
        console.log("Signup triggered:", { name, email });
        setError("");
        setIsLoading(true);
        try {
            console.log("Step 1: Creating Supabase user...");
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (signUpError) throw signUpError;

            console.log("Step 1 Success: User created", data.user?.id);
            console.log("Step 2: Redirecting to dashboard...");
            router.push('/dashboard');
        } catch (err: any) {
            console.error("Signup process failed:", err);
            setError(err.message || "REGISTRATION_FAILED");
        } finally {
            setIsLoading(false);
            console.log("Signup flow completed");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-background font-display text-white/90 overflow-hidden">
            {/* Ambient Grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 0, 0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255, 255, 0, 0.03) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* HUD Elements */}
            <div className="fixed top-8 left-8 hidden lg:block">
                <div className="text-[10px] tracking-[0.2em] text-primary/60 font-medium">
                    <p>SECURE_CONNECTION: ESTABLISHED</p>
                    <p>PROTOCOL: NEW_IDENTITY_CREATION</p>
                    <p>ARKAN_OS v4.0.2</p>
                </div>
            </div>
            <div className="fixed top-8 right-8 hidden lg:block text-right">
                <div className="text-[10px] tracking-[0.2em] text-primary/60 font-medium">
                    <p>LOCAL_TIME: <span id="clock">{time}</span></p>
                    <p>LOCATION: SECTOR_7_HUB</p>
                    <p>STATUS: INITIALIZING</p>
                </div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 w-full max-w-[440px]">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-center w-full">
                    <h1 className="text-xs font-bold tracking-[0.5em] text-primary glow-text uppercase mb-2">Arkan Command Center</h1>
                    <div className="h-[1px] w-32 bg-primary/30 mx-auto"></div>
                </div>

                <div className="bg-[#151508]/95 backdrop-blur-md border border-primary/40 rounded-lg p-8 glow-box relative overflow-hidden">
                    <div className="corner-accent top-0 left-0 border-t-2 border-l-2"></div>
                    <div className="corner-accent top-0 right-0 border-t-2 border-r-2"></div>
                    <div className="corner-accent bottom-0 left-0 border-b-2 border-l-2"></div>
                    <div className="corner-accent bottom-0 right-0 border-b-2 border-r-2"></div>

                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 mb-6 flex items-center justify-center border-2 border-primary rounded-full glow-box">
                            <UserPlus className="text-primary h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold tracking-widest text-white uppercase glow-text">Initialize Identity</h2>
                        <p className="text-[10px] text-white/40 tracking-[0.2em] mt-1 uppercase">Create new system access profile</p>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
                        <div className="group">
                            <label className="block text-[10px] font-bold tracking-[0.3em] text-primary/70 mb-2 uppercase group-focus-within:text-primary transition-colors">
                                OPERATOR_NAME
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 h-4 w-4" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/60 border border-[#2d2d15] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded py-3 pl-10 pr-4 text-sm tracking-widest text-white placeholder:text-white/20 transition-all outline-none"
                                    placeholder="ENTER_NAME..."
                                    required
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-bold tracking-[0.3em] text-primary/70 mb-2 uppercase group-focus-within:text-primary transition-colors">
                                EMAIL_ID
                            </label>
                            <div className="relative">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 h-4 w-4" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/60 border border-[#2d2d15] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded py-3 pl-10 pr-4 text-sm tracking-widest text-white placeholder:text-white/20 transition-all outline-none"
                                    placeholder="ENTER_EMAIL..."
                                    required
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-bold tracking-[0.3em] text-primary/70 mb-2 uppercase group-focus-within:text-primary transition-colors">
                                SET_ACCESS_CODE
                            </label>
                            <div className="relative">
                                <LockOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 h-4 w-4" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/60 border border-[#2d2d15] focus:border-primary focus:ring-1 focus:ring-primary/20 rounded py-3 pl-10 pr-4 text-sm tracking-widest text-white placeholder:text-white/20 transition-all outline-none"
                                    placeholder="********"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex flex-col gap-3">
                                <div className="text-red-500 text-[10px] font-mono tracking-widest uppercase text-center border border-red-500/20 bg-red-500/10 p-3 rounded leading-relaxed">
                                    {error}
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <button type="submit" disabled={isLoading} className="w-full bg-transparent border-2 border-primary py-4 rounded font-bold text-primary tracking-[0.4em] uppercase hover:bg-primary hover:text-black transition-all duration-300 relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="relative z-10">{isLoading ? 'INITIALIZING...' : (error ? 'RETRY_INITIALIZATION' : 'CREATE_IDENTITY')}</span>
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#ffff00]"></div>
                            <span className="text-[10px] tracking-widest text-white/60 uppercase">System_Ready</span>
                        </div>
                        <div className="text-[10px] tracking-widest text-white/40 uppercase">
                            V 4.0.2
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center space-y-4">
                    <Link href="/login" className="inline-block text-[11px] tracking-[0.2em] text-primary/60 hover:text-primary transition-colors uppercase font-medium">
                        Existing User? <span className="underline underline-offset-4 decoration-primary/40">Access Login</span>
                    </Link>
                </div>
            </main>
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-20">
                <div className="w-full h-[50%] bg-gradient-to-b from-transparent via-primary/5 to-transparent absolute scan-animate"></div>
            </div>
        </div>
    );
}
