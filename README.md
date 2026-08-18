# Mebel Store - Furniture Landing Page

A responsive React + TypeScript landing page for a furniture store featuring a magazine-style product viewer with page-flipping animation.

## Features

- **Responsive Design**: Mobile-first layout with breakpoints for mobile (< 768px), tablet (768px - 1024px), and desktop (> 1024px)
- **Hero Carousel**: Auto-sliding image carousel with manual navigation and pagination
- **Categories Grid**: Interactive cards for Wardrobes, Sofas, and Kitchens
- **Magazine Viewer**: Fullscreen modal with realistic page-flipping animation
- **Page Flipping**: Desktop shows two pages per spread, mobile shows single pages
- **Orientation Support**: Handles both portrait and landscape image orientations
- **Lazy Loading**: Images load on demand for better performance
- **Keyboard Navigation**: ESC to close modal, arrow keys for navigation

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- react-pageflip for page flipping animation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Navigation header
│   ├── HeroCarousel.tsx    # Image carousel
│   ├── CategoriesGrid.tsx  # Category selection cards
│   ├── CategorySection.tsx # Product sections
│   ├── MagazineCard.tsx    # Individual product cards
│   ├── MagazineModal.tsx   # Fullscreen viewer modal
│   ├── FlipBookViewer.tsx  # Page flipping component
│   └── Footer.tsx          # Site footer
├── hooks/
│   ├── useGallery.ts       # Data fetching hook
│   └── useMediaQuery.ts    # Responsive breakpoint hook
├── types/
│   ├── index.ts            # TypeScript interfaces
│   └── react-pageflip.d.ts # react-pageflip type definitions
├── App.tsx                 # Main application component
└── main.tsx                # Application entry point

public/
├── gallery-manifest.json   # Product data
└── images/                 # Product images
```

## Data Structure

Product data is stored in `public/gallery-manifest.json` with the following structure:

```json
{
  "wardrobes": [
    {
      "id": 1,
      "name": "Modern Wardrobe",
      "description": "A sleek and contemporary wardrobe",
      "price": 799.99,
      "orientation": "portrait",
      "images": ["/path/to/image1.jpg", "/path/to/image2.jpg"]
    }
  ],
  "sofas": [...],
  "kitchens": [...]
}
```

## Responsive Behavior

- **Desktop**: Grid layouts, two-page flipbook spreads
- **Mobile**: Stacked layouts, single-page flipbook
- **Tablet**: Adaptive between desktop and mobile layouts

## Contributing

1. Follow the existing code style and TypeScript types
2. Use functional components with hooks
3. Ensure responsive design works across all breakpoints
4. Test on multiple devices and browsers
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
