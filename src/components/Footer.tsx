import { Phone, Mail, MapPin } from "lucide-react";
import { FaFacebook, FaWhatsapp, FaViber } from "react-icons/fa";

const Footer = () => {
  return (
    <footer id="footer" className="bg-white py-8 border-t border-[#E6E1DA]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 lg:gap-32 justify-items-center md:justify-items-start">
          {/* Column 1 */}
          <div className="w-full">
            <h3 className="text-lg md:text-xl font-bold mb-4 text-[#2F2A25]">Магазин Mebel</h3>
            <p className="text-sm md:text-base text-[#5B544E]">
              Ваше найкраще місце для придбання високоякісних меблів.
              Ми пропонуємо широкий асортимент шаф, диванів та кухонних рішень, щоб зробити ваш дім красивим та функціональним.
            </p>
          </div>

          {/* Column 2 — Contact + Map */}
          <div className="w-full">
            <h3 className="text-lg md:text-xl font-bold mb-4 text-[#2F2A25]">Зв'яжіться з нами</h3>
            <div className="flex items-center gap-2 text-[#5B544E] mb-2">
              <Phone size={16} className="text-[#8A6A50] shrink-0" />
              <span className="text-sm md:text-base">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2 text-[#5B544E] mb-2">
              <Mail size={16} className="text-[#8A6A50] shrink-0" />
              <span className="text-sm md:text-base">info@mebelstore.com</span>
            </div>
            <div className="flex items-center gap-2 text-[#5B544E] mb-3">
              <MapPin size={16} className="text-[#8A6A50] shrink-0" />
              <span className="text-sm md:text-base">123 Магазин Меблів</span>
            </div>
            {/* Mini map box */}
            <div className="rounded-lg overflow-hidden border border-[#E6E1DA] shadow-sm w-full h-36">
              <iframe
                title="Mebel Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.0!2d24.7111!3d48.9226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDU1JzIxLjQiTiAyNMKwNDInMzkuOSJF!5e0!3m2!1suk!2sua!4v1700000000000!5m2!1suk!2sua"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Column 3 */}
          <div className="w-full">
            <h3 className="text-lg md:text-xl font-bold mb-4 text-[#2F2A25]">Соціальні мережі</h3>
            <div className="flex flex-col space-y-3">
              <a href="#" className="flex items-center gap-2 text-[#5B544E] hover:text-[#2F2A25] transition-colors">
                <FaFacebook size={18} className="text-[#1877F2]" />
                <span className="text-sm md:text-base">Facebook</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-[#5B544E] hover:text-[#2F2A25] transition-colors">
                <FaWhatsapp size={18} className="text-[#25D366]" />
                <span className="text-sm md:text-base">WhatsApp</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-[#5B544E] hover:text-[#2F2A25] transition-colors">
                <FaViber size={18} className="text-[#7360F2]" />
                <span className="text-sm md:text-base">Viber</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E6E1DA] mt-8 pt-8 text-center">
          <p className="text-sm text-[#8A827A]">
            © {new Date().getFullYear()} Магазин Mebel. Усі права захищені.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
