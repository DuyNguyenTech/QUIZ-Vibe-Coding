"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Upload, Home, User, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuthStore } from "../lib/store";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/exams/upload", label: "Tải đề lên", icon: Upload },
    { href: "/exams", label: "Danh sách đề", icon: BookOpen },
  ];

  const { token, user, logout, lobbyAvatar } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-transform group-hover:scale-110">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              QuizAI
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}

            <div className="w-px h-6 bg-border mx-2"></div>
            
            <ThemeToggle />

            {mounted && (
              <div className="ml-2">
                {token && user ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary border border-primary/20 flex items-center justify-center overflow-hidden">
                        <img 
                          src={lobbyAvatar && lobbyAvatar.includes("dicebear") ? lobbyAvatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.nickname || user.email}&backgroundColor=transparent`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="hidden sm:inline">{user.nickname || user.email.split("@")[0]}</span>
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="p-2 rounded-xl text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth/login"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
