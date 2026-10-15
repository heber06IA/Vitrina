(() => {
  // src/js/lib/catalog.js
  var CATEGORY_LABELS = {
    ropa: "Ropa",
    perfumes: "Perfumes",
    tecnologia: "Tecnolog\xEDa"
  };
  var CATEGORIES = Object.keys(CATEGORY_LABELS);
  var readFilters = (params) => ({
    query: (params.get("q") || "").trim().toLocaleLowerCase("es"),
    category: params.get("categoria") || "",
    min: Number(params.get("min")) || 0,
    max: Number(params.get("max")) || Infinity,
    order: params.get("orden") || "relevancia"
  });
  var matchesFilters = (item, filters) => (!filters.category || item.category === filters.category) && (!filters.query || item.text.toLocaleLowerCase("es").includes(filters.query)) && item.price >= filters.min && item.price <= filters.max;
  var priceComparator = (order) => {
    if (!order.startsWith("precio-")) return null;
    const direction = order === "precio-desc" ? -1 : 1;
    return (a, b) => (a - b) * direction;
  };

  // src/js/lib/format.js
  var formatPrice = (amount) => `$${Number(amount).toFixed(2)} MXN`;
  var parsePrice = (text = "") => Number(text.replace(/[^0-9.]/g, ""));

  // src/js/features/catalog-filters.js
  var priceOf = (element) => parsePrice(element.querySelector(".price")?.textContent);
  var categorySections = (catalog) => CATEGORIES.map((id) => catalog.querySelector(`section[id="${id}"]`)).filter(Boolean);
  var goToCatalog = (params) => {
    const target = new URL("index.html", window.location.href);
    target.search = params.toString();
    window.location.assign(target.href);
  };
  function initCatalogFilters() {
    const catalog = document.querySelector("#catalogo");
    const filterForm = catalog && catalog.querySelector('form[aria-label="Filtros del cat\xE1logo"]');
    if (!catalog || !filterForm) return;
    const params = new URLSearchParams(window.location.search);
    const filters = readFilters(params);
    const searchInput = document.querySelector("#site-search");
    const minInput = filterForm.querySelector('[name="min"]');
    const maxInput = filterForm.querySelector('[name="max"]');
    const sortInput = filterForm.querySelector('[name="orden"]');
    if (searchInput) searchInput.value = params.get("q") || "";
    const selectedCategory = [...filterForm.querySelectorAll('[name="categoria"]')].find(
      (input) => input.value === filters.category
    );
    if (selectedCategory) selectedCategory.checked = true;
    if (minInput) minInput.value = params.get("min") || "";
    if (maxInput) maxInput.value = params.get("max") || "";
    if (sortInput && params.has("orden")) sortInput.value = params.get("orden");
    filterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(filterForm);
      const search = (searchInput?.value || "").trim();
      if (search) formData.set("q", search);
      goToCatalog(new URLSearchParams(formData));
    });
    if (searchInput?.form) {
      searchInput.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const search = new URLSearchParams();
        if (searchInput.value.trim()) search.set("q", searchInput.value.trim());
        goToCatalog(search);
      });
    }
    catalog.querySelectorAll(".product-card").forEach((card) => {
      const item = {
        text: card.textContent,
        category: card.closest("section[id]")?.id,
        price: priceOf(card)
      };
      card.closest("li").hidden = !matchesFilters(item, filters);
    });
    const compare = priceComparator(filters.order);
    categorySections(catalog).forEach((section) => {
      const list = section.querySelector("ul.row");
      if (compare && list) {
        [...list.children].sort((a, b) => compare(priceOf(a), priceOf(b))).forEach((item) => list.append(item));
      }
      section.hidden = ![...section.querySelectorAll(".product-card")].some((card) => !card.closest("li").hidden);
    });
  }

  // src/js/features/demo-forms.js
  var DEMO_MESSAGE = "Esta funci\xF3n no est\xE1 disponible en esta demostraci\xF3n.";
  var announceDemo = (form) => {
    const notice2 = form.querySelector("[data-demo-notice]");
    if (!notice2) return;
    notice2.textContent = "";
    window.setTimeout(() => {
      notice2.textContent = form.dataset.demoMessage || DEMO_MESSAGE;
    }, 30);
  };
  function initDemoForms() {
    document.querySelectorAll("form[data-demo-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        announceDemo(form);
      });
      form.querySelectorAll("[data-demo-action]").forEach((button) => {
        button.addEventListener("click", () => announceDemo(form));
      });
    });
  }

  // src/js/features/ui.js
  function initNavigation() {
    const navToggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");
    if (!navToggle || !nav) return;
    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      nav.dataset.open = String(open);
    };
    navToggle.addEventListener("click", () => {
      setOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        navToggle.focus();
      }
    });
  }
  function initGalleries() {
    document.querySelectorAll("[data-gallery]").forEach((gallery) => {
      const main = gallery.querySelector("[data-gallery-main]");
      const thumbs = [...gallery.querySelectorAll("[data-gallery-thumb]")];
      if (!main) return;
      thumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
          const image = thumb.querySelector("img");
          main.src = thumb.dataset.src;
          main.alt = thumb.dataset.alt;
          if (image) {
            main.width = image.width;
            main.height = image.height;
          }
          thumbs.forEach((other) => other.setAttribute("aria-current", String(other === thumb)));
        });
      });
    });
  }
  function initSteppers() {
    document.querySelectorAll("[data-stepper]").forEach((stepper) => {
      const input = stepper.querySelector('input[type="number"]');
      const buttons = [...stepper.querySelectorAll("[data-step]")];
      if (!input) return;
      const bounds = () => ({
        min: input.min === "" ? -Infinity : Number(input.min),
        max: input.max === "" ? Infinity : Number(input.max)
      });
      const sync = () => {
        const { min, max } = bounds();
        const value = Number(input.value);
        buttons.forEach((button) => {
          const step = Number(button.dataset.step);
          button.disabled = step < 0 && value <= min || step > 0 && value >= max;
        });
      };
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const { min, max } = bounds();
          const next = Math.min(max, Math.max(min, (Number(input.value) || 0) + Number(button.dataset.step)));
          input.value = String(next);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
      input.addEventListener("input", sync);
      sync();
    });
  }
  function initFavorites() {
    document.querySelectorAll("[data-favorite]").forEach((button) => {
      button.addEventListener("click", () => {
        button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
      });
    });
  }
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach((tabs) => {
      const links = [...tabs.querySelectorAll('a[href^="#"]')];
      links.forEach((link) => {
        link.addEventListener("click", () => {
          links.forEach((other) => other.setAttribute("aria-current", String(other === link)));
        });
      });
    });
  }
  function initFileSummaries() {
    document.querySelectorAll('input[type="file"]').forEach((input) => {
      const summary = input.parentElement && input.parentElement.querySelector("[data-file-summary]");
      if (!summary) return;
      input.addEventListener("change", () => {
        const count = input.files ? input.files.length : 0;
        summary.textContent = count === 0 ? "" : count === 1 ? "1 archivo seleccionado" : `${count} archivos seleccionados`;
      });
    });
  }

  // src/js/marketplace/dom.js
  var el = (tag, className = "", text = "") => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  var notice = (form, message, error = false) => {
    const target = form.querySelector("[data-auth-notice], [data-product-notice]");
    if (target) {
      target.textContent = message;
      target.classList.toggle("text-danger", error);
    }
  };

  // src/js/lib/storage.js
  var KEYS = {
    users: "vitrina.users.v1",
    products: "vitrina.products.v1",
    session: "vitrina.session.v1"
  };
  var read = (key, fallback = []) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  var write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  // src/js/marketplace/session.js
  var currentUser = () => {
    const email = sessionStorage.getItem(KEYS.session);
    return email ? read(KEYS.users).find((user) => user.email === email) || null : null;
  };
  var signIn = (user) => {
    sessionStorage.setItem(KEYS.session, user.email);
    location.href = user.role === "seller" ? "seller.html" : "index.html";
  };
  var signOut = () => {
    sessionStorage.removeItem(KEYS.session);
    location.href = "index.html";
  };
  var hashPassword = async (salt, password) => {
    if (!globalThis.crypto?.subtle) {
      throw new Error("Para usar el acceso de demostraci\xF3n, abre el sitio en HTTPS o desde localhost.");
    }
    const bytes = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  // src/js/marketplace/account.js
  function initAccountPage() {
    const page = document.querySelector("[data-account-page]");
    const user = currentUser();
    if (!page || !user) return;
    const isSeller = user.role === "seller";
    const row = page.querySelector(".row");
    row.hidden = true;
    const go = el("a", "btn btn-primary", isSeller ? "Abrir panel de vendedor" : "Explorar productos");
    go.href = isSeller ? "seller.html" : "index.html#catalogo";
    const out = el("button", "btn btn-outline-primary", "Cerrar sesi\xF3n");
    out.type = "button";
    out.dataset.logout = "";
    out.addEventListener("click", signOut);
    const actions = el("div", "d-flex flex-wrap gap-3 mt-5");
    actions.append(go, out);
    const panel = el("section", "plate p-6 p-lg-8 mt-8 mx-auto mw-3xl");
    panel.append(
      el("h2", "fs-2xl fw-semibold", `\xA1Hola, ${user.name}!`),
      el(
        "p",
        "mt-2 text-muted",
        isSeller ? "Tu cuenta de vendedor est\xE1 lista para administrar tu tienda." : "Tu cuenta de cliente est\xE1 lista para explorar el cat\xE1logo."
      ),
      actions
    );
    row.after(panel);
  }
  function initHeaderAccount() {
    const user = currentUser();
    document.querySelectorAll('header nav[aria-label="Acciones de la cuenta"]').forEach((menu) => {
      const sellLink = menu.querySelector('a[href="sell.html"]');
      if (sellLink && user?.role === "seller") {
        sellLink.href = "seller.html";
        sellLink.textContent = "Mi tienda";
      }
      if (sellLink && user?.role === "buyer") sellLink.textContent = "Vender";
      if (user) {
        const logout = el("button", "header-link border-0 bg-transparent", "Salir");
        logout.type = "button";
        logout.addEventListener("click", signOut);
        menu.append(logout);
      }
    });
  }

  // src/js/marketplace/auth-forms.js
  function initLogin() {
    const login = document.querySelector("[data-auth-login]");
    if (!login) return;
    login.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = login.querySelector("#login-email").value.trim().toLowerCase();
      const password = login.querySelector("#login-password").value;
      const user = read(KEYS.users).find((item) => item.email === email);
      try {
        if (!user || user.passwordHash !== await hashPassword(user.salt, password)) {
          notice(login, "No encontramos esa combinaci\xF3n de correo y contrase\xF1a.", true);
          return;
        }
      } catch (error) {
        notice(login, error.message || "No fue posible iniciar sesi\xF3n.", true);
        return;
      }
      signIn(user);
    });
  }
  function initRegister() {
    const register = document.querySelector("[data-auth-register]");
    if (!register) return;
    register.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = register.querySelector("#signup-name").value.trim();
      const email = register.querySelector("#signup-email").value.trim().toLowerCase();
      const password = register.querySelector("#signup-password").value;
      const role = register.querySelector('[name="role"]:checked').value;
      const users = read(KEYS.users);
      if (users.some((user) => user.email === email)) {
        notice(register, "Ya existe una cuenta con ese correo. Inicia sesi\xF3n.", true);
        return;
      }
      try {
        const salt = crypto.randomUUID();
        const user = { name, email, role, salt, passwordHash: await hashPassword(salt, password) };
        write(KEYS.users, [...users, user]);
        signIn(user);
      } catch (error) {
        notice(register, error.message || "No fue posible crear la cuenta.", true);
      }
    });
  }
  function initAuthForms() {
    initLogin();
    initRegister();
    document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", signOut));
  }

  // src/js/marketplace/community.js
  var createSection = (catalog) => {
    const section = el("section", "mt-12");
    section.id = "comunidad";
    const header = el("div", "d-flex flex-wrap justify-content-between align-items-end gap-3 mb-5");
    const titles = el("div");
    titles.append(
      el("p", "eyebrow", "Nuevas tiendas"),
      el("h2", "fs-3xl fw-semibold tracking-tight", "Art\xEDculos de la comunidad")
    );
    header.append(titles);
    const list = el("ul", "row g-4 list-unstyled mb-0");
    list.dataset.communityList = "";
    section.append(header, list);
    catalog.append(section);
    return section;
  };
  var createCard = (item) => {
    const ratio = el("div", "ratio ratio-4x5");
    if (item.image) {
      const img = el("img", "product-card__img object-fit-cover");
      img.src = item.image;
      img.alt = item.title;
      ratio.append(img);
    } else {
      ratio.append(el("div", "d-flex align-items-center justify-content-center bg-light text-muted", item.categoryLabel));
    }
    const plate = el("div", "plate product-card__plate");
    plate.append(ratio);
    const body = el("div", "product-card__body");
    body.append(
      el("h3", "product-card__name", item.title),
      el("p", "fs-sm text-muted", `Por ${item.seller}`),
      el("p", "price fw-semibold", formatPrice(item.price)),
      el("p", "fs-sm text-muted", item.description)
    );
    const card = el("article", "product-card");
    card.append(plate, body);
    const li = el("li", "col-6 col-md-4 col-xl-3");
    li.append(card);
    return li;
  };
  function renderCommunity() {
    const catalog = document.querySelector("#catalogo");
    if (!catalog) return;
    const section = document.querySelector("#comunidad") || createSection(catalog);
    const list = section.querySelector("[data-community-list]");
    list.replaceChildren(...read(KEYS.products).map(createCard));
    section.hidden = !list.children.length;
  }

  // src/js/lib/image.js
  var MAX_IMAGE_BYTES = 1024 * 1024;
  var isValidImage = (file) => file.type.startsWith("image/") && file.size <= MAX_IMAGE_BYTES;
  var readAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // src/js/marketplace/seller.js
  var createRow = (item, onRemove) => {
    const row = el("article", "plate d-flex align-items-center gap-4 p-3");
    if (item.image) {
      const img = el("img", "object-fit-cover rounded-2");
      img.src = item.image;
      img.alt = "";
      img.width = 72;
      img.height = 88;
      row.append(img);
    }
    const info = el("div", "flex-1 min-w-0");
    info.append(
      el("h3", "fw-semibold", item.title),
      el("p", "fs-sm text-muted", `${item.categoryLabel} \xB7 ${formatPrice(item.price)} \xB7 ${item.stock} en existencia`)
    );
    const remove = el("button", "btn btn-outline-primary btn-sm", "Eliminar");
    remove.type = "button";
    remove.setAttribute("aria-label", `Eliminar ${item.title}`);
    remove.addEventListener("click", () => onRemove(item));
    row.append(info, remove);
    return row;
  };
  function renderProducts(page, user) {
    const own = read(KEYS.products).filter((item) => item.owner === user.email);
    page.querySelector("[data-product-count]").textContent = own.length;
    const list = page.querySelector("[data-seller-products]");
    const remove = (item) => {
      write(
        KEYS.products,
        read(KEYS.products).filter((product) => product.id !== item.id)
      );
      renderProducts(page, user);
    };
    list.replaceChildren(...own.map((item) => createRow(item, remove)));
    if (!own.length) {
      list.append(
        el("p", "plate p-5 text-muted", "A\xFAn no tienes art\xEDculos. Usa el formulario para crear tu primera publicaci\xF3n.")
      );
    }
  }
  function initProductForm(page, user) {
    const form = page.querySelector("[data-product-form]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const file = form.querySelector('[name="image"]').files[0];
      if (file && !isValidImage(file)) {
        notice(form, "Elige una imagen de hasta 1 MB.", true);
        return;
      }
      try {
        const image = file ? await readAsDataUrl(file) : "";
        const data = new FormData(form);
        const category = data.get("category");
        const product = {
          id: crypto.randomUUID(),
          owner: user.email,
          seller: user.name,
          title: data.get("title").trim(),
          description: data.get("description").trim(),
          category,
          categoryLabel: CATEGORY_LABELS[category],
          price: Number(data.get("price")),
          stock: Number(data.get("stock")),
          image,
          createdAt: Date.now()
        };
        write(KEYS.products, [product, ...read(KEYS.products)]);
        form.reset();
        notice(form, "Art\xEDculo publicado. Ya aparece en el cat\xE1logo de compradores.");
        renderProducts(page, user);
        renderCommunity();
      } catch {
        notice(form, "No se pudo guardar el art\xEDculo en este navegador.", true);
      }
    });
  }
  function initSellerPage() {
    const page = document.querySelector("[data-seller-page]");
    if (!page) return;
    const user = currentUser();
    if (!user || user.role !== "seller") {
      page.querySelector("[data-seller-locked]").hidden = false;
      return;
    }
    page.querySelector("[data-seller-dashboard]").hidden = false;
    page.querySelector("[data-seller-name]").textContent = user.name;
    renderProducts(page, user);
    initProductForm(page, user);
  }

  // src/js/main.js
  document.documentElement.classList.add("js");
  initNavigation();
  initGalleries();
  initSteppers();
  initFavorites();
  initCatalogFilters();
  initTabs();
  initFileSummaries();
  initDemoForms();
  initAuthForms();
  initSellerPage();
  initAccountPage();
  initHeaderAccount();
  renderCommunity();
})();
