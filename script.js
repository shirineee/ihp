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

  const parentCounts = new WeakMap();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const parent = el.parentElement;
        const count = parentCounts.get(parent) || 0;
        parentCounts.set(parent, count + 1);
        const delay = Math.min(count, 4) * 70;
        setTimeout(() => el.classList.add('is-visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.01, rootMargin: '0px 0px 15% 0px' });

  lines.forEach((el) => observer.observe(el));
});

/* --------------------------------------------------------------------------
   EVENT PAGE STICKY SUB-NAV
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const subnav = document.getElementById('eventSubnav');
  if (!subnav) return;

  const showAfter = 480;
  const onScroll = () => {
    if (window.scrollY > showAfter) {
      subnav.classList.add('is-visible');
    } else {
      subnav.classList.remove('is-visible');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});

/* --------------------------------------------------------------------------
   LIVE CAPACITY INDICATOR (Wildly Rooted)
   --------------------------------------------------------------------------
   This is NOT connected to Stripe or any live registration count — there's
   no backend to pull that from. Update the number below by hand whenever
   headcount changes, and the bar + text will reflect it automatically.
   -------------------------------------------------------------------------- */

const CURRENT_REGISTRANTS = 0;   // <-- update this number as people register
const TOTAL_CAPACITY = 50;

document.addEventListener('DOMContentLoaded', () => {
  const countEl = document.getElementById('capacitySpotsCount');
  const fillEl = document.getElementById('capacityBarFill');
  if (!countEl || !fillEl) return;

  countEl.textContent = `${CURRENT_REGISTRANTS} of ${TOTAL_CAPACITY}`;
  const pct = Math.min(100, Math.round((CURRENT_REGISTRANTS / TOTAL_CAPACITY) * 100));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        fillEl.style.width = pct + '%';
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });
  observer.observe(fillEl);
});

/* --------------------------------------------------------------------------
   FAQ ACCORDION
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      if (isOpen) {
        item.classList.remove('is-open');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
});

/* --------------------------------------------------------------------------
   SHIMMER BUTTON — CONTINUOUS ANIMATION ACROSS PAGE LOADS
   --------------------------------------------------------------------------
   CSS animations always restart at 0% on a fresh page load/refresh — there's
   no way around that in pure CSS. This works around it: on every page load,
   we calculate how far into the animation cycle "real time" would have
   reached (based on the actual clock, not page-load time), and set a
   matching negative animation-delay. The animation still technically
   restarts, but it restarts already mid-cycle at the "correct" point, so
   it reads as one continuous shimmer that never stopped, even across a
   full page refresh or navigating to a different page.
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.btn-shimmer-base');
  if (!buttons.length) return;

  const now = Date.now();
  const shimmerDuration = 6000;   // matches shimmerMove's 6s
  const sweepDuration = 3600;     // matches shimmerSweep's 3.6s

  const shimmerDelay = -((now % shimmerDuration) / 1000);
  const sweepDelay = -((now % sweepDuration) / 1000);

  buttons.forEach((btn) => {
    btn.style.setProperty('--shimmer-delay', shimmerDelay + 's');
    btn.style.setProperty('--sweep-delay', sweepDelay + 's');
  });
});
