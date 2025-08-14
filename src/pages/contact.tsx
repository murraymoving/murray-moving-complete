import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Contact schema will be added when contact functionality is needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import JobForm from "@/components/job-form";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    // Contact form validation will be added when needed
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      console.log('Submitting contact via server proxy');
      
      const response = await fetch('/.netlify/functions/formspree-contact', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Message Sent",
          description: "Thank you for your message. We'll get back to you within 24 hours.",
        });
        form.reset();
      } else {
        const errorData = await response.json();
        console.error('Contact form error:', errorData);
        throw new Error(errorData.error || `Failed to submit form: ${response.status}`);
      }
    } catch (error) {
      console.error('Contact form submit error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Contact Murray Moving - Get Your Free Moving Quote Today</title>
        <meta name="description" content="Contact Murray Moving for your free moving quote. Call (555) 123-4567 or fill out our contact form. Professional moving services with prompt response times." />
        <meta name="keywords" content="contact Murray Moving, free moving quote, moving company contact, professional movers contact" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-murray-blue to-murray-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Contact Us</h1>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-murray-navy mb-8">Get in Touch</h2>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-murray-blue text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-murray-navy mb-2">Phone</h3>
                    <p className="text-gray-600">Call us for immediate assistance</p>
                    <p className="text-green-600 font-semibold text-lg">
                      <a href="tel:+16097244445" className="hover:text-green-700 transition-colors">
                        (609) 724-4445
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-murray-blue text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-murray-navy mb-2">Email</h3>
                    <p className="text-gray-600">Send us your questions</p>
                    <p className="text-green-600 font-semibold">murraymovingnj@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-murray-blue text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-murray-navy mb-2">Address</h3>
                    <p className="text-gray-600">Visit our office</p>
                    <p className="text-green-600 font-semibold">Chesterfield, NJ</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-murray-blue text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-murray-navy mb-2">Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 9:00 AM - 4:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-murray-navy mb-8">Send us a Message</h2>
              {isSubmitted ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <h3 className="text-2xl font-bold text-murray-navy mb-4">Thank You!</h3>
                  <p className="text-lg mb-4">Your message has been sent successfully.</p>
                  <p className="text-gray-600">We'll get back to you within 24 hours.</p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 bg-green-600 text-white hover:bg-green-700"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="bg-gray-50 rounded-lg p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem className="mt-6">
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="mt-6">
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea rows={5} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="mt-6">
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Job Form */}
      <JobForm jobType="moving" />
    </div>
  );
}
