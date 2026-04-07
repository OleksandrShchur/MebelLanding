import type { Magazine } from "../types";

interface MagazineCardProps {
  magazine: Magazine;
  onClick: () => void;
}

const MagazineCard = ({ magazine, onClick }: MagazineCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg active:scale-[0.99] transition duration-300 ease-out transform border border-[#E6E1DA]"
    >
      <img
        src={`${import.meta.env.BASE_URL}${magazine.images[0]}`}
        alt={magazine.name}
        className="w-full h-64 object-cover"
        loading="lazy"
      />
      <div className="p-4 text-center">
        <h3 className="text-base md:text-lg font-semibold mb-2 text-[#2F2A25]">
          {magazine.name}
        </h3>
      </div>
    </div>
  );
};

export default MagazineCard;
