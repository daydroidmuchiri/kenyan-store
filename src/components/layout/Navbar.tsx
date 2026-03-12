// src/components/layout/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  {
    label: "Women",
    href: "/shop?category=women",
    children: [
      { label: "Dresses", href: "/shop?category=dresses" },
      { label: "Tops", href: "/shop?category=tops" },
      { label: "Bottoms", href: "/shop?category=bottoms" },
      { label: "Outerwear", href: "/shop?category=outerwear" },
    ],
  },
  {
    label: "Men",
    href: "/shop?category=men",
    children: [
      { label: "Shirts", href: "/shop?category=shirts" },
      { label: "Trousers", href: "/shop?category=trousers" },
      { label: "Suits", href: "/shop?category=suits" },
      { label: "Casualwear", href: "/shop?category=casualwear" },
    ],
  },
  { label: "Accessories", href: "/shop?category=accessories" },
  { label: "Sale", href: "/shop?sale=true" },
  { label: "Custom Print 🎨", href: "/custom-print" },
];

export function Navbar() {
  const { data: session } = useSession();
  const { getTotalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-charcoal text-cream text-xs text-center py-2 font-body tracking-widest">
        Free delivery on orders over KES 5,000 · Pay with M-Pesa 🇰🇪
      </div>

      {/* Main Navbar */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-cream/95 backdrop-blur-sm shadow-sm"
            : "bg-cream"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="font-display text-2xl md:text-3xl font-semibold tracking-[0.15em] text-charcoal uppercase"
            >
              KWELI
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() =>
                    link.children && setActiveDropdown(link.label)
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 font-body text-sm font-medium text-charcoal hover:text-brand-600 transition-colors"
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown size={14} className="mt-0.5" />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {link.children && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 pt-2 animate-in">
                      <div className="bg-white shadow-xl border border-sand py-3 min-w-[180px]">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-5 py-2.5 text-sm font-body text-charcoal hover:text-brand-600 hover:bg-cream transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-charcoal hover:text-brand-600 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="hidden sm:block p-2 text-charcoal hover:text-brand-600 transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>

              {/* Account */}
              {session ? (
                <div className="relative group">
                  <button className="p-2 text-charcoal hover:text-brand-600 transition-colors">
                    <User size={20} />
                  </button>
                  <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                    <div className="bg-white shadow-xl border border-sand py-2 min-w-[160px]">
                      <p className="px-4 py-2 text-xs text-muted truncate border-b border-sand mb-1">
                        {session.user?.email}
                      </p>
                      <Link
                        href="/account"
                        className="block px-4 py-2.5 text-sm hover:bg-cream transition-colors"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        className="block px-4 py-2.5 text-sm hover:bg-cream transition-colors"
                      >
                        Orders
                      </Link>
                      {(session.user as any)?.role === "ADMIN" && (
                        <Link
                          href="/admin/dashboard"
                          className="block px-4 py-2.5 text-sm text-brand-600 hover:bg-cream transition-colors"
                        >
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2.5 text-sm hover:bg-cream transition-colors border-t border-sand mt-1"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-charcoal hover:text-brand-600 transition-colors"
                  aria-label="Sign In"
                >
                  <User size={20} />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-charcoal hover:text-brand-600 transition-colors"
                aria-label={`Cart (${totalItems} items)`}
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-4 animate-in">
              <form
                action="/shop"
                method="get"
                className="flex gap-2"
              >
                <input
                  type="text"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="input-field flex-1"
                  autoFocus
                />
                <button type="submit" className="btn-primary px-5">
                  <Search size={18} />
                </button>
              </form>
            </div>
          )}
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-sand animate-in">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-base font-medium border-b border-sand"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="pl-4 py-1 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 text-sm text-muted"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {!session ? (
                <div className="pt-4 space-y-2">
                  <Link href="/login" className="btn-primary w-full text-center">
                    Sign In
                  </Link>
                  <Link href="/register" className="btn-secondary w-full text-center">
                    Create Account
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => signOut()}
                  className="mt-4 text-sm text-muted"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
