import type { Magazine } from "../types";

interface MagazineCardProps {
  magazine: Magazine;
  onClick: () => void;
}

const MagazineCard = ({ magazine, onClick }: MagazineCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      <img
        src={`${import.meta.env.BASE_URL}${magazine.images[0]}`}
        alt={magazine.name}
        className="w-full h-64 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{magazine.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{magazine.description}</p>
        <p className="text-lg font-bold text-blue-600">${magazine.price}</p>
      </div>
    </div>
  );
};

export default MagazineCard;
