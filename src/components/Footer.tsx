const Footer = () => {
  return (
    <footer id="footer" className="bg-white py-8 border-t border-[#E6E1DA]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#2F2A25]">Магазин Mebel</h3>
            <p className="text-[#5B544E]">
              Ваше найкраще місце для придбання високоякісних меблів. 
              Ми пропонуємо широкий асортимент шаф, диванів та кухонних рішень, щоб зробити ваш дім красивим та функціональним.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#2F2A25]">Зв'яжіться з нами</h3>
            <p className="text-[#5B544E] mb-2">Номер: +1 (555) 123-4567</p>
            <p className="text-[#5B544E] mb-2">Пошта: info@mebelstore.com</p>
            <p className="text-[#5B544E]">Адреса: 123 Магазин Меблів</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#2F2A25]">Соціальні мережі</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-[#5B544E] hover:text-[#2F2A25] transition-colors">
                Facebook
              </a>
              <a href="#" className="text-[#5B544E] hover:text-[#2F2A25] transition-colors">
                WhatsApp
              </a>
              <a href="#" className="text-[#5B544E] hover:text-[#2F2A25] transition-colors">
                Viber
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#E6E1DA] mt-8 pt-8 text-center">
          <p className="text-[#8A827A]">
            © {new Date().getFullYear()} Магазин Mebel. Усі права захищені.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
