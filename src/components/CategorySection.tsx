import type { Category, Magazine } from '../types';
import MagazineCard from './MagazineCard';
import { categories } from '../data/categories';

interface CategorySectionProps {
  category: Category;
  magazines: Magazine[];
  onMagazineClick: (magazine: Magazine, category: Category, page: number) => void;
}

const CategorySection = ({ category, magazines, onMagazineClick }: CategorySectionProps) => {
  const categoryData = categories.find(cat => cat.id === category);
  const categoryName = categoryData ? categoryData.name : category;

  return (
    <section id={category} className="py-16 bg-[#F7F5F2]">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#2F2A25]">{categoryName}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
          {magazines.map((magazine) => (
            <MagazineCard
              key={magazine.id}
              magazine={magazine}
              onClick={() => onMagazineClick(magazine, category, 0)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
