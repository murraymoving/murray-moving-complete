import { Helmet } from "react-helmet-async";
import { Check, Truck, Trash2, Heart, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobForm from "@/components/job-form";

export default function Services() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  const vanServices = [
    {
      icon: Trash2,
      title: "Junk Removal",
      description: "Professional junk removal for homes and businesses",
      features: [
        "Household junk and debris removal",
        "Appliance removal and disposal",
        "Construction debris cleanup",
        "Garage and basement cleanouts",
        "Yard waste removal",
        "Same-day service available",
      ]
    },
    {
      icon: Truck,
      title: "Furniture Transportation",
      description: "Safe and efficient furniture transport with cargo van",
      features: [
        "Single item furniture pickup",
        "Multiple furniture pieces transport",
        "Careful loading and securing",
        "Blanket wrapping for protection",
        "Apartment and home deliveries",
        "Assembly/disassembly if needed",
      ]
    },
    {
      icon: Home,
      title: "Small & Local Moves",
      description: "Efficient small moves and local relocations",
      features: [
        "Studio and 1-bedroom apartment moves",
        "Senior moving assistance",
        "Dorm room moves",
        "Small office relocations",
        "Last-minute moves",
        "Local delivery services",
      ]
    },
    {
      icon: Heart,
      title: "Donation Pickups",
      description: "We'll pick up your donations and deliver to local charities",
      features: [
        "Clothing and household items",
        "Furniture donation pickup",
        "Direct delivery to charities",
        "Tax-deductible receipt assistance",
        "Scheduled pickup appointments",
        "Supporting local community",
      ]
    }
  ];

  const truckServices = [
    {
      icon: Home,
      title: "Residential Moving",
      description: "Complete residential moving services with professional crew",
      features: [
        "Full-service packing and unpacking",
        "Professional moving crew",
        "Furniture disassembly/reassembly",
        "Loading and transportation",
        "Blanket wrapping protection",
        "Insurance coverage available",
      ]
    },
    {
      icon: Building2,
      title: "Commercial Moving",
      description: "Professional commercial and office relocations",
      features: [
        "Office equipment moving",
        "Minimal business disruption",
        "Professional coordination",
        "Secure document handling",
        "IT equipment specialist care",
        "Weekend and after-hours service",
      ]
    },
    {
      icon: Building2,
      title: "Estate Sale Cleanouts",
      description: "Complete estate cleanout and preparation services",
      features: [
        "Full estate property cleanouts",
        "Sorting valuable vs. disposal items",
        "Estate sale preparation",
        "Post-sale cleanup services",
        "Donation coordination",
        "Respectful family service",
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Services | Murray Moving - Junk Removal, Furniture Transport & Small Moves</title>
        <meta name="description" content="Professional cargo van services including junk removal, furniture transportation, small moves, donation pickups, and estate cleanouts in Chesterfield, NJ." />
        <meta name="keywords" content="junk removal, furniture transport, small moves, donation pickup, estate cleanouts, cargo van services, Chesterfield NJ" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Services</h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Professional van services and truck services to meet all your moving needs in Chesterfield, NJ
            </p>
          </div>
        </div>
      </section>

      {/* Van Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Van Services</h2>
            <p className="text-xl text-gray-600">Quick & affordable cargo van solutions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {vanServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="text-center mb-4">
                  <div className="bg-green-600 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <service.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                </div>
                <p className="text-gray-600 mb-4 text-center">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="text-green-600 mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => scrollToSection("cargo-services")}
                  className="bg-green-600 text-white hover:bg-green-700 w-full"
                >
                  Get Van Quote
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Truck Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Truck Services</h2>
            <p className="text-xl text-gray-600">Complete moving solutions with professional crew</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {truckServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="text-center mb-6">
                  <div className="bg-orange-600 text-white p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <service.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                </div>
                <p className="text-lg text-gray-600 mb-6 text-center">{service.description}</p>
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="text-orange-600 mr-3 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => scrollToSection("moving-services")}
                  className="bg-orange-600 text-white hover:bg-orange-700 w-full"
                >
                  Get Truck Quote
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Forms */}
      <div id="cargo-services">
        <JobForm jobType="junk_removal" />
      </div>
      
      <div id="moving-services">
        <JobForm jobType="moving" />
      </div>

    </div>
  );
}
