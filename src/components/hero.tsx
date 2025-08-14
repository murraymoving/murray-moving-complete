import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import vanImage from "@assets/IMG_6260_1752281304654.jpg";
import neighborhoodFaveBadge from "@assets/IMG_6263_1752283696876.jpg";

export default function Hero() {

  return (
    <section className="relative bg-black text-white min-h-[700px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={vanImage}
          alt="Murray Moving van"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-2xl">
              Murray Moving
            </h1>
            <p className="text-xl md:text-2xl font-semibold mb-6 text-green-400">
              Moving you toward your future
            </p>
            <p className="text-lg mb-8 text-gray-200">
              Professional moving services available 24/7 throughout Hamilton, Chesterfield, Princeton & Central NJ • Same-day availability • Competitive pricing
            </p>
            
            {/* 2024 Neighborhood Favorite Badge */}
            <div className="flex items-center space-x-3 mb-8">
              <img 
                src={neighborhoodFaveBadge} 
                alt="2024 Neighborhood Favorite" 
                className="h-16 w-auto object-contain rounded-lg shadow-lg bg-white/90 p-1"
                title="2024 Neighborhood Favorite Business"
              />
              <div>
                <p className="text-green-400 font-semibold text-lg">2024 Neighborhood Favorite</p>
                <p className="text-gray-300 text-sm">Voted by our community</p>
              </div>
            </div>

          </div>
          
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Your Free Quote</h3>
                <p className="text-gray-600">Choose your service type below</p>
              </div>
              <div className="space-y-4">
                <Link href="/truck-quote" className="block">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-lg font-semibold">
                    Truck Services
                  </Button>
                </Link>
                <Link href="/van-quote" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold">
                    Van Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
