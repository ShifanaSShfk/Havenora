// src/pages/AboutPage.jsx
import { Link } from 'react-router-dom';
import TeamMemberCard from '../components/TeamMemberCard'; // You'll need to create this component

export default function AboutPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Arun Kumar",
      role: "Founder & CEO",
      bio: "20+ years in real estate with expertise in Kerala property markets",
      image: "/images/team/arun.jpg"
    },
    {
      id: 2,
      name: "Priya Nair",
      role: "Legal Head",
      bio: "Specialized in property documentation and legal compliance",
      image: "/images/team/priya.jpg"
    },
    {
      id: 3,
      name: "Rajesh Menon",
      role: "Sales Director",
      bio: "Connecting clients with their dream properties since 2010",
      image: "/images/team/rajesh.jpg"
    }
  ];

  const stats = [
    { value: "1500+", label: "Properties Listed" },
    { value: "95%", label: "Customer Satisfaction" },
    { value: "14", label: "Districts Covered" },
    { value: "24/7", label: "Support Available" }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">About Havenora</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Kerala's most trusted real estate consultancy with a decade of excellence in property solutions
        </p>
      </div>

      {/* Company Story */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-16">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Journey</h2>
            <p className="text-gray-600 mb-6">
              Founded in 2012, Havenora has grown from a small Kochi-based agency to Kerala's premier real estate 
              consultancy. Our founder, Arun Kumar, started with a vision to bring transparency and professionalism 
              to Kerala's property market.
            </p>
            <p className="text-gray-600 mb-6">
              Today, we operate across all 14 districts with a team of 50+ professionals, having facilitated over 
              1,500 successful property transactions worth ₹500+ crores.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-700">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-1/2 bg-gray-100 min-h-64">
            <img 
              src="/images/about-office.jpg" 
              alt="Havenora Office" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Meet Our Leadership</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map(member => (
            <TeamMemberCard 
              key={member.id}
              name={member.name}
              role={member.role}
              bio={member.bio}
              image={member.image}
            />
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-blue-50 rounded-xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Integrity</h3>
            <p className="text-gray-600">
              We maintain complete transparency in all transactions and provide honest property assessments.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Expertise</h3>
            <p className="text-gray-600">
              Our team combines local market knowledge with professional certifications for reliable advice.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Client Focus</h3>
            <p className="text-gray-600">
              Every client receives personalized attention and solutions tailored to their needs.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Ready to find your dream property?</h3>
        <Link 
          to="/contact" 
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
        >
          Contact Our Experts
        </Link>
      </div>
    </div>
  );
}