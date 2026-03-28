import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    const header = document.querySelector('header');
    if (element) {
      const headerHeight = header?.offsetHeight ?? 57;
      const top = element.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-[#E6E1DA]">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#2F2A25]">Магазин Mebel</h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <button
            onClick={() => scrollToSection('hero')}
            className="text-[#5B544E] hover:text-[#2F2A25] transition-colors"
          >
            Головна
          </button>
          <button
            onClick={() => scrollToSection('categories')}
            className="text-[#5B544E] hover:text-[#2F2A25] transition-colors"
          >
            Каталоги
          </button>
          <button
            onClick={() => scrollToSection('footer')}
            className="text-[#5B544E] hover:text-[#2F2A25] transition-colors"
          >
            Контакти
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#5B544E] hover:text-[#2F2A25] transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E6E1DA]">
          <div className="container mx-auto px-4 py-2 space-y-2">
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left py-2 text-[#5B544E] hover:text-[#2F2A25]"
            >
              Головна
            </button>
            <button
              onClick={() => scrollToSection('categories')}
              className="block w-full text-left py-2 text-[#5B544E] hover:text-[#2F2A25]"
            >
              Каталоги
            </button>
            <button
              onClick={() => scrollToSection('footer')}
              className="block w-full text-left py-2 text-[#5B544E] hover:text-[#2F2A25]"
            >
              Контакти
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
