import { Helmet } from "react-helmet-async";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Testimonials from "@/components/testimonials";

export default function Home() {
  return (
    <div>
      <Helmet>
        <title>Murray Moving - Professional Moving Services | Chesterfield, NJ</title>
        <meta name="description" content="Professional moving company serving Chesterfield, NJ and surrounding areas. Full-service moving, cargo van services, junk removal. Free quotes available." />
      </Helmet>

      <Hero />
      <Features />
      <Testimonials />
    </div>
  );
}