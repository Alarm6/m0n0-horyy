const products=[{name:'horyy01',goal:'Глубокое увлажнение',category:'hydra',color:'olive',active:'Гиалуроновая кислота + B5',en:'DAILY HYDRATION',price:2490,desc:'Лёгкая сыворотка для ежедневного ритуала увлажнения. Для кожи, которой хочется мягкости и комфорта.',use:'Наносите утром или вечером на слегка влажную кожу, затем используйте крем.'},{name:'horyy02',goal:'Естественное сияние',category:'glow',color:'amber',active:'Витамин C + феруловая кислота',en:'EVERYDAY GLOW',price:2790,desc:'Утренний ритуал для тусклой кожи. Нежная текстура и фокус на свежем, отдохнувшем виде.',use:'Наносите утром на очищенную сухую кожу. Завершите уход кремом и SPF.'},{name:'horyy03',goal:'Баланс и спокойствие',category:'balance',color:'blue',active:'Ниацинамид + цинк',en:'PURE BALANCE',price:2590,desc:'Минималистичный уход для комбинированной кожи и кожи с жирным блеском. Лёгкая текстура без ощущения тяжести.',use:'Наносите утром или вечером перед кремом. Начните с применения через день.'},{name:'horyy04',goal:'Вечернее восстановление',category:'restore',color:'purple',active:'Пептиды + сквалан',en:'NIGHT RECOVERY',price:2990,desc:'Завершающий акцент неспешного вечера. Питательная сыворотка для кожи, которой нужен дополнительный комфорт.',use:'Наносите вечером на очищенную кожу перед кремом.'}];
let cart={};try{cart=JSON.parse(localStorage.getItem('horyy-cart')||'{}')}catch{};for(const k of Object.keys(cart))if(!products[k]||!Number.isInteger(cart[k])||cart[k]<1)delete cart[k];const money=n=>n.toLocaleString('ru-RU')+' ₽';
const imagePlaceholder='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const deferredImages='IntersectionObserver' in window?new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>{if(!isIntersecting)return;if(target.dataset.srcset){target.srcset=target.dataset.srcset;delete target.dataset.srcset}target.src=target.dataset.src;delete target.dataset.src;deferredImages.unobserve(target)})},{rootMargin:'250px 0px'}):null;
function observeDeferredImages(){document.querySelectorAll('img[data-src]').forEach(img=>{if(deferredImages)deferredImages.observe(img);else{if(img.dataset.srcset)img.srcset=img.dataset.srcset;img.src=img.dataset.src;delete img.dataset.src}})}
function bottle(p,eager=false){const src=p.name==='horyy01'?'assets/horyy01-diffuse.webp':'assets/'+p.name+'-small.webp';const immediate=eager||p.name==='horyy01';return `<div class="photo-bottle"><img src="${immediate?src:imagePlaceholder}" ${immediate?'':`data-src="${src}"`} alt="Флакон ${p.name}" decoding="async" width="${p.name==='horyy01'?768:512}" height="${p.name==='horyy01'?1152:768}"><span class="bottle-reflection" aria-hidden="true"></span></div>`}
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

// Damped angular springs approximate gravity and inertia at the serum meniscus.
(() => {
  const rig = document.querySelector('.bottle-rig');
  if (!rig) return;
  const bottle = rig.querySelector('.hero-closed');
  const image = bottle.querySelector('img');
  const canvas = bottle.querySelector('canvas');
  const ctx = canvas.getContext('2d', {alpha:true});
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0, last = 0, inside = false, visible = true, bounds;
  let tx = 0, ty = 0, rx = 0, ry = 0, roll = 0;
  let liquid = 0, liquidVelocity = 0, ripple = 0, rippleVelocity = 0, phase = 0;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const enabled = () => ctx && finePointer.matches && !reduced.matches && visible && !document.hidden;

  function size() {
    bounds = rig.getBoundingClientRect();
    const width = Math.min(image.naturalWidth || 768, Math.round(rig.clientWidth * Math.min(devicePixelRatio || 1, 2)));
    canvas.width = Math.max(1,width);
    canvas.height = Math.round(canvas.width * 1.5);
  }

  function paintLiquid() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (!image.complete || !image.naturalWidth) return;
    const w=canvas.width,h=canvas.height;
    const left=w*.325,right=w*.695,top=h*.40,band=h*.075;
    const slope=Math.tan(liquid*Math.PI/180);
    const scale=image.naturalWidth/w;
    const step=(right-left)/72;
    // Refract only the photographed meniscus, strictly inside the glass and above all lettering.
    for(let i=0;i<72;i++){
      const n=i/71,x=left+i*step;
      const envelope=Math.pow(Math.sin(n*Math.PI),.7);
      const wave=(Math.sin(n*Math.PI*2+phase)*ripple*.85+Math.sin(n*Math.PI*3-phase*.6)*ripple*.18)*h/600;
      const shift=clamp(((x-w*.51)*slope+wave)*envelope,-h*.012,h*.012);
      ctx.drawImage(image,x*scale,(top-shift)*scale,(step+.3)*scale,band*scale,x,top,step+.3,band);
    }
    const edge=ctx.createLinearGradient(left,0,right,0);
    edge.addColorStop(0,'transparent');edge.addColorStop(.1,'#000');edge.addColorStop(.9,'#000');edge.addColorStop(1,'transparent');
    ctx.globalCompositeOperation='destination-in';ctx.fillStyle=edge;ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';
  }

  function reset() {
    cancelAnimationFrame(frame); frame=0; last=0; inside=false;
    tx=ty=rx=ry=roll=liquid=liquidVelocity=ripple=rippleVelocity=0;
    bottle.style.transform='';
    rig.classList.remove('is-active');
    ctx?.clearRect(0,0,canvas.width,canvas.height);
  }

  function tick(now) {
    frame=0;
    if (!enabled()) {reset();return;}
    const dt = last ? Math.min((now-last)/1000,.032) : 1/60;
    last=now;
    const follow=1-Math.exp(-10*dt);
    const oldRoll=roll, oldRx=rx;
    rx += (-ty*2-rx)*follow;
    ry += (tx*3-ry)*follow;
    roll += (tx*1.2-roll)*follow;
    // The liquid seeks a level horizon and overshoots after angular acceleration.
    liquidVelocity += ((-roll-liquid)*30-liquidVelocity*4.2)*dt - (roll-oldRoll)*22;
    liquid += liquidVelocity*dt;
    liquid=clamp(liquid,-6,6);
    rippleVelocity += (-ripple*48-rippleVelocity*4.5)*dt + (roll-oldRoll)*48 + (rx-oldRx)*16;
    ripple += rippleVelocity*dt;
    ripple=clamp(ripple,-6,6);
    phase += dt*4.5;
    bottle.style.transform=`perspective(1100px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${roll.toFixed(3)}deg)`;
    paintLiquid();
    const energy=Math.abs(rx+ty*2)+Math.abs(ry-tx*3)+Math.abs(roll-tx*1.2)+Math.abs(liquid+roll)+Math.abs(liquidVelocity)+Math.abs(ripple)+Math.abs(rippleVelocity);
    if (energy>.025) frame=requestAnimationFrame(tick);
    else if (!inside) reset();
  }

  function start() {
    if (!enabled() || frame) return;
    rig.classList.add('is-active');last=0;frame=requestAnimationFrame(tick);
  }
  rig.addEventListener('pointerenter',e=>{
    if (e.pointerType!=='mouse' || !enabled()) return;
    bounds=rig.getBoundingClientRect();inside=true;start();
  });
  rig.addEventListener('pointermove',e=>{
    if (e.pointerType!=='mouse' || !enabled()) return;
    bounds ||= rig.getBoundingClientRect();
    tx=clamp((e.clientX-bounds.left-bounds.width*.5)/(bounds.width*.30),-1,1);
    ty=clamp((e.clientY-bounds.top-bounds.height*.5)/(bounds.height*.5),-1,1);
    inside=true;start();
  },{passive:true});
  rig.addEventListener('pointerleave',()=>{inside=false;tx=ty=0;start()});
  rig.addEventListener('pointercancel',reset);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)reset()}).observe(rig);
  new ResizeObserver(()=>{size();reset()}).observe(rig);
  addEventListener('scroll',()=>{bounds=null},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
  reduced.addEventListener('change',reset);
  finePointer.addEventListener('change',reset);
  image.addEventListener('load',size,{once:true});
  size();
})();
