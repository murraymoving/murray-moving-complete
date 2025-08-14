import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Phone, Truck, X } from "lucide-react";

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        // Expanded menu
        <div className="bg-white rounded-lg shadow-2xl border-2 border-green-500 p-4 min-w-[280px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900">Quick Quote</h3>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-2">
            <Link href="/truck-quote" className="block">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white justify-start">
                <Truck size={16} className="mr-2" />
                Truck Services
              </Button>
            </Link>
            
            <Link href="/van-quote" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white justify-start">
                <Truck size={16} className="mr-2" />
                Van Services
              </Button>
            </Link>
            
            <a href="tel:+16097244445" className="block">
              <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50 justify-start">
                <Phone size={16} className="mr-2" />
                Call (609) 724-4445
              </Button>
            </a>
          </div>
        </div>
      ) : (
        // Collapsed button
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-green-600 hover:bg-green-700 text-white shadow-2xl px-6 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
        >
          Get Quote Now
        </Button>
      )}
    </div>
  );
}