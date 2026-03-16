/**
 * Gallery Component
 *
 * Renders gallery items from data, handles category filtering with
 * smooth animations, and implements LQIP lazy loading with blur-up effect.
 */

import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipeDynamicCaption from 'photoswipe-dynamic-caption-plugin';
import 'photoswipe/style.css';
import 'photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css';

import { galleryImages, categories } from '../data/gallery-images.js';

let activeCategory = 'all';
let lazyObserver = null;
let lightbox = null;

/**
 * Build a category label lookup from the categories array.
 */
const categoryLabelMap = Object.fromEntries(
  categories.map((c) => [c.id, c.label])
);

/**
 * Render filter pills into the filter bar.
 */
function renderFilters() {
  const container = document.getElementById('gallery-filters');
  if (!container) return;

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'gallery__pill';
    btn.dataset.category = cat.id;
    btn.textContent = cat.label;

    if (cat.id === 'all') {
      btn.classList.add('gallery__pill--active');
    }

    btn.addEventListener('click', () => {
      filterGallery(cat.id);
    });

    container.appendChild(btn);
  });
}

/**
 * Render all gallery items into the masonry grid.
 */
function renderGalleryItems() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  galleryImages.forEach((image) => {
    const item = document.createElement('div');
    item.className = 'gallery__item';
    item.dataset.category = image.category;

    if (image.isPlaceholder) {
      item.classList.add('gallery__item--placeholder');
      item.style.background = image.gradient || '';
      item.style.aspectRatio = `${image.width} / ${image.height}`;
    } else {
      const anchor = document.createElement('a');
      anchor.href = image.src;
      anchor.dataset.pswpWidth = String(image.width);
      anchor.dataset.pswpHeight = String(image.height);

      const catLabel = categoryLabelMap[image.category] || image.category;
      anchor.dataset.caption = `${image.caption} -- ${catLabel}`;
      anchor.target = '_blank';

      const img = document.createElement('img');
      img.className = 'gallery__img gallery__img--loaded';
      img.src = image.src;
      img.alt = image.alt;
      img.width = image.width;
      img.height = image.height;
      img.loading = 'lazy';

      anchor.appendChild(img);
      item.appendChild(anchor);
    }

    grid.appendChild(item);
  });
}

/**
 * Initialize IntersectionObserver for LQIP lazy loading.
 */
function initLazyLoading() {
  lazyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const fullSrc = img.dataset.src;
          if (fullSrc) {
            img.onload = () => {
              img.classList.add('gallery__img--loaded');
            };
            img.src = fullSrc;
          }
          lazyObserver.unobserve(img);
        }
      });
    },
    { rootMargin: '200px' }
  );

  document.querySelectorAll('.gallery__img').forEach((img) => {
    lazyObserver.observe(img);
  });
}

/**
 * Re-observe images that haven't loaded yet (after filter change).
 */
function reobserveUnloaded() {
  if (!lazyObserver) return;

  document
    .querySelectorAll(
      '.gallery__item:not(.gallery__item--hidden) .gallery__img:not(.gallery__img--loaded)'
    )
    .forEach((img) => {
      lazyObserver.observe(img);
    });
}

/**
 * Filter gallery items by category with smooth animation.
 */
function filterGallery(category) {
  // If the initial scroll stagger animation hasn't completed yet,
  // cancel it immediately to avoid collision with filter animation.
  if (!window.__galleryInitialAnimDone) {
    window.__galleryInitialAnimDone = true;
    document.querySelectorAll('.gallery__item--scroll-entering').forEach((item) => {
      item.classList.remove('gallery__item--scroll-entering');
      item.style.animationDelay = '';
    });
  }

  activeCategory = category;

  // 1. Update active pill
  document.querySelectorAll('.gallery__pill').forEach((pill) => {
    pill.classList.toggle(
      'gallery__pill--active',
      pill.dataset.category === category
    );
  });

  const items = document.querySelectorAll('.gallery__item');
  const shouldShow = (item) =>
    category === 'all' || item.dataset.category === category;

  // 2. Phase 1: Fade out items that will be hidden
  items.forEach((item) => {
    if (!shouldShow(item) && !item.classList.contains('gallery__item--hidden')) {
      item.classList.add('gallery__item--fading');
    }
  });

  // 3. After fade duration, toggle visibility
  setTimeout(() => {
    items.forEach((item) => {
      item.classList.remove('gallery__item--fading');

      if (shouldShow(item)) {
        item.classList.remove('gallery__item--hidden');
      } else {
        item.classList.add('gallery__item--hidden');
      }
    });

    // 4. Phase 2: Staggered enter animation for visible items
    requestAnimationFrame(() => {
      const visibleItems = document.querySelectorAll(
        '.gallery__item:not(.gallery__item--hidden)'
      );

      visibleItems.forEach((item, i) => {
        item.style.animationDelay = `${i * 30}ms`;
        item.classList.add('gallery__item--entering');
      });

      // 5. Cleanup after animations complete
      const totalDuration = 300 + visibleItems.length * 30;
      setTimeout(() => {
        visibleItems.forEach((item) => {
          item.classList.remove('gallery__item--entering');
          item.style.animationDelay = '';
        });
      }, totalDuration);

      // Re-observe any newly visible images that haven't loaded
      reobserveUnloaded();

      // Reinitialize PhotoSwipe so navigation is scoped to visible items
      initLightbox();
    });
  }, 250);
}

/**
 * Initialize (or reinitialize) PhotoSwipe lightbox.
 * Reinitializing on filter change scopes navigation to visible items only.
 */
function initLightbox() {
  if (lightbox) {
    lightbox.destroy();
    lightbox = null;
  }

  lightbox = new PhotoSwipeLightbox({
    gallery: '#gallery-grid',
    children:
      '.gallery__item:not(.gallery__item--hidden):not(.gallery__item--placeholder) a',
    pswpModule: () => import('photoswipe'),
    bgOpacity: 0.95,
    loop: true,
    counterEl: false,
    padding: { top: 20, bottom: 40, left: 0, right: 0 },
  });

  // Dynamic captions showing "Car Name -- Category"
  new PhotoSwipeDynamicCaption(lightbox, {
    type: 'below',
    captionContent: (slide) => {
      return slide.data.element?.dataset.caption || '';
    },
  });

  lightbox.init();
}

/**
 * Get the currently active filter category.
 */
export function getActiveCategory() {
  return activeCategory;
}

/**
 * Initialize the gallery component.
 */
export function initGallery() {
  renderFilters();
  renderGalleryItems();
  initLazyLoading();
  initLightbox();
}
