"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const supabase = createClient();

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // check who's logged in right now, on first load
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // keep this in sync any time login state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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

  const links = [
    { href: "/", label: "Search" },
    { href: "/collection", label: "My Collection" },
  ];

  return (
    <nav className="border-b border-gray-800 px-4 sm:px-8 py-4 flex items-center gap-4 sm:gap-6 overflow-x-auto">
      <Link href="/" className="font-bold text-lg mr-4">
        Musicrate
      </Link>

      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            pathname === link.href
              ? "text-white font-medium text-sm"
              : "text-gray-500 text-sm hover:text-gray-300"
          }
        >
          {link.label}
        </Link>
      ))}

      <div className="ml-auto flex items-center gap-4 text-sm">
        {user ? (
          <>
            <span className="text-gray-500 hidden sm:inline">{user.email}</span>
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-300">
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-500 hover:text-gray-300">
              Log In
            </Link>
            <Link href="/signup" className="text-white font-medium">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}