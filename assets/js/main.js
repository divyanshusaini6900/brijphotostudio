/* =========================================================
   Brij Photo Studio — site script
   GSAP + ScrollTrigger + Lenis (from CDN). Every story scene is a
   timeline scrubbed by scroll while its section is pinned. Without
   GSAP, or with reduced motion, scenes show their finished frame.
   The page is written in Hindi; English lives in data-en attributes
   and the header switch swaps between them.
   ========================================================= */

/* ---------------------------------------------------------
   दुकान की जानकारी — सिर्फ़ यहाँ बदलिए
   whatsapp / phone: 91 के साथ, बिना + और स्पेस के (जैसे '919876543210')
   --------------------------------------------------------- */
const SHOP = {
  whatsapp: '919758580623',
  phone: '919758580623',
  phoneDisplay: '+91 97585 80623',
  address: {
    hi: 'ग्राम पठेड़, नथमलपुर रोड, ज़िला सहारनपुर, उत्तर प्रदेश – 247231',
    en: 'Village Pather, Nathmalpur Road, District Saharanpur, Uttar Pradesh – 247231'
  },
  hours: {
    hi: 'रोज़ सुबह 8 से रात 8 बजे तक',
    en: 'Open daily, 8 AM to 8 PM'
  },
  mapUrl: 'https://maps.app.goo.gl/TCuKijWRTwXKrL349'
};

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none) and (pointer: coarse)').matches;
  const motion = !!(window.gsap && window.ScrollTrigger) && !reduce;
  const body = document.body;
  const root = document.documentElement;

  /* ---------- small DOM setup (before the language pass, so copies get translated too) ---------- */
  $$('.marq__track').forEach(t => { t.innerHTML += t.innerHTML; });
  $$('.story').forEach(sec => { $('.story__film', sec).innerHTML = '<i></i>'.repeat($$('.ustep', sec).length); });
  const confetti = $('#confetti');
  const confColors = ['#F4A62A', '#14A3A1', '#E8516A', '#F7C548', '#6A45B8', '#25D366'];
  for (let i = 0; i < 20; i++) {
    const c = document.createElement('i');
    c.style.setProperty('--c', confColors[i % confColors.length]);
    confetti.appendChild(c);
  }
  $$('[data-shop-tel]').forEach(a => { a.href = `tel:+${SHOP.phone}`; });
  $$('[data-shop-map]').forEach(a => { a.href = SHOP.mapUrl; });
  $('#year').textContent = new Date().getFullYear();

  /* =========================================================
     LANGUAGE — Hindi by default, English on request
     ========================================================= */
  const waLink = text => `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;
  const T = {
    hi: { errName: 'कृपया अपना नाम लिखिए।', errSeva: 'कृपया सेवा चुनिए।', hello: 'नमस्ते बृज फोटो स्टूडियो!', name: 'नाम', seva: 'सेवा', msg: 'संदेश' },
    en: { errName: 'Please enter your name.', errSeva: 'Please choose a service.', hello: 'Hello Brij Photo Studio!', name: 'Name', seva: 'Service', msg: 'Message' }
  };
  // the Hindi written in the page is kept so it can be put back
  const textEls = $$('[data-en]');
  textEls.forEach(el => { el.dataset.hi = el.tagName === 'TITLE' ? el.textContent : el.innerHTML; });
  const ATTRS = ['aria-label', 'placeholder', 'title', 'label', 'content'];
  const attrEls = ATTRS.flatMap(a => $$(`[data-en-${a}]`).map(el => {
    el.setAttribute(`data-hi-${a}`, el.getAttribute(a) || '');
    return [el, a];
  }));
  let lang = 'hi';

  function applyLang(next, refresh) {
    lang = next === 'en' ? 'en' : 'hi';
    root.lang = lang;
    textEls.forEach(el => {
      const v = lang === 'en' ? el.dataset.en : el.dataset.hi;
      if (el.tagName === 'TITLE') el.textContent = v; else el.innerHTML = v;
    });
    attrEls.forEach(([el, a]) => el.setAttribute(a, el.getAttribute(`data-${lang}-${a}`)));
    $$('[data-wa]').forEach(a => { a.href = waLink(lang === 'en' ? a.dataset.waEn : a.dataset.wa); });
    $$('[data-shop]').forEach(el => {
      const v = SHOP[el.dataset.shop];
      el.textContent = typeof v === 'object' ? v[lang] : v;
    });
    $$('.lang__btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    $('#orderErr').textContent = '';
    showDoc(currentDoc);
    try { localStorage.setItem('brij-lang', lang); } catch (e) {}
    // text lengths changed, so pinned sections need fresh positions
    if (refresh && motion) requestAnimationFrame(() => ScrollTrigger.refresh());
  }
  $$('.lang__btn').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang !== lang) applyLang(b.dataset.lang, true); }));

  /* ---------- document checklist ---------- */
  const DOCS = {
    pan: {
      title: { hi: 'पैन कार्ड के लिए', en: 'For a PAN card' },
      wa: { hi: 'मुझे पैन कार्ड बनवाना है — कौन-से कागज़ लाऊँ?', en: 'I want to apply for a PAN card — which documents should I bring?' },
      items: [
        [['आधार कार्ड', 'मोबाइल नंबर आधार से जुड़ा हो (OTP के लिए)'], ['Aadhaar card', 'Your mobile number must be linked to Aadhaar (for OTP)']],
        [['2 पासपोर्ट साइज़ फोटो', 'यहीं तुरंत खिंचवा सकते हैं'], ['2 passport size photos', 'We can take them right here']],
        [['हस्ताक्षर या अंगूठा', ''], ['Signature or thumb impression', '']],
        [['मोबाइल नंबर', 'OTP और स्थिति जानने के लिए'], ['Mobile number', 'For OTP and status updates']],
        [['सुधार के लिए', 'पुराने पैन कार्ड की कॉपी'], ['For corrections', 'A copy of your old PAN card']]
      ]
    },
    income: {
      title: { hi: 'आय प्रमाण पत्र के लिए', en: 'For an income certificate' },
      wa: { hi: 'मुझे आय प्रमाण पत्र बनवाना है — कौन-से कागज़ लाऊँ?', en: 'I need an income certificate — which documents should I bring?' },
      items: [
        [['आधार कार्ड', ''], ['Aadhaar card', '']],
        [['राशन कार्ड या परिवार रजिस्टर की नकल', ''], ['Ration card or a copy of the family register', '']],
        [['स्व-घोषणा पत्र', 'फ़ॉर्मेट हम दे देंगे'], ['Self-declaration form', 'We will give you the format']],
        [['पासपोर्ट साइज़ फोटो', ''], ['Passport size photo', '']],
        [['आय का सबूत', 'सैलरी स्लिप / खतौनी — अगर हो'], ['Proof of income', 'Salary slip / land record — if you have one']],
        [['मोबाइल नंबर', ''], ['Mobile number', '']]
      ]
    },
    birth: {
      title: { hi: 'जन्म प्रमाण पत्र के लिए', en: 'For a birth certificate' },
      wa: { hi: 'मुझे जन्म प्रमाण पत्र बनवाना है — कौन-से कागज़ लाऊँ?', en: 'I need a birth certificate — which documents should I bring?' },
      items: [
        [['अस्पताल की डिस्चार्ज स्लिप / जन्म पर्ची', ''], ['Hospital discharge slip / birth slip', '']],
        [['माता-पिता का आधार कार्ड', ''], ["Parents' Aadhaar cards", '']],
        [['पते का सबूत', 'आधार या बिजली बिल'], ['Proof of address', 'Aadhaar or an electricity bill']],
        [['मोबाइल नंबर', ''], ['Mobile number', '']],
        [['देर से पंजीकरण हो तो', 'शपथ पत्र (एफ़िडेविट) लग सकता है'], ['For late registration', 'An affidavit may be needed']]
      ]
    },
    domicile: {
      title: { hi: 'निवास प्रमाण पत्र के लिए', en: 'For a domicile certificate' },
      wa: { hi: 'मुझे निवास प्रमाण पत्र बनवाना है — कौन-से कागज़ लाऊँ?', en: 'I need a domicile certificate — which documents should I bring?' },
      items: [
        [['आधार कार्ड', ''], ['Aadhaar card', '']],
        [['राशन कार्ड या वोटर ID', ''], ['Ration card or voter ID', '']],
        [['पते का सबूत', 'बिजली बिल या घर के कागज़'], ['Proof of address', 'Electricity bill or property papers']],
        [['पासपोर्ट साइज़ फोटो', ''], ['Passport size photo', '']],
        [['स्व-घोषणा पत्र', 'फ़ॉर्मेट हम दे देंगे'], ['Self-declaration form', 'We will give you the format']],
        [['मोबाइल नंबर', ''], ['Mobile number', '']]
      ]
    }
  };
  const docList = $('#docList');
  const docTabs = $$('.dtab');
  let docsSeen = false;
  let currentDoc = 'pan';
  function showDoc(key) {
    const d = DOCS[key];
    currentDoc = key;
    $('#docTitle').textContent = d.title[lang];
    $('#docWa').href = waLink(d.wa[lang]);
    docList.classList.remove('is-in');
    docList.innerHTML = d.items.map((pair, i) => {
      const [t, s] = pair[lang === 'en' ? 1 : 0];
      return `<li style="--i:${i}"><span class="box"><svg><use href="#i-check"/></svg></span><span>${t}${s ? `<small>${s}</small>` : ''}</span></li>`;
    }).join('');
    docTabs.forEach(b => {
      const on = b.dataset.doc === key;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on);
    });
    if (docsSeen) requestAnimationFrame(() => requestAnimationFrame(() => docList.classList.add('is-in')));
  }
  docTabs.forEach(b => b.addEventListener('click', () => showDoc(b.dataset.doc)));
  new IntersectionObserver((entries, io) => {
    if (!entries[0].isIntersecting) return;
    docsSeen = true;
    docList.classList.add('is-in');
    io.disconnect();
  }, { threshold: 0.3 }).observe(docList);

  // first pass: saved choice (set on <html> by the head script) or Hindi
  applyLang(root.lang, false);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (motion && window.Lenis && !isTouch) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = el => {
    if (lenis) lenis.scrollTo(el, { duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------- header: shadow once scrolled, hides going down ---------- */
  const header = $('#header');
  let lastY = 0;
  const onScrollY = y => {
    header.classList.toggle('is-scrolled', y > 20);
    if (!body.classList.contains('menu-open')) {
      if (y > lastY + 4 && y > 400) header.classList.add('is-hidden');
      else if (y < lastY - 4) header.classList.remove('is-hidden');
    }
    lastY = y;
  };
  if (lenis) lenis.on('scroll', l => onScrollY(l.scroll));
  else addEventListener('scroll', () => onScrollY(scrollY), { passive: true });

  /* ---------- menu ---------- */
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');
  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', !open);
    menuBtn.setAttribute('aria-expanded', open);
    body.classList.toggle('menu-open', open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  menuBtn.addEventListener('click', () => setMenu(true));
  $('#menuClose').addEventListener('click', () => setMenu(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });

  // in-page links glide to their section
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id.length > 1 && $(id);
    if (!target) return;
    e.preventDefault();
    if (menu.classList.contains('is-open')) setMenu(false);
    scrollToEl(target);
  });

  /* ---------- WhatsApp order form ---------- */
  $('#orderForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const t = T[lang];
    const naam = f.naam.value.trim();
    const seva = f.seva.value;
    const err = $('#orderErr');
    if (!naam) { err.textContent = t.errName; f.naam.focus(); return; }
    if (!seva) { err.textContent = t.errSeva; f.seva.focus(); return; }
    err.textContent = '';
    const note = f.sandesh.value.trim();
    const msg = [t.hello, `${t.name}: ${naam}`, `${t.seva}: ${seva}`, note && `${t.msg}: ${note}`].filter(Boolean).join('\n');
    window.open(waLink(msg), '_blank', 'noopener');
  });


  /* =========================================================
     STORIES
     story(section, step thresholds, build(tl, u), length in screens)
     u(n) converts cqmin of the scene to px, so moves match the CSS.
     ========================================================= */
  const stories = [];
  const story = (sel, thresholds, scene, build, length = 2.6) => stories.push({ sec: $(sel), scene: $(scene), thresholds, build, length });
  const unit = scene => n => Math.min(scene.clientWidth, scene.clientHeight) * n / 100;
  // GSAP turns the CSS `translate: -50% -50%` into pixels and can miss the
  // -50% on odd-pixel sizes, so scene items get their centring set explicitly.
  const centre = els => gsap.set(els, { x: 0, y: 0, xPercent: -50, yPercent: -50 });
  const runBuild = (s, tl) => { centre($$('.it', s.scene)); s.build(tl, unit(s.scene), s.scene); };

  function setStep(s, p) {
    let n = 0;
    s.thresholds.forEach((t, k) => { if (p >= t) n = k; });
    if (s.cur === n) return;
    s.cur = n;
    $$('.ustep', s.sec).forEach((el, k) => el.classList.toggle('is-active', k === n));
    $$('.story__film i', s.sec).forEach((el, k) => el.classList.toggle('is-on', k <= n));
  }

  /* 01 — Passport: focus, click, crop to 35x45, eight on a sheet, cut, ready */
  story('#st-passport', [0, 0.15, 0.25, 0.48, 0.84], '#scPass', (tl, u, sc) => {
    const vf = $('#vf', sc);
    const img = $('.vf__img', sc);
    const ui = $('.vf__ui', sc);
    const focus = $('.vf__focus', sc);
    const af = $('.vf__af b', sc);
    const corners = $$('.vf__c', sc);
    const shutters = $$('.vf__shutter', sc);
    const flash = $('.flash', sc);
    const dims = $$('.dim', sc);
    const sheet = $('#passSheet');
    const minis = $$('.pass-mini', sc);
    const cutH = $('.cut--h', sc);
    const cutV = $$('.cut--v', sc);
    const scissors = $('.scissors', sc);
    const ready = $('.pass-ready', sc);
    const sw = sheet.offsetWidth, sh = sheet.offsetHeight;
    const cornerOut = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

    gsap.set(vf, { autoAlpha: 1 });
    gsap.set(img, { filter: 'blur(7px)', scale: 1.14 });
    gsap.set(focus, { scale: 1.5, opacity: 0.4 });
    gsap.set(af, { opacity: 0.15 });
    corners.forEach((c, k) => gsap.set(c, { x: cornerOut[k][0] * u(3), y: cornerOut[k][1] * u(3) }));
    gsap.set(dims, { autoAlpha: 0 });
    gsap.set(sheet, { autoAlpha: 0, y: u(6), scale: 0.92 });
    minis.forEach(m => gsap.set(m, {
      x: sw / 2 - (m.offsetLeft + m.offsetWidth / 2),
      y: sh / 2 - (m.offsetTop + m.offsetHeight / 2),
      scale: 0.5, autoAlpha: 0, zIndex: 2
    }));
    gsap.set(cutH, { scaleX: 0 });
    gsap.set(cutV, { scaleY: 0 });
    gsap.set(scissors, { autoAlpha: 0, x: 0 });
    gsap.set(ready, { scale: 0, rotation: -30 });

    tl.to(img, { filter: 'blur(0px)', scale: 1, duration: 1.2 }, 0)
      .to(corners, { x: 0, y: 0, duration: 1 }, 0)
      .to(focus, { scale: 1, opacity: 1, duration: 1 }, 0.1)
      .to(focus, { borderColor: '#4ADE80', duration: 0.2 }, 1.05)
      .to(af, { opacity: 1, duration: 0.2 }, 1.05)
      // click!
      .to(shutters, { scaleY: 1, duration: 0.18, ease: 'power2.in' }, 1.4)
      .to(flash, { opacity: 1, duration: 0.12 }, 1.52)
      .to(shutters, { scaleY: 0, duration: 0.25, ease: 'power2.out' }, 1.62)
      .to(flash, { opacity: 0, duration: 0.6 }, 1.68)
      // crop to passport size
      .to(ui, { autoAlpha: 0, duration: 0.4 }, 2.3)
      .to(vf, { width: u(38.5), height: u(49.5), borderRadius: u(0.4), duration: 1.1, ease: 'power3.inOut' }, 2.5)
      .to(dims, { autoAlpha: 1, duration: 0.4, stagger: 0.12 }, 3.3)
      // eight on a sheet
      .to(dims, { autoAlpha: 0, duration: 0.3 }, 4.3)
      .to(sheet, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out' }, 4.4)
      .to(vf, { scale: 0.4, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, 4.5)
      .to(minis, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'back.out(1.4)' }, 4.8)
      // cut
      .to(scissors, { autoAlpha: 1, duration: 0.15 }, 6.3)
      .to(cutH, { scaleX: 1, duration: 0.8, ease: 'none' }, 6.3)
      .to(scissors, { x: sw, duration: 0.8, ease: 'none' }, 6.3)
      .to(scissors, { autoAlpha: 0, duration: 0.15 }, 7.05)
      .to(cutV, { scaleY: 1, duration: 0.5, stagger: 0.12, ease: 'none' }, 6.9)
      // one lifts off, ready
      .to(minis[7], { x: u(10), y: -u(13), rotation: 10, scale: 1.5, boxShadow: `0 ${u(2)}px ${u(3)}px rgba(11,22,64,.3)`, duration: 0.8, ease: 'power3.out' }, 7.8)
      .to(ready, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' }, 8)
      .to({}, { duration: 0.6 });
  }, 2.6);

  /* 02 — Designing photo: an editor removes the background, recolours, adds text */
  story('#st-design', [0, 0.11, 0.28, 0.46, 0.6, 0.85], '#scDesign', (tl, u, sc) => {
    const ed = $('#ed', sc);
    const canvas = $('.ed__canvas', sc);
    const old = $('.cv--old', sc);
    const fresh = $('.cv--new', sc);
    const person = $('.cv-person', sc);
    const scan = $('.cv-scan', sc);
    const sparks = $$('.cv-spark i', sc);
    const textB = $('.cv-text b', sc);
    const textS = $('.cv-text span', sc);
    const balloons = $$('.balloon', sc);
    const frame = $('.cv-frame', sc);
    const tools = $$('.tool', sc);
    const layers = $$('.lyr', sc);
    const save = $('.ed__save', sc);
    const toast = $('.ed-toast', sc);
    const toolOff = { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', duration: 0.25 };
    const toolOn = (k, t) => {
      tl.to(tools[k], { backgroundColor: '#F4A62A', color: '#0B1640', duration: 0.25 }, t);
      if (k > 0) tl.to(tools[k - 1], toolOff, t);
    };

    gsap.set(ed, { y: u(5), autoAlpha: 0.6 });
    gsap.set(old, { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.set(fresh, { clipPath: 'circle(0% at 50% 55%)' });
    gsap.set(person, { filter: 'grayscale(0.75) brightness(0.82)' });
    gsap.set(scan, { autoAlpha: 0, x: 0 });
    gsap.set(sparks, { scale: 0, rotation: -90 });
    gsap.set([textB, textS], { autoAlpha: 0, y: u(4), scale: 0.8 });
    gsap.set(balloons, { y: u(30), autoAlpha: 0 });
    gsap.set(frame, { autoAlpha: 0, scale: 1.06 });
    gsap.set(layers.slice(1), { autoAlpha: 0.25 });
    gsap.set(save, { autoAlpha: 0, scale: 0.6 });
    gsap.set(toast, { autoAlpha: 0, y: u(6) });

    tl.to(ed, { y: 0, autoAlpha: 1, duration: 0.6 }, 0);
    toolOn(0, 0.9);
    tl.to(scan, { autoAlpha: 1, duration: 0.1 }, 1)
      .to(scan, { x: canvas.offsetWidth, duration: 1.3, ease: 'power1.inOut' }, 1)
      .to(old, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.3, ease: 'power1.inOut' }, 1)
      .to(scan, { autoAlpha: 0, duration: 0.1 }, 2.25)
      .to(layers[1], { autoAlpha: 1, duration: 0.3 }, 2);
    toolOn(1, 2.5);
    tl.to(fresh, { clipPath: 'circle(90% at 50% 55%)', duration: 1.2, ease: 'power2.inOut' }, 2.6)
      .to(layers[2], { autoAlpha: 1, duration: 0.3 }, 3.4);
    toolOn(2, 4.1);
    tl.to(person, { filter: 'grayscale(0) brightness(1.04)', duration: 0.9 }, 4.2)
      .to(sparks, { scale: 1, rotation: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(3)' }, 4.5)
      .to(layers[3], { autoAlpha: 1, duration: 0.3 }, 4.8);
    toolOn(3, 5.3);
    tl.to(textB, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, 5.4)
      .to(textS, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 5.7)
      .to(layers[4], { autoAlpha: 1, duration: 0.3 }, 5.9);
    toolOn(4, 6.4);
    tl.to(balloons, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12, ease: 'power2.out' }, 6.5)
      .to(frame, { autoAlpha: 1, scale: 1, duration: 0.5 }, 6.9)
      .to(layers[5], { autoAlpha: 1, duration: 0.3 }, 7.1)
      .to(tools[4], toolOff, 7.7)
      .to(save, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 7.8)
      .to(toast, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }, 8)
      .to({}, { duration: 0.6 });
  }, 2.6);

  /* 03 — Frame: print develops, four mitred bars lock in, glass, sizes, styles, wall */
  story('#st-frame', [0, 0.155, 0.27, 0.36, 0.62, 0.8], '#scFrame', (tl, u, sc) => {
    const main = $('#frMain');
    const bars = $$('.frame__bar', main); // top, right, bottom, left
    const mat = $('.frame__mat', main);
    const paper = $('.frame__paper', main);
    const photo = $('.frame__photo svg', main);
    const glass = $('.frame__glass', main);
    const shine = $('.frame__shine', main);
    const wire = $('.frame__wire', main);
    const others = [$('.fr-b', sc), $('.fr-c', sc)];
    const sizesRow = $('.fr-sizes', sc);
    const sizes = $$('span', sizesRow);
    const stylesRow = $('.fr-styles', sc);
    const styles = $$('span', stylesRow);
    const chipOn = { backgroundColor: '#0B1640', color: '#FFF7EA', duration: 0.2 };
    const chipOff = { backgroundColor: 'rgba(255,255,255,0.75)', color: '#0B1640', duration: 0.2 };
    const barFrom = [{ y: -u(22) }, { x: u(22) }, { y: u(22) }, { x: -u(22) }];

    gsap.set(main, { x: u(14), y: -u(36), rotation: -8, autoAlpha: 0, '--frame': '#8B5A2B', '--frame-l': '#C08A50' });
    gsap.set(photo, { filter: 'sepia(1) brightness(1.8) blur(3px)', opacity: 0.25 });
    gsap.set(paper, { autoAlpha: 1 });
    gsap.set(mat, { autoAlpha: 0 });
    bars.forEach((b, k) => gsap.set(b, { ...barFrom[k], autoAlpha: 0 }));
    gsap.set([glass, wire], { autoAlpha: 0 });
    gsap.set(others, { y: -u(60), rotation: i => (i ? 12 : -12), autoAlpha: 0 });
    gsap.set([sizesRow, stylesRow], { autoAlpha: 0, y: u(4) });

    tl.to(main, { y: 0, rotation: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' }, 0)
      .to(photo, { filter: 'sepia(0) brightness(1) blur(0px)', opacity: 1, duration: 1.2 }, 0.5)
      // the frame closes in
      .to(mat, { autoAlpha: 1, duration: 0.4 }, 1.9)
      .to(paper, { autoAlpha: 0, duration: 0.4 }, 2)
      .to(bars, { x: 0, y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 2)
      // glass
      .to(glass, { autoAlpha: 1, duration: 0.3 }, 3.3)
      .fromTo(shine, { left: '-45%' }, { left: '120%', duration: 0.9, ease: 'power1.inOut' }, 3.4)
      .to(sizesRow, { autoAlpha: 1, y: 0, duration: 0.4 }, 4.4);

    // sizes: 4x6 -> 20x30
    [0.6, 0.7, 0.82, 0.93, 1].forEach((s, k) => {
      const t = 4.7 + k * 0.55;
      tl.to(main, { scale: s, duration: 0.45, ease: 'power2.inOut' }, t).to(sizes[k], chipOn, t);
      if (k) tl.to(sizes[k - 1], chipOff, t);
    });
    tl.to(sizesRow, { autoAlpha: 0, y: u(4), duration: 0.3 }, 7.5)
      .to(stylesRow, { autoAlpha: 1, y: 0, duration: 0.4 }, 7.6)
      .to(styles[0], chipOn, 7.6);

    // styles: wooden -> black -> white -> golden
    [['#1E1E22', '#50505A'], ['#E4DED2', '#FFFFFF'], ['#D4A72C', '#F6DA86']].forEach(([c, l], k) => {
      const t = 7.9 + k * 0.6;
      tl.to(main, { '--frame': c, '--frame-l': l, duration: 0.4 }, t).to(styles[k + 1], chipOn, t).to(styles[k], chipOff, t);
    });

    // gallery wall
    tl.to(stylesRow, { autoAlpha: 0, duration: 0.3 }, 9.7)
      .to(main, { x: 0, duration: 1, ease: 'power3.inOut' }, 9.8)
      .to(wire, { autoAlpha: 1, duration: 0.3 }, 10.4)
      .to(others[0], { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' }, 10)
      .to(others[0], { rotation: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)' }, 10.3)
      .to(others[1], { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' }, 10.3)
      .to(others[1], { rotation: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)' }, 10.6)
      .to({}, { duration: 0.5 });
  }, 3);

  /* 04 — Jan Seva: documents into the file, online form, PAN card, certificates, stamp */
  story('#st-janseva', [0, 0.17, 0.41, 0.58, 0.68], '#scJsk', (tl, u, sc) => {
    const file = $('#file');
    const docs = $$('.doc', file);
    const certs = $$('.cert', sc);
    const marks = $$('.cert__stamp', sc);
    const pan = $('#pan');
    const panShine = $('.pan__shine', pan);
    const form = $('#jskForm');
    const fills = $$('.form__row span i', form);
    const prog = $('.form__prog i', form);
    const btn = $('.form__btn', form);
    const stamp = $('#stamp');
    const status = $('.jsk-status', sc);
    // certificates start inside the file (file rests at -26,-22)
    const fileAt = [-26, -22];
    const certAt = [[-14, 8, -9], [1, 4, 0], [16, 9, 9]];
    // stamp centre for each hit: the mark's centre on its tilted certificate, minus half the stamp's height
    const hit = [[-6.8, 9.9], [6.6, 6.9], [19.8, 12.6]];

    gsap.set(file, { x: u(0 - fileAt[0]), y: u(10 - fileAt[1]), scale: 1.15 });
    gsap.set(docs, { x: i => u([-26, -6, 14][i]), y: -u(48), rotation: i => [-14, 10, -8][i], autoAlpha: 0 });
    gsap.set(form, { autoAlpha: 0, scale: 0.9, y: u(6) });
    gsap.set(fills, { scaleX: 0 });
    gsap.set(prog, { scaleX: 0 });
    gsap.set(pan, { autoAlpha: 0, rotationY: -100, transformPerspective: 900, scale: 0.8, x: -u(24), y: u(24), rotation: -8 });
    certs.forEach((c, k) => gsap.set(c, { x: u(fileAt[0] - certAt[k][0]), y: u(fileAt[1] - certAt[k][1]), rotation: -certAt[k][2], scale: 0.4, autoAlpha: 0 }));
    gsap.set(marks, { scale: 2.2, autoAlpha: 0 });
    gsap.set(stamp, { autoAlpha: 0, x: u(hit[0][0]), y: -u(60) });
    gsap.set(status, { autoAlpha: 0, y: u(6), scale: 0.9 });

    tl.to(docs, { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 0.9, stagger: 0.35, ease: 'power3.out' }, 0.2)
      .to(docs, { y: u(7), duration: 0.4, stagger: 0.08 }, 1.8)
      // online form
      .to(file, { x: 0, y: 0, scale: 1, duration: 1, ease: 'power3.inOut' }, 2.2)
      .to(form, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)' }, 2.6)
      .to(fills, { scaleX: 1, duration: 0.45, stagger: 0.3, ease: 'power1.out' }, 3)
      .to(prog, { scaleX: 1, duration: 1.8, ease: 'none' }, 3)
      .to(btn, { scale: 1.12, backgroundColor: '#25D366', color: '#06291A', duration: 0.25 }, 4.8)
      .to(btn, { scale: 1, duration: 0.25 }, 5.05)
      // PAN card
      .to(form, { autoAlpha: 0, y: -u(8), scale: 0.95, duration: 0.5 }, 5.4)
      .to(pan, { autoAlpha: 1, rotationY: 0, scale: 1.25, duration: 1, ease: 'power3.out' }, 5.6)
      .fromTo(panShine, { left: '-60%' }, { left: '130%', duration: 0.8 }, 6.4)
      .to(pan, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1, ease: 'power3.inOut' }, 7.3)
      // certificates fan out of the file
      .to(certs, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }, 7.6)
      .to(stamp, { autoAlpha: 1, y: u(hit[0][1] - 12), duration: 0.5 }, 8.9);

    // thump, thump, thump
    hit.forEach(([x, y], k) => {
      const t = 9.4 + k * 0.9;
      if (k) tl.to(stamp, { x: u(x), y: u(y - 12), duration: 0.35, ease: 'power2.inOut' }, t - 0.4);
      tl.to(stamp, { y: u(y), duration: 0.18, ease: 'power3.in' }, t)
        .to(marks[k], { scale: 1, autoAlpha: 0.85, duration: 0.12 }, t + 0.17)
        .to(certs[k], { scale: 0.97, duration: 0.08, yoyo: true, repeat: 1 }, t + 0.17)
        .to(stamp, { y: u(y - 12), duration: 0.3, ease: 'power2.out' }, t + 0.32);
    });
    tl.to(stamp, { y: -u(60), autoAlpha: 0, duration: 0.5 }, 11.9)
      .to(status, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, 12)
      .to({}, { duration: 0.6 });
  }, 3.2);

  /* 05 — Print: scan + copies, B/W, colour, PDF from WhatsApp, lamination */
  story('#st-print', [0, 0.19, 0.31, 0.47, 0.72], '#scPrint', (tl, u, sc) => {
    const mc = $('#mc');
    const scan = $('.mc__scan', mc);
    const screens = $$('.mc__screen span', mc);
    const inks = $$('.mc__ink i', mc);
    const pages = $$('.pg', mc);
    const colorBits = [$('.pg--color .pg__photo', mc), $('.pg--color b', mc)];
    const stack = $('#stack');
    const stks = $$('.stk', stack);
    const countEl = $('#copyCount');
    const phone = $('#phoneMini');
    const bubbleOut = $('.bubble--out', phone);
    const pdf = $('#pdfFly');
    const lam = $('#lam');
    const rolls = $$('.lam__roll', lam);
    const card = $('#lamCard');
    const gloss = $('.lam-card__gloss', card);
    const badge = $('.lam-badge', sc);
    const count = { v: 0 };
    const showCount = () => { countEl.textContent = Math.round(count.v); };
    let shown = 0;
    const screen = (k, t) => { tl.to(screens[shown], { opacity: 0, duration: 0.2 }, t).to(screens[k], { opacity: 1, duration: 0.2 }, t); shown = k; };
    const countTo = (v, t) => tl.to(count, { v, duration: 0.6, ease: 'none', onUpdate: showCount }, t);
    // a sheet slides out of the slot, then joins the pile
    const printPage = (k, t) => tl.to(pages[k], { yPercent: 0, duration: 0.8, ease: 'power1.out' }, t)
      .to(pages[k], { autoAlpha: 0, duration: 0.3 }, t + 0.9)
      .to(stks[k], { autoAlpha: 1, duration: 0.2 }, t + 0.9);

    gsap.set(mc, { autoAlpha: 1, y: u(6) });
    gsap.set(scan, { autoAlpha: 0 });
    gsap.set(pages, { y: 0, yPercent: -102 });
    gsap.set(colorBits, { filter: 'grayscale(1)' });
    gsap.set(stack, { autoAlpha: 0, scale: 0.8 });
    gsap.set(stks, { autoAlpha: 0 });
    gsap.set(phone, { autoAlpha: 0, x: -u(10) });
    gsap.set(bubbleOut, { autoAlpha: 0, y: u(2) });
    gsap.set(pdf, { autoAlpha: 0, scale: 0.6 });
    gsap.set(lam, { autoAlpha: 0, y: u(14) });
    gsap.set(card, { x: -u(64), autoAlpha: 0 });
    gsap.set(gloss, { autoAlpha: 0 });
    gsap.set(badge, { autoAlpha: 0, scale: 0.6 });
    count.v = 0; showCount();

    // photocopy
    tl.to(mc, { y: 0, duration: 0.5 }, 0)
      .to(scan, { autoAlpha: 1, duration: 0.1 }, 0.3)
      .fromTo(scan, { x: -u(9) }, { x: u(52), duration: 0.7, ease: 'power1.inOut', repeat: 1, yoyo: true }, 0.3)
      .to(scan, { autoAlpha: 0, duration: 0.1 }, 1.7)
      .to(stack, { autoAlpha: 1, scale: 1, duration: 0.4 }, 1.8);
    printPage(0, 1.1);
    countTo(25, 1.9);
    // black & white
    screen(1, 2.4);
    printPage(1, 2.6);
    countTo(40, 3.4);
    // colour
    screen(2, 3.9);
    tl.to(inks, { scale: 1.6, duration: 0.2, stagger: 0.08, yoyo: true, repeat: 1 }, 3.9);
    printPage(2, 4.1);
    tl.to(colorBits, { filter: 'grayscale(0)', duration: 0.5 }, 4.6);
    countTo(60, 5.1);
    // PDF from WhatsApp
    tl.to(phone, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power3.out' }, 6)
      .to(bubbleOut, { autoAlpha: 1, y: 0, duration: 0.3 }, 6.5)
      .to(pdf, { autoAlpha: 1, scale: 1, duration: 0.25 }, 6.9)
      .to(pdf, { keyframes: { x: [0, u(20), u(39)], y: [0, -u(36), -u(26)], easeEach: 'sine.inOut' }, duration: 0.8, ease: 'none' }, 7)
      .to(pdf, { scale: 0.3, autoAlpha: 0, duration: 0.25 }, 7.7);
    screen(3, 7.75);
    printPage(3, 7.9);
    countTo(100, 8.7);
    // lamination
    tl.to([mc, phone], { autoAlpha: 0, y: -u(6), duration: 0.5 }, 9.3)
      .to(lam, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 9.5)
      .to(card, { autoAlpha: 1, duration: 0.2 }, 10)
      .to(card, { x: 0, duration: 1.6, ease: 'none' }, 10.1)
      .to(rolls, { rotation: 720, duration: 1.6, ease: 'none' }, 10.1)
      .to(gloss, { autoAlpha: 1, duration: 0.1 }, 10.9)
      .to(badge, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 11.8)
      .to({}, { duration: 0.5 });
  }, 3);

  /* 06 — Bills: services orbit in, Bijli is picked, amount, pay, success, receipt */
  story('#st-bill', [0, 0.19, 0.42, 0.59, 0.77], '#scBill', (tl, u, sc) => {
    const bubs = $$('.bub', sc);
    const oks = $$('.bub__ok', sc);
    const ph = $('#ph');
    const [home, form, done] = $$('.scr', ph);
    const typed = $('.scr__type', ph);
    const bill = $('.scr__bill', ph);
    const amtEl = $('#billAmt');
    const pay = $('.scr__pay', ph);
    const tickC = $('.scr__tick circle', ph);
    const tickP = $('.scr__tick path', ph);
    const receipt = $('#receipt');
    const bits = $$('i', confetti);
    const amt = { v: 1240 };
    const showAmt = () => { amtEl.textContent = Math.round(amt.v).toLocaleString('en-IN'); };
    const pos = el => [parseFloat(el.style.getPropertyValue('--x')) || 0, parseFloat(el.style.getPropertyValue('--y')) || 0];

    // each bubble starts further out, swung round by 55 degrees
    bubs.forEach(b => {
      const [x, y] = pos(b);
      const a = 55 * Math.PI / 180;
      const ix = (x * Math.cos(a) - y * Math.sin(a)) * 1.7;
      const iy = (x * Math.sin(a) + y * Math.cos(a)) * 1.7;
      gsap.set(b, { x: u(ix - x), y: u(iy - y), autoAlpha: 0, scale: 0.4 });
    });
    gsap.set(oks, { scale: 0 });
    gsap.set(ph, { y: u(14), autoAlpha: 0, rotation: -6 });
    gsap.set(home, { autoAlpha: 1, xPercent: 0 });
    gsap.set(form, { autoAlpha: 0, xPercent: 100 });
    gsap.set(done, { autoAlpha: 0 });
    gsap.set(typed, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(bill, { autoAlpha: 0, scale: 0.85 });
    gsap.set(pay, { autoAlpha: 0.4 });
    gsap.set(tickC, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(tickP, { strokeDashoffset: 34 });
    gsap.set(receipt, { x: -u(29), y: -u(25), autoAlpha: 0, scale: 0.6, rotation: -6 });
    gsap.set(bits, { x: 0, y: 0, autoAlpha: 0 });
    amt.v = 0; showAmt();

    const [bx, by] = pos(bubs[0]);
    tl.to(ph, { y: 0, autoAlpha: 1, rotation: 0, duration: 0.8, ease: 'power3.out' }, 0)
      .to(bubs, { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 1.1, stagger: 0.1, ease: 'power3.out' }, 0.2)
      // pick Bijli
      .to(bubs[0], { scale: 1.2, duration: 0.3 }, 1.9)
      .to(bubs[0], { x: u(-bx), y: u(-by), scale: 0.3, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, 2.2)
      .to(home, { autoAlpha: 0, xPercent: -30, duration: 0.4 }, 2.6)
      .to(form, { autoAlpha: 1, xPercent: 0, duration: 0.5, ease: 'power3.out' }, 2.6)
      .to(typed, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'steps(12)' }, 3.1)
      // bill fetched
      .to(bill, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, 4.2)
      .to(amt, { v: 1240, duration: 0.7, ease: 'power1.out', onUpdate: showAmt }, 4.3)
      .to(pay, { autoAlpha: 1, duration: 0.3 }, 4.9)
      .to(pay, { scale: 0.92, duration: 0.15, yoyo: true, repeat: 1 }, 5.5)
      // success
      .to(form, { autoAlpha: 0, duration: 0.3 }, 5.9)
      .to(done, { autoAlpha: 1, duration: 0.3 }, 6)
      .to(tickC, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, 6.1)
      .to(tickP, { strokeDashoffset: 0, duration: 0.45 }, 6.4)
      .to(bits, {
        x: i => Math.cos(i / bits.length * Math.PI * 2) * u(24 + (i % 3) * 7),
        y: i => Math.sin(i / bits.length * Math.PI * 2) * u(24 + (i % 4) * 6),
        rotation: i => 180 + i * 47, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.01
      }, 6.3)
      .to(bits, { autoAlpha: 0, duration: 0.4 }, 7.2)
      // receipt, and every service ticked
      .to(receipt, { x: 0, y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'power3.out' }, 7.7)
      .to(bubs[0], { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.6)' }, 8.4)
      .to(oks, { scale: 1, duration: 0.35, stagger: 0.12, ease: 'back.out(3)' }, 8.9)
      .to({}, { duration: 0.5 });
  }, 2.8);

  /* =========================================================
     Static fallback: finished frames, no loader
     ========================================================= */
  if (!motion) {
    $('#loader').remove();
    $('#progress').style.display = 'none';
    $$('.film__frame').forEach(f => f.classList.add('is-dev'));
    stories.forEach(s => {
      if (window.gsap) {
        const tl = gsap.timeline({ paused: true });
        runBuild(s, tl);
        tl.progress(1);
      }
      setStep(s, 1);
    });
    return;
  }

  /* =========================================================
     Motion
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ---------- hero: float, lean towards the pointer, drift on scroll ---------- */
  const heroScene = $('#heroScene');
  const heroItems = $$('.it', heroScene);
  gsap.set('.hero__title .ln > span', { yPercent: 110 });
  gsap.set(['.hero__pill', '.hero__lead', '.hero__cta', '.hero__facts'], { y: 24, autoAlpha: 0 });
  centre(heroItems);
  gsap.set(heroItems, { scale: 0, autoAlpha: 0 });
  function heroIntro() {
    gsap.to('.hero__title .ln > span', { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' });
    gsap.to(['.hero__pill', '.hero__lead', '.hero__cta', '.hero__facts'], { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.1, delay: 0.25, ease: 'power3.out' });
    gsap.to(heroItems, {
      scale: 1, autoAlpha: 1, duration: 1, stagger: 0.08, delay: 0.2, ease: 'back.out(1.6)',
      onComplete: () => heroItems.forEach((it, k) => gsap.to(it, { y: k % 2 ? 10 : -10, duration: 2.6 + (k % 3) * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }))
    });
  }
  if (!isTouch) {
    const lean = { x: 0, y: 0 };
    const apply = () => { heroScene.style.setProperty('--mx', lean.x); heroScene.style.setProperty('--my', lean.y); };
    $('#hero').addEventListener('pointermove', e => {
      gsap.to(lean, { x: (e.clientX / innerWidth - 0.5) * 30, y: (e.clientY / innerHeight - 0.5) * 22, duration: 1, ease: 'power3.out', overwrite: true, onUpdate: apply });
    });
  }
  gsap.to(heroScene, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- reveal on scroll ---------- */
  const reveal = (sel, opts = {}) => {
    const els = $$(sel);
    if (!els.length) return;
    gsap.set(els, { y: opts.y ?? 50, autoAlpha: 0 });
    ScrollTrigger.batch(els, {
      start: 'top 88%', once: true,
      onEnter: batch => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out', overwrite: true })
    });
  };
  reveal('#sevayein .head');
  reveal('.cat', { y: 70 });

  /* ---------- the six stories (rebuilt when the window size changes) ---------- */
  let storyCtx;
  function buildStories() {
    storyCtx = gsap.context(() => {
      stories.forEach(s => {
        s.cur = -1;
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: s.sec, start: 'top top', end: () => '+=' + innerHeight * s.length,
            pin: $('.story__pin', s.sec), scrub: 1, anticipatePin: 1,
            onUpdate: self => setStep(s, self.progress)
          }
        });
        runBuild(s, tl);
        setStep(s, 0);
      });
    });
  }
  buildStories();

  reveal('#kaagaz .head');
  reveal('.docs__tabs, .clip', { y: 60 });
  reveal('#process .head');
  reveal('.why .head');
  reveal('.why__card', { y: 60 });
  reveal('.contact__info, .order', { y: 60 });

  /* ---------- film strip: slides sideways, frames develop ---------- */
  const track = $('#filmTrack');
  gsap.to(track, {
    x: () => Math.min(0, innerWidth - track.scrollWidth), ease: 'none',
    scrollTrigger: { trigger: '#film', start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true }
  });
  ScrollTrigger.create({
    trigger: '#film', start: 'top 75%', once: true,
    onEnter: () => $$('.film__frame').forEach((f, k) => setTimeout(() => f.classList.add('is-dev'), k * 380))
  });

  let lastW = innerWidth, lastH = innerHeight, resizeT;
  addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const wChanged = innerWidth !== lastW;
      const hChanged = Math.abs(innerHeight - lastH) > 1;
      if (!wChanged && (isTouch || !hChanged)) return;
      lastW = innerWidth; lastH = innerHeight;
      storyCtx.revert();
      buildStories();
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 250);
  });

  /* ---------- loader: count up, then dive into the lens ---------- */
  const loader = $('#loader');
  const countEl = $('#loaderCount');
  const flashbulb = $('#flashbulb');
  body.classList.add('is-loading');
  if (lenis) lenis.stop();
  const lc = { v: 0 };
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('#loaderMark', { scale: 0, rotation: -180, duration: 1, ease: 'back.out(1.4)' }, 0)
    .from('.loader__word', { y: 24, autoAlpha: 0, duration: 0.7 }, 0.3)
    .to(lc, { v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => { countEl.textContent = Math.round(lc.v); } }, 0)
    .to(['.loader__word', '.loader__count'], { autoAlpha: 0, duration: 0.3 }, 1.45)
    .to('#loaderMark', { scale: 70, rotation: 60, duration: 0.9, ease: 'expo.in' }, 1.5)
    .to(flashbulb, { opacity: 1, duration: 0.08, ease: 'none' }, 2.32)
    .add(() => {
      loader.remove();
      body.classList.remove('is-loading');
      if (lenis) lenis.start();
      heroIntro();
      ScrollTrigger.refresh();
    }, 2.42)
    .to(flashbulb, { opacity: 0, duration: 0.8, ease: 'power2.out' }, 2.45);
})();
