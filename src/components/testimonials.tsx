import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Crystal Oslowski",
    location: "Local Guide",
    rating: 5,
    date: "2 days ago",
    text: "I used Max several times! Super convenient and easy to get in touch with. Very reasonable prices don't hesitate contact him!!!! I was hesitant at first but now he's my number one go to even for small pick ups! 5 stars!",
    isNew: true
  },
  {
    name: "Carrie Ann Krupa",
    location: "Verified Customer",
    rating: 5,
    date: "Recent",
    text: "Max has done jobs for me in the past. He's reliable, efficient and just an all around great, hardworking kid."
  },
  {
    name: "Dave Freeman",
    location: "Verified Customer", 
    rating: 5,
    date: "Recent",
    text: "I've had Max perform several jobs at my home. Very good communication, fair pricing and good work ethic. Would recommend to anyone in town."
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what real customers say about Murray Moving's service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 relative hover:shadow-lg transition-shadow">
              {testimonial.isNew && (
                <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  NEW
                </div>
              )}
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">{testimonial.date}</span>
              </div>

              <Quote className="w-6 h-6 text-green-600 mb-3" />
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>

              <div className="border-t pt-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Ready to experience the Murray Moving difference?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+16097244445"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Call (609) 724-4445
            </a>
            <a
              href="/truck-quote"
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Get Free Quote
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}