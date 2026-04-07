import type { Category } from '../types';
import { categories } from '../data/categories';

interface CategoriesGridProps {
  onCategoryClick: (category: Category) => void;
}

const CategoriesGrid = ({ onCategoryClick }: CategoriesGridProps) => {
  return (
    <section id="categories" className="py-16 bg-[#F7F5F2]">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#2F2A25]">Наші категорії</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:-translate-y-3 hover:shadow-lg active:scale-[0.8] transition duration-300 ease-out transform border border-[#E6E1DA]"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/categories/${category.imageId}`}
                alt={category.name}
                className="w-full h-48 object-contain"
              />
              <div className="p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-2 text-[#2F2A25] text-center">
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
