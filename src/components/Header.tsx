import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

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

const SofaIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 84 84"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', flexShrink: 0 }}
  >
    <rect x="12" y="20" width="60" height="22" rx="5" fill="#7D5030" />
    <rect x="8" y="40" width="68" height="24" rx="5" fill="#6B4226" />
    <rect x="14" y="42" width="56" height="10" rx="3" fill="#8B5E3C" opacity="0.45" />
    <rect x="2" y="30" width="12" height="30" rx="4" fill="#5A3318" />
    <rect x="70" y="30" width="12" height="30" rx="4" fill="#5A3318" />
    <rect x="10" y="62" width="6" height="10" rx="2" fill="#3E2208" />
    <rect x="68" y="62" width="6" height="10" rx="2" fill="#3E2208" />
  </svg>
);

const navItems = [
  { id: 'hero', label: 'Головна', Icon: HomeIcon },
  { id: 'categories', label: 'Каталоги', Icon: CatalogIcon },
  { id: 'footer', label: 'Контакти', Icon: ContactIcon },
];

const menuContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

const menuItem = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeight = () => {
      const height = header.getBoundingClientRect().height;
      setHeaderHeight(height);
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset =
        headerRef.current?.getBoundingClientRect().height ?? headerHeight;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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
  }, [location.pathname, pendingSection]);

  const handleNavClick = (sectionId: string) => {
    if (sectionId === 'footer') {
      scrollToSection(sectionId);
      return;
    }

    if (location.pathname !== '/') {
      setPendingSection(sectionId);
      navigate('/');
      return;
    }

    scrollToSection(sectionId);
  };

  const menuPanelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  const reducedMenuItem = {
    hidden: { opacity: 1, x: 0 },
    show: { opacity: 1, x: 0, transition: { duration: 0 } },
  };

  return (
    <>
      <style>{`
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
        className={`fixed top-0 z-50 w-full transition-all duration-300 ease-out ${
          scrolled
            ? 'bg-white/80 backdrop-blur-md shadow-mebel-sm border-b border-mebel-border'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="font-display text-xl md:text-2xl font-bold text-mebel-text-strong">
            <button
              type="button"
              onClick={() => handleNavClick('hero')}
              className="nav-btn flex items-center rounded-lg px-1 py-0.5 -ml-1 text-mebel-text-strong hover:text-mebel-text-strong hover:bg-mebel-hover transition-all duration-200"
              aria-label="Головна"
            >
              <SofaIcon />
              Магазин Mebel
            </button>
          </h1>

          <nav className="hidden md:flex space-x-1">
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleNavClick(id)}
                className="nav-btn group flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent text-mebel-text hover:text-mebel-text-strong hover:bg-mebel-hover transition-all duration-200"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-mebel-olive/15 group-hover:bg-mebel-olive/20 transition-colors text-current">
                  <Icon />
                </span>
                <span className="font-sans text-sm font-medium">{label}</span>
              </button>
            ))}
          </nav>

          <button
            className="nav-btn md:hidden w-9 h-9 flex flex-col items-center justify-center rounded-lg text-mebel-text hover:text-mebel-text-strong hover:bg-mebel-hover transition-colors"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
            aria-expanded={isMenuOpen}
          >
            <span className={`bar ${isMenuOpen ? 'bar-top-open' : ''}`} style={{ marginBottom: '5px' }} />
            <span className={`bar ${isMenuOpen ? 'bar-mid-open' : ''}`} style={{ marginBottom: '5px' }} />
            <span className={`bar ${isMenuOpen ? 'bar-bot-open' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                key="mobile-backdrop"
                className={`md:hidden fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px] ${headerHeight ? '' : 'top-14'}`}
                style={{ top: headerHeight ? `${headerHeight}px` : undefined }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={menuPanelTransition}
                onClick={() => setIsMenuOpen(false)}
              />

              <motion.div
                key="mobile-menu"
                className={`md:hidden fixed inset-x-0 z-40 bg-white shadow-xl ${headerHeight ? '' : 'top-14'}`}
                style={{ top: headerHeight ? `${headerHeight}px` : undefined }}
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: -8 }}
                transition={menuPanelTransition}
              >
                <div className="h-0.5 bg-gradient-to-r from-mebel-olive via-mebel-warm to-transparent" />

                <motion.div
                  className="px-4 py-4 space-y-2"
                  variants={prefersReducedMotion ? undefined : menuContainer}
                  initial="hidden"
                  animate="show"
                >
                  {navItems.map(({ id, label, Icon }) => (
                    <motion.button
                      key={id}
                      type="button"
                      variants={prefersReducedMotion ? reducedMenuItem : menuItem}
                      onClick={() => handleNavClick(id)}
                      className="nav-btn group flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl bg-mebel-olive text-white font-medium hover:bg-mebel-olive-dark active:scale-[0.98] transition-all duration-150"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 group-hover:bg-white/25 transition-colors shrink-0 text-white">
                        <Icon />
                      </span>
                      <span className="font-sans text-sm tracking-wide">{label}</span>
                      <svg
                        className="ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
                      </svg>
                    </motion.button>
                  ))}
                </motion.div>

                <div className="h-2" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <div style={{ height: headerHeight || undefined }} className={headerHeight ? undefined : 'h-14'} aria-hidden="true" />
    </>
  );
};

export default Header;
