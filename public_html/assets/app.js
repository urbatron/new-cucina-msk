const body = document.body;
const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const modal = document.querySelector('[data-modal]');

window.addEventListener('scroll', () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 20);
});

menuToggle?.addEventListener('click', () => {
  body.classList.toggle('menu-open');
  mobileMenu?.classList.toggle('is-open');
});

mobileMenu?.querySelectorAll('a, button').forEach((item) => {
  item.addEventListener('click', () => {
    body.classList.remove('menu-open');
    mobileMenu.classList.remove('is-open');
  });
});

const openModal = () => {
  modal?.classList.add('is-open');
  body.classList.add('modal-open');
};

const closeModal = () => {
  modal?.classList.remove('is-open');
  body.classList.remove('modal-open');
};

document.querySelectorAll('[data-open-modal]').forEach((btn) => btn.addEventListener('click', openModal));
document.querySelectorAll('[data-close-modal]').forEach((btn) => btn.addEventListener('click', closeModal));

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));

document.querySelectorAll('[data-lead-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    const original = button.textContent;
    button.textContent = 'Заявка отправлена';
    button.disabled = true;
    setTimeout(() => {
      form.reset();
      button.disabled = false;
      button.textContent = original;
      closeModal();
    }, 1200);
  });
});
