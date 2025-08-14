export default function ServiceAreas() {
  const serviceAreas = [
    {
      title: "24 Hour Emergency Service",
      areas: ["Emergency Movers Hamilton", "24 Hour Moving Company Chesterfield NJ", "Last Minute Movers Princeton", "Urgent Relocations Trenton"],
    },
    {
      title: "Student & Budget Moving",
      areas: ["Student Movers New Jersey", "Cheap Movers Burlington County", "College Dorm Moves", "Affordable Apartment Moving"],
    },
    {
      title: "Weekend & Evening Service",
      areas: ["Weekend Movers Chesterfield", "Moving Companies That Work Weekends", "Saturday Moving Service", "Sunday Relocations"],
    },
    {
      title: "Specialty Moving Services",
      areas: ["Senior Moving Services Hamilton", "Heavy Lifting Service Princeton", "Appliance Movers Hamilton NJ", "Estate Cleanout Chesterfield NJ"],
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete Moving Services - 24/7 Emergency & Weekend Availability</h2>
          <p className="text-xl text-gray-600">Local moving company Trenton area families trust for emergency movers Hamilton, student movers New Jersey, and senior moving services Hamilton</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {serviceAreas.map((area, index) => (
            <div key={index} className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{area.title}</h3>
              <ul className="text-gray-600 space-y-2">
                {area.areas.map((location, locationIndex) => (
                  <li key={locationIndex}>{location}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
