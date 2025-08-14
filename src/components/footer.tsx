import { Instagram, Linkedin } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Murray Moving</h3>
            <p className="text-gray-300 mb-4">
              Professional moving services you can trust. Making your move stress-free since 2022.
            </p>
            <div className="flex space-x-4">
              <a href="https://share.google/vES6jikTvr9LBmxtU" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-500 transition-colors">
                <SiGoogle size={20} />
              </a>
              <a href="https://www.instagram.com/murraymoving" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/company/murray-moving" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-500 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link 
                  href="/services" 
                  className="hover:text-green-500 transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  Residential Moving
                </Link>
              </li>
              <li>
                <Link 
                  href="/services" 
                  className="hover:text-green-500 transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  Commercial Moving
                </Link>
              </li>
              <li>
                <Link 
                  href="/services" 
                  className="hover:text-green-500 transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  Long Distance
                </Link>
              </li>
              <li>
                <Link 
                  href="/services" 
                  className="hover:text-green-500 transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  Packing Services
                </Link>
              </li>
              <li>
                <Link 
                  href="/services" 
                  className="hover:text-green-500 transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  Storage Solutions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link 
                  href="/careers" 
                  className="hover:text-green-500 transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="hover:text-green-500 transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  Contact Us
                </Link>
              </li>
              <li><a href="tel:+16097244445" className="hover:text-green-500 transition-colors">Call Now</a></li>
              <li>
                <Link 
                  href="/admin/login" 
                  className="hover:text-green-500 transition-colors text-sm opacity-75"
                >
                  Business Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-300">
              <p>
                <a href="tel:+16097244445" className="hover:text-green-500 transition-colors">
                  (609) 724-4445
                </a>
              </p>
              <p>murraymovingnj@gmail.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Murray Moving. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
