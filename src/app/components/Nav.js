"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import ThemeToggle from "./ThemeToggle";
import Avatar from "./Avatar";

const supabase = createClient();

const links = [
  { href: "/", label: "Search" },
  { href: "/collection", label: "Collection" },
  { href: "/profile", label: "Profile" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name, profile_picture_url")
        .eq("id", currentUser.id)
        .maybeSingle();
      setProfile(data);
    };

    supabase.auth.getUser().then(({ data }) => loadProfile(data.user));

    // keep this in sync any time login state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const linkClass = (href) =>
    `rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
      pathname === href ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-2 flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
          <span className="h-5 w-5 rounded-full bg-accent shadow-[inset_0_0_0_5px_var(--bg),inset_0_0_0_6px_var(--accent)]" aria-hidden="true" />
          musicrate
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              {profile?.username && (
                <Link href={`/users/${profile.username}`} aria-label="Your public profile" className="rounded-full">
                  <Avatar url={profile.profile_picture_url} name={profile.display_name || profile.username} size="sm" />
                </Link>
              )}
              <button onClick={handleLogout} className="btn-ghost px-3">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-3">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary hidden px-4 sm:inline-flex">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="flex gap-1 overflow-x-auto px-4 pb-2.5 sm:hidden">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass(link.href)}>
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
