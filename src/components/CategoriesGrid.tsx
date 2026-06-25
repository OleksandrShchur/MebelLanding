import { motion } from 'framer-motion';
import type { Category, CategoryItem } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';
import SectionShell from './SectionShell';
import StateMessage from './StateMessage';

interface CategoriesGridProps {
  title?: string;
  description?: string;
  items: CategoryItem[];
  onSelect: (category: Category) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

const skeletonItems = Array.from({ length: 6 }, (_, index) => index);

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  }),
};

const CategoriesGrid = ({
  title = 'Наші категорії',
  description = 'Оберіть категорію, щоб швидко перейти до відповідного каталогу меблів.',
  items,
  onSelect,
  loading = false,
  error = null,
  onRetry,
  emptyStateTitle = 'Категорії тимчасово недоступні',
  emptyStateDescription = 'Спробуйте оновити сторінку трохи пізніше або повторіть запит ще раз.',
}: CategoriesGridProps) => {
  const prefersReducedMotion = useReducedMotion();
  const hasItems = items.length > 0;

  const reducedVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: () => ({ opacity: 1, y: 0, transition: { duration: 0 } }),
  };

  return (
    <SectionShell
      id="categories"
      title={title}
      description={description}
      contentClassName="space-y-4"
    >
      {loading ? (
        <div
          className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6"
          aria-label="Завантаження категорій"
          aria-busy="true"
        >
          {skeletonItems.map((item) => (
            <div
              key={item}
              className="h-[188px] animate-pulse rounded-2xl border border-mebel-border-muted bg-mebel-surface p-3 shadow-sm md:h-[280px] md:p-4"
            >
              <div className="flex min-h-[112px] items-center justify-center rounded-xl border border-mebel-border-muted bg-mebel-cream md:min-h-[176px]">
                <div className="h-24 w-24 rounded-full bg-mebel-skeleton md:h-32 md:w-32" />
              </div>
              <div className="px-4 pb-3 pt-5 md:px-3 md:pt-6">
                <div className="mx-auto h-4 w-4/5 rounded bg-mebel-skeleton-muted" />
                <div className="mx-auto mt-3 h-4 w-3/5 rounded bg-mebel-skeleton-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <StateMessage
          title="Не вдалося завантажити категорії"
          description={error}
          tone="error"
          compact
          action={
            onRetry ? (
              <button type="button" onClick={onRetry}>
                Спробувати ще раз
              </button>
            ) : undefined
          }
        />
      ) : null}

      {!loading && !error && !hasItems ? (
        <StateMessage
          title={emptyStateTitle}
          description={emptyStateDescription}
          compact
        />
      ) : null}

      {!loading && !error && hasItems ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((category, index) => (
            <motion.div
              key={category.id}
              className="h-full"
              custom={index}
              variants={prefersReducedMotion ? reducedVariants : cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <button
                type="button"
                onClick={() => onSelect(category.id)}
                disabled={category.disabled}
                className="group h-full w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mebel-olive disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Перейти до категорії ${category.name}`}
              >
                <div className="flex h-full min-h-[188px] w-full flex-col rounded-[26px] border border-mebel-border-muted bg-mebel-surface-raised p-3 text-mebel-text-strong shadow-mebel-md transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:border-mebel-tan group-hover:shadow-mebel-md group-active:translate-y-0 group-active:scale-[0.985] group-disabled:hover:translate-y-0 group-disabled:hover:shadow-mebel-md group-disabled:active:scale-100 md:min-h-[280px] md:p-4 md:group-hover:-translate-y-2">
                  <div className="flex min-h-[112px] flex-1 items-center justify-center rounded-[22px] border border-mebel-border-muted bg-gradient-to-b from-mebel-surface-raised to-mebel-cream px-4 py-5 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] md:min-h-[176px] md:px-6 md:py-8">
                    <img
                      src={category.imageSrc}
                      alt={category.imageAlt ?? category.name}
                      className="max-h-24 w-full object-contain opacity-95 transition duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] group-hover:opacity-100 md:max-h-36"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex min-h-16 shrink-0 items-center justify-center px-2 pb-2 pt-4 text-center md:px-3 md:pb-3 md:pt-5">
                    <h3 className="text-sm font-display font-semibold leading-snug text-mebel-text-strong md:text-lg">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      ) : null}
    </SectionShell>
  );
};

export default CategoriesGrid;
