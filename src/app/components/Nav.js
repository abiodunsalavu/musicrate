"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Search" },
    { href: "/collection", label: "My Collection" },
  ];

  return (
    <nav className="border-b border-gray-800 px-8 py-4 flex items-center gap-6">
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
    </nav>
  );
}