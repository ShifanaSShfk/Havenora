export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Havenora</h3>
              <p className="text-gray-300">Your trusted real estate partner in Kerala, providing end-to-end property solutions.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Properties</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Buy Property</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Rent Property</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">List Property</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Legal Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <address className="text-gray-300 not-italic">
                <p>Havenora</p>
                <p>Thiruvananthapuram, Kerala</p>
                <p className="mt-2">Phone: +91 7510100710</p>
                <p>Email: info@havenora.com</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Havenora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }