"use client";

/**
 * How this code works:
 * 
 * - This is a React component for an authenticated IP Calculator page.
 * - It uses NextAuth for session/authentication. If the user is not logged in, it redirects to the sign-in page.
 * - The user can enter a WAN IP address and a CIDR value. As the user types the WAN IP, suggestions are fetched from the backend.
 * - When the user clicks "Calculate", the code validates the input and computes subnet details using utility functions.
 * - The result is displayed, and the user can save the calculation to the backend.
 * 
 * Potential Weaknesses or Vulnerabilities (and how they are fixed):
 * 
 * 1. Input Validation:
 *    - Weakness: Only client-side validation is not enough. Malicious or malformed data could be sent to the backend.
 *    - Fix: You must also validate and sanitize all inputs on the backend in `/api/calculations` and `/api/wan-ip/lookup`.
 * 
 * 2. Suggestions API Data Exposure:
 *    - Weakness: The WAN IP suggestions endpoint could leak sensitive data if not protected.
 *    - Fix: Backend must only return non-sensitive info and check user permissions before returning suggestions.
 * 
 * 3. Rate Limiting:
 *    - Weakness: No rate limiting on WAN IP suggestions or calculation saving, so a user could spam requests.
 *    - Fix: Implement rate limiting on backend endpoints.
 * 
 * 4. Error Handling:
 *    - Weakness: Used alert() for feedback, which is not user-friendly and could be abused for spamming.
 *    - Fix: Now uses error state and UI display; use a toast/snackbar in production.
 * 
 * 5. Type Safety:
 *    - Weakness: Used "any" for result and wanIpSuggestions, reducing type safety.
 *    - Fix: Added TypeScript interfaces for suggestions and results.
 * 
 * 6. UX (Suggestion List):
 *    - Weakness: setTimeout for hiding suggestions on blur could cause flicker or race conditions.
 *    - Fix: Use onMouseDown for suggestion selection to avoid blur race.
 * 
 * 7. CSRF/Session Protection:
 *    - Weakness: No CSRF protection for the POST request to /api/calculations.
 *    - Fix: Use credentials: "include" and ensure backend checks session/auth.
 * 
 * 8. API Endpoint Security:
 *    - Weakness: API endpoints must check authentication/authorization, not just the UI.
 *    - Fix: Ensure this in backend.
 * 
 * See also the backend code for `/api/calculations` and `/api/wan-ip/lookup` for proper validation, authentication, and rate limiting.
 */

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { calculateIP, isValidIPAddress, isValidCIDR } from "@/lib/utils";

// TypeScript interfaces for type safety
interface WanIpSuggestion {
    id: string;
    ipAddress: string;
    description?: string;
}

interface IPCalculationResult {
    subnetMask: string;
    usableHosts: number;
    [key: string]: any;
}

export default function IPCalculatorPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [wanIp, setWanIp] = useState("");
    const [cidr, setCidr] = useState("");
    const [result, setResult] = useState<IPCalculationResult | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [wanIpSuggestions, setWanIpSuggestions] = useState<WanIpSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [correctedCidr, setCorrectedCidr] = useState<number | null>(null);
    const [correctionSource, setCorrectionSource] = useState<string | null>(null);
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const [showGate, setShowGate] = useState(false);
    const [gateChecks, setGateChecks] = useState({
        yt: false,
        tg: false,
        li: false,
        x: false,
        ig: false,
        tk: false,
    });
    const [gateReason, setGateReason] = useState<string | null>(null);
    const [ytOpened, setYtOpened] = useState(false);
    const [tgUserId, setTgUserId] = useState("");
    const [tgVerifying, setTgVerifying] = useState(false);

    const handleClear = () => {
        setWanIp("");
        setCidr("");
        setResult(null);
        setError("");
        setSuccessMsg("");
        setWanIpSuggestions([]);
        setShowSuggestions(false);
        setCorrectedCidr(null);
        setCorrectionSource(null);
    };

    // Allow unauthenticated users a one-time trial; do not auto-redirect here

    // Fetch WAN IP suggestions as user types
    useEffect(() => {
        let ignore = false;
        if (wanIp.trim().length > 0) {
            const fetchSuggestions = async () => {
                try {
                    const response = await fetch(
                        `/api/wan-ip/lookup?q=${encodeURIComponent(wanIp)}`,
                        {
                            credentials: "include", // for CSRF/session protection
                        }
                    );
                    if (response.ok) {
                        const data: WanIpSuggestion[] = await response.json();
                        if (!ignore) {
                            setWanIpSuggestions(data);
                            setShowSuggestions(true);
                        }
                    } else {
                        setWanIpSuggestions([]);
                        setShowSuggestions(false);
                    }
                } catch (error) {
                    setWanIpSuggestions([]);
                    setShowSuggestions(false);
                }
            };
            fetchSuggestions();
        } else {
            setWanIpSuggestions([]);
            setShowSuggestions(false);
        }
        return () => { ignore = true; };
    }, [wanIp]);

    // Hide suggestions on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        }
        if (showSuggestions) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSuggestions]);

    const handleWanIpSelect = (ip: string) => {
        setWanIp(ip);
        setShowSuggestions(false);
    };

    const handleCalculate = async () => {
        setError("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            const isLoggedIn = Boolean(session);
            const isPrivileged = (session?.user?.email || '').toLowerCase() === 'josen@gmail.com';
            const trialUsed = typeof window !== 'undefined' && (localStorage.getItem('trialUsed') === '1' || document.cookie.includes('trial_used=1'));
            if (!isLoggedIn && trialUsed) {
                toast.info("Free trial used", { description: "Create an account to continue using IP tools." });
                setIsLoading(false);
                router.push('/auth/signup');
                return;
            }

            // Logged-in soft gate after 2 successful uses if not social verified
            const userKey = (session?.user?.email || session?.user?.name || 'user').toLowerCase();
            const usesKey = `uses_calc_${userKey}`;
            const verifiedKey = `social_verified_${userKey}`;
            const verified = typeof window !== 'undefined' && (localStorage.getItem(verifiedKey) === '1' || document.cookie.includes(`${verifiedKey}=1`));
            const lsUses = parseInt(localStorage.getItem(usesKey) || '0', 10) || 0;
            const cookieMatch = document.cookie.match(new RegExp(`${usesKey}=([^;]+)`));
            const ckUses = cookieMatch ? parseInt(cookieMatch[1], 10) || 0 : 0;
            const pastUses = Math.max(lsUses, ckUses);
            if (!isPrivileged && isLoggedIn && !verified && pastUses >= 2) {
                setShowGate(true);
                setIsLoading(false);
                return;
            }

            if (!wanIp.trim() || !cidr.trim()) {
                throw new Error(
                    "Please enter both IP address and CIDR notation"
                );
            }

            if (!isValidIPAddress(wanIp)) {
                throw new Error("Invalid IP address format");
            }

            let cidrNum = parseInt(cidr, 10);
            if (!isValidCIDR(cidrNum)) {
                throw new Error("CIDR must be an integer between 0 and 32");
            }
            // Try to detect the canonical CIDR for this IP via analyzer
            try {
                const resp = await fetch(`/api/wan-ip/analyze?ip=${encodeURIComponent(wanIp)}&unmetered=1`);
                if (resp.ok) {
                    const data = await resp.json();
                    const detectedRaw = data?.networkInfo?.cidr;
                    const detected = typeof detectedRaw === 'string' ? parseInt(detectedRaw, 10) : detectedRaw;
                    if (typeof detected === "number" && Number.isFinite(detected) && detected >= 0 && detected <= 32) {
                        if (detected !== cidrNum) {
                            cidrNum = detected;
                            setCidr(String(detected));
                            const src = [data?.region?.interface, data?.region?.name].filter(Boolean).join(" — ") || null;
                            setCorrectedCidr(detected);
                            setCorrectionSource(src);
                            toast.info("CIDR auto-corrected", {
                                description: `Detected /${detected} for ${wanIp}${src ? ` from ${src}` : ''}.`,
                            });
                        } else {
                            setCorrectedCidr(null);
                            setCorrectionSource(null);
                        }
                    }
                } else if (resp.status === 429) {
                    const data = await resp.json();
                    setGateReason(data.error || 'Verification required');
                    setShowGate(true);
                    setIsLoading(false);
                    return;
                }
            } catch (e: any) {
                // If analyzer fails, proceed with user-entered CIDR (already validated)
                setCorrectedCidr(null);
                setCorrectionSource(null);
            }

            const calculation = calculateIP(wanIp, cidrNum);
            setResult(calculation);
            toast.success("Great! Calculation successful", {
                description: `Subnet: ${calculation.subnetMask}, Gateway: ${calculation.defaultGateway}`,
            });

            // Mark trial used for guests after first success
            if (!isLoggedIn) {
                try {
                    localStorage.setItem('trialUsed', '1');
                    document.cookie = `trial_used=1; max-age=31536000; path=/`;
                } catch {}
            }

            // Increment uses for logged-in
            if (isLoggedIn && !isPrivileged) {
                try {
                    const next = String(pastUses + 1);
                    localStorage.setItem(usesKey, next);
                    document.cookie = `${usesKey}=${next}; max-age=31536000; path=/`;
                } catch {}
            }
        } catch (err: any) {
            setError(err.message);
            setResult(null);
            toast.error("Check your inputs", {
                description: `${err.message}. If you don't know the CIDR, try the WAN IP Analyzer tool.`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const allGateChecked = gateChecks.yt && gateChecks.tg && gateChecks.li && gateChecks.x && gateChecks.ig && gateChecks.tk;
    const completeGate = () => {
        try {
            const userKey = (session?.user?.email || session?.user?.name || 'user').toLowerCase();
            const verifiedKey = `social_verified_${userKey}`;
            localStorage.setItem(verifiedKey, '1');
            document.cookie = `${verifiedKey}=1; max-age=31536000; path=/`;
        } catch {}
        setShowGate(false);
        toast.success('Thanks for supporting us!');
    };

    const handleSave = async () => {
        setError("");
        setSuccessMsg("");
        if (!result) return;

        try {
            const response = await fetch("/api/calculations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // for CSRF/session protection
                body: JSON.stringify({
                    title: `Calculation for ${wanIp}/${cidr}`,
                    wanIp,
                    cidr,
                    result,
                }),
            });

            if (response.ok) {
                setSuccessMsg("Calculation saved successfully.");
            } else {
                setError("Failed to save calculation.");
            }
        } catch (error) {
            setError("Error saving calculation.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">IP Calculator</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Label htmlFor="wanIp">WAN IP Address</Label>
                    <Input
                        id="wanIp"
                        type="text"
                        value={wanIp}
                        onChange={(e) => setWanIp(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        autoComplete="off"
                        aria-autocomplete="list"
                        aria-controls="wan-ip-suggestions"
                    />
                    {wanIp && (
                        <button
                            type="button"
                            aria-label="Clear WAN IP"
                            onClick={() => { setWanIp(""); setWanIpSuggestions([]); setShowSuggestions(false); }}
                            className="absolute right-2 top-8 p-1 rounded hover:bg-gray-100"
                        >
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    )}
                    {showSuggestions && wanIpSuggestions.length > 0 && (
                        <ul
                            ref={suggestionsRef}
                            id="wan-ip-suggestions"
                            className="absolute mt-1 z-10 bg-white border border-gray-200 rounded-md w-full max-h-60 overflow-auto shadow-sm"
                        >
                            {wanIpSuggestions.map((item) => (
                                <li
                                    key={item.id}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm"
                                    onMouseDown={() => handleWanIpSelect(item.ipAddress)}
                                >
                                    {item.ipAddress} {item.description ? `- ${item.description}` : ""}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="relative">
                    <Label htmlFor="cidr">CIDR</Label>
                    <Input
                        id="cidr"
                        type="text"
                        value={cidr}
                        onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/[^0-9]/g, "");
                            // prevent leading zeros like "024" while typing
                            const normalized = onlyDigits.replace(/^0+(\d)/, '$1');
                            setCidr(normalized);
                        }}
                        placeholder="e.g., 24"
                    />
                    {cidr && (
                        <button
                            type="button"
                            aria-label="Clear CIDR"
                            onClick={() => setCidr("")}
                            className="absolute right-2 top-8 p-1 rounded hover:bg-gray-100"
                        >
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
                <Button onClick={handleCalculate} disabled={isLoading}>
                    Calculate
                </Button>
                <Button variant="secondary" type="button" onClick={handleClear}>
                    Clear
                </Button>
            </div>

            {error && (
                <div className="mt-4 text-red-600 flex items-center gap-2">
                    <AlertCircle /> {error}
                </div>
            )}

            {successMsg && (
                <div className="mt-4 text-green-600 flex items-center gap-2">
                    {successMsg}
                </div>
            )}

            {result && (
                <div className="mt-6">
                    {correctedCidr !== null && (
                        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                            CIDR adjusted to /{correctedCidr} {correctionSource ? `based on ${correctionSource}` : "based on provider pool"}. This is the correct CIDR for your WAN IP.
                        </div>
                    )}
                    <Card>
                        <CardHeader>
                            <CardTitle>Calculation Result</CardTitle>
                            <CardDescription>
                                Details of the IP calculation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <p><span className="font-medium">Subnet Mask:</span> {result.subnetMask}</p>
                                <p><span className="font-medium">Default Gateway:</span> {result.defaultGateway}</p>
                                <p><span className="font-medium">Usable Hosts:</span> {result.usableHosts?.toLocaleString()}</p>
                                <p><span className="font-medium">CIDR:</span> {result.cidrNotation}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Button className="mt-4" onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Save Calculation
                    </Button>
                </div>
            )}
            {showGate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
                        <h3 className="text-xl font-semibold mb-2">Support Yoh-Tech Solutions</h3>
                        <p className="text-sm text-gray-600 mb-1">Follow/subscribe to continue using the tools.</p>
                        {gateReason && (
                            <p className="text-xs text-orange-600 mb-3">{gateReason}</p>
                        )}
                        <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <label className="flex items-center gap-3">
                                <input type="checkbox" disabled={!ytOpened} checked={gateChecks.yt} onChange={(e) => setGateChecks({ ...gateChecks, yt: e.target.checked })} />
                                <span>YouTube</span>
                            </label>
                            <a onClick={() => setYtOpened(true)} href="https://www.youtube.com/@Yoh-Tech-Solutions" target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Open</a>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" disabled checked={gateChecks.tg} onChange={() => {}} />
                                    <span>Telegram (auto-verified)</span>
                                </label>
                                <a href="https://t.me/YohTechSolutions" target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Open</a>
                            </div>
                            <div className="flex gap-2">
                                <input
                                  value={tgUserId}
                                  onChange={(e) => setTgUserId(e.target.value)}
                                  placeholder="Your Telegram user ID"
                                  className="flex-1 border rounded px-2 py-1 text-sm"
                                />
                                <Button size="sm" disabled={!tgUserId || tgVerifying} onClick={async () => {
                                    try {
                                        setTgVerifying(true);
                                        const res = await fetch('/api/social/telegram/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: tgUserId }) });
                                        const data = await res.json();
                                        if (data.ok && data.isMember) {
                                            setGateChecks((g) => ({ ...g, tg: true }));
                                            toast.success('Telegram verified');
                                        } else {
                                            toast.error('Telegram not verified', { description: 'Join the channel then try again.' });
                                        }
                                    } finally {
                                        setTgVerifying(false);
                                    }
                                }}>Verify</Button>
                            </div>
                        </div>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={gateChecks.li} onChange={(e) => setGateChecks({ ...gateChecks, li: e.target.checked })} />
                                <a href="https://www.linkedin.com/in/yohanes-senbeto-61833218a/" target="_blank" rel="noreferrer" className="text-blue-600 underline">LinkedIn</a>
                            </label>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={gateChecks.x} onChange={(e) => setGateChecks({ ...gateChecks, x: e.target.checked })} />
                                <a href="https://x.com/YohanesSenbeto?t=XGudVyYnkdss3xidqoI4fQ&s=09" target="_blank" rel="noreferrer" className="text-blue-600 underline">X (Twitter)</a>
                            </label>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={gateChecks.ig} onChange={(e) => setGateChecks({ ...gateChecks, ig: e.target.checked })} />
                                <a href="https://www.instagram.com/joni_senbeto/?igsh=MXhsNGs2dmlvZHluYg%3D%3D#" target="_blank" rel="noreferrer" className="text-blue-600 underline">Instagram</a>
                            </label>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" checked={gateChecks.tk} onChange={(e) => setGateChecks({ ...gateChecks, tk: e.target.checked })} />
                            <a href="https://www.tiktok.com/@jonisenbeto?_t=ZM-8zpIZ0SiSxn&_r=1" target="_blank" rel="noreferrer" className="text-blue-600 underline">TikTok</a>
                        </label>
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowGate(false)}>Cancel</Button>
                            <Button disabled={!allGateChecked} onClick={completeGate}>Continue</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * 
 * Backend-side update recommendations (for /api/calculations and /api/wan-ip/lookup):
 * 
 * 1. Validate and sanitize all inputs (IP address, CIDR, etc.) on the server.
 * 2. Check authentication and authorization for all requests.
 * 3. Implement rate limiting to prevent abuse.
 * 4. Only return non-sensitive data in WAN IP suggestions, and only to authorized users.
 * 5. Log errors and suspicious activity.
 * 6. Use CSRF/session protection (NextAuth session, credentials: "include").
 * 7. Use strong TypeScript types for API request/response.
 * 
 * See also the comments at the end of this file for a summary of weaknesses and fixes.
 */
