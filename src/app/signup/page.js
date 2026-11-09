"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

const supabase = createClient();

// Supabase's weak-password message lists every allowed character
// ("...at least one character of each: abcdef..., ABCDEF..., 0123..., !@#$..."),
// which reads like you need one of *every* character. Turn it into plain English.
function friendlyPasswordError(error) {
  if (error?.code !== "weak_password") return error.message;

  const reasons = error.reasons ?? [];
  const msg = error.message ?? "";
  const parts = [];

  if (reasons.includes("characters") || /one character of each/i.test(msg)) {
    const needs = [];
    if (/abcdefghijklmnopqrstuvwxyz/.test(msg)) needs.push("a lowercase letter");
    if (/ABCDEFGHIJKLMNOPQRSTUVWXYZ/.test(msg)) needs.push("an uppercase letter");
    if (/0123456789/.test(msg)) needs.push("a number");
    if (/[!@#$%^&*]/.test(msg)) needs.push("a symbol (like ! or #)");
    if (needs.length) {
      const list = needs.length > 1 ? `${needs.slice(0, -1).join(", ")} and ${needs.at(-1)}` : needs[0];
      parts.push(`Your password needs at least ${list}.`);
    }
  }
  if (reasons.includes("length")) parts.push("It's too short.");
  if (reasons.includes("pwned")) {
    parts.push("This password has appeared in a known data breach — please choose a different one.");
  }

  return parts.length ? parts.join(" ") : "That password is too weak. Try a longer one with a mix of letters, numbers and symbols.";
}

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      // the confirmation email links back here, then on to onboarding
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/welcome` },
    });

    setLoading(false);

    if (error) {
      setError(friendlyPasswordError(error));
      return;
    }

    router.push("/welcome");
    router.refresh();
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <div className="card p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold">Join musicrate</h1>
        <p className="mt-2 text-muted">Rate albums, build your collection, and see what others think.</p>

        <form onSubmit={handleSignUp} className="mt-7 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold">Password</label>
            <input
              id="password"
              type="password"
            minLength={8}
            autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          <p className="mt-1.5 text-xs text-subtle">
            At least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol.
          </p>
          </div>

          {error && <p className="text-sm text-score-low-fg">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent-text hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
