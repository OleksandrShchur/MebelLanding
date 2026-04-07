import { useLocation, useNavigate } from 'react-router-dom';
import HeroCarousel from './HeroCarousel';
import CategoriesGrid from './CategoriesGrid';
import CategorySection from './CategorySection';
import MagazineModal from './MagazineModal';
import { useGallery } from '../hooks/useGallery';
import type { Category, Magazine } from '../types';
import { categories } from '../data/categories';

function Home() {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg md:text-xl text-[#5B544E]">Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg md:text-xl text-[#7C5A3A]">Помилка: {error}</div>
      </div>
    );
  }

  return (
    <>
      <HeroCarousel />
      <CategoriesGrid onCategoryClick={handleCategoryClick} />

      {data && (
        <>
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category.id}
              magazines={data[category.id]}
              onMagazineClick={handleMagazineClick}
            />
          ))}
        </>
      )}

      <MagazineModal
        magazine={selectedMagazine}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

function findMagazineByCategoryAndId(data: Record<Category, Magazine[]>, category: Category, id: number): Magazine | null {
  return data[category].find(magazine => magazine.id === id) || null;
}

function isValidCategory(category: string): category is Category {
  return categories.some(cat => cat.id === category);
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

export default Home;