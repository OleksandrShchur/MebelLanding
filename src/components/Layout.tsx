import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import ScrollToTopButton from './ScrollToTopButton';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const isModalOpen = location.pathname.includes('/catalog/');

  const instant = { opacity: 1, y: 0 };
  const pageTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: 'easeOut' as const };

  return (
    <div className="font-sans min-h-screen bg-mebel-cream">
      <Header />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={prefersReducedMotion ? instant : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? instant : { opacity: 0, y: -8 }}
          transition={pageTransition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <Footer />
      {!isModalOpen && <ScrollToTopButton />}
    </div>
  );
};

export default Layout;
