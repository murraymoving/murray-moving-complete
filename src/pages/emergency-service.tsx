import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Clock, Phone, AlertTriangle, CheckCircle, DollarSign, Calendar } from "lucide-react";
import { useEffect } from "react";

export default function EmergencyServicePage() {
  // Track emergency service page views
  useEffect(() => {
    import('../lib/analytics').then(({ trackEmergencyService }) => {
      trackEmergencyService();
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Emergency & Same-Day Moving Services | Murray Moving NJ</title>
        <meta name="description" content="Need emergency moving services in NJ? Murray Moving offers same-day and urgent moving solutions. Call (609) 724-4445 for immediate assistance." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-orange-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Emergency & Same-Day Moving
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Need to move today? We're here to help with urgent moving situations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+16097244445"
                className="bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-50 transition-colors flex items-center justify-center"
                onClick={() => {
                  import('../lib/analytics').then(({ trackPhoneCall }) => trackPhoneCall());
                }}
              >
                <Phone className="w-5 h-5 mr-2" />
                CALL NOW: (609) 724-4445
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Emergency Situations */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Emergency Moving Situations We Handle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <AlertTriangle className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Eviction Situations</h3>
              <p className="text-gray-600 text-sm">
                Court-ordered moves with tight deadlines. We understand the urgency and stress.
              </p>
            </Card>
            <Card className="p-6">
              <Clock className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Last-Minute Job Relocation</h3>
              <p className="text-gray-600 text-sm">
                Got a job offer that requires immediate relocation? We can help you move quickly.
              </p>
            </Card>
            <Card className="p-6">
              <AlertTriangle className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Family Emergencies</h3>
              <p className="text-gray-600 text-sm">
                Unexpected family situations requiring immediate moves or storage solutions.
              </p>
            </Card>
            <Card className="p-6">
              <AlertTriangle className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Property Damage</h3>
              <p className="text-gray-600 text-sm">
                Fire, flood, or other damage requiring immediate belongings relocation.
              </p>
            </Card>
            <Card className="p-6">
              <Calendar className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Failed Moving Company</h3>
              <p className="text-gray-600 text-sm">
                Another mover didn't show up? We can step in and save your moving day.
              </p>
            </Card>
            <Card className="p-6">
              <Clock className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Urgent Junk Removal</h3>
              <p className="text-gray-600 text-sm">
                Same-day cleanouts for estates, foreclosures, or emergency situations.
              </p>
            </Card>
          </div>
        </div>

        {/* Availability & Response Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="p-8">
            <Clock className="w-12 h-12 text-green-600 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Response Time</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-gray-700"><strong>Same-Day Service:</strong> Within 2-4 hours</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-gray-700"><strong>Emergency Response:</strong> Within 1-2 hours</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-gray-700"><strong>Available:</strong> 7 days a week</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-gray-700"><strong>Hours:</strong> 6 AM - 10 PM</span>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <DollarSign className="w-12 h-12 text-green-600 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Pricing</h3>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <span className="font-semibold text-gray-900">Same-Day Premium:</span>
                <span className="text-gray-700 ml-2">+25% of standard rate</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-semibold text-gray-900">Emergency (Under 2 hours):</span>
                <span className="text-gray-700 ml-2">+50% of standard rate</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-semibold text-gray-900">Weekends:</span>
                <span className="text-gray-700 ml-2">+15% of standard rate</span>
              </div>
              <div className="text-sm text-gray-600 mt-4">
                * Base rates: $120/hour for 2-man crew with truck
              </div>
            </div>
          </Card>
        </div>

        {/* Emergency Contact Section */}
        <Card className="p-8 bg-orange-50 border-orange-200 mb-16">
          <div className="text-center">
            <Phone className="w-16 h-16 text-orange-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-orange-900 mb-4">Emergency Contact</h3>
            <p className="text-lg text-orange-800 mb-6">
              For immediate assistance, call our emergency line. We answer 24/7 for true emergencies.
            </p>
            <div className="space-y-4">
              <div className="text-center">
                <a 
                  href="tel:+16097244445"
                  className="text-3xl font-bold text-orange-600 hover:text-orange-700"
                >
                  (609) 724-4445
                </a>
                <p className="text-orange-700 mt-2">Primary Emergency Line</p>
              </div>
              <div className="text-sm text-orange-700">
                <p>When calling for emergency service, please mention:</p>
                <ul className="list-disc list-inside mt-2 text-left max-w-md mx-auto">
                  <li>Your location and destination</li>
                  <li>Size of the move (rooms/items)</li>
                  <li>Timeline requirement</li>
                  <li>Nature of the emergency</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* What We Need to Know */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What We Need to Know for Emergency Service
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Move Details</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Current location address</li>
                <li>• Destination address</li>
                <li>• Size of move (studio, 1BR, 2BR, etc.)</li>
                <li>• Special items (piano, safe, fragile items)</li>
                <li>• Access details (stairs, elevator, parking)</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Timeline & Requirements</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Required completion time</li>
                <li>• Reason for urgency</li>
                <li>• Packing needs</li>
                <li>• Storage requirements</li>
                <li>• Contact information</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Don't Let Moving Stress Overwhelm You
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            When you're facing a moving emergency, Murray Moving is here to help. 
            Our experienced team can handle urgent situations with professionalism and care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+16097244445"
              className="bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-700 transition-colors"
            >
              Call for Emergency Service
            </a>
            <a
              href="/truck-quote"
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
            >
              Get Quick Quote
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}