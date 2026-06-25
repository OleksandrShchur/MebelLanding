import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTopButton from './ScrollToTopButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isModalOpen = location.pathname.includes('/catalog/');

  return (
    <div className="min-h-screen bg-mebel-cream">
      <Header />
      {children}
      <Footer />
      {!isModalOpen && <ScrollToTopButton />}
    </div>
  );
};

export default Layout;