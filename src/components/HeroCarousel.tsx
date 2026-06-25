import { assetUrl } from '../utils/assets';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const heroImages = [assetUrl('images/top/1.jpg')];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
};

const HeroCarousel = () => {
  const currentIndex = 0;
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 400], [0, prefersReducedMotion ? 0 : -60]);
  const chevronOpacity = useTransform(scrollY, [0, 120], [1, 0]);

  const instantItem = {
    hidden: { opacity: 1, y: 0 },
    show: { opacity: 1, y: 0, transition: { duration: 0 } },
  };

  const scrollToCategories = () => {
    const element = document.getElementById('categories');
    element?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <section id="hero" className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden scroll-mt-[var(--header-height,3.5rem)]">
      <div className="relative h-full overflow-hidden">
        {heroImages.map((image, index) => (
          <motion.div
            key={index}
            className={`absolute inset-0 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ y: index === currentIndex ? backgroundY : undefined }}
          >
            <img
              src={image}
              alt={`Hero ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[#2F2A25]/35" />
          </motion.div>
        ))}

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          variants={prefersReducedMotion ? { hidden: {}, show: {} } : container}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            variants={prefersReducedMotion ? instantItem : item}
            className="hero-title mb-4 max-w-3xl text-white drop-shadow-md"
          >
            Якісні меблі для вашого дому
          </motion.h1>
          <motion.p
            variants={prefersReducedMotion ? instantItem : item}
            className="mb-8 max-w-xl text-base text-mebel-cream/95 drop-shadow md:text-lg"
          >
            Переглядайте каталоги меблів онлайн та обирайте ідеальні рішення для кожної кімнати.
          </motion.p>
          <motion.button
            type="button"
            variants={prefersReducedMotion ? instantItem : item}
            onClick={scrollToCategories}
            className="nav-btn rounded-full bg-mebel-olive px-6 py-3 text-sm font-semibold text-white shadow-mebel-md transition-colors hover:bg-mebel-olive-dark md:text-base"
          >
            Переглянути каталоги
          </motion.button>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={scrollToCategories}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/90"
        style={{ opacity: chevronOpacity }}
        aria-label="Прокрутити до категорій"
        animate={prefersReducedMotion ? undefined : { y: [0, 8, 0] }}
        transition={prefersReducedMotion ? { duration: 0 } : { repeat: Infinity, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <ChevronDown className="h-8 w-8" />
      </motion.button>
    </section>
  );
};

export default HeroCarousel;
