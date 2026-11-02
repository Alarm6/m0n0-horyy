from pathlib import Path
import re
root = Path(__file__).parent / 'dist'
p = root / 'index.html'
s = p.read_text(encoding='utf-8')
s = re.sub(r'<h([1-3])\b[^>]*>.*?</h\1>', lambda m: m[0].replace('.', ''), s, flags=re.S)
s = s.replace('SKINCARE, SIMPLIFIED.', 'SKINCARE, SIMPLIFIED').replace('ЕЖЕДНЕВНАЯ ЗАБОТА. БЕЗ ЛИШНЕГО.', 'ЕЖЕДНЕВНАЯ ЗАБОТА · БЕЗ ЛИШНЕГО').replace('МЕНЬШЕ ШАГОВ. БОЛЬШЕ ЗАБОТЫ.', 'МЕНЬШЕ ШАГОВ · БОЛЬШЕ ЗАБОТЫ').replace('less, but better.', 'less, but better')
s = re.sub(r'<div class="bottle large olive">.*?</div></div><span class="product-shadow">', '<div class="photo-bottle hero-bottle" style="--bottle-image:url(assets/horyy01.png)"><img src="assets/horyy01.png" alt="Фотореалистичный оливковый флакон Horyy01" fetchpriority="high"><span class="bottle-reflection" aria-hidden="true"></span></div><span class="product-shadow">', s, count=1)
s = s.replace('<div class="mini-bottle">01</div>', '<img class="mini-photo" src="assets/horyy01.png" alt="" width="54" height="76">')
s = s.replace('<div class="hill h1"></div><div class="hill h2"></div><div class="hill h3"></div>', '<img class="meadow-photo" src="assets/meadow.png" alt="Зелёные луговые холмы в мягком солнечном свете" loading="lazy"><div class="meadow-light" aria-hidden="true"></div>')
p.write_text(s, encoding='utf-8')
p = root / 'app.js'
s = p.read_text(encoding='utf-8')
start = s.index('function bottle(p)')
end = s.index('\nfunction render(', start)
s = s[:start] + '''function bottle(p){const src='assets/'+p.name.toLowerCase()+'.png';return `<div class="photo-bottle" style="--bottle-image:url(${src})"><img src="${src}" alt="Флакон ${p.name}" loading="lazy" width="1024" height="1536"><span class="bottle-reflection" aria-hidden="true"></span></div>`}''' + s[end:]
s += '''
// One passive scroll listener, one scheduled frame; lighting follows viewport position.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let lightingFrame=0;
function updateLighting(){lightingFrame=0;const height=window.innerHeight;document.querySelectorAll('.photo-bottle,.nature-art').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom< -100||r.top>height+100)return;const progress=reducedMotion.matches?.5:Math.max(0,Math.min(1,(height-r.top)/(height+r.height)));el.style.setProperty('--light-x',(12+progress*76).toFixed(2)+'%');el.style.setProperty('--light-y',(25+progress*35).toFixed(2)+'%');el.style.setProperty('--light-opacity',(.12+Math.sin(progress*Math.PI)*.22).toFixed(3));el.style.setProperty('--exposure',(.94+Math.sin(progress*Math.PI)*.12).toFixed(3));el.style.setProperty('--reflection-angle',(-24+progress*38).toFixed(2)+'deg');el.style.setProperty('--meadow-shift',(-13+progress*26).toFixed(2)+'px')})}
function scheduleLighting(){if(!lightingFrame)lightingFrame=requestAnimationFrame(updateLighting)}
window.addEventListener('scroll',scheduleLighting,{passive:true});window.addEventListener('resize',scheduleLighting,{passive:true});
document.getElementById('productDialog').addEventListener('scroll',scheduleLighting,{passive:true});
new MutationObserver(scheduleLighting).observe(document.getElementById('products'),{childList:true});
new MutationObserver(scheduleLighting).observe(document.getElementById('productDetail'),{childList:true});
reducedMotion.addEventListener('change',scheduleLighting);scheduleLighting();
'''
p.write_text(s, encoding='utf-8')
