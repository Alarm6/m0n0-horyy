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
  const tiltX = 3.2, tiltY = 5, tiltRoll = 1.8;
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
    rx += (-ty*tiltX-rx)*follow;
    ry += (tx*tiltY-ry)*follow;
    roll += (tx*tiltRoll-roll)*follow;
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
    const energy=Math.abs(rx+ty*tiltX)+Math.abs(ry-tx*tiltY)+Math.abs(roll-tx*tiltRoll)+Math.abs(liquid+roll)+Math.abs(liquidVelocity)+Math.abs(ripple)+Math.abs(rippleVelocity);
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
