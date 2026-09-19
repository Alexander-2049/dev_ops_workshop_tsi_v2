(() => {
  'use strict';
  const title = 'Hamlet, Act III, Scene I — To be, or not to be';
  const description = "William Shakespeare's Hamlet, Act III, Scene I [To be, or not to be]";
  const anthologyKey = 'existential-crisis-fun-zone:hamlet-act-3-scene-1';
  const status = document.querySelector('.status');
  const saveButton = document.querySelector('[data-action="save"]');
  const anthologyChip = document.querySelector('[data-anthology-chip]');
  const canonicalUrl = () => `${window.location.origin}${window.location.pathname}`;
  const announce = message => { status.textContent = message; };
  const shareUrls = () => { const url = encodeURIComponent(canonicalUrl()); const encodedTitle = encodeURIComponent(title); return {facebook:`https://www.facebook.com/sharer/sharer.php?u=${url}`,twitter:`https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}`,tumblr:`https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&title=${encodedTitle}&caption=${encodeURIComponent(description)}`}; };
  const openShare = event => { event.preventDefault(); const popup = window.open(shareUrls()[event.currentTarget.dataset.share], '_blank', 'noopener,noreferrer'); if (popup) popup.opener = null; else announce('Your browser blocked the sharing window. Please allow pop-ups and try again.'); };
  document.querySelectorAll('[data-share]').forEach(link => link.addEventListener('click', openShare));
  document.querySelector('[data-action="print"]').addEventListener('click', () => window.print());
  const copyText = async text => { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; } const textarea = document.createElement('textarea'); textarea.value = text; textarea.setAttribute('readonly', ''); textarea.style.position = 'fixed'; textarea.style.opacity = '0'; document.body.append(textarea); textarea.select(); const copied = document.execCommand('copy'); textarea.remove(); if (!copied) throw new Error('Copy command was unavailable'); };
  document.querySelector('[data-action="embed"]').addEventListener('click', async () => { const embed = `<iframe src="${canonicalUrl()}" title="${title}" width="100%" height="760" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`; try { await copyText(embed); announce('Embed code copied to your clipboard.'); } catch { announce('Could not copy the embed code. Please try again in a browser that permits clipboard access.'); } });
  const storage = { get() { try { return localStorage.getItem(anthologyKey) === 'saved'; } catch { return null; } }, set(saved) { try { localStorage.setItem(anthologyKey, saved ? 'saved' : ''); return true; } catch { return false; } } };
  const updateSaveButton = saved => {
    saveButton.setAttribute('aria-pressed', String(saved));
    const symbol = document.createElement('span');
    symbol.textContent = saved ? '−' : '+';
    saveButton.replaceChildren(symbol, document.createTextNode(saved ? ' Remove from this browser’s anthology' : ' Add this poem to an anthology'));
    anthologyChip.textContent = saved ? 'LOCAL SLOT: SAVED' : 'LOCAL SLOT: OPEN';
  };
  const saved = storage.get(); if (saved === null) announce('Local saving is unavailable in this browser.'); else updateSaveButton(saved);
  saveButton.addEventListener('click', () => { const next = saveButton.getAttribute('aria-pressed') !== 'true'; if (!storage.set(next)) { announce('Local saving is unavailable in this browser.'); return; } updateSaveButton(next); announce(next ? 'Saved to this browser’s anthology.' : 'Removed from this browser’s anthology.'); });
  const toggle = document.querySelector('.mode-toggle');
  const toggleLabel = toggle.querySelector('.mode-toggle__label');
  const particleLayer = document.querySelector('.arcade-particles');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activationTimer = null;

  const random = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);
  const palette = ['#dfff58', '#ff66b3', '#ff964a', '#fffdf4', '#4545ff'];
  const shapes = ['star', 'diamond', 'ring', 'pixel'];
  const clearParticles = () => {
    if (activationTimer) window.clearTimeout(activationTimer);
    activationTimer = null;
    particleLayer.replaceChildren();
  };
  const createParticle = (kind, index, total) => {
    const particle = document.createElement('span');
    const shape = shapes[index % shapes.length];
    particle.className = `arcade-particle arcade-particle--${kind} arcade-particle--${shape}`;
    particle.style.setProperty('--particle-color', palette[index % palette.length]);
    particle.style.setProperty('--size', `${Math.round(random(8, 22))}px`);
    if (kind === 'ambient') {
      particle.style.setProperty('--x', `${Math.round(random(3, 94))}%`);
      particle.style.setProperty('--y', `${Math.round(random(5, 91))}%`);
      particle.style.setProperty('--drift-x', `${Math.round(random(-34, 34))}px`);
      particle.style.setProperty('--drift-y', `${Math.round(random(-42, 42))}px`);
      particle.style.setProperty('--duration', `${random(4.5, 9).toFixed(2)}s`);
      particle.style.setProperty('--delay', `${random(-8, 0).toFixed(2)}s`);
    } else {
      const angle = (Math.PI * 2 * index) / total + random(-0.18, 0.18);
      const distance = random(70, 210);
      particle.style.setProperty('--x', '50%');
      particle.style.setProperty('--y', '18%');
      particle.style.setProperty('--burst-x', `${Math.round(Math.cos(angle) * distance)}px`);
      particle.style.setProperty('--burst-y', `${Math.round(Math.sin(angle) * distance)}px`);
      particle.style.setProperty('--duration', `${random(.7, 1.3).toFixed(2)}s`);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
    }
    return particle;
  };
  const startArcade = () => {
    document.body.classList.add('arcade-active');
    toggle.setAttribute('aria-pressed', 'true');
    toggleLabel.textContent = 'Exit arcade mode';
    clearParticles();
    if (!reduceMotion.matches) {
      const ambientCount = window.matchMedia('(max-width: 600px)').matches ? 12 : 22;
      const ambient = Array.from({ length: ambientCount }, (_, index) => createParticle('ambient', index, ambientCount));
      const burst = Array.from({ length: 24 }, (_, index) => createParticle('burst', index, 24));
      particleLayer.append(...ambient, ...burst);
      activationTimer = window.setTimeout(() => { activationTimer = null; }, 1400);
    }
    announce('Arcade mode activated. Animated decorations are on.');
  };
  const stopArcade = () => {
    document.body.classList.remove('arcade-active');
    clearParticles();
    toggle.setAttribute('aria-pressed', 'false');
    toggleLabel.textContent = 'Switch to arcade mode';
    announce('Arcade mode off. Animated decorations are stopped.');
  };
  toggle.addEventListener('click', () => {
    if (document.body.classList.contains('arcade-active')) stopArcade();
    else startArcade();
  });

  const portrait = document.querySelector('.shakespeare-portrait');
  const portraitFallback = document.querySelector('.portrait-fallback');
  portrait.addEventListener('load', () => { portrait.hidden = false; portraitFallback.hidden = true; });
  portrait.addEventListener('error', () => { portrait.hidden = true; portraitFallback.hidden = false; });
  if (portrait.complete) {
    portrait.hidden = !portrait.naturalWidth;
    portraitFallback.hidden = Boolean(portrait.naturalWidth);
  }
})();
