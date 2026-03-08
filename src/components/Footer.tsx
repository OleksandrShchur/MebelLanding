const Footer = () => {
  return (
    <footer id="footer" className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Mebel Store</h3>
            <p className="text-gray-300">
              Your premier destination for high-quality furniture. We offer a wide range of
              wardrobes, sofas, and kitchen solutions to make your home beautiful and functional.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="text-gray-300 mb-2">Phone: +1 (555) 123-4567</p>
            <p className="text-gray-300 mb-2">Email: info@mebelstore.com</p>
            <p className="text-gray-300">Address: 123 Furniture Street, City, State 12345</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Instagram
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} Mebel Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
