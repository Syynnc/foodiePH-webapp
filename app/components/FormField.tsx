"use client";

import { ReactNode } from "react";

/** Wrapper that renders label + input slot + error/hint */
export function Field({
    label,
    required,
    error,
    hint,
    charCount,
    maxChars,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    charCount?: number;
    maxChars?: number;
    children: ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#1a1208]/40 flex items-center gap-1">
                    {label}
                    {required && <span className="text-[#c8783a] ml-0.5">*</span>}
                </label>
                {maxChars !== undefined && charCount !== undefined && (
                    <span className={`text-[10px] tabular-nums ${charCount > maxChars ? "text-red-500 font-semibold" : "text-[#1a1208]/25"}`}>
                        {charCount}/{maxChars}
                    </span>
                )}
            </div>

            {children}

            {error ? (
                <p className="flex items-center gap-1.5 text-[11px] text-red-500 mt-1.5 font-medium">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </p>
            ) : hint ? (
                <p className="text-[10px] text-[#1a1208]/30 mt-1.5 leading-relaxed">{hint}</p>
            ) : null}
        </div>
    );
}

/** Returns className string for an input/textarea/select — switches to red when there's an error */
export function iCls(error?: string, extra?: string) {
    const base = "w-full rounded-xl px-3.5 py-2.5 text-[13px] text-[#1a1208] placeholder:text-[#1a1208]/25 outline-none focus:ring-2 transition-all duration-200";
    const normal = "border border-[#1a1208]/12 bg-white focus:border-[#c8783a]/50 focus:ring-[#c8783a]/10";
    const err = "border border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-200/40";
    return [base, error ? err : normal, extra ?? ""].join(" ").trim();
}

/** Validation helpers */
export const V = {
    required: (v: string, label = "This field") =>
        !v.trim() ? `${label} is required` : "",

    minLen: (v: string, n: number, label = "This field") =>
        v.trim() && v.trim().length < n ? `${label} must be at least ${n} characters` : "",

    maxLen: (v: string, n: number, label = "This field") =>
        v.trim().length > n ? `${label} must be ${n} characters or less` : "",

    positiveInt: (v: string, label = "This field") =>
        v && (isNaN(Number(v)) || Number(v) <= 0 || !Number.isInteger(Number(v)))
            ? `${label} must be a whole number greater than 0`
            : "",

    nonNegativeInt: (v: string, label = "This field") =>
        v && (isNaN(Number(v)) || Number(v) < 0)
            ? `${label} must be 0 or more`
            : "",

    url: (v: string) => {
        const s = v.trim();
        if (!s) return "";
        try {
            const u = new URL(s);
            if (u.protocol !== "https:" && u.protocol !== "http:") {
                return "Must be a valid URL starting with https://";
            }
            return "";
        } catch {
            return "Must be a valid URL starting with https://";
        }
    },

    // Accepts optional leading +, then digits only. Total digits must be 7–15 (ITU-T E.164).
    phone: (v: string) => {
        const s = v.trim();
        if (!s) return "";
        if (!/^\+?[0-9]+$/.test(s)) return "Phone number must contain digits only (+ allowed at start)";
        const digits = s.replace(/^\+/, "");
        if (digits.length < 12) return "Phone number is too short (minimum 12 digits)";
        if (digits.length > 12) return "Phone number is too long (maximum 12 digits)";
        return "";
    },

    // Letters, spaces, hyphens, and apostrophes only (covers names like O'Brien, Anne-Marie)
    name: (v: string, label = "Name") => {
        const s = v.trim();
        if (!s) return "";
        if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ '\-]+$/.test(s)) return `${label} must contain letters only`;
        return "";
    },

    uuid: (v: string) =>
        v.trim() && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.trim())
            ? "Must be a valid UUID (e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
            : "",

    /** Run multiple validators and return the first error */
    first: (...msgs: string[]) => msgs.find(m => m) ?? "",
};
