// ==========================================================================
// Illuminate Her Path — shared behavior
// ==========================================================================

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
});

/* --------------------------------------------------------------------------
   WELCOME POPUP (Wildly Rooted invite)
   --------------------------------------------------------------------------
   Shows once per browser session on the homepage only. Uses sessionStorage
   so it reappears on a fresh visit/new tab but won't nag someone browsing
   between pages during the same visit.
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('welcomePopup');
  if (!popup) return;

  const closeBtn = document.getElementById('welcomePopupClose');
  const STORAGE_KEY = 'ihp_welcome_popup_shown';

  const closePopup = () => {
    popup.classList.remove('is-visible');
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* private browsing, ignore */ }
  };

  let alreadyShown = false;
  try { alreadyShown = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { /* ignore */ }

  if (!alreadyShown) {
    setTimeout(() => popup.classList.add('is-visible'), 500);
  }

  closeBtn.addEventListener('click', closePopup);
  popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('is-visible')) closePopup();
  });
});

/* --------------------------------------------------------------------------
   PRICING TIERS
   --------------------------------------------------------------------------
   Stripe currently only has ONE payment link (the $475 Early rate). A single
   Payment Link can only charge one fixed price — it can't switch itself.

   TO ACTIVATE TIER 2 AND 3:
   1. In Stripe, duplicate the Payment Link at the General Admission ($500)
      price, and again at the Last Chance ($550) price.
   2. Paste those two URLs into TIER_LINKS below.
   3. That's it — this script will automatically point the Register button
      at whichever tier is currently active based on today's date.

   Registrant-count cutoffs (15 / 35 / 50) can't be checked automatically
   from the browser without a backend — for now this only tracks the DATE
   windows. Keep an eye on headcount manually and update DATE_OVERRIDE
   below if a tier sells out early.
   -------------------------------------------------------------------------- */

const TIER_LINKS = {
  early: 'https://buy.stripe.com/dRmcN72tedGAeGy1vk2VG01',
  general: 'https://buy.stripe.com/dRmcN72tedGAeGy1vk2VG01', // TODO: replace with $500 link
  last: 'https://buy.stripe.com/dRmcN72tedGAeGy1vk2VG01',    // TODO: replace with $550 link
};

// Set to a tier name ('early' | 'general' | 'last') to force a tier
// regardless of date, e.g. if a tier sells out on registrant count.
const DATE_OVERRIDE = null;

function getActiveTier() {
  if (DATE_OVERRIDE) return DATE_OVERRIDE;
  const today = new Date();
  const earlyEnds = new Date('2026-08-15T23:59:59');
  const generalEnds = new Date('2026-09-16T23:59:59');
  const lastEnds = new Date('2026-09-23T23:59:59');

  if (today <= earlyEnds) return 'early';
  if (today <= generalEnds) return 'general';
  if (today <= lastEnds) return 'last';
  return 'closed';
}

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.price-card');
  if (!cards.length) return;

  const active = getActiveTier();

  cards.forEach((card) => {
    const tier = card.dataset.tier;
    const btn = card.querySelector('a.btn');
    const status = card.querySelector('.tier-window');

    if (active === 'closed') {
      card.classList.remove('is-active');
      if (btn) {
        btn.classList.add('btn-disabled');
        btn.classList.remove('btn-gold', 'btn-outline');
        btn.textContent = 'Registration Closed';
        btn.removeAttribute('href');
      }
      return;
    }

    if (tier === active) {
      card.classList.add('is-active');
      if (btn) {
        btn.href = TIER_LINKS[tier];
        btn.classList.add('btn-gold');
        btn.classList.remove('btn-outline', 'btn-disabled');
        btn.textContent = 'Register Now';
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener');
      }
    } else {
      card.classList.remove('is-active');
      if (btn) {
        const tierOrder = ['early', 'general', 'last'];
        const isPast = tierOrder.indexOf(tier) < tierOrder.indexOf(active);
        btn.classList.add('btn-disabled');
        btn.classList.remove('btn-gold', 'btn-outline');
        btn.textContent = isPast ? 'Rate Closed' : 'Opens Soon';
        btn.removeAttribute('href');
      }
    }
  });
});

/* --------------------------------------------------------------------------
   GALLERY SCROLL REVEAL
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.masonry-item');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = (Array.from(items).indexOf(el) % 6) * 80;
        setTimeout(() => el.classList.add('is-visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el) => observer.observe(el));
});

/* --------------------------------------------------------------------------
   NAV DROPDOWN (Events / Past Events)
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  if (!dropdowns.length) return;

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('is-open');
      dropdowns.forEach((d) => d.classList.remove('is-open'));
      if (!isOpen) dropdown.classList.add('is-open');
    });
  });

  document.addEventListener('click', () => {
    dropdowns.forEach((d) => d.classList.remove('is-open'));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dropdowns.forEach((d) => d.classList.remove('is-open'));
  });
});

/* --------------------------------------------------------------------------
   SCROLL REVEAL TEXT (Come Home to Yourself section)
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const lines = document.querySelectorAll('.reveal-line');
  if (!lines.length) return;

  if (!('IntersectionObserver' in window)) {
    lines.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = Array.from(lines).indexOf(el) * 150;
        setTimeout(() => el.classList.add('is-visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -60px 0px' });

  lines.forEach((el) => observer.observe(el));
});
