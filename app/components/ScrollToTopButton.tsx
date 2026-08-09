import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [pendingCategoriesScroll, setPendingCategoriesScroll] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 100);
    };

    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToCategories = () => {
    const element = document.getElementById('categories');
    if (!element) return false;

    const headerHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
      ) || 56;
    const top = element.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    return true;
  };

  useEffect(() => {
    if (!pendingCategoriesScroll) return;
    if (location.pathname !== '/') return;

    const timer = window.setTimeout(() => {
      scrollToCategories();
      setPendingCategoriesScroll(false);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [location.pathname, pendingCategoriesScroll, prefersReducedMotion]);

  const handleClick = () => {
    if (scrollToCategories()) return;

    setPendingCategoriesScroll(true);
    navigate('/');
  };

  const instant = { opacity: 1, scale: 1, y: 0 };
  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 340, damping: 28 };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="scroll-to-top"
          type="button"
          onClick={handleClick}
          className="group fixed bottom-4 right-4 z-50 rounded-full bg-mebel-olive p-3 text-white shadow-lg hover:bg-mebel-olive-darker active:bg-mebel-olive-darkest"
          aria-label="Перейти до категорій"
          initial={prefersReducedMotion ? instant : { opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? instant : { opacity: 0, scale: 0.7, y: 12 }}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
          transition={springTransition}
        >
          <svg
            className="h-6 w-6 transition-transform duration-2000 ease-in-out group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
