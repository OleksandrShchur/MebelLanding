import type { Category, Magazine } from '../types';
import MagazineCard from './MagazineCard';
import { categories } from '../data/categories';
import SectionShell from './SectionShell';
import StateMessage from './StateMessage';

interface CategorySectionProps {
  category: Category;
  title?: string;
  magazines: Magazine[];
  onMagazineClick: (magazine: Magazine, category: Category, page: number) => void;
  loading?: boolean;
  missing?: boolean;
}

const loadingItems = Array.from({ length: 4 }, (_, index) => index);

const CategorySection = ({
  category,
  title,
  magazines,
  onMagazineClick,
  loading = false,
  missing = false,
}: CategorySectionProps) => {
  const categoryData = categories.find(cat => cat.id === category);
  const categoryName = title ?? (categoryData ? categoryData.name : category);
  const isEmpty = magazines.length === 0;

  return (
    <SectionShell
      id={category}
      title={categoryName}
      description="Доступні каталоги в цій категорії. Відкрийте потрібний каталог, щоб переглянути сторінки у модальному режимі."
      contentClassName="space-y-4"
    >
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loadingItems.map((item) => (
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
      ) : null}

      {!loading && missing ? (
        <StateMessage
          title="Категорія тимчасово недоступна"
          description="Для цієї категорії ще немає підготовленого каталогу або дані не вдалося зчитати коректно."
          compact
        />
      ) : null}

      {!loading && !missing && isEmpty ? (
        <StateMessage
          title="Каталоги скоро з’являться"
          description="Ми вже готуємо добірку для цієї категорії. Будь ласка, поверніться трохи пізніше."
          compact
        />
      ) : null}

      {!loading && !missing && !isEmpty ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {magazines.map((magazine) => (
            <MagazineCard
              key={magazine.id}
              magazine={magazine}
              onClick={() => onMagazineClick(magazine, category, 0)}
            />
          ))}
        </div>
      ) : null}
    </SectionShell>
  );
};

export default CategorySection;
