"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

const supabase = createClient();

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

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/");
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
          <p className="mt-1.5 text-xs text-subtle">At least 8 characters.</p>
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
