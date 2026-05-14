const body = document.body;
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const phoneToggle = document.querySelector('[data-phone-toggle]');
const phoneWrap = document.querySelector('.phone-wrap');

menuToggle?.addEventListener('click', () => {
  body.classList.toggle('menu-open');
  mobileMenu?.classList.toggle('is-open');
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    mobileMenu.classList.remove('is-open');
  });
});

phoneToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  phoneWrap?.classList.toggle('is-open');
});

document.addEventListener('click', (event) => {
  if (!phoneWrap?.contains(event.target)) phoneWrap?.classList.remove('is-open');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    body.classList.remove('menu-open');
    mobileMenu?.classList.remove('is-open');
    phoneWrap?.classList.remove('is-open');
  }
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
