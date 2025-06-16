import { useState } from 'react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
    propertyType: '',
    budget: '',
    location: '',
    timeline: ''
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert(`Thank you for your ${activeTab === 'property' ? 'property inquiry' : 'message'}! We will contact you shortly.`);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'general',
      message: '',
      propertyType: '',
      budget: '',
      location: '',
      timeline: ''
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">Contact Havenora</h1>
        <p className="text-xl text-gray-600">We're here to help with all your property needs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6 h-fit">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Our Offices</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Headquarters</h3>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-600">
                  123 MG Road, Marine Drive<br />
                  Kochi, Kerala 682001<br />
                  India
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Branch Office</h3>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-600">
                  456 Kowdiar Road<br />
                  Thiruvananthapuram, Kerala 695003<br />
                  India
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>contact@havenora.com</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Business Hours</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 7:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 5:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span>Emergency Only</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('general')}
            >
              General Inquiry
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'property' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('property')}
            >
              Property Request
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Full Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone Number*</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {activeTab === 'general' && (
                <div>
                  <label className="block text-gray-700 mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="feedback">Feedback</option>
                    <option value="careers">Careers</option>
                    <option value="partnership">Business Partnership</option>
                  </select>
                </div>
              )}
            </div>

            {activeTab === 'property' && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">Property Type*</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                    <option value="house">Independent House</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Budget Range*</label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Budget</option>
                    <option value="0-50">Below ₹50 Lakhs</option>
                    <option value="50-100">₹50 Lakhs - ₹1 Crore</option>
                    <option value="100-200">₹1 Crore - ₹2 Crore</option>
                    <option value="200+">Above ₹2 Crore</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Preferred Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City or Neighborhood"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Purchase Timeline</label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Timeline</option>
                    <option value="1-3">1-3 Months</option>
                    <option value="3-6">3-6 Months</option>
                    <option value="6+">6+ Months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                {activeTab === 'property' ? 'Specific Requirements*' : 'Message*'}
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={activeTab === 'property' ? 'Tell us about your ideal property...' : 'How can we help you?'}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              {activeTab === 'property' ? 'Submit Property Request' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}