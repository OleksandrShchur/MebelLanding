import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { FaFacebook, FaWhatsapp, FaViber, FaTelegram } from 'react-icons/fa';
import { storeContact } from '../data/storeContact';

const Footer = () => {
  return (
    <footer id="footer" className="font-sans bg-white py-8 border-t border-mebel-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 lg:gap-32 justify-items-center md:justify-items-start">
          <div className="w-full">
            <h3 className="font-display text-lg md:text-xl font-bold mb-4 text-mebel-text-strong">
              {storeContact.name}
            </h3>
            <p className="font-sans text-sm md:text-base text-mebel-text">
              {storeContact.tagline}
            </p>
            <div className="mt-4 flex items-start gap-2 text-mebel-text">
              <Clock size={16} className="text-mebel-tan shrink-0 mt-0.5" />
              <span className="text-sm md:text-base">{storeContact.hours}</span>
            </div>
          </div>

          <div className="w-full">
            <h3 className="font-display text-lg md:text-xl font-bold mb-4 text-mebel-text-strong">
              Зв&apos;яжіться з нами
            </h3>
            <a
              href={storeContact.phone.tel}
              className="flex items-center gap-2 text-mebel-text mb-2 hover:text-mebel-text-strong transition-colors"
            >
              <Phone size={16} className="text-mebel-tan shrink-0" />
              <span className="text-sm md:text-base font-medium">{storeContact.phone.display}</span>
            </a>
            <a
              href={storeContact.email.mailto}
              className="flex items-center gap-2 text-mebel-text mb-2 hover:text-mebel-text-strong transition-colors"
            >
              <Mail size={16} className="text-mebel-tan shrink-0" />
              <span className="text-sm md:text-base">{storeContact.email.display}</span>
            </a>
            <a
              href={storeContact.address.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-mebel-text mb-3 hover:text-mebel-text-strong transition-colors"
            >
              <MapPin size={16} className="text-mebel-tan shrink-0" />
              <span className="text-sm md:text-base">{storeContact.address.display}</span>
            </a>
            <div className="rounded-lg overflow-hidden border border-mebel-border shadow-sm w-full h-36">
              <iframe
                title="Розташування магазину Mebel"
                src={storeContact.address.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="w-full">
            <h3 className="font-display text-lg md:text-xl font-bold mb-4 text-mebel-text-strong">
              Месенджери
            </h3>
            <div className="flex flex-col space-y-3">
              <a
                href={storeContact.social.viber}
                className="flex items-center gap-2 text-mebel-text hover:text-mebel-text-strong transition-colors"
              >
                <FaViber size={18} className="text-[#7360F2]" />
                <span className="text-sm md:text-base">Viber</span>
              </a>
              <a
                href={storeContact.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-mebel-text hover:text-mebel-text-strong transition-colors"
              >
                <FaTelegram size={18} className="text-[#26A5E4]" />
                <span className="text-sm md:text-base">Telegram</span>
              </a>
              <a
                href={storeContact.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-mebel-text hover:text-mebel-text-strong transition-colors"
              >
                <FaWhatsapp size={18} className="text-[#25D366]" />
                <span className="text-sm md:text-base">WhatsApp</span>
              </a>
              <a
                href={storeContact.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-mebel-text hover:text-mebel-text-strong transition-colors"
              >
                <FaFacebook size={18} className="text-[#1877F2]" />
                <span className="text-sm md:text-base">Facebook</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-mebel-border mt-8 pt-8 text-center">
          <p className="text-sm text-mebel-text-subtle">
            © {new Date().getFullYear()} {storeContact.name}. Усі права захищені.
            <Link
              to="/terms"
              className="ml-3 text-sm text-mebel-text-subtle hover:text-mebel-text-strong transition-colors"
            >
              Умови використання
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
