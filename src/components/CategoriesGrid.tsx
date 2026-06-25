import type { Category } from '../types';
import { categories } from '../data/categories';

interface CategoriesGridProps {
  onCategoryClick: (category: Category) => void;
}

const CategoriesGrid = ({ onCategoryClick }: CategoriesGridProps) => {
  return (
    <section id="categories" className="py-10 md:py-16 bg-[#F7F5F2]">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-12 text-[#2F2A25]">
          Наші категорії
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="group flex h-[188px] md:h-auto w-full flex-col bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:-translate-y-1.5 md:hover:-translate-y-3 hover:shadow-lg active:scale-[0.98] transition duration-300 ease-out transform border border-[#E6E1DA] p-0 text-[#2F2A25]"
              aria-label={category.name}
            >
              <img
                src={`${import.meta.env.BASE_URL}images/categories/${category.imageId}`}
                alt={category.name}
                className="w-full h-24 md:h-48 object-contain px-5 pt-5 md:px-0 md:pt-0 opacity-85 group-hover:opacity-100 transition-opacity"
              />
              <div className="mt-auto flex min-h-16 md:min-h-0 w-full items-center justify-center px-3 pb-4 pt-2 md:p-6">
                <h3 className="text-[15px] md:text-xl font-semibold leading-snug text-[#2F2A25] text-center">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
