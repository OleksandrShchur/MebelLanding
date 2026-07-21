import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeroCarousel from './HeroCarousel';
import CategoriesGrid from './CategoriesGrid';
import CategorySection from './CategorySection';
import MagazineModal from './MagazineModal';
import StateMessage from './StateMessage';
import { useGallery } from '../hooks/useGallery';
import type { Category, CategoryItem, CategorySectionViewModel, Magazine } from '../types';
import { categories } from '../data/categories';
import { assetUrl } from '../utils/assets';

const catalogLoadingItems = Array.from({ length: 4 }, (_, index) => index);

function Home() {
  const { data, loading, error, retry, status } = useGallery();
  const { category: categoryParam, magazineId: magazineIdParam } = useParams<{
    category?: string;
    magazineId?: string;
  }>();
  const navigate = useNavigate();

  const categoryItems = useMemo<CategoryItem[]>(
    () =>
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        imageSrc: assetUrl(`images/categories/${category.imageId}`),
        imageAlt: category.name,
        disabled: status === 'error',
      })),
    [status]
  );

  const sections = useMemo<CategorySectionViewModel[]>(
    () =>
      categories.map((category) => {
        const sectionMagazines = data?.[category.id];

        return {
          category: category.id,
          title: category.name,
          magazines: Array.isArray(sectionMagazines) ? sectionMagazines : [],
          isEmpty: !sectionMagazines || sectionMagazines.length === 0,
          missing: !data || !Array.isArray(sectionMagazines),
        };
      }),
    [data]
  );

  const selectedMagazine =
    data &&
      categoryParam &&
      magazineIdParam &&
      isValidCategory(categoryParam) &&
      isValidId(magazineIdParam)
      ? findMagazineByCategoryAndId(data, categoryParam, Number.parseInt(magazineIdParam, 10))
      : null;
  const isModalOpen = !!selectedMagazine;
  const categoryName =
    categoryParam && isValidCategory(categoryParam)
      ? categories.find((cat) => cat.id === categoryParam)?.name
      : undefined;
  const hasRouteParams = !!categoryParam || !!magazineIdParam;
  const hasInvalidRouteParams =
    (!!categoryParam && !isValidCategory(categoryParam)) ||
    (!!magazineIdParam && !isValidId(magazineIdParam));
  const hasMissingMagazine = status === 'success' && hasRouteParams && !selectedMagazine && !hasInvalidRouteParams;
  const hasAnyCatalogs = sections.some((section) => !section.isEmpty);

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

  useEffect(() => {
    if ((hasInvalidRouteParams || hasMissingMagazine) && !loading) {
      navigate('/', { replace: true });
    }
  }, [hasInvalidRouteParams, hasMissingMagazine, loading, navigate]);

  return (
    <>
      <HeroCarousel />
      <CategoriesGrid
        items={categoryItems}
        onSelect={handleCategoryClick}
        error={error}
        onRetry={retry}
        emptyStateDescription="Список категорій порожній. Додайте дані до маніфесту каталогу, щоб заповнити секцію."
      />

      {loading ? (
        <section className="bg-mebel-cream py-10 md:py-16" aria-label="Завантаження каталогів" aria-busy="true">
          <div className="container mx-auto px-4">
            <div className="mb-6 md:mb-10">
              <div className="h-8 w-48 animate-pulse rounded bg-mebel-skeleton md:h-9" />
              <div className="mt-2 h-4 w-full max-w-xl animate-pulse rounded bg-mebel-skeleton-muted" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {catalogLoadingItems.map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-mebel-border bg-white shadow-sm"
                  aria-hidden="true"
                >
                  <div className="h-64 animate-pulse bg-mebel-skeleton" />
                  <div className="p-4">
                    <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-mebel-skeleton" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="bg-mebel-cream px-4 pb-16">
          <div className="container mx-auto">
            <StateMessage
              title="Каталог тимчасово недоступний"
              description="Ми не змогли завантажити добірку меблів. Перевірте інтернет-з’єднання та повторіть спробу."
              tone="error"
              action={
                <button type="button" onClick={retry}>
                  Оновити каталог
                </button>
              }
            />
          </div>
        </section>
      ) : null}

      {!loading && !error && hasAnyCatalogs
        ? sections.map((section) => (
          <CategorySection
            key={section.category}
            category={section.category}
            title={section.title}
            magazines={section.magazines}
            onMagazineClick={handleMagazineClick}
            missing={section.missing}
          />
        ))
        : null}

      {!loading && !error && !hasAnyCatalogs
        ? (
          <section className="bg-mebel-cream px-4 pb-16">
            <div className="container mx-auto">
              <StateMessage
                title="Каталоги ще наповнюються"
                description="Ми підготували структуру категорій, але поки не знайшли жодного доступного каталогу для відображення."
                action={
                  <button type="button" onClick={retry}>
                    Перевірити ще раз
                  </button>
                }
              />
            </div>
          </section>
        ) : null}

      <MagazineModal
        magazine={selectedMagazine}
        categoryName={categoryName}
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

export default Home;
