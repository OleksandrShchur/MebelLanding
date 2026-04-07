import Header from './Header';
import Footer from './Footer';
import ScrollToTopButton from './ScrollToTopButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <Header />
      {children}
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;