/*
 * Shared progressive enhancements for every page.
 * Each feature is opt-in through a data attribute and the pages stay usable without this file.
 */
(() => {
  'use strict';

  const DEMO_MESSAGE = 'Esta función no está disponible en esta demostración.';

  document.documentElement.classList.add('js');

  /* Mobile navigation toggle: data-nav-toggle controls the element marked data-nav. */
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (navToggle && nav) {
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

  /* Quantity steppers: buttons carry data-step="-1" or "1" and respect the input's min and max. */
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

  /* Favorite toggles. */
  document.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
    });
  });

  /* Catalog search and filters work on the static product cards. */
  const catalog = document.querySelector('#catalogo');
  const filterForm = catalog && catalog.querySelector('form[aria-label="Filtros del catálogo"]');
  if (catalog && filterForm) {
    const cards = [...catalog.querySelectorAll('.product-card')];
    const params = new URLSearchParams(window.location.search);
    const searchInput = document.querySelector('#site-search');
    const categoryInput = [...filterForm.querySelectorAll('[name="categoria"]')];
    const minInput = filterForm.querySelector('[name="min"]');
    const maxInput = filterForm.querySelector('[name="max"]');
    const sortInput = filterForm.querySelector('[name="orden"]');
    const query = (params.get('q') || '').trim().toLocaleLowerCase('es');
    if (searchInput) searchInput.value = params.get('q') || '';
    const category = params.get('categoria') || '';
    const selectedCategory = categoryInput.find((input) => input.value === category);
    if (selectedCategory) selectedCategory.checked = true;
    if (minInput) minInput.value = params.get('min') || '';
    if (maxInput) maxInput.value = params.get('max') || '';
    if (sortInput && params.has('orden')) sortInput.value = params.get('orden');

    filterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(filterForm);
      const search = (searchInput?.value || '').trim();
      if (search) formData.set('q', search);
      const target = new URL('index.html', window.location.href);
      target.search = new URLSearchParams(formData).toString();
      window.location.assign(target.href);
    });
    if (searchInput?.form) searchInput.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const target = new URL('index.html', window.location.href);
      if (searchInput.value.trim()) target.searchParams.set('q', searchInput.value.trim());
      window.location.assign(target.href);
    });

    const minimum = Number(params.get('min')) || 0;
    const maximum = Number(params.get('max')) || Infinity;
    const order = params.get('orden') || 'relevancia';
    cards.forEach((card) => {
      const section = card.closest('section[id]');
      const text = card.textContent.toLocaleLowerCase('es');
      const priceText = card.querySelector('.price')?.textContent || '';
      const price = Number(priceText.replace(/[^0-9.]/g, ''));
      const match = (!category || section?.id === category) && (!query || text.includes(query)) && price >= minimum && price <= maximum;
      card.closest('li').hidden = !match;
    });
    if (order.startsWith('precio-')) {
      catalog.querySelectorAll('section[id="ropa"], section[id="perfumes"], section[id="tecnologia"]').forEach((section) => {
        const list = section.querySelector('ul.row');
        if (!list) return;
        [...list.children].sort((a, b) => {
          const priceOf = (item) => Number((item.querySelector('.price')?.textContent || '').replace(/[^0-9.]/g, ''));
          return (priceOf(a) - priceOf(b)) * (order === 'precio-desc' ? -1 : 1);
        }).forEach((item) => list.append(item));
      });
    }
    catalog.querySelectorAll('section[id="ropa"], section[id="perfumes"], section[id="tecnologia"]').forEach((section) => {
      const visible = [...section.querySelectorAll('.product-card')].some((card) => !card.closest('li').hidden);
      section.hidden = !visible;
    });
  }

  /* Tab-like anchor navigation: the clicked link becomes the current one. */
  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const links = [...tabs.querySelectorAll('a[href^="#"]')];
    links.forEach((link) => {
      link.addEventListener('click', () => {
        links.forEach((other) => other.setAttribute('aria-current', String(other === link)));
      });
    });
  });

  /* Selected file summary for the drop-zone style file input. */
  document.querySelectorAll('input[type="file"]').forEach((input) => {
    const summary = input.parentElement && input.parentElement.querySelector('[data-file-summary]');
    if (!summary) return;
    input.addEventListener('change', () => {
      const count = input.files ? input.files.length : 0;
      summary.textContent = count === 0 ? '' : count === 1 ? '1 archivo seleccionado' : `${count} archivos seleccionados`;
    });
  });

  /* Phase 1 forms cannot work without a backend: never submit, say so in the form's status region. */
  const announceDemo = (form) => {
    const notice = form.querySelector('[data-demo-notice]');
    if (!notice) return;
    // Clear first so repeated attempts are announced again by the live region.
    notice.textContent = '';
    window.setTimeout(() => {
      notice.textContent = form.dataset.demoMessage || DEMO_MESSAGE;
    }, 30);
  };

  document.querySelectorAll('form[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      announceDemo(form);
    });
    form.querySelectorAll('[data-demo-action]').forEach((button) => {
      button.addEventListener('click', () => announceDemo(form));
    });
  });
})();
