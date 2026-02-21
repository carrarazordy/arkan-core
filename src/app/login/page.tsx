// Verified: logic relies on store.login and isAuthenticated state, no direct changes needed except import if it was importing 'account'. 
// Checking imports.
"use client";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Shield, AtSign, LockOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";



import { useIdentityStore } from "@/store/useIdentityStore";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";


export default function LoginPage() {
    const router = useRouter();
    const [time, setTime] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [authActive, setAuthActive] = useState(false);

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

    const { login } = useIdentityStore();

    const handleAuthenticate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        setError("");
        setIsLoading(true);

        try {
            await login(email, password);
            setAuthActive(true);
            ArkanAudio.play('system_execute_clack');

            // Success Transition - Real Auth Confirmed
            setTimeout(() => {
                router.push('/dashboard');
            }, 800);
        } catch (err: any) {
            console.error("Login process failed:", err);
            let message = err.message || JSON.stringify(err) || "AUTHENTICATION_FAILED";

            if (message.includes("fetch") || message.includes("NetworkError")) {
                message = "NETWORK_ERROR: CHECK_UPLINK_CONNECTION";
            }

            setError(message);
            ArkanAudio.play('error_buzz');
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        try {
            const origin = typeof window !== "undefined" && window.location.origin
                ? window.location.origin
                : "https://arkan-source.vercel.app";

            // const success = `${origin}/dashboard`;
            // const failure = `${origin}/login`;

            // account.createOAuth2Session(OAuthProvider.Google, success, failure);
            console.warn("Google Auth temporarily disabled during migration");
        } catch (err) {
            console.error("Google Auth Setup Failed:", err);
            setError("GOOGLE_AUTH_HANDSHAKE_FAILED");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-background font-display text-white/90 overflow-hidden">
            {/* Background Grid */}
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
                    <p>ENCRYPTION: AES_256_GCM</p>
                    <p>ARKAN_OS v4.0.2</p>
                </div>
            </div>
            <div className="fixed top-8 right-8 hidden lg:block text-right">
                <div className="text-[10px] tracking-[0.2em] text-primary/60 font-medium">
                    <p>LOCAL_TIME: <span id="clock">{time}</span></p>
                    <p>LOCATION: SECTOR_7_HUB</p>
                    <p>STATUS: STANDBY</p>
                </div>
            </div>
            <div className="fixed bottom-8 left-8 hidden lg:block">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border border-primary/20 rounded-lg flex items-center justify-center">
                        <Fingerprint className="text-primary/40 h-6 w-6" />
                    </div>
                    <div className="text-[10px] tracking-widest text-white/40 uppercase">
                        Biometric_Scan_Ready
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 w-full max-w-[440px]">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-center w-full">
                    <h1 className="text-xs font-bold tracking-[0.5em] text-primary glow-text uppercase mb-2">Arkan Command Center</h1>
                    <div className="h-[1px] w-32 bg-primary/30 mx-auto"></div>
                </div>

                <div className={cn(
                    "bg-[#151508]/95 backdrop-blur-md border rounded-lg p-8 glow-box relative overflow-hidden transition-colors duration-300",
                    error ? "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]" : "border-primary/40"
                )}>
                    {/* Corner Accents */}
                    <div className={cn("corner-accent top-0 left-0 border-t-2 border-l-2", error ? "border-red-500" : "border-primary")}></div>
                    <div className={cn("corner-accent top-0 right-0 border-t-2 border-r-2", error ? "border-red-500" : "border-primary")}></div>
                    <div className={cn("corner-accent bottom-0 left-0 border-b-2 border-l-2", error ? "border-red-500" : "border-primary")}></div>
                    <div className={cn("corner-accent bottom-0 right-0 border-b-2 border-r-2", error ? "border-red-500" : "border-primary")}></div>

                    <div className="mb-10 flex flex-col items-center text-center">
                        <div className={cn("w-16 h-16 mb-6 flex items-center justify-center border-2 rounded-full glow-box transition-colors", error ? "border-red-500 text-red-500" : "border-primary text-primary")}>
                            <Shield className="h-8 w-8" />
                        </div>
                        <h2 className={cn("text-xl font-bold tracking-widest uppercase glow-text transition-colors", error ? "text-red-500" : "text-white")}>
                            {error ? "ACCESS_DENIED" : "System_Authentication"}
                        </h2>
                        <p className="text-[10px] text-white/40 tracking-[0.2em] mt-1 uppercase">
                            {error ? "INVALID_CREDENTIALS_DETECTED" : "Identity Verification Required"}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleAuthenticate}>
                        <div className="group">
                            <label className={cn("block text-[10px] font-bold tracking-[0.3em] mb-2 uppercase transition-colors", error ? "text-red-500/70" : "text-primary/70 group-focus-within:text-primary")}>
                                EMAIL_ID
                            </label>
                            <div className="relative">
                                <AtSign className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors", error ? "text-red-500" : "text-primary/40")} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={cn(
                                        "w-full bg-black/60 border focus:ring-1 rounded py-3 pl-10 pr-4 text-sm tracking-widest text-white placeholder:text-white/20 transition-all outline-none",
                                        error
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                                            : "border-[#2d2d15] focus:border-primary focus:ring-primary/20"
                                    )}
                                    placeholder="ENTER_EMAIL..."
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className={cn("block text-[10px] font-bold tracking-[0.3em] mb-2 uppercase transition-colors", error ? "text-red-500/70" : "text-primary/70 group-focus-within:text-primary")}>
                                ACCESS_CODE
                            </label>
                            <div className="relative">
                                <LockOpen className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors", error ? "text-red-500" : "text-primary/40")} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={cn(
                                        "w-full bg-black/60 border focus:ring-1 rounded py-3 pl-10 pr-4 text-sm tracking-widest text-white placeholder:text-white/20 transition-all outline-none",
                                        error
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                                            : "border-[#2d2d15] focus:border-primary focus:ring-primary/20"
                                    )}
                                    placeholder="********"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-[10px] font-mono tracking-widest uppercase text-center border border-red-500/20 bg-red-500/10 p-3 rounded leading-relaxed animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <div className="pt-4 flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={cn(
                                    "w-full bg-transparent border-2 py-4 rounded font-bold tracking-[0.4em] uppercase transition-all duration-300 relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed",
                                    error
                                        ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
                                        : "border-primary text-primary hover:bg-primary hover:text-black"
                                )}
                            >
                                <span className="relative z-10">{isLoading ? 'AUTHENTICATING...' : (error ? 'RETRY_ACCESS' : 'AUTHORIZED_ACCESS')}</span>
                                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity", error ? "bg-red-500/10" : "bg-primary/10")}></div>
                            </button>

                            <div className="flex items-center gap-4 py-2 opacity-30">
                                <div className="h-[1px] flex-1 bg-white/20"></div>
                                <span className="text-[9px] tracking-widest uppercase">OR</span>
                                <div className="h-[1px] flex-1 bg-white/20"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full bg-black/40 border border-white/10 py-3 rounded text-[10px] font-bold text-white/60 tracking-[0.3em] uppercase hover:border-primary/50 hover:text-primary transition-all duration-300 flex items-center justify-center gap-3 group"
                            >
                                <svg className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors fill-current" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="relative z-10">Google Identity</span>
                            </button>
                        </div>
                    </form>

                    <div className={cn("mt-8 pt-6 border-t flex items-center justify-between transition-colors", error ? "border-red-500/20" : "border-white/5")}>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", error ? "bg-red-500 shadow-[0_0_8px_#ef4444]" : "bg-primary shadow-[0_0_8px_#ffff00]")}></div>
                            <span className="text-[10px] tracking-widest text-white/60 uppercase">Node_Active</span>
                        </div>
                        <div className="text-[10px] tracking-widest text-white/40 uppercase">
                            Port: 8080
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center space-y-4">
                    <Link href="/signup" className="inline-block text-[11px] tracking-[0.2em] text-primary/60 hover:text-primary transition-colors uppercase font-medium">
                        New User? <span className="underline underline-offset-4 decoration-primary/40">Initialize Account</span>
                    </Link>
                    <p className="text-[9px] text-white/20 tracking-[0.2em] uppercase max-w-[300px] mx-auto leading-relaxed">
                        Access restricted to authorized personnel only. Unauthorized access attempts are logged and reported.
                    </p>
                </div>
            </main>

            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-20">
                <div className="w-full h-[50%] bg-gradient-to-b from-transparent via-primary/5 to-transparent absolute scan-animate"></div>
            </div>
        </div>
    );
}
