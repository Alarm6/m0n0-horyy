const products=[{name:'horyy01',goal:'Глубокое увлажнение',category:'hydra',color:'olive',active:'Гиалуроновая кислота + B5',en:'DAILY HYDRATION',price:2490,desc:'Лёгкая сыворотка для ежедневного ритуала увлажнения. Для кожи, которой хочется мягкости и комфорта.',use:'Наносите утром или вечером на слегка влажную кожу, затем используйте крем.'},{name:'horyy02',goal:'Естественное сияние',category:'glow',color:'amber',active:'Витамин C + феруловая кислота',en:'EVERYDAY GLOW',price:2790,desc:'Утренний ритуал для тусклой кожи. Нежная текстура и фокус на свежем, отдохнувшем виде.',use:'Наносите утром на очищенную сухую кожу. Завершите уход кремом и SPF.'},{name:'horyy03',goal:'Баланс и спокойствие',category:'balance',color:'blue',active:'Ниацинамид + цинк',en:'PURE BALANCE',price:2590,desc:'Минималистичный уход для комбинированной кожи и кожи с жирным блеском. Лёгкая текстура без ощущения тяжести.',use:'Наносите утром или вечером перед кремом. Начните с применения через день.'},{name:'horyy04',goal:'Вечернее восстановление',category:'restore',color:'purple',active:'Пептиды + сквалан',en:'NIGHT RECOVERY',price:2990,desc:'Завершающий акцент неспешного вечера. Питательная сыворотка для кожи, которой нужен дополнительный комфорт.',use:'Наносите вечером на очищенную кожу перед кремом.'}];
let cart={};try{cart=JSON.parse(localStorage.getItem('horyy-cart')||'{}')}catch{};for(const k of Object.keys(cart))if(!products[k]||!Number.isInteger(cart[k])||cart[k]<1)delete cart[k];const money=n=>n.toLocaleString('ru-RU')+' ₽';
const imagePlaceholder='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const deferredImages='IntersectionObserver' in window?new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>{if(!isIntersecting)return;if(target.dataset.srcset){target.srcset=target.dataset.srcset;delete target.dataset.srcset}target.src=target.dataset.src;delete target.dataset.src;deferredImages.unobserve(target)})},{rootMargin:'250px 0px'}):null;
function observeDeferredImages(){document.querySelectorAll('img[data-src]').forEach(img=>{if(deferredImages)deferredImages.observe(img);else{if(img.dataset.srcset)img.srcset=img.dataset.srcset;img.src=img.dataset.src;delete img.dataset.src}})}
function bottle(p,eager=false){const src='assets/'+p.name+'-small.webp';const immediate=eager||p.name==='horyy01';return `<div class="photo-bottle"><img src="${immediate?src:imagePlaceholder}" ${immediate?'':`data-src="${src}"`} alt="Флакон ${p.name}" decoding="async" width="${p.name==='horyy01'?768:512}" height="${p.name==='horyy01'?1152:768}"><span class="bottle-reflection" aria-hidden="true"></span></div>`}
function render(filter='all'){document.getElementById('products').innerHTML=products.map((p,i)=>filter==='all'||filter===p.category?`<article class="card" data-product-index="${i}"><div class="card-visual" role="button" tabindex="0" onclick="showProduct(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showProduct(${i})}" aria-label="Подробнее о ${p.name}"><span class="tag">${p.en}</span>${bottle(p)}</div><div class="card-info"><div><h3><a href="#" onclick="event.preventDefault();showProduct(${i})">${p.name}</a></h3><p>${p.goal} · 30 мл</p></div><button class="add" onclick="add(${i})" aria-label="Добавить ${p.name} в корзину">+</button></div><div class="price">${money(p.price)}</div></article>`:'').join('');observeDeferredImages()}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.filter)});
function sync(){localStorage.setItem('horyy-cart',JSON.stringify(cart));document.getElementById('count').textContent=Object.values(cart).reduce((a,b)=>a+b,0)}
let toastTimer;function add(i){cart[i]=(cart[i]||0)+1;sync();const t=document.getElementById('toast');t.textContent=products[i].name+' — в вашей корзине';t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),2200)}
function showProduct(i){const p=products[i];document.getElementById('productDetail').innerHTML=`<div class="detail-bottle">${bottle(p,true)}</div><div class="detail-copy"><span class="eyebrow">${p.en} / 30 МЛ</span><h2>${p.name}</h2><h3>${p.goal}</h3><p>${p.desc}</p><h3>В центре формулы</h3><p>${p.active}</p><h3>Как использовать</h3><p>${p.use}</p><p class="demo-note">Иллюстративная формула концептуального продукта. Состав и свойства требуют подтверждения перед запуском продаж.</p><button class="pill" onclick="add(${i})">Добавить в корзину <span>${money(p.price)} +</span></button></div>`;document.getElementById('productDialog').showModal()}
function renderCart(){document.getElementById('cartItems').innerHTML=Object.keys(cart).length?Object.entries(cart).map(([i,q])=>`<div class="cart-row"><div>${products[i].name}<br><small>${money(products[i].price)}</small></div><div class="quantity"><button onclick="change(${i},-1)" aria-label="Убрать одну ${products[i].name}">−</button><span>${q}</span><button onclick="change(${i},1)" aria-label="Добавить одну ${products[i].name}">+</button></div></div>`).join(''):'<p class="demo-note">Здесь пока пусто. Найдите свою первую формулу в коллекции.</p>';document.getElementById('cartTotal').textContent=Object.keys(cart).length?'Итого: '+money(Object.entries(cart).reduce((s,[i,q])=>s+products[i].price*q,0)):''}
function change(i,n){cart[i]+=n;if(cart[i]<=0)delete cart[i];sync();renderCart()}function openCart(){renderCart();document.getElementById('cartDialog').showModal()}document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));render();sync();

// One passive scroll listener, one scheduled frame; lighting follows viewport position.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let lightingFrame=0;
function updateLighting(){lightingFrame=0;const height=window.innerHeight;document.querySelectorAll('.photo-bottle,.nature-art').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom< -100||r.top>height+100)return;const progress=reducedMotion.matches ? .5 : Math.max(0,Math.min(1,(height-r.top)/(height+r.height)));el.style.setProperty('--light-x',(12+progress*76).toFixed(2)+'%');el.style.setProperty('--light-y',(25+progress*35).toFixed(2)+'%');el.style.setProperty('--light-opacity',(.12+Math.sin(progress*Math.PI)*.22).toFixed(3));el.style.setProperty('--exposure',(.94+Math.sin(progress*Math.PI)*.12).toFixed(3));el.style.setProperty('--reflection-angle',(-24+progress*38).toFixed(2)+'deg');el.style.setProperty('--light-warmth',(.18+progress*.42).toFixed(3));el.style.setProperty('--cloud-x',(-28+progress*55).toFixed(2)+'%');el.style.setProperty('--cloud-opacity',(.16+Math.sin(progress*Math.PI)*.2).toFixed(3));el.style.setProperty('--meadow-shift',(-13+progress*26).toFixed(2)+'px');if(el.classList.contains('landscape-scene')){el.style.setProperty('--exposure','1');el.style.setProperty('--cloud-drift',(-22+progress*44).toFixed(2)+'vw');el.style.setProperty('--cloud-return',(16-progress*32).toFixed(2)+'vw');el.style.setProperty('--cloud-rise',(8-progress*16).toFixed(2)+'px');el.style.setProperty('--sun-position',(18+progress*65).toFixed(2)+'%')}})}
function scheduleLighting(){if(!lightingFrame)lightingFrame=requestAnimationFrame(updateLighting)}
window.addEventListener('load',scheduleLighting,{once:true});window.addEventListener('scroll',scheduleLighting,{passive:true});window.addEventListener('resize',scheduleLighting,{passive:true});
document.getElementById('productDialog').addEventListener('scroll',scheduleLighting,{passive:true});
new MutationObserver(scheduleLighting).observe(document.getElementById('products'),{childList:true});
new MutationObserver(scheduleLighting).observe(document.getElementById('productDetail'),{childList:true});
reducedMotion.addEventListener('change',scheduleLighting);scheduleLighting();

observeDeferredImages();

// The same closed bottle moves from the hero to its actual catalogue position.
(() => {
  const hero = document.querySelector('.hero-stage');
  const slot = document.querySelector('.hero-closed');
  const catalogue = document.getElementById('collection');
  const flight = document.getElementById('bottle-flight');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1,n));
  const lerp = (a,b,t) => a + (b-a)*t;
  const phase = (p,a,b) => clamp((p-a)/(b-a));
  const ease = t => t*t*(3-2*t);
  let pending = false;
  document.documentElement.classList.add('flight-ready');
  function draw() {
    pending = false;
    const target = catalogue.querySelector('[data-product-index="0"] .photo-bottle');
    const cards = catalogue.querySelectorAll('.card');
    const y = window.scrollY;
    const sourceRect = slot.getBoundingClientRect();
    const targetRect = target?.getBoundingClientRect();
    const reduced = motion.matches;
    const narrow = innerWidth <= 800;
    const landingY = innerHeight * (narrow ? .87 : .34);
    const start = 30;
    const end = targetRect ? targetRect.top + y - landingY : start + 1;
    const p = reduced || !target ? 1 : clamp((y-start)/Math.max(1,end-start));
    const t = ease(p);
    const active = !reduced && !!target && y < end;
    slot.style.visibility = reduced || !target ? 'visible' : 'hidden';
    catalogue.style.setProperty('--first-bottle-visibility', active ? 'hidden' : 'visible');
    flight.style.visibility = active ? 'visible' : 'hidden';
    if (active) {
      const fromY = sourceRect.top + y - Math.min(y,start);
      const x = lerp(sourceRect.left,targetRect.left,t);
      const top = lerp(fromY,narrow ? targetRect.top : landingY,t);
      flight.style.width = lerp(sourceRect.width,targetRect.width,t)+'px';
      flight.style.height = lerp(sourceRect.height,targetRect.height,t)+'px';
      flight.style.transform = `translate3d(${x}px,${top}px,0) rotate(${-4*(1-t)}deg)`;
      flight.style.setProperty('--turn', (Math.sin(p*Math.PI)*9)+'deg');
      const sunlight = Math.sin(phase(p,0,.86)*Math.PI);
      flight.style.setProperty('--glint-x',(110-p*140)+'%');
      flight.style.setProperty('--glint-opacity',(sunlight*.28).toFixed(3));
      const exposure = parseFloat(getComputedStyle(target).getPropertyValue('--exposure')) || 1;
      flight.style.setProperty('--flight-brightness',(lerp(1,exposure,t)-sunlight*.06).toFixed(3));
      flight.style.setProperty('--flight-saturation',(1+sunlight*.10).toFixed(3));
    }
    const copy = reduced ? 1 : 1-ease(phase(p,.04,.5));
    hero.style.setProperty('--hero-copy-opacity',copy.toFixed(3));
    hero.style.setProperty('--hero-copy-shift',(-24*(1-copy))+'px');
    hero.style.setProperty('--hero-halo-opacity',(.6*copy).toFixed(3));
    catalogue.style.setProperty('--catalogue-opacity',reduced ? '1' : ease(phase(p,narrow ? .4 : .15,narrow ? .75 : .5)).toFixed(3));
    cards.forEach(card => {
      const index = Number(card.dataset.productIndex);
      const reveal = reduced || !target ? 1 : ease(phase(p,.40+index*.06,.70+index*.06));
      card.style.setProperty('--card-opacity',reveal.toFixed(3));
      card.style.setProperty('--card-shift',(24*(1-reveal))+'px');
    });
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(draw)}}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  addEventListener('load',schedule,{once:true});
  motion.addEventListener('change',schedule);
  new MutationObserver(schedule).observe(document.getElementById('products'),{childList:true});
  new ResizeObserver(schedule).observe(catalogue);
  document.fonts?.ready.then(schedule);
  slot.querySelector('img').addEventListener('load',schedule,{once:true});
  draw();
})();
