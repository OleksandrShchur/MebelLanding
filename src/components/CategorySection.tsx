import type { Category, Magazine } from '../types';
import MagazineCard from './MagazineCard';

interface CategorySectionProps {
  category: Category;
  magazines: Magazine[];
  onMagazineClick: (magazine: Magazine, category: Category) => void;
}

const CategorySection = ({ category, magazines, onMagazineClick }: CategorySectionProps) => {
  const categoryNames = {
    wardrobes: 'Wardrobes',
    sofas: 'Sofas',
    kitchens: 'Kitchens'
  };

  return (
    <section id={category} className="py-16 bg-[#F7F5F2]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#2F2A25]">{categoryNames[category]}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {magazines.map((magazine) => (
            <MagazineCard
              key={magazine.id}
              magazine={magazine}
              onClick={() => onMagazineClick(magazine, category)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
