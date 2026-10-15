/*
 * Small progressive enhancements shared by every page.
 * Each feature is opt-in through a data attribute and the pages stay usable without JavaScript.
 */

/* Mobile navigation toggle: data-nav-toggle controls the element marked data-nav. */
export function initNavigation() {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (!navToggle || !nav) return;

  const setOpen = (open) => {
    navToggle.setAttribute('aria-expanded', String(open));
    nav.dataset.open = String(open);
  };
  navToggle.addEventListener('click', () => {
    setOpen(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      navToggle.focus();
    }
  });
}

/* Product gallery: thumbnails swap the main image and mark themselves current. */
export function initGalleries() {
  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const main = gallery.querySelector('[data-gallery-main]');
    const thumbs = [...gallery.querySelectorAll('[data-gallery-thumb]')];
    if (!main) return;
    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const image = thumb.querySelector('img');
        main.src = thumb.dataset.src;
        main.alt = thumb.dataset.alt;
        if (image) {
          main.width = image.width;
          main.height = image.height;
        }
        thumbs.forEach((other) => other.setAttribute('aria-current', String(other === thumb)));
      });
    });
  });
}

/* Quantity steppers: buttons carry data-step="-1" or "1" and respect the input's min and max. */
export function initSteppers() {
  document.querySelectorAll('[data-stepper]').forEach((stepper) => {
    const input = stepper.querySelector('input[type="number"]');
    const buttons = [...stepper.querySelectorAll('[data-step]')];
    if (!input) return;

    const bounds = () => ({
      min: input.min === '' ? -Infinity : Number(input.min),
      max: input.max === '' ? Infinity : Number(input.max),
    });
    const sync = () => {
      const { min, max } = bounds();
      const value = Number(input.value);
      buttons.forEach((button) => {
        const step = Number(button.dataset.step);
        button.disabled = (step < 0 && value <= min) || (step > 0 && value >= max);
      });
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const { min, max } = bounds();
        const next = Math.min(max, Math.max(min, (Number(input.value) || 0) + Number(button.dataset.step)));
        input.value = String(next);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    input.addEventListener('input', sync);
    sync();
  });
}

/* Favorite toggles (visual only until favorites are stored). */
export function initFavorites() {
  document.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
    });
  });
}

/* Tab-like anchor navigation: the clicked link becomes the current one. */
export function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const links = [...tabs.querySelectorAll('a[href^="#"]')];
    links.forEach((link) => {
      link.addEventListener('click', () => {
        links.forEach((other) => other.setAttribute('aria-current', String(other === link)));
      });
    });
  });
}

/* Selected file summary for the drop-zone style file input. */
export function initFileSummaries() {
  document.querySelectorAll('input[type="file"]').forEach((input) => {
    const summary = input.parentElement && input.parentElement.querySelector('[data-file-summary]');
    if (!summary) return;
    input.addEventListener('change', () => {
      const count = input.files ? input.files.length : 0;
      summary.textContent =
        count === 0 ? '' : count === 1 ? '1 archivo seleccionado' : `${count} archivos seleccionados`;
    });
  });
}
