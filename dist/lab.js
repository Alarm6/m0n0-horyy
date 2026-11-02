import * as THREE from './assets/vendor/three-r170.min.js';

const stage=document.getElementById('stage');
const loading=document.getElementById('loading');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{
  loading.hidden=true;loading.style.display='none';document.getElementById('fallback').hidden=false;
  document.querySelectorAll('.controls button').forEach(b=>b.disabled=true);
}
if(renderer) initialise();

async function initialise(){
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.setClearColor(0xf2f2ed,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  stage.prepend(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(31,1,.1,50);
  camera.position.set(0,1.05,10.6);camera.lookAt(0,.34,0);
  const rig=new THREE.Group();scene.add(rig);
  const profile=p=>p.map(([r,y])=>new THREE.Vector2(r,y));
  const lathe=(p,material,n=96)=>new THREE.Mesh(new THREE.LatheGeometry(profile(p),n),material);

  // A compact procedural studio environment: real reflections, no painted highlight layer.
  function environment(side=false){
    const studio=new THREE.Scene();studio.background=new THREE.Color(side?0x555b4b:0xc8cbbf);
    const wall=new THREE.Mesh(new THREE.BoxGeometry(16,14,16),new THREE.MeshBasicMaterial({color:side?0x757e65:0xbfc5b1,side:THREE.BackSide}));studio.add(wall);
    function box(w,h,x,y,z,intensity){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(1,.97,.88).multiplyScalar(intensity),side:THREE.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,.2,0);studio.add(p);}
    box(side?1.4:2.8,7,-3.7,2,4.5,side?6:3);
    box(.7,5,3.4,.8,2.6,side?.4:1.3);
    box(3,3,.5,5,-3.5,side?3.2:2.5);
    box(5,1,0,-3,4,1.1);
    const pmrem=new THREE.PMREMGenerator(renderer);const result=pmrem.fromScene(studio,.045,.1,30);pmrem.dispose();
    studio.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()});return result;
  }
  let env=environment();scene.environment=env.texture;
  const hemi=new THREE.HemisphereLight(0xffffff,0x6a7454,.9);scene.add(hemi);
  const key=new THREE.DirectionalLight(0xfff3d9,3.4);key.position.set(-4,6,5);key.castShadow=false;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=5;key.shadow.camera.bottom=-4;key.shadow.normalBias=.025;key.shadow.radius=4;scene.add(key);
  const fill=new THREE.DirectionalLight(0xe9f1e2,1.3);fill.position.set(4,2,-3);scene.add(fill);

  const glass=new THREE.MeshPhysicalMaterial({color:0x758b48,metalness:0,roughness:.035,transmission:.35,transparent:true,opacity:.42,depthWrite:false,thickness:.20,ior:1.5,attenuationColor:new THREE.Color(0x5e762e),attenuationDistance:2.4,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1.05,side:THREE.FrontSide});
  const bottle=lathe([[0,-1.72],[.63,-1.72],[.77,-1.69],[.825,-1.61],[.84,-1.48],[.84,.37],[.83,.53],[.79,.66],[.70,.79],[.54,.91],[.39,1.01],[.39,1.27],[.34,1.27],[.34,1.05],[.50,.97],[.65,.87],[.75,.72],[.77,.54],[.77,-1.28],[.71,-1.37],[.59,-1.40],[0,-1.40]],glass,128);
  rig.add(bottle);
  const threadMat=glass.clone();threadMat.color.setHex(0xaab973);threadMat.transmission=.65;threadMat.roughness=.1;threadMat.thickness=.07;
  for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.385,.025,8,96),threadMat);ring.rotation.x=Math.PI/2;ring.position.y=1.02+i*.085;rig.add(ring)}
  const bottom=new THREE.Mesh(new THREE.CylinderGeometry(.73,.70,.09,96),glass);bottom.position.y=-1.61;rig.add(bottom);
  const black=new THREE.MeshPhysicalMaterial({color:0x070907,roughness:.32,metalness:.15,clearcoat:.2,clearcoatRoughness:.27});
  const capGeo=new THREE.CylinderGeometry(.465,.465,.53,288,2);
  const cp=capGeo.attributes.position;
  for(let i=0;i<cp.count;i++){const x=cp.getX(i),z=cp.getZ(i),r=Math.hypot(x,z);if(r>.4){const a=Math.atan2(z,x),r1=r+Math.cos(a*72)*.0065;cp.setX(i,x/r*r1);cp.setZ(i,z/r*r1)}}capGeo.computeVertexNormals();
  const cap=new THREE.Mesh(capGeo,black);cap.position.y=1.49;cap.castShadow=true;rig.add(cap);
  const collar=new THREE.Mesh(new THREE.CylinderGeometry(.477,.477,.055,128),black);collar.position.y=1.2;rig.add(collar);
  const rubber=new THREE.MeshPhysicalMaterial({color:0x080a08,roughness:.57,metalness:0,clearcoat:.09});
  const bulbPoints=profile([[0,1.75],[.27,1.75],[.30,1.8],[.30,2.18],[.275,2.37],[.20,2.53],[.10,2.60],[0,2.62]]);
  const curve=new THREE.SplineCurve(bulbPoints);const bulb=new THREE.Mesh(new THREE.LatheGeometry(curve.getPoints(60),96),rubber);bulb.castShadow=true;rig.add(bulb);

  const level=.29,radius=.755,bottomY=-1.36;
  const uniform={slope:{value:new THREE.Vector2()},wave:{value:0},phase:{value:0},mean:{value:0}};
  const liquidMat=new THREE.MeshPhysicalMaterial({color:0x34460d,roughness:.075,metalness:0,clearcoat:.8,clearcoatRoughness:.06,envMapIntensity:.8,transparent:true,opacity:.78,depthWrite:false});
  liquidMat.onBeforeCompile=shader=>{
    shader.uniforms.uSlope=uniform.slope;shader.uniforms.uWave=uniform.wave;shader.uniforms.uPhase=uniform.phase;shader.uniforms.uMean=uniform.mean;
    shader.vertexShader='uniform vec2 uSlope; uniform float uWave; uniform float uPhase; uniform float uMean;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    float edge=clamp(1.0-dot(position.xz,position.xz)/${(radius*radius).toFixed(5)},0.0,1.0);
    float rip=(sin(position.x*5.0+uPhase)+sin(position.z*4.0-uPhase*.7)*.4)*(.5+.5*edge)*uWave-uMean;
    transformed.y += (dot(position.xz,uSlope)+rip)*smoothstep(${bottomY.toFixed(2)},${level.toFixed(2)},position.y);`);
  };
  const liquid=lathe([[0,bottomY],[.68,bottomY],[radius,-1.28],[radius,level]],liquidMat,96);liquid.castShadow=true;rig.add(liquid);
  const rings=14,sectors=96,verts=[0,level,0],indices=[];
  for(let j=1;j<=rings;j++)for(let i=0;i<sectors;i++){const a=i/sectors*Math.PI*2,r=radius*j/rings;verts.push(Math.cos(a)*r,level,Math.sin(a)*r)}
  for(let i=0;i<sectors;i++)indices.push(0,1+(i+1)%sectors,1+i);
  for(let j=1;j<rings;j++)for(let i=0;i<sectors;i++){const a=1+(j-1)*sectors+i,b=1+(j-1)*sectors+(i+1)%sectors,c=1+j*sectors+i,d=1+j*sectors+(i+1)%sectors;indices.push(a,b,c,b,d,c)}
  const surfaceGeo=new THREE.BufferGeometry();surfaceGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));surfaceGeo.setIndex(indices);surfaceGeo.computeVertexNormals();
  const surfaceMat=new THREE.MeshPhysicalMaterial({color:0x647820,roughness:.08,metalness:.05,clearcoat:1,envMapIntensity:1.15,side:THREE.DoubleSide});
  const surface=new THREE.Mesh(surfaceGeo,surfaceMat);rig.add(surface);
  const tubeMaterial=new THREE.MeshStandardMaterial({color:0xe3ebcf,roughness:.19,metalness:.25});
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(.027,.025,2.55,32),tubeMaterial);tube.position.y=.03;rig.add(tube);
  const tip=new THREE.Mesh(new THREE.SphereGeometry(.028,20,12),tubeMaterial);tip.position.y=-1.25;rig.add(tip);

  await document.fonts.ready;
  const labelCanvas=document.createElement('canvas');labelCanvas.width=1024;labelCanvas.height=1024;
  const ink=labelCanvas.getContext('2d');ink.fillStyle='#f3f3db';ink.textAlign='center';
  ink.font='190px Georgia';ink.fillText('horyy',512,260);
  ink.font='34px Manrope';ink.letterSpacing='7px';ink.fillText('DAILY HYDRATION',512,446);
  ink.letterSpacing='0px';ink.font='58px Manrope';ink.fillText('horyy01',512,625);
  ink.font='30px Manrope';ink.letterSpacing='5px';ink.fillText('FACE SERUM',512,802);
  ink.font='27px Manrope';ink.letterSpacing='3px';ink.fillText('30 ML',512,950);
  const labelTexture=new THREE.CanvasTexture(labelCanvas);labelTexture.colorSpace=THREE.SRGBColorSpace;labelTexture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
  const label=new THREE.Mesh(new THREE.CylinderGeometry(.844,.844,1.58,96,1,true,-.97,1.94),new THREE.MeshBasicMaterial({map:labelTexture,transparent:true,alphaTest:.025,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));label.position.y=-.47;label.renderOrder=10;rig.add(label);

  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.14}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.735;ground.receiveShadow=true;scene.add(ground);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d'),grad=sc.createRadialGradient(64,64,5,64,64,64);grad.addColorStop(0,'rgba(44,55,26,.20)');grad.addColorStop(.45,'rgba(44,55,26,.10)');grad.addColorStop(1,'rgba(44,55,26,0)');sc.fillStyle=grad;sc.fillRect(0,0,128,128);
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(3,2.3),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=-1.73;scene.add(contact);

  // Pooled microbubbles: buoyancy follows world up, drag couples them to the serum.
  const bubbles=[];
  const bubbleGeo=new THREE.SphereGeometry(1,12,8);
  const bubbleMat=new THREE.MeshPhysicalMaterial({color:0xdce6ad,metalness:.15,roughness:.08,clearcoat:1,transparent:true,opacity:.72,depthWrite:false});
  for(let i=0;i<28;i++){const mesh=new THREE.Mesh(bubbleGeo,bubbleMat);mesh.visible=false;rig.add(mesh);bubbles.push({mesh,velocity:new THREE.Vector3(),size:.014+(i%7)*.003,alive:false,age:0})}
  function aerate(amount=14){if(reduced.matches)return;let n=0;for(const b of bubbles){if(b.alive)continue;const a=Math.random()*Math.PI*2,r=.3+Math.random()*.38;b.mesh.position.set(Math.cos(a)*r,-1.13+Math.random()*.8,Math.sin(a)*r);b.velocity.set((Math.random()-.5)*.2,.08+Math.random()*.12,(Math.random()-.5)*.2);b.age=0;b.alive=true;b.mesh.visible=true;if(++n>=amount)break}}
  let desiredX=0,desiredY=-.1,desiredZ=0,dragging=false,lastX=0,lastY=0,pressX=0,pressY=0,dragDistance=0,spin=0;
  let sx=0,sz=0,vx=0,vz=0,amp=0,ampV=0,phase=0,lastTime=0,frame=0,until=0,inView=true;
  let oldX=0,oldZ=0;
  const up=new THREE.Vector3(),inv=new THREE.Quaternion();
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const pause=()=>{cancelAnimationFrame(frame);frame=0;lastTime=0};
  function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=r.width<550?10.4:10.6;camera.updateProjectionMatrix();wake(400)}
  function wake(ms=1800){until=Math.max(until,performance.now()+ms);if(!frame&&!document.hidden&&inView)frame=requestAnimationFrame(tick)}
  function tick(time){
    frame=0;if(document.hidden||!inView)return;
    const dt=lastTime?Math.min((time-lastTime)/1000,.03):1/60;lastTime=time;
    const k=1-Math.exp(-9*dt);
    if(!dragging&&!reduced.matches){desiredY+=spin*dt;spin*=Math.exp(-2.1*dt)}
    rig.rotation.x+=(desiredX-rig.rotation.x)*k;rig.rotation.y+=(desiredY-rig.rotation.y)*k;rig.rotation.z+=(desiredZ-rig.rotation.z)*k;
    rig.updateMatrixWorld(true);inv.copy(rig.quaternion).invert();up.set(0,1,0).applyQuaternion(inv);
    const targetX=-up.x/Math.max(.5,up.y),targetZ=-up.z/Math.max(.5,up.y);
    const dx=rig.rotation.x-oldX,dz=rig.rotation.z-oldZ;oldX=rig.rotation.x;oldZ=rig.rotation.z;
    if(!reduced.matches){
      vx+=((targetX-sx)*34-vx*4.7)*dt-dz*2;vz+=((targetZ-sz)*34-vz*4.7)*dt+dx*2;
      sx=clamp(sx+vx*dt,-.32,.32);sz=clamp(sz+vz*dt,-.32,.32);
      ampV+=(-amp*40-ampV*4.2)*dt+Math.hypot(dx,dz)*1.8;amp=clamp(amp+ampV*dt,-.065,.065);phase+=dt*5;
    }else{sx=targetX;sz=targetZ;amp=ampV=vx=vz=0}
    const p=surfaceGeo.attributes.position;
    let weighted=0,weights=0;
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),r2=(x*x+z*z)/(radius*radius),weight=Math.max(.05,Math.sqrt(r2));const wave=(Math.sin(x*5+phase)+Math.sin(z*4-phase*.7)*.4)*(.5+.5*(1-r2))*amp;weighted+=wave*weight;weights+=weight}
    const mean=weighted/weights;
    let activeBubbles=0;
    for(const b of bubbles){if(!b.alive)continue;activeBubbles++;b.age+=dt;
      b.velocity.x+=(up.x*.36-b.velocity.x*1.8-dz*4)*dt;
      b.velocity.z+=(up.z*.36-b.velocity.z*1.8+dx*4)*dt;
      b.velocity.y+=(.22-b.velocity.y*.8)*dt;b.mesh.position.addScaledVector(b.velocity,dt);
      const v=b.mesh.position,r=Math.hypot(v.x,v.z),wall=radius-b.size-.012;
      if(r>wall){v.x*=wall/r;v.z*=wall/r;const outward=(b.velocity.x*v.x+b.velocity.z*v.z)/(wall*wall);if(outward>0){b.velocity.x-=v.x*outward*1.5;b.velocity.z-=v.z*outward*1.5}}
      const top=level+v.x*sx+v.z*sz;
      if(v.y>=top-b.size||b.age>12){b.alive=false;b.mesh.visible=false;continue}
      b.mesh.scale.setScalar(b.size*Math.min(1,b.age*5)*Math.min(1,(top-v.y)/.07));
    }
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),r2=(x*x+z*z)/(radius*radius);p.setY(i,level+x*sx+z*sz+(Math.sin(x*5+phase)+Math.sin(z*4-phase*.7)*.4)*(.5+.5*(1-r2))*amp-mean)}
    p.needsUpdate=true;surfaceGeo.computeVertexNormals();uniform.slope.value.set(sx,sz);uniform.wave.value=amp;uniform.phase.value=phase;uniform.mean.value=mean;
    renderer.render(scene,camera);
    const moving=Math.abs(desiredX-rig.rotation.x)+Math.abs(desiredY-rig.rotation.y)+Math.abs(desiredZ-rig.rotation.z)+Math.abs(vx)+Math.abs(vz)+Math.abs(amp)+Math.abs(ampV);
    if(time<until||moving>.0003||activeBubbles||Math.abs(spin)>.001)frame=requestAnimationFrame(tick);else lastTime=0;
  }
  function move(e){const b=stage.getBoundingClientRect();if(dragging){const dx=e.clientX-lastX,dy=e.clientY-lastY;dragDistance=Math.max(dragDistance,Math.hypot(e.clientX-pressX,e.clientY-pressY));desiredY+=dx*.018;desiredX=clamp(desiredX+dy*.006,-.48,.48);desiredZ=clamp(dx*.005,-.22,.22);spin=clamp(dx*.15,-5,5);if(Math.abs(dx)+Math.abs(dy)>7)aerate(2);lastX=e.clientX;lastY=e.clientY}else if(e.pointerType==='mouse'&&!reduced.matches){const x=clamp((e.clientX-b.left)/b.width*2-1,-1,1),y=clamp((e.clientY-b.top)/b.height*2-1,-1,1);desiredX=y*.1;if(Math.abs(spin)<.05)desiredY+=THREE.MathUtils.euclideanModulo(x*.33-desiredY+Math.PI,Math.PI*2)-Math.PI;desiredZ=-x*.10}wake()}
  stage.addEventListener('pointermove',move,{passive:true});
  stage.addEventListener('pointerdown',e=>{dragging=true;spin=0;dragDistance=0;pressX=lastX=e.clientX;pressY=lastY=e.clientY;stage.classList.add('dragging');stage.setPointerCapture(e.pointerId);wake()});
  stage.addEventListener('pointerup',e=>{dragging=false;desiredZ=0;if(dragDistance<6&&!reduced.matches){spin=3.6;desiredY+=.65;vx+=.65;ampV+=.3;aerate(18)}stage.classList.remove('dragging');if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);wake(4000)});
  stage.addEventListener('pointercancel',()=>{dragging=false;desiredZ=0;stage.classList.remove('dragging');wake()});
  stage.addEventListener('pointerleave',()=>{if(!dragging){desiredX=desiredZ=0;wake()}});
  document.getElementById('shake').addEventListener('click',()=>{if(reduced.matches)return;rig.rotation.z=.24;spin=2.8;vx+=1.4;vz-=.55;ampV+=.45;aerate(28);wake(4000)});
  document.getElementById('reset').addEventListener('click',()=>{spin=0;desiredX=desiredZ=0;desiredY=rig.rotation.y+THREE.MathUtils.euclideanModulo(-.1-rig.rotation.y+Math.PI,Math.PI*2)-Math.PI;wake(2000)});
  document.querySelectorAll('[data-light]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-light]').forEach(b=>{const yes=b===button;b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes))});const previous=env;env=environment(button.dataset.light==='side');scene.environment=env.texture;key.intensity=button.dataset.light==='side'?4.4:3.4;fill.intensity=button.dataset.light==='side'?.6:1.3;previous.dispose();wake(800)}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else wake(200)});
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)wake(200);else pause()}).observe(stage);
  new ResizeObserver(resize).observe(stage);
  reduced.addEventListener('change',()=>wake(200));
  window.addEventListener('pagehide',pause);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();pause();loading.style.display='flex';loading.textContent='Восстанавливаем студию…'});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{loading.style.display='none';wake(500)});
  rig.rotation.y=-.1;resize();renderer.render(scene,camera);loading.style.display='none';
  window.horyy3d={get state(){return {rotation:[rig.rotation.x,rig.rotation.y,rig.rotation.z],liquidSlope:[sx,sz],wave:amp,bubbles:bubbles.filter(b=>b.alive).length,rendering:!!frame}},dispose:()=>{pause();env.dispose();renderer.dispose()}};
}
