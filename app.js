/*! Click & Care Animations v2 (with smooth details + reveal) */
(function(){
  // Mobile nav
  const menuBtn = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn){ menuBtn.addEventListener('click', () => navLinks.classList.toggle('open')); }

  // Reveal-on-scroll
  try {
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:0.12, rootMargin:"0px 0px -40px 0px"});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  } catch(e){
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));
  }

  // Preferences
  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const url = new URL(window.location.href);
  const forceAnim = url.searchParams.get('anim') === 'on';
  const allowAnim = forceAnim || !prefersReduce;

  // Smooth <details> dropdowns + one-open-at-a-time
  (function enhanceDetails(){
    const detailsNodes = Array.from(document.querySelectorAll('details'));
    if (!detailsNodes.length) return;

    function wrapContent(d){
      if (d.__wrapped) return d.querySelector('.dd-content');
      const kids = Array.from(d.children);
      const summary = kids.find(c => c.tagName && c.tagName.toLowerCase() === 'summary');
      const rest = kids.filter(c => c !== summary);
      const wrap = document.createElement('div');
      wrap.className = 'dd-content';
      rest.forEach(n => wrap.appendChild(n));
      d.appendChild(wrap);
      d.__wrapped = true;
      return wrap;
    }

    function animHeight(el, from, to, opts){
      if (!allowAnim) { el.style.height=''; return {cancel:()=>{},onfinish:null,oncancel:null}; }
      if (el.__anim) el.__anim.cancel();
      el.style.overflow = 'hidden';
      const a = el.animate([{height: from+'px'},{height: to+'px'}], Object.assign({
        duration: to>from ? 260 : 200,
        easing: to>from ? 'cubic-bezier(.22,.61,.36,1)' : 'cubic-bezier(.4,0,.2,1)'
      }, opts||{}));
      el.__anim = a;
      a.onfinish = ()=>{ el.style.height=''; el.style.overflow=''; el.__anim=null; if(opts&&opts.onfinish)opts.onfinish(); };
      a.oncancel = ()=>{ el.__anim=null; if(opts&&opts.oncancel)opts.oncancel(); };
      return a;
    }

    function closeOthers(current){
      detailsNodes.forEach(d => {
        if (d !== current && d.open){
          const c = wrapContent(d);
          const from = c.offsetHeight;
          animHeight(c, from, 0, { onfinish: () => { d.open = false; } });
        }
      });
    }

    detailsNodes.forEach(d => {
      const summary = d.querySelector('summary');
      if (!summary) return;

      const content = wrapContent(d);
      if (!d.open) { content.style.height='0px'; content.style.overflow='hidden'; }

      function toggle(expand){
        if (expand){
          d.open = true;
          const from = content.offsetHeight;
          const to = content.scrollHeight;
          closeOthers(d);
          animHeight(content, from, to);
        } else {
          const from = content.offsetHeight;
          animHeight(content, from, 0, { onfinish: ()=>{ d.open = false; } });
        }
      }

      summary.addEventListener('click', (e) => { e.preventDefault(); toggle(!d.open); });
      summary.addEventListener('keydown', (e)=>{
        const key = e.key || e.code;
        if (key === 'Enter' || key === ' ' || key === 'Spacebar'){ e.preventDefault(); toggle(!d.open); }
      });
    });
  })();

  window.__clickCareAnim = { allowAnim: allowAnim, version: 'v2' };
})();