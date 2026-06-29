const catalogState = {
  projects: [],
  page: 1,
  pageSize: 12,
};

const catalogNodes = {
  grid: document.querySelector('[data-project-grid]'),
  count: document.querySelector('[data-project-count]'),
  pagination: document.querySelector('[data-project-pagination]'),
  filters: document.querySelector('.catalog-filters'),
  modal: document.querySelector('[data-project-modal]'),
  modalImage: document.querySelector('[data-modal-image]'),
  modalTitle: document.querySelector('[data-modal-title]'),
  modalDescription: document.querySelector('[data-modal-description]'),
  modalFacts: document.querySelector('[data-modal-facts]'),
  modalCta: document.querySelector('[data-modal-cta]'),
};

const consultationUrl = 'https://n1251174.yclients.com';
const assetPath = (path) => `../${path}`;

function getPageSize() {
  if (window.matchMedia('(max-width: 640px)').matches) return 6;
  if (window.matchMedia('(max-width: 1024px)').matches) return 6;
  if (window.matchMedia('(max-width: 1439px)').matches) return 8;
  return 12;
}

function compactAddress(address) {
  return address.replace(/^г\.\s*/i, '');
}

function projectDescription(project) {
  return project.task || project.answer || project.note || '';
}

function projectDimensions(project) {
  return Array.isArray(project.sizes) ? project.sizes.join(', ') : project.sizes;
}

function compactProjectSize(project) {
  const sizes = Array.isArray(project.sizes) ? project.sizes : [project.sizes].filter(Boolean);
  const length = sizes.find((size) => /^Длина/i.test(size));
  return (length || sizes[0] || '').replace(/^Длина\s*/i, '').replace(/^Высота\s*/i, '');
}

function catalogPrice(project) {
  return `от ${project.price}`;
}

function visibleProjects() {
  const start = (catalogState.page - 1) * catalogState.pageSize;
  return catalogState.projects.slice(start, start + catalogState.pageSize);
}

function totalPages() {
  return Math.max(1, Math.ceil(catalogState.projects.length / catalogState.pageSize));
}

function setPage(page) {
  catalogState.page = Math.min(Math.max(page, 1), totalPages());
  renderCatalog();
}

function renderCount() {
  const total = catalogState.projects.length;
  if (!total) {
    catalogNodes.count.textContent = 'Проекты не найдены';
    return;
  }

  const start = (catalogState.page - 1) * catalogState.pageSize + 1;
  const end = Math.min(catalogState.page * catalogState.pageSize, total);
  catalogNodes.count.textContent = `Показано ${start}–${end} из ${total} проектов`;
}

function renderGrid() {
  catalogNodes.grid.innerHTML = visibleProjects().map((project, index) => {
    const globalIndex = (catalogState.page - 1) * catalogState.pageSize + index;
    const image = project.photos?.[0] || '';

    return `
      <button class="project-card card" type="button" data-project-detail="${globalIndex}" aria-label="Смотреть проект: ${project.title}">
        <span class="project-card__image">
          <img src="${assetPath(image)}" alt="${project.title}">
        </span>
        <span class="project-card__body">
          <span class="project-card__title">${project.title}</span>
          <span class="project-card__line">
            <span>${compactProjectSize(project)}</span>
            <strong>${catalogPrice(project)}</strong>
          </span>
        </span>
      </button>
    `;
  }).join('');
}

function pageNumbers() {
  const pages = totalPages();
  const numbers = new Set([1, pages, catalogState.page - 1, catalogState.page, catalogState.page + 1]);
  return [...numbers].filter((page) => page >= 1 && page <= pages).sort((a, b) => a - b);
}

function renderPagination() {
  const pages = totalPages();
  if (catalogState.projects.length <= catalogState.pageSize) {
    catalogNodes.pagination.innerHTML = '';
    return;
  }

  const numbers = pageNumbers();
  const buttons = numbers.map((page, index) => {
    const gap = index > 0 && page - numbers[index - 1] > 1 ? '<span class="pagination-gap">...</span>' : '';
    return `${gap}<button class="pagination-page${page === catalogState.page ? ' is-active' : ''}" type="button" data-page="${page}">${page}</button>`;
  }).join('');
  const nextPage = Math.min(catalogState.page + 1, pages);

  catalogNodes.pagination.innerHTML = `
    ${buttons}
    <button class="pagination-next" type="button" data-page="${nextPage}" ${catalogState.page === pages ? 'disabled' : ''} aria-label="Следующая страница">→</button>
  `;
}

function renderCatalog() {
  renderCount();
  renderGrid();
  renderPagination();
}

function modalFacts(project) {
  return [
    ['Адрес', project.address],
    ['Размеры', projectDimensions(project)],
    ['Материалы', project.materials],
    ['Стоимость', project.price],
    ['Выгода клиента', project.benefit],
  ];
}

function openProjectDetail(index) {
  const project = catalogState.projects[index];
  if (!project) return;

  catalogNodes.modalImage.src = assetPath(project.photos?.[0] || '');
  catalogNodes.modalImage.alt = project.title;
  catalogNodes.modalTitle.textContent = project.title;
  catalogNodes.modalDescription.textContent = project.note || projectDescription(project);
  catalogNodes.modalFacts.innerHTML = modalFacts(project).map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
  catalogNodes.modalCta.href = project.ctaUrl || consultationUrl;
  catalogNodes.modal.classList.add('is-open');
  catalogNodes.modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-open-modal');
}

function closeProjectDetail() {
  catalogNodes.modal.classList.remove('is-open');
  catalogNodes.modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-open-modal');
}

catalogNodes.grid?.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-project-detail]');
  if (trigger) openProjectDetail(Number(trigger.dataset.projectDetail));
});

catalogNodes.pagination?.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-page]');
  if (trigger) setPage(Number(trigger.dataset.page));
});

catalogNodes.filters?.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-filter]');
  if (!trigger) return;
  catalogNodes.filters.querySelectorAll('.catalog-filter').forEach((button) => button.classList.remove('is-active'));
  trigger.classList.add('is-active');
});

catalogNodes.modal?.addEventListener('click', (event) => {
  if (event.target.closest('[data-modal-close]')) closeProjectDetail();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeProjectDetail();
});

window.addEventListener('resize', () => {
  const nextSize = getPageSize();
  if (nextSize === catalogState.pageSize) return;
  catalogState.pageSize = nextSize;
  catalogState.page = Math.min(catalogState.page, totalPages());
  renderCatalog();
});

fetch('../assets/data/projects.json')
  .then((response) => {
    if (!response.ok) throw new Error('Не удалось загрузить проекты');
    return response.json();
  })
  .then((projects) => {
    catalogState.projects = projects;
    catalogState.pageSize = getPageSize();
    renderCatalog();
  })
  .catch(() => {
    catalogNodes.count.textContent = 'Проекты временно недоступны';
  });
