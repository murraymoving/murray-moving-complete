import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function VanQuote() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('https://formspree.io/f/REPLACE_WITH_VAN_ENDPOINT', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Track successful quote request
        import('../lib/analytics').then(({ trackQuoteRequest }) => {
          trackQuoteRequest('van-service');
        });
        
        alert('Thank you! Your van services quote request has been submitted. We\'ll contact you within 24 hours.');
        e.currentTarget.reset();
        setIsFormOpen(false);
      } else {
        alert('There was an error submitting your request. Please try again or call us at (609) 724-4445.');
      }
    } catch (error) {
      alert('There was an error submitting your request. Please try again or call us at (609) 724-4445.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Van Services Quote - Cargo Van & Junk Removal | Murray Moving</title>
        <meta name="description" content="Get a free quote for cargo van services. Junk removal, furniture transport, small moves, estate cleanouts, and donation pickups." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Van Services</h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Quick and affordable cargo van services for smaller moves, junk removal, and specialty transport. 
            Perfect for apartments, single rooms, and hauling services.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Junk Removal & Cleanouts */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Junk Removal & Cleanouts</h2>
            <p className="text-gray-600 mb-6">
              Professional removal and disposal services for unwanted items.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Estate cleanouts</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Basement & attic clearing</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Appliance removal</span>
              </div>
            </div>
          </div>

          {/* Furniture & Small Moves */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Furniture & Small Moves</h2>
            <p className="text-gray-600 mb-6">
              Single item pickups, deliveries, and small apartment moves.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Furniture delivery & pickup</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Studio & 1-bedroom moves</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Donation pickups</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Quote Form */}
        <div className="max-w-4xl mx-auto">
          <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-semibold flex items-center justify-center gap-3"
              >
                Get Free Van Quote
                {isFormOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-6">
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Request Your Free Van Services Quote</h3>
                
                <form id="van-form" className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="van-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        id="van-name" 
                        name="name" 
                        required 
                        placeholder="John Smith"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="van-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input 
                        type="email" 
                        id="van-email" 
                        name="email" 
                        required 
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="van-phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input 
                        type="tel" 
                        id="van-phone" 
                        name="phone" 
                        required 
                        placeholder="(609) 555-0123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="van-serviceDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Service Date *
                      </label>
                      <input 
                        type="date" 
                        id="van-serviceDate" 
                        name="serviceDate" 
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="van-pickupAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Address *
                      </label>
                      <input 
                        type="text" 
                        id="van-pickupAddress" 
                        name="pickupAddress" 
                        required 
                        placeholder="123 Main St, City, State"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="van-dropoffAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        Drop-off Address
                      </label>
                      <input 
                        type="text" 
                        id="van-dropoffAddress" 
                        name="dropoffAddress" 
                        placeholder="456 Oak Ave, City, State (or disposal/donation)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="van-serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                        Service Type *
                      </label>
                      <select 
                        id="van-serviceType" 
                        name="serviceType" 
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select service</option>
                        <option value="junk-removal">Junk Removal</option>
                        <option value="furniture-delivery">Furniture Delivery/Pickup</option>
                        <option value="small-move">Small Move</option>
                        <option value="estate-cleanout">Estate Cleanout</option>
                        <option value="donation-pickup">Donation Pickup</option>
                        <option value="appliance-removal">Appliance Removal</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="van-itemCount" className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Items
                      </label>
                      <select 
                        id="van-itemCount" 
                        name="itemCount"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Estimate</option>
                        <option value="1-5">1-5 items</option>
                        <option value="6-15">6-15 items</option>
                        <option value="16-30">16-30 items</option>
                        <option value="full-van">Full van load</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="van-details" className="block text-sm font-medium text-gray-700 mb-2">
                      Item Details & Special Instructions
                    </label>
                    <textarea 
                      id="van-details" 
                      name="details" 
                      rows={4}
                      placeholder="Describe items, any heavy lifting requirements, stairs, special handling needs, etc..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    ></textarea>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
                  >
                    Submit Quote Request
                  </Button>
                </form>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Truck Services Redirect Option */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Need full-service moving instead?</p>
            <Link href="/truck-quote">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-lg font-semibold">
                Get Truck Services Quote Instead
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}