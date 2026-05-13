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

function openModal() {
  modal?.classList.add('is-open');
  modal?.setAttribute('aria-hidden', 'false');
  body.classList.add('modal-open');
}

function closeModal() {
  modal?.classList.remove('is-open');
  modal?.setAttribute('aria-hidden', 'true');
  body.classList.remove('modal-open');
}

document.querySelectorAll('[data-open-modal]').forEach((button) => button.addEventListener('click', openModal));
document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

document.querySelectorAll('[data-variant]').forEach((button) => {
  button.addEventListener('click', () => {
    const variant = button.dataset.variant;
    document.querySelectorAll('[data-variant]').forEach((btn) => btn.classList.toggle('is-active', btn === button));
    document.querySelectorAll('[data-hero]').forEach((hero) => hero.classList.toggle('is-active', hero.dataset.hero === variant));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));

document.querySelectorAll('[data-lead-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const phone = form.querySelector('input[type="tel"]');
    if (!phone?.value.trim()) return;
    const original = form.querySelector('button[type="submit"]').textContent;
    form.querySelector('button[type="submit"]').textContent = 'Заявка подготовлена';
    setTimeout(() => {
      form.reset();
      form.querySelector('button[type="submit"]').textContent = original;
      closeModal();
    }, 1200);
  });
});
