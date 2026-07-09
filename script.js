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
