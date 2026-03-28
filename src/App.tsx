import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  const { category, magazineId } = parseCatalogParams(location.pathname);
  const selectedMagazine = data && category && magazineId && isValidCategory(category) && isValidId(magazineId)
    ? findMagazineByCategoryAndId(data, category as Category, parseInt(magazineId))
    : null;
  const isModalOpen = !!selectedMagazine;

  const handleCategoryClick = (category: Category) => {
    const element = document.getElementById(category);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMagazineClick = (magazine: Magazine, category: Category, page: number) => {
    navigate(`/catalog/${category}/${magazine.id}?page=${page}`);
  };

  const handleCloseModal = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2]">
        <div className="text-xl text-[#5B544E]">Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2]">
        <div className="text-xl text-[#7C5A3A]">Помилка: {error}</div>
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

function findMagazineByCategoryAndId(data: { wardrobes: Magazine[]; sofas: Magazine[]; kitchens: Magazine[] }, category: Category, id: number): Magazine | null {
  return data[category].find(magazine => magazine.id === id) || null;
}

function isValidCategory(category: string): category is Category {
  return ['wardrobes', 'sofas', 'kitchens'].includes(category);
}

function isValidId(id: string): boolean {
  return !isNaN(parseInt(id)) && parseInt(id) > 0;
}

function parseCatalogParams(pathname: string): { category: string | null; magazineId: string | null } {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length >= 3 && parts[0] === 'catalog') {
    return { category: parts[1], magazineId: parts[2] };
  }
  return { category: null, magazineId: null };
}

export default App;
