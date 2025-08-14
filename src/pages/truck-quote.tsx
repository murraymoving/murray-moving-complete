import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function TruckQuote() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('https://formspree.io/f/mrbkndro', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Track successful quote request
        import('../lib/analytics').then(({ trackQuoteRequest }) => {
          trackQuoteRequest('full-service');
        });
        
        alert('Thank you! Your quote request has been submitted. We\'ll contact you within 24 hours.');
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
        <title>Truck Services Quote - Professional Moving | Murray Moving</title>
        <meta name="description" content="Get a free quote for professional truck moving services. Complete residential and commercial moving with our professional crew and large moving trucks." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Truck Services</h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Complete residential and commercial moving services with our professional crew and 
            large moving trucks. Perfect for full household moves, office relocations, and long-distance moves.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Residential Moving */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Residential Moving</h2>
            <p className="text-gray-600 mb-6">
              Complete home moving services from studio apartments to large houses.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                <span>Full packing services</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                <span>Furniture disassembly/assembly</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                <span>Specialty item handling</span>
              </div>
            </div>
          </div>

          {/* Commercial Moving */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Commercial Moving</h2>
            <p className="text-gray-600 mb-6">
              Office and business relocations with minimal downtime.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                <span>Office equipment handling</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                <span>After-hours moving</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                <span>IT equipment setup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Quote Form */}
        <div className="max-w-4xl mx-auto">
          <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-xl font-semibold flex items-center justify-center gap-3"
              >
                Get Free Truck Quote
                {isFormOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-6">
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-orange-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Request Your Free Truck Services Quote</h3>
                
                <form id="truck-form" className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="truck-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        id="truck-name" 
                        name="name" 
                        required 
                        placeholder="John Smith"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="truck-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input 
                        type="email" 
                        id="truck-email" 
                        name="email" 
                        required 
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="truck-phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input 
                        type="tel" 
                        id="truck-phone" 
                        name="phone" 
                        required 
                        placeholder="(609) 555-0123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="truck-moveDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Moving Date *
                      </label>
                      <input 
                        type="date" 
                        id="truck-moveDate" 
                        name="moveDate" 
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="truck-fromAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        Moving From *
                      </label>
                      <input 
                        type="text" 
                        id="truck-fromAddress" 
                        name="fromAddress" 
                        required 
                        placeholder="123 Main St, City, State"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="truck-toAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        Moving To *
                      </label>
                      <input 
                        type="text" 
                        id="truck-toAddress" 
                        name="toAddress" 
                        required 
                        placeholder="456 Oak Ave, City, State"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="truck-homeSize" className="block text-sm font-medium text-gray-700 mb-2">
                        Home/Office Size *
                      </label>
                      <select 
                        id="truck-homeSize" 
                        name="homeSize" 
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select size</option>
                        <option value="studio">Studio/1 BR</option>
                        <option value="2br">2 Bedroom</option>
                        <option value="3br">3 Bedroom</option>
                        <option value="4br">4+ Bedroom</option>
                        <option value="office-small">Small Office</option>
                        <option value="office-large">Large Office</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="truck-serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                        Service Type *
                      </label>
                      <select 
                        id="truck-serviceType" 
                        name="serviceType" 
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select service</option>
                        <option value="full-service">Full-Service Move</option>
                        <option value="labor-only">Labor Only</option>
                        <option value="packing-only">Packing Only</option>
                        <option value="commercial">Commercial Move</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="truck-details" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Details
                    </label>
                    <textarea 
                      id="truck-details" 
                      name="details" 
                      rows={4}
                      placeholder="Tell us about any special items, stairs, long carries, or other details..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    ></textarea>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-lg font-semibold"
                  >
                    Submit Quote Request
                  </Button>
                </form>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Van Services Redirect Option */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Looking for smaller moves or junk removal?</p>
            <Link href="/van-quote">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg font-semibold">
                Get Van Services Quote Instead
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}