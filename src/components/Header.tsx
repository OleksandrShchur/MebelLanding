import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <polyline points="9 21 9 12 15 12 15 21" />
  </svg>
);

const CatalogIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ContactIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.37 17a19.45 19.45 0 0 1-4.5-4.5 19.79 19.79 0 0 1-3.96-8.37A2 2 0 0 1 5 2h2.09a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const navItems = [
  { id: 'hero', label: 'Головна', Icon: HomeIcon },
  { id: 'categories', label: 'Каталоги', Icon: CatalogIcon },
  { id: 'footer', label: 'Контакти', Icon: ContactIcon },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(50);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
      setPendingSection(null);
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!pendingSection) return;
    if (location.pathname !== '/') return;

    const timer = window.setTimeout(() => {
      scrollToSection(pendingSection);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [location.pathname, pendingSection, headerHeight]);

  const handleNavClick = (sectionId: string) => {
    if (location.pathname !== '/') {
      setPendingSection(sectionId);
      navigate('/');
      return;
    }

    scrollToSection(sectionId);
  };

  return (
    <>
      <style>{`
        @keyframes menuItemIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .menu-item {
          animation: menuItemIn 0.25s ease forwards;
          opacity: 0;
        }
        .menu-item:nth-child(1) { animation-delay: 0.05s; }
        .menu-item:nth-child(2) { animation-delay: 0.10s; }
        .menu-item:nth-child(3) { animation-delay: 0.15s; }

        /* Animated hamburger bars */
        .bar {
          display: block;
          width: 20px;
          height: 2px;
          background: currentColor;
          border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
          transform-origin: center;
        }
        .bar-top-open    { transform: translateY(6px) rotate(45deg); }
        .bar-mid-open    { opacity: 0; transform: scaleX(0); }
        .bar-bot-open    { transform: translateY(-6px) rotate(-45deg); }
      `}</style>

      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-white shadow-md border-b border-[#E6E1DA]"
      >
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-[#2F2A25]">Магазин Mebel</h1>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent text-[#5B544E] hover:text-[#2F2A25] hover:bg-[#F5F0EB] transition-all duration-200"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#5B3E28]/15 group-hover:bg-[#5B3E28]/20 transition-colors text-[#F7F5F2]">
                  <Icon />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </nav>

          {/* Hamburger Button — animated 3-line stack */}
          <button
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center rounded-lg text-[#5B544E] hover:text-[#2F2A25] hover:bg-[#F5F0EB] transition-colors"
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label={isMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
            aria-expanded={isMenuOpen}
          >
            <span className={`bar ${isMenuOpen ? 'bar-top-open' : ''}`} style={{ marginBottom: '5px' }} />
            <span className={`bar ${isMenuOpen ? 'bar-mid-open' : ''}`} style={{ marginBottom: '5px' }} />
            <span className={`bar ${isMenuOpen ? 'bar-bot-open' : ''}`} />
          </button>
        </div>

        {/* Mobile Overlay Menu */}
        <div
          className="md:hidden fixed inset-x-0 z-40 bg-white shadow-xl"
          style={{
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            opacity: isMenuOpen ? 1 : 0,
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(-6px)',
            pointerEvents: isMenuOpen ? 'auto' : 'none',
          }}
        >
          {/* Decorative top accent line */}
          <div className="h-0.5 bg-gradient-to-r from-[#7D5C3C] via-[#A67C5B] to-transparent" />

          <div className="px-4 py-4 space-y-2">
            {isMenuOpen && navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className="menu-item group flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl bg-[#7D5C3C] text-white font-medium hover:bg-[#6B4E32] active:scale-[0.98] transition-all duration-150"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 group-hover:bg-white/25 transition-colors shrink-0">
                  <Icon />
                </span>
                <span className="text-sm tracking-wide">{label}</span>
                <svg
                  className="ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>

          <div className="h-2" />
        </div>

        {/* Backdrop */}
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px]"
          style={{
            top: `${headerHeight}px`,
            transition: 'opacity 0.25s ease',
            opacity: isMenuOpen ? 1 : 0,
            pointerEvents: isMenuOpen ? 'auto' : 'none',
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      </header>
    </>
  );
};

export default Header;
