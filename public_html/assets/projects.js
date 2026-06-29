const projectState = {
  projects: [],
  index: 0,
  photoIndex: 0,
};

const projectNodes = {
  mainPhoto: document.querySelector('[data-project-main-photo]'),
  thumbs: document.querySelector('[data-project-thumbs]'),
  question: document.querySelector('[data-project-question]'),
  answer: document.querySelector('[data-project-answer]'),
  title: document.querySelector('[data-project-title]'),
  task: document.querySelector('[data-project-task]'),
  address: document.querySelector('[data-project-address]'),
  sizes: document.querySelector('[data-project-sizes]'),
  materials: document.querySelector('[data-project-materials]'),
  price: document.querySelector('[data-project-price]'),
  benefit: document.querySelector('[data-project-benefit]'),
  note: document.querySelector('[data-project-note]'),
  cta: document.querySelector('[data-project-cta]'),
  counter: document.querySelector('[data-project-counter]'),
  rail: document.querySelector('[data-project-rail]'),
  prev: document.querySelector('[data-project-prev]'),
  next: document.querySelector('[data-project-next]'),
};

const assetPath = (path) => `../${path}`;

function setProject(index) {
  if (!projectState.projects.length) return;

  projectState.index = (index + projectState.projects.length) % projectState.projects.length;
  projectState.photoIndex = 0;
  renderProject();
}

function setProjectPhoto(index) {
  const project = projectState.projects[projectState.index];
  projectState.photoIndex = (index + project.photos.length) % project.photos.length;
  renderProjectPhoto(project);
}

function renderProjectPhoto(project) {
  const currentPhoto = project.photos[projectState.photoIndex];
  projectNodes.mainPhoto.src = assetPath(currentPhoto);
  projectNodes.mainPhoto.alt = project.title;

  projectNodes.thumbs.innerHTML = project.photos.map((photo, index) => `
    <button class="project-thumb${index === projectState.photoIndex ? ' is-active' : ''}" type="button" data-photo-index="${index}" aria-label="Фото ${index + 1}: ${project.title}">
      <img src="${assetPath(photo)}" alt="">
    </button>
  `).join('');
}

function renderProjectRail() {
  projectNodes.rail.innerHTML = projectState.projects.map((project, index) => `
    <button class="project-pill${index === projectState.index ? ' is-active' : ''}" type="button" data-project-index="${index}">
      <span>${String(index + 1).padStart(2, '0')}</span>
      ${project.title}
    </button>
  `).join('');
}

function renderProject() {
  const project = projectState.projects[projectState.index];

  renderProjectPhoto(project);
  renderProjectRail();

  projectNodes.question.textContent = project.question;
  projectNodes.answer.textContent = project.answer;
  projectNodes.title.textContent = project.title;
  projectNodes.task.textContent = project.task;
  projectNodes.address.textContent = project.address;
  projectNodes.sizes.textContent = project.sizes.join(', ');
  projectNodes.materials.textContent = project.materials;
  projectNodes.price.textContent = project.price;
  projectNodes.benefit.textContent = project.benefit;
  projectNodes.note.textContent = project.note;
  projectNodes.cta.textContent = project.ctaText;
  projectNodes.cta.href = project.ctaUrl;
  projectNodes.counter.textContent = `${projectState.index + 1} / ${projectState.projects.length}`;
}

projectNodes.prev?.addEventListener('click', () => setProject(projectState.index - 1));
projectNodes.next?.addEventListener('click', () => setProject(projectState.index + 1));

projectNodes.thumbs?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-photo-index]');
  if (button) setProjectPhoto(Number(button.dataset.photoIndex));
});

projectNodes.rail?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-project-index]');
  if (button) setProject(Number(button.dataset.projectIndex));
});

fetch('../assets/data/projects.json')
  .then((response) => {
    if (!response.ok) throw new Error('Не удалось загрузить проекты');
    return response.json();
  })
  .then((projects) => {
    projectState.projects = projects;
    setProject(0);
  })
  .catch(() => {
    if (projectNodes.title) projectNodes.title.textContent = 'Проекты временно недоступны';
  });
