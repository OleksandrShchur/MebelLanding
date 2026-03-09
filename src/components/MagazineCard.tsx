import type { Magazine } from "../types";

interface MagazineCardProps {
  magazine: Magazine;
  onClick: () => void;
}

const MagazineCard = ({ magazine, onClick }: MagazineCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-[#E6E1DA]"
    >
      <img
        src={`${import.meta.env.BASE_URL}${magazine.images[0]}`}
        alt={magazine.name}
        className="w-full h-64 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-[#2F2A25]">{magazine.name}</h3>
        <p className="text-[#5B544E] text-sm mb-2">{magazine.description}</p>
        <p className="text-lg font-bold text-[#7C5A3A]">${magazine.price}</p>
      </div>
    </div>
  );
};

export default MagazineCard;
