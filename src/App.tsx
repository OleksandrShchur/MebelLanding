import { useState } from 'react';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import CategoriesGrid from './components/CategoriesGrid';
import CategorySection from './components/CategorySection';
import MagazineModal from './components/MagazineModal';
import Footer from './components/Footer';
import { useGallery } from './hooks/useGallery';
import type { Category, Magazine } from './types';

function App() {
  const { data, loading, error } = useGallery();
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCategoryClick = (category: Category) => {
    const element = document.getElementById(category);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMagazineClick = (magazine: Magazine) => {
    setSelectedMagazine(magazine);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMagazine(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2]">
        <div className="text-xl text-[#5B544E]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2]">
        <div className="text-xl text-[#7C5A3A]">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <Header />
      <HeroCarousel />
      <CategoriesGrid onCategoryClick={handleCategoryClick} />

      {data && (
        <>
          <CategorySection
            category="wardrobes"
            magazines={data.wardrobes}
            onMagazineClick={handleMagazineClick}
          />
          <CategorySection
            category="sofas"
            magazines={data.sofas}
            onMagazineClick={handleMagazineClick}
          />
          <CategorySection
            category="kitchens"
            magazines={data.kitchens}
            onMagazineClick={handleMagazineClick}
          />
        </>
      )}

      <Footer />

      <MagazineModal
        magazine={selectedMagazine}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;
