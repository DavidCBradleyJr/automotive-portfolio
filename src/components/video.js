/* ==========================================================================
 * Video Section — lite-youtube-embed facade
 *
 * The custom element <lite-youtube> self-registers on import.
 * initVideo() is called from main.js to keep the pattern consistent.
 * ========================================================================== */

import 'lite-youtube-embed/src/lite-yt-embed.css';
import 'lite-youtube-embed/src/lite-yt-embed.js';

export function initVideo() {
  // Custom element registers itself on import — nothing extra needed.
}
