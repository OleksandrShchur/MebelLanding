import type { Magazine } from "../types";
import { assetUrl, catalogImageUrl } from "../utils/assets";
import { prefetchMagazinePages } from "../hooks/useCatalogPageLoader";

interface MagazineCardProps {
  magazine: Magazine;
  onClick: () => void;
  disabled?: boolean;
}

const MagazineCard = ({ magazine, onClick, disabled = false }: MagazineCardProps) => {
  const coverImage = magazine.srcs[0];

  const handlePrefetch = () => {
    if (!disabled) {
      prefetchMagazinePages(magazine.srcs, 3);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      className="group w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mebel-olive disabled:cursor-not-allowed disabled:opacity-60"
      aria-label={`Відкрити каталог ${magazine.name}`}
    >
      <div className="overflow-hidden rounded-[26px] border border-mebel-border-muted bg-mebel-surface-raised p-0 shadow-mebel-md transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:border-mebel-tan group-hover:shadow-mebel-md group-active:translate-y-0 group-active:scale-[0.985] group-disabled:hover:translate-y-0 group-disabled:hover:shadow-mebel-md group-disabled:active:scale-100">
        <div className="m-2 mb-0 overflow-hidden rounded-[22px] border border-mebel-border-muted bg-gradient-to-b from-mebel-surface-raised to-mebel-cream">
          <img
            src={coverImage ? catalogImageUrl(coverImage) : assetUrl('images/top/1.jpg')}
            alt={magazine.name}
            className="h-64 w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
            loading="lazy"
          />
        </div>
        <div className="p-4 pt-5 text-center">
          <h3 className="font-display mb-2 text-lg font-semibold text-mebel-text-strong md:text-xl">
            {magazine.name}
          </h3>
        </div>
      </div>
    </button>
  );
};

export default MagazineCard;
