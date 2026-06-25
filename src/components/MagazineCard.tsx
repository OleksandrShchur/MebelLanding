import type { Magazine } from "../types";
import { assetUrl } from "../utils/assets";

interface MagazineCardProps {
  magazine: Magazine;
  onClick: () => void;
  disabled?: boolean;
}

const MagazineCard = ({ magazine, onClick, disabled = false }: MagazineCardProps) => {
  const coverImage = magazine.images[0];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group w-full overflow-hidden rounded-[26px] border border-mebel-border-muted bg-mebel-surface-raised p-0 text-left shadow-mebel-sm transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-mebel-tan hover:shadow-mebel-md active:translate-y-0 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mebel-olive disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-mebel-sm disabled:active:scale-100"
      aria-label={`Відкрити каталог ${magazine.name}`}
    >
      <div className="overflow-hidden rounded-[22px] m-2 mb-0 border border-mebel-border-muted bg-gradient-to-b from-mebel-surface-raised to-mebel-cream">
        <img
          src={coverImage ? assetUrl(coverImage) : assetUrl('images/top/1.jpg')}
          alt={magazine.name}
          className="h-64 w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
          loading="lazy"
        />
      </div>
      <div className="p-4 pt-5 text-center">
        <h3 className="mb-2 text-base font-semibold text-mebel-text-strong md:text-lg">
          {magazine.name}
        </h3>
      </div>
    </button>
  );
};

export default MagazineCard;
