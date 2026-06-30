const catalogState = {
  projects: [],
  page: 1,
  pageSize: 6,
  activeProjectIndex: 0,
  activePhotoIndex: 0,
  activeFilter: 'all',
};

const catalogNodes = {
  grid: document.querySelector('[data-project-grid]'),
  pagination: document.querySelector('[data-project-pagination]'),
  filters: document.querySelector('.catalog-filters'),
  modal: document.querySelector('[data-project-modal]'),
  modalImage: document.querySelector('[data-modal-image]'),
  modalThumbs: document.querySelector('[data-modal-thumbs]'),
  modalPrev: document.querySelector('[data-modal-prev]'),
  modalNext: document.querySelector('[data-modal-next]'),
  modalTitle: document.querySelector('[data-modal-title]'),
  modalDescription: document.querySelector('[data-modal-description]'),
  modalFacts: document.querySelector('[data-modal-facts]'),
  modalCta: document.querySelector('[data-modal-cta]'),
};

const consultationUrl = 'https://n1251174.yclients.com';
const assetPath = (path) => `../${path}`;

function getPageSize() {
  return 6;
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


function projectPriceValue(project) {
  return Number(String(project.price).replace(/\D/g, '')) || 0;
}

function filteredProjects() {
  return catalogState.projects.filter((project) => {
    if (catalogState.activeFilter === 'all') return true;
    if (catalogState.activeFilter === 'kitchens') return project.category === 'Кухня';
    if (catalogState.activeFilter === 'living') return project.category === 'Гостиная';
    if (catalogState.activeFilter === 'wardrobes') return project.category === 'Шкафы';
    if (catalogState.activeFilter === 'under-500') return projectPriceValue(project) < 500000;
    if (catalogState.activeFilter === 'from-500') return projectPriceValue(project) >= 500000;
    return true;
  });
}

function visibleProjects() {
  const start = (catalogState.page - 1) * catalogState.pageSize;
  return filteredProjects().slice(start, start + catalogState.pageSize);
}

function totalPages() {
  return Math.max(1, Math.ceil(filteredProjects().length / catalogState.pageSize));
}

function setPage(page) {
  catalogState.page = Math.min(Math.max(page, 1), totalPages());
  renderCatalog();
}


function renderGrid() {
  const projects = visibleProjects();
  if (!projects.length) {
    catalogNodes.grid.innerHTML = '<p class="catalog-error">Проекты не найдены</p>';
    return;
  }

  catalogNodes.grid.innerHTML = projects.map((project, index) => {
    const globalIndex = catalogState.projects.indexOf(project);
    const cardClass = `project-card card${index === 4 ? ' project-card--wide' : ''}`;
    const image = project.photos?.[0] || '';

    return `
      <button class="${cardClass}" type="button" data-project-detail="${globalIndex}" aria-label="Смотреть проект: ${project.title}">
        <img class="project-card__image" src="${assetPath(image)}" alt="${project.title}">
        <span class="project-card__shade" aria-hidden="true"></span>
        <span class="project-card__badge">${project.category === 'Шкафы' ? 'Шкаф' : (project.category || (project.cardTitle?.includes('Шкаф') ? 'Шкаф' : 'Кухня'))}</span>
        <span class="project-card__body">
          <span class="project-card__line">
            <span>${compactProjectSize(project)}</span>
            <strong>${catalogPrice(project)}</strong>
          </span>
          <span class="project-card__action">Смотреть проект <span>→</span></span>
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
  if (filteredProjects().length <= catalogState.pageSize) {
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

function renderModalPhoto() {
  const project = catalogState.projects[catalogState.activeProjectIndex];
  if (!project) return;

  const photos = project.photos || [];
  const currentPhoto = photos[catalogState.activePhotoIndex] || photos[0] || '';
  catalogNodes.modalImage.src = assetPath(currentPhoto);
  catalogNodes.modalImage.alt = project.title;
  catalogNodes.modalThumbs.innerHTML = photos.map((photo, index) => `
    <button class="project-modal__thumb${index === catalogState.activePhotoIndex ? ' is-active' : ''}" type="button" data-modal-photo="${index}" aria-label="Фото ${index + 1}">
      <img src="${assetPath(photo)}" alt="">
    </button>
  `).join('');
}

function setModalPhoto(index) {
  const project = catalogState.projects[catalogState.activeProjectIndex];
  if (!project?.photos?.length) return;

  catalogState.activePhotoIndex = (index + project.photos.length) % project.photos.length;
  renderModalPhoto();
}

function openProjectDetail(index) {
  const project = catalogState.projects[index];
  if (!project) return;

  catalogState.activeProjectIndex = index;
  catalogState.activePhotoIndex = 0;
  renderModalPhoto();
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
  catalogState.activeFilter = trigger.dataset.filter;
  catalogState.page = 1;
  renderCatalog();
});

catalogNodes.modal?.addEventListener('click', (event) => {
  if (event.target.closest('[data-modal-close]')) closeProjectDetail();
});

catalogNodes.modalPrev?.addEventListener('click', () => setModalPhoto(catalogState.activePhotoIndex - 1));
catalogNodes.modalNext?.addEventListener('click', () => setModalPhoto(catalogState.activePhotoIndex + 1));
catalogNodes.modalThumbs?.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-modal-photo]');
  if (trigger) setModalPhoto(Number(trigger.dataset.modalPhoto));
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
    catalogNodes.grid.innerHTML = '<p class="catalog-error">Проекты временно недоступны</p>';
  });
