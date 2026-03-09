const Footer = () => {
  return (
    <footer id="footer" className="bg-white py-8 border-t border-[#E6E1DA]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#2F2A25]">Mebel Store</h3>
            <p className="text-[#5B544E]">
              Your premier destination for high-quality furniture. We offer a wide range of
              wardrobes, sofas, and kitchen solutions to make your home beautiful and functional.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#2F2A25]">Contact Us</h3>
            <p className="text-[#5B544E] mb-2">Phone: +1 (555) 123-4567</p>
            <p className="text-[#5B544E] mb-2">Email: info@mebelstore.com</p>
            <p className="text-[#5B544E]">Address: 123 Furniture Street, City, State 12345</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#2F2A25]">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-[#5B544E] hover:text-[#2F2A25] transition-colors">
                Facebook
              </a>
              <a href="#" className="text-[#5B544E] hover:text-[#2F2A25] transition-colors">
                Instagram
              </a>
              <a href="#" className="text-[#5B544E] hover:text-[#2F2A25] transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#E6E1DA] mt-8 pt-8 text-center">
          <p className="text-[#8A827A]">
            © {new Date().getFullYear()} Mebel Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
