import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Club } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: "fas fa-home" },
  { href: "/schedule", label: "Schedule", icon: "fas fa-calendar-week" },
  { href: "/courses", label: "Courses", icon: "fas fa-flag" },
  { href: "/scoring", label: "Scoring", icon: "fas fa-chart-line" },
  { href: "/matchplay", label: "Matchplay", icon: "fas fa-trophy" },
  { href: "/fines", label: "Fines", icon: "fas fa-coins" },
  { href: "/activities", label: "Activities", icon: "fas fa-vote-yea" },
  { href: "/players", label: "Players", icon: "fas fa-users" }
];

export default function Navigation() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLink = ({ href, label, icon, mobile = false }: { href: string; label: string; icon: string; mobile?: boolean }) => {
    const isActive = location === href;
    const baseClasses = mobile 
      ? "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors"
      : "text-white hover:text-yellow-400 transition-colors";
    
    const activeClasses = mobile
      ? isActive ? "bg-green-800 text-white" : "text-white hover:bg-green-700"
      : "";

    return (
      <Link 
        href={href} 
        className={`${baseClasses} ${activeClasses}`} 
        onClick={() => mobile && setMobileOpen(false)}
      >
        <i className={`${icon} ${mobile ? "text-lg" : ""}`}></i>
        <span className={mobile ? "" : "hidden md:inline"}>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="golf-green shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Club className="text-yellow-400 h-6 w-6 mr-3" />
            <span className="text-white font-bold text-lg">Portugal Golf 2025</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="golf-light text-white">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <NavLink key={item.href} {...item} mobile />
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
