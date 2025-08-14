import { Truck, Home, Trash2, Heart, Clock, Shield, Star, Users } from "lucide-react";
import { Link } from "wouter";
import workerPhoto from "@assets/9EB2649A-E9F0-4DDE-AA26-A7507CC4FBAB_1752955827954.png";

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Murray Moving?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional moving services for residents and businesses throughout central New Jersey. We provide reliable, efficient moving solutions with flexible scheduling to meet your needs.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Link href="/truck-quote">
            <div className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group h-64 flex flex-col">
              <div className="bg-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-700 transition-colors">
                <Home size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">Full-Service Moving</h3>
              <p className="text-gray-600 flex-grow">Complete household and office relocations with professional crew and equipment</p>
            </div>
          </Link>
          
          <Link href="/van-quote">
            <div className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group h-64 flex flex-col">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-700 transition-colors">
                <Truck size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-green-600 transition-colors">Cargo Van Services</h3>
              <p className="text-gray-600 flex-grow">Efficient cargo van for furniture transport, small moves, and cleanouts</p>
            </div>
          </Link>
          
          <Link href="/van-quote">
            <div className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group h-64 flex flex-col">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition-colors">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">Junk Removal</h3>
              <p className="text-gray-600 flex-grow">Professional junk removal and estate cleanout services with eco-friendly disposal</p>
            </div>
          </Link>
          
          <Link href="/van-quote">
            <div className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group h-64 flex flex-col">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-700 transition-colors">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-purple-600 transition-colors">Donation Pickups</h3>
              <p className="text-gray-600 flex-grow">We'll pick up your donations and deliver them to local charities</p>
            </div>
          </Link>
        </div>

        {/* Professional Team Photo */}
        <div className="text-center mt-16">
          <img 
            src={workerPhoto} 
            alt="Murray Moving professional loading cargo van" 
            className="rounded-xl shadow-2xl mx-auto max-w-4xl w-full object-cover"
          />
          <p className="text-gray-600 mt-4 text-lg">Our professional team in action - delivering reliable service every day</p>
        </div>

      </div>
    </section>
  );
}
