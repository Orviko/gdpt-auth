"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  User,
  Stethoscope,
  ShieldAlert,
  Pill,
  Activity,
  Syringe,
  Menu,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/actions/logout";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Profile", href: "/patient", icon: User },
  { label: "Conditions", href: "/patient/conditions", icon: Stethoscope },
  { label: "Allergies", href: "/patient/allergies", icon: ShieldAlert },
  { label: "Medications", href: "/patient/medications", icon: Pill },
  { label: "Vitals", href: "/patient/observations", icon: Activity },
  { label: "Immunizations", href: "/patient/immunizations", icon: Syringe },
] as const;

export function PatientNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/patient") return pathname === "/patient";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        {/* Logo / app name */}
        <Link
          href="/"
          className="mr-6 text-sm font-semibold tracking-tight text-foreground"
        >
          Good Patient
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop logout */}
        <form action={logout} className="hidden md:block">
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>

        {/* Mobile nav */}
        <div className="flex flex-1 justify-end md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" />}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="text-lg font-semibold">
                Patient Info
              </SheetTitle>
              <Separator className="my-3" />
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive(href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </nav>
              <Separator className="my-3" />
              <form action={logout}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  className="w-full justify-start gap-2 text-muted-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
