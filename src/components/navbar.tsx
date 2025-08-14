import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import newLogoPath from "@assets/phonto 2_1752189305081.jpg";
import njMapPath from "@assets/nj_counties_map.png";

export default function Navbar() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/service-areas", label: "Service Areas" },
    { href: "/emergency-service", label: "Emergency Service" },
    { href: "/contact", label: "Contact" },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-black text-white py-2 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout */}
          <div className="flex md:hidden justify-center items-center text-sm">
            <div className="flex items-center space-x-2">
              <Phone size={16} className="text-green-400" />
              <a 
                href="tel:+16097244445" 
                className="hover:text-green-400 transition-colors font-medium text-base"
                onClick={() => {
                  import('../lib/analytics').then(({ trackPhoneCall }) => trackPhoneCall());
                }}
              >
                (609) 724-4445
              </a>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-1 hover:text-green-400 transition-colors">
                <img 
                  src={njMapPath} 
                  alt="New Jersey Counties Map" 
                  className="h-4 w-auto object-contain"
                  style={{ marginRight: '4px' }}
                />
                <span>TRUCK SERVICES & VAN SERVICES</span>
              </Link>
              <div className="flex items-center space-x-1">
                <Phone size={16} />
                <a 
                  href="tel:+16097244445" 
                  className="hover:text-green-400 transition-colors"
                  onClick={() => {
                    import('../lib/analytics').then(({ trackPhoneCall }) => trackPhoneCall());
                  }}
                >
                  (609) 724-4445
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center flex-shrink-0" style={{ minWidth: '280px' }}>
              <Link 
                href="/" 
                className="flex-shrink-0 flex items-center"
                onClick={() => {
                  // Scroll to top when clicking logo
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }, 100);
                }}
              >
                <img 
                  src={newLogoPath} 
                  alt="Murray Moving Logo" 
                  className="h-16 w-auto object-contain"
                  style={{ 
                    maxWidth: '260px',
                    maxHeight: '60px'
                  }}
                />
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-lg font-medium transition-colors ${
                    location === item.href
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-white hover:text-green-400"
                  }`}
                  onClick={() => {
                    // Scroll to top when navigating
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center space-x-4">
                <Link 
                  href="/truck-quote"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  <Button className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 text-md font-semibold rounded-md">
                    TRUCK QUOTE
                  </Button>
                </Link>
                <Link 
                  href="/van-quote"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  <Button className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 text-md font-semibold rounded-md">
                    VAN QUOTE
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="md:hidden flex items-center space-x-2">
              <Link 
                href="/truck-quote"
                onClick={() => {
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }, 100);
                }}
              >
                <Button className="bg-orange-600 text-white hover:bg-orange-700 px-3 py-2 text-xs font-semibold">
                  TRUCK
                </Button>
              </Link>
              <Link 
                href="/van-quote"
                onClick={() => {
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }, 100);
                }}
              >
                <Button className="bg-green-600 text-white hover:bg-green-700 px-3 py-2 text-xs font-semibold">
                  VAN
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-600">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location === item.href
                        ? "text-green-400 bg-gray-800"
                        : "text-white hover:text-green-400"
                    }`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Scroll to top when navigating
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }, 100);
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
