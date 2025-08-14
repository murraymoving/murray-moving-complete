import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuoteSchema, type InsertQuote } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface JobFormProps {
  jobType?: 'moving' | 'junk_removal' | 'heavy_lifting' | 'packing';
}

export default function JobForm({ jobType = 'moving' }: JobFormProps) {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<InsertQuote>({
    resolver: zodResolver(insertQuoteSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      moveFrom: "",
      moveTo: "",
      moveDate: "",
      homeSize: "",
      serviceType: jobType === 'moving' ? 'full_service' : jobType === 'junk_removal' ? 'junk_removal' : 'cargo_van',
      additionalInfo: "",
      urgency: "normal",
    },
  });

  const onSubmit = async (data: InsertQuote) => {
    try {
      console.log('Creating quote request:', data);
      
      const response = await fetch('/api/quotes', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: "Quote Request Submitted!",
          description: "Murray Moving will contact you within 24 hours with a detailed quote.",
        });
        form.reset();
      } else {
        throw new Error(result.error || "Failed to post job");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post job. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted! 🎉</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Thanks! We'll contact you within 2 hours with your custom quote.
        </p>
        <Card className="border-0 shadow-sm bg-green-50 mb-6">
          <CardContent className="p-4">
            <p className="font-semibold text-green-900 mb-2">What's Next:</p>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span>We review your requirements</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span>Custom quote prepared</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span>You'll get a call or text</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span>Schedule your move</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3">
          <Button 
            onClick={() => setIsSubmitted(false)} 
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl"
          >
            Request Another Quote
          </Button>
          <Button 
            variant="outline"
            className="w-full py-3 rounded-xl border-green-600 text-green-600"
            onClick={() => window.location.href = 'tel:609-724-4445'}
          >
            📞 Call Now: (609) 724-4445
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Get Your Quote</h2>
          <p className="text-gray-600 text-sm">
            Fill out the details and we'll get back to you within 2 hours
          </p>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" className="border-gray-200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Smith" className="border-gray-200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" className="border-gray-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(609) 555-0123" className="border-gray-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Service Details</h3>
              
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full_service">Full-Service Moving</SelectItem>
                        <SelectItem value="junk_removal">Junk Removal</SelectItem>
                        <SelectItem value="cargo_van">Cargo Van Service</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="moveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Preferred Date</FormLabel>
                      <FormControl>
                        <Input type="date" className="border-gray-200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="homeSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Home Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-200">
                            <SelectValue placeholder="Size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="studio">Studio</SelectItem>
                          <SelectItem value="1_bedroom">1 Bedroom</SelectItem>
                          <SelectItem value="2_bedroom">2 Bedroom</SelectItem>
                          <SelectItem value="3_bedroom">3 Bedroom</SelectItem>
                          <SelectItem value="4_bedroom">4+ Bedroom</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Location Details</h3>
              
              <FormField
                control={form.control}
                name="moveFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Moving From
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, Hamilton, NJ" className="border-gray-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="moveTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Moving To (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="456 Oak Ave, Trenton, NJ" className="border-gray-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">When do you need this?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Within 1-2 weeks</SelectItem>
                        <SelectItem value="urgent">This week</SelectItem>
                        <SelectItem value="emergency">ASAP (Emergency)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900">Additional Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about special items, stairs, access issues, etc."
                        rows={3}
                        className="border-gray-200 resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="pt-4 pb-6">
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-4 rounded-xl font-semibold shadow-lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Submitting Request..." : "Get Free Quote"}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-3">
              We'll contact you within 2 hours during business hours
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}