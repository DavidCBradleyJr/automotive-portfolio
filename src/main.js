import './style.css';
import './components/hero.css';
import './components/nav.css';
import './components/gallery.css';
import './components/video.css';
import './components/about.css';
import './components/bts.css';
import './components/social.css';
import './components/contact.css';
import './components/footer.css';
import './components/scroll-animations.css';
import { initHero } from './components/hero.js';
import { initNav } from './components/nav.js';
import { initGallery } from './components/gallery.js';
import { initVideo } from './components/video.js';
import { initContact } from './components/contact.js';
initHero();
initNav();
initGallery();
initVideo();
initContact();

// Load scroll animations dynamically so GSAP failure can't crash other components
import('./components/scroll-animations.js')
  .then((m) => m.initScrollAnimations())
  .catch(() => {});
