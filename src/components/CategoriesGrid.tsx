import type { Category } from '../types';

const categories = [
  {
    id: 'wardrobes' as Category,
    name: 'Wardrobes',
    description: 'Elegant storage solutions for your home',
    image: `${import.meta.env.BASE_URL}/images/img_1.jpg`
  },
  {
    id: 'sofas' as Category,
    name: 'Sofas',
    description: 'Comfortable seating for every room',
    image: `${import.meta.env.BASE_URL}/images/img_2.jpg`
  },
  {
    id: 'kitchens' as Category,
    name: 'Kitchens',
    description: 'Functional and stylish kitchen designs',
    image: `${import.meta.env.BASE_URL}/images/img_3.jpg`
  }
];

interface CategoriesGridProps {
  onCategoryClick: (category: Category) => void;
}

const CategoriesGrid = ({ onCategoryClick }: CategoriesGridProps) => {
  return (
    <section id="categories" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
