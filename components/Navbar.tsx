"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/story", label: "Story Demo" },
  { href: "/products", label: "Products" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="bg-[#0D1B2A] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-brand-red text-white font-black text-lg px-3 py-1 rounded tracking-widest">
            SPROXIL
          </span>
          <span className="text-xs text-gray-400 hidden sm:block">Sales Demo</span>
        </Link>
        <div className="flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
                pathname === l.href
                  ? "bg-brand-red text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
