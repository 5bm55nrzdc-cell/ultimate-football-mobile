const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
(async()=>{
let THREE;
try{
  THREE=await import(THREE_URL);
}catch(error){
  console.error('Three.js failed to load:',error);
  const note=document.getElementById('rotateNote');
  note.style.display='grid';
  note.style.zIndex='10';
  note.textContent='Не удалось загрузить 3D-графику. Проверь интернет и обнови страницу.';
  return;
}
const canvas=document.getElementById('pitch');
const overlay=document.getElementById('overlay');
const startBtn=document.getElementById('startBtn');
const clockEl=document.getElementById('clock');
const homeEl=document.getElementById('homeScore');
const awayEl=document.getElementById('awayScore');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8fc5d2);
scene.fog=new THREE.Fog(0x8fc5d2,42,92);
const camera=new THREE.PerspectiveCamera(43,1,.1,150);
camera.position.set(0,24,31);
camera.lookAt(0,0,0);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.18;
scene.add(new THREE.HemisphereLight(0xdff6ff,0x31502c,2.0));
const sun=new THREE.DirectionalLight(0xfff3d8,3.1);
sun.position.set(-13,27,14);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-27;sun.shadow.camera.right=27;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;
sun.shadow.bias=-.00025;scene.add(sun);
const fill=new THREE.DirectionalLight(0x9ecbff,1.15);fill.position.set(18,13,-16);scene.add(fill);
const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const grassA=mat(0x16763c),grassB=mat(0x1b8243),white=mat(0xf4f6e9,.65),dark=mat(0x14231c),metal=mat(0x9aa8a2,.35,.7);

// Procedural turf texture: subtle blades and mowing variation, generated locally.
const turfCanvas=document.createElement('canvas');turfCanvas.width=512;turfCanvas.height=512;
const turfCtx=turfCanvas.getContext('2d');
turfCtx.fillStyle='#ffffff';turfCtx.fillRect(0,0,512,512);
for(let i=0;i<12500;i++){
 const x=Math.random()*512,y=Math.random()*512,a=.025+Math.random()*.09;
 turfCtx.fillStyle=Math.random()>.5?'rgba(8,45,18,'+a+')':'rgba(225,255,210,'+a+')';
 turfCtx.fillRect(x,y,1+Math.random()*2,1+Math.random()*5);
}
const turfTexture=new THREE.CanvasTexture(turfCanvas);
turfTexture.wrapS=turfTexture.wrapT=THREE.RepeatWrapping;
turfTexture.repeat.set(3,2);turfTexture.colorSpace=THREE.SRGBColorSpace;
grassA.map=turfTexture;grassB.map=turfTexture;

const field=new THREE.Mesh(new THREE.PlaneGeometry(36,22),grassA);field.rotation.x=-Math.PI/2;field.receiveShadow=true;scene.add(field);
for(let i=0;i<9;i++){
 const strip=new THREE.Mesh(new THREE.PlaneGeometry(4,22),i%2?grassA:grassB);
 strip.rotation.x=-Math.PI/2;strip.position.set(-16+i*4,.006,0);strip.receiveShadow=true;scene.add(strip);
}
function line(points,material=white,radius=.035){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],.035,p[1])));
 const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*8),radius,6,false),material);
 scene.add(mesh);return mesh;
}
function rect(x1,z1,x2,z2){line([[x1,z1],[x2,z1],[x2,z2],[x1,z2],[x1,z1]])}
rect(-17,-10.5,17,10.5);
line([[0,-10.5],[0,10.5]]);
const circlePts=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;circlePts.push([Math.cos(a)*3.1,Math.sin(a)*3.1])}line(circlePts);
const spot=(x,z)=>{const m=new THREE.Mesh(new THREE.CircleGeometry(.11,20),white);m.rotation.x=-Math.PI/2;m.position.set(x,.04,z);scene.add(m)};
spot(0,0);spot(-12,0);spot(12,0);
rect(-17,-4.2,-12,4.2);rect(12,-4.2,17,4.2);rect(-17,-2.1,-15,2.1);rect(15,-2.1,17,2.1);
function stand(x,z,sx,sz,rotation=0){
 const base=new THREE.Mesh(new THREE.BoxGeometry(sx,2.4,sz),mat(0x263a36));
 base.position.set(x,1.05,z);base.rotation.y=rotation;base.castShadow=true;base.receiveShadow=true;scene.add(base);
 for(let row=0;row<4;row++){
  const step=new THREE.Mesh(new THREE.BoxGeometry(sx*.98,.24,sz*.92),mat([0x477b72,0x477b72,0x355e59,0x355e59][row]));
  step.position.set(x,.65+row*.48,z+(row-1.5)*.13);step.rotation.y=rotation;scene.add(step);
 }
}
stand(0,-13,38,4);stand(0,13,38,4);stand(-21,0,4,22);stand(21,0,4,22);

// Thousands-seat atmosphere represented by compact, varied crowd silhouettes.
const crowdMats=[0xd94f45,0xf0d36b,0xe9ecef,0x3f8edb,0x253b32,0x9b6bc4].map(c=>mat(c,.9));
const crowdGeo=new THREE.SphereGeometry(.105,7,6);
for(let side of [-1,1]){
 for(let row=0;row<3;row++){
  for(let col=0;col<64;col++){
   if((col+row)%7===0)continue;
   const person=new THREE.Mesh(crowdGeo,crowdMats[(col*3+row*5)%crowdMats.length]);
   person.position.set(-18+col*.57,1.75+row*.43,side*(14.15+row*.22));
   person.scale.set(.85,1.35,.8);person.castShadow=false;scene.add(person);
  }
 }
}
for(let side of [-1,1]){
 for(let row=0;row<3;row++){
  for(let col=0;col<25;col++){
   const person=new THREE.Mesh(crowdGeo,crowdMats[(col+row*2)%crowdMats.length]);
   person.position.set(side*(22.1+row*.22),1.7+row*.42,-9+col*.75);
   person.scale.set(.8,1.3,.8);scene.add(person);
  }
 }
}
// Animated-looking LED advertising fascia around the pitch.
const boardMat=mat(0x102a25,.45,.2);
for(const side of [-1,1]){
 const board=new THREE.Mesh(new THREE.BoxGeometry(35,.62,.22),boardMat);
 board.position.set(0,.36,side*11.05);scene.add(board);
 const signCanvas=document.createElement('canvas');signCanvas.width=1024;signCanvas.height=64;
 const sc=signCanvas.getContext('2d');
 sc.fillStyle='#102a25';sc.fillRect(0,0,1024,64);
 sc.fillStyle='#c7ff83';sc.font='bold 34px Arial';sc.textAlign='center';
 sc.fillText('ULTIMATE FOOTBALL  •  PLAY WITH PASSION  •  ULTIMATE FOOTBALL',512,44);
 const signTex=new THREE.CanvasTexture(signCanvas);signTex.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(34.8,.52),new THREE.MeshBasicMaterial({map:signTex}));
 sign.position.set(0,.38,side*10.925);sign.rotation.y=side===1?0:Math.PI;scene.add(sign);
}

function goal(x,sign){
 const group=new THREE.Group();const postMat=mat(0xffffff,.35,.35);
 const post=(y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,y,12),postMat);m.position.set(x,y/2,z);m.castShadow=true;group.add(m)};
 post(2.5,-2.25);post(2.5,2.25);
 const bar=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,4.5,12),postMat);bar.rotation.x=Math.PI/2;bar.position.set(x,2.5,0);group.add(bar);
 const netMat=new THREE.MeshBasicMaterial({color:0xe8f4ed,wireframe:true,transparent:true,opacity:.25});
 const net=new THREE.Mesh(new THREE.BoxGeometry(1.8,2.5,4.5),netMat);net.position.set(x+sign*.9,1.25,0);group.add(net);
 scene.add(group);
}
goal(-17,-1);goal(17,1);
for(let side of [-1,1]){
 for(let i=0;i<5;i++){
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.13,9,8),metal);
  pole.position.set(side*19.5,4.5,-8+i*4);pole.castShadow=true;scene.add(pole);
  const lamp=new THREE.Mesh(new THREE.BoxGeometry(.9,.28,.65),mat(0xfff2bf,.25));
  lamp.position.set(side*19.5,9,-8+i*4);scene.add(lamp);
  const glow=new THREE.PointLight(0xffedc2,5,18,2);glow.position.set(side*19,8.7,-8+i*4);scene.add(glow);
 }
}
function capsule(radius,length,material){
 return new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,5,9),material);
}
function limb(parent,x,y,z,length,radius,material){
 const pivot=new THREE.Group();pivot.position.set(x,y,z);parent.add(pivot);
 const part=new THREE.Mesh(new THREE.CylinderGeometry(radius*.78,radius,length,9),material);
 part.position.y=-length/2;part.castShadow=true;pivot.add(part);
 const joint=new THREE.Mesh(new THREE.SphereGeometry(radius*1.04,9,7),material);joint.position.y=-length;part.add(joint);
 return pivot;
}
function makePlayer(primary,secondary,number){
 const root=new THREE.Group();scene.add(root);
 const kit=mat(primary,.63),trim=mat(secondary,.55),skin=mat(0xd6a27d),shorts=mat(0x182a42),sock=mat(0xf0f0e8),boots=mat(0x171d20,.4);
 const torso=capsule(.39,.72,kit);torso.position.y=1.42;torso.castShadow=true;root.add(torso);
 const chest=new THREE.Mesh(new THREE.BoxGeometry(.54,.13,.12),trim);chest.position.set(0,1.55,.33);root.add(chest);

// Kit details: sleeve cuffs and a clean central shirt stripe.
const stripe=new THREE.Mesh(new THREE.BoxGeometry(.075,.62,.018),trim);
stripe.position.set(0,1.47,.395);root.add(stripe);
for(const side of [-1,1]){
 const sleeve=new THREE.Mesh(new THREE.SphereGeometry(.19,10,8),kit);
 sleeve.scale.set(1,.72,.82);sleeve.position.set(side*.38,1.67,0);root.add(sleeve);
 const cuff=new THREE.Mesh(new THREE.TorusGeometry(.105,.025,6,12),trim);
 cuff.rotation.z=Math.PI/2;cuff.position.set(side*.49,1.56,0);root.add(cuff);
}

 const head=new THREE.Mesh(new THREE.SphereGeometry(.245,16,12),skin);head.position.y=2.08;head.castShadow=true;root.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.25,14,8,0,Math.PI*2,0,Math.PI*.55),mat(0x30251f));hair.position.y=2.17;root.add(hair);
 const short=new THREE.Mesh(new THREE.BoxGeometry(.65,.35,.43),shorts);short.position.y=.91;short.castShadow=true;root.add(short);
 const legs=[limb(root,-.2,.83,0,.62,.105,sock),limb(root,.2,.83,0,.62,.105,sock)];
 const arms=[limb(root,-.49,1.72,0,.56,.09,kit),limb(root,.49,1.72,0,.56,.09,kit)];
 for(let i=0;i<2;i++){
  const shoe=new THREE.Mesh(new THREE.BoxGeometry(.2,.12,.34),boots);shoe.position.set(0,-.63,.1);legs[i].add(shoe);shoe.castShadow=true;
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.105,10,8),skin);hand.position.y=-.59;arms[i].add(hand);
 }
 const label=document.createElement('canvas');label.width=128;label.height=128;
 const c=label.getContext('2d');c.clearRect(0,0,128,128);c.fillStyle='#ffffff';c.font='bold 68px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(number),64,66);
 const texture=new THREE.CanvasTexture(label);texture.colorSpace=THREE.SRGBColorSpace;
 const badge=new THREE.Mesh(new THREE.PlaneGeometry(.25,.25),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
 badge.position.set(0,1.45,.405);root.add(badge);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.57,24),new THREE.MeshBasicMaterial({color:0x07140c,transparent:true,opacity:.27}));
 shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;root.add(shadow);
 return {root,legs,arms,shadow,dx:1,dz:0,phase:0};
}
const player=makePlayer(0x2d8cff,0xffffff,10);
const rival=makePlayer(0xe94e48,0xffd44c,9);
player.root.position.set(-7,0,0);rival.root.position.set(7,0,0);rival.root.rotation.y=-Math.PI/2;
const ballGroup=new THREE.Group();scene.add(ballGroup);
const ballMesh=new THREE.Mesh(new THREE.SphereGeometry(.31,24,18),mat(0xffffff,.34));
ballMesh.castShadow=true;ballGroup.add(ballMesh);
const patches=mat(0x18201c,.5);
for(let i=0;i<5;i++){const p=new THREE.Mesh(new THREE.CircleGeometry(.105,5),patches);p.position.set(Math.cos(i*2*Math.PI/5)*.305,Math.sin(i*2*Math.PI/5)*.305,0);p.rotation.z=i*.2;ballMesh.add(p)}
const ballShadow=new THREE.Mesh(new THREE.CircleGeometry(.4,20),new THREE.MeshBasicMaterial({color:0x07140c,transparent:true,opacity:.3}));
ballShadow.rotation.x=-Math.PI/2;ballShadow.position.y=.025;scene.add(ballShadow);
const ball={x:-5.8,z:0,vx:0,vz:0,owner:null,height:.31,spin:0};
const state={running:false,last:0,elapsed:0,home:0,away:0};
const input={x:0,z:0,sprint:false};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>{const ax=a.root?a.root.position.x:a.x,az=a.root?a.root.position.z:a.z;return Math.hypot(ax-b.x,az-b.z)};
function updatePlayerVisual(p,dt,moving){
 p.phase+=dt*(moving?12:2);
 const swing=moving?Math.sin(p.phase)*.65:Math.sin(p.phase)*.035;
 p.legs[0].rotation.x=swing;p.legs[1].rotation.x=-swing;
 p.arms[0].rotation.x=-swing*.62;p.arms[1].rotation.x=swing*.62;
 p.root.rotation.z=moving?Math.sin(p.phase*2)*.035:0;
 p.root.rotation.x=moving?-.035:0;
 p.root.position.y=moving?Math.abs(Math.sin(p.phase*2))*.045:0;
}
function update(dt){
 const magnitude=Math.hypot(input.x,input.z);
 let moving=false;
 if(magnitude>.08){
  const dx=input.x/magnitude,dz=input.z/magnitude;
  player.dx=dx;player.dz=dz;
  const speed=input.sprint?8.7:6.1;
  player.root.position.x=clamp(player.root.position.x+dx*speed*dt,-16.1,16.1);
  player.root.position.z=clamp(player.root.position.z+dz*speed*dt,-9.5,9.5);
  player.root.rotation.y=Math.atan2(dx,dz);
  moving=true;
 }
 updatePlayerVisual(player,dt,moving);
 const target=ball.owner==='player'?player.root.position:(ball.owner==='rival'?{x:-15.8,z:0}:ball);
 const rx=target.x-rival.root.position.x,rz=target.z-rival.root.position.z;
 const rd=Math.hypot(rx,rz)||1;
 const rivalSpeed=ball.owner==='rival'?5.5:6.2;
 rival.root.position.x=clamp(rival.root.position.x+rx/rd*rivalSpeed*dt,-16.1,16.1);
 rival.root.position.z=clamp(rival.root.position.z+rz/rd*rivalSpeed*dt,-9.5,9.5);
 rival.root.rotation.y=Math.atan2(rx,rz);
 updatePlayerVisual(rival,dt,rd>.8);
 if(ball.owner==='player'){
  const a=player.root.rotation.y;
  const tx=player.root.position.x+Math.sin(a)*.82,tz=player.root.position.z+Math.cos(a)*.82;
  ball.x+=(tx-ball.x)*Math.min(1,dt*14);ball.z+=(tz-ball.z)*Math.min(1,dt*14);ball.vx=ball.vz=0;
 }else if(ball.owner==='rival'){
  const a=rival.root.rotation.y;
  ball.x+=(rival.root.position.x+Math.sin(a)*.82-ball.x)*Math.min(1,dt*12);
  ball.z+=(rival.root.position.z+Math.cos(a)*.82-ball.z)*Math.min(1,dt*12);
 }else{
  ball.x+=ball.vx*dt;ball.z+=ball.vz*dt;
  const drag=Math.pow(.987,dt*60);ball.vx*=drag;ball.vz*=drag;
  if(Math.hypot(ball.vx,ball.vz)<.08)ball.vx=ball.vz=0;
  ball.height=.31+Math.abs(Math.sin(state.elapsed*9))*Math.min(.2,Math.hypot(ball.vx,ball.vz)*.012);
  if(Math.abs(ball.z)>9.8){ball.z=clamp(ball.z,-9.8,9.8);ball.vz*=-.68}
  if(Math.abs(ball.x)>17.35&&Math.abs(ball.z)<2.15){
   if(ball.x<0)state.away++;else state.home++;
   homeEl.textContent=state.home;awayEl.textContent=state.away;
   resetPositions();
  }else if(Math.abs(ball.x)>16.7){ball.x=clamp(ball.x,-16.7,16.7);ball.vx*=-.65}
  if(dist(player,ball)<.95&&Math.hypot(ball.vx,ball.vz)<5)ball.owner='player';
  if(dist(rival,ball)<.88){ball.owner='rival';ball.vx=ball.vz=0}
 }
 if(Math.abs(ball.x)>17.35&&Math.abs(ball.z)<2.15){if(ball.x<0)state.away++;else state.home++;homeEl.textContent=state.home;awayEl.textContent=state.away;resetPositions();}
 ballGroup.position.set(ball.x,ball.height,ball.z);
 ballMesh.rotation.x+=ball.vz*dt*1.4;ballMesh.rotation.z-=ball.vx*dt*1.4;
 ballShadow.position.x=ball.x;ballShadow.position.z=ball.z;
 ballShadow.scale.setScalar(1-Math.min(.35,ball.height*.22));
 // Smooth camera framing keeps the action readable on phones.
 const cx=player.root.position.x*.17;
 camera.position.x+=(cx-camera.position.x)*Math.min(1,dt*1.5);
 camera.lookAt(cx*.3,0,0);
}
function resetPositions(){
 player.root.position.set(-7,0,0);rival.root.position.set(7,0,0);
 ball.x=-5.8;ball.z=0;ball.vx=ball.vz=0;ball.owner=null;ball.height=.31;
}
function render(){renderer.render(scene,camera)}
function resize(){
 const w=window.innerWidth,h=window.innerHeight,aspect=w/h;
 renderer.setSize(w,h,false);
 camera.aspect=aspect;
 if(aspect<1){
  camera.fov=58;
  camera.position.set(0,34,43);
 }else{
  camera.fov=43;
  camera.position.set(0,24,31);
 }
 camera.updateProjectionMatrix();
 camera.lookAt(0,0,0);
}
window.addEventListener('resize',resize,{passive:true});resize();
function frame(now){
 if(!state.running)return;
 const dt=Math.min((now-state.last)/1000,.04);state.last=now;state.elapsed+=dt;
 const sec=Math.floor(state.elapsed);
 clockEl.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
 update(dt);render();requestAnimationFrame(frame);
}
function start(){
 if(state.running)return;
 state.running=true;overlay.classList.add('hidden');state.last=performance.now();requestAnimationFrame(frame);
}
startBtn.addEventListener('click',start);
const joy=document.getElementById('joystick'),knob=document.getElementById('joyKnob');
let pointer=null;
function setStick(clientX,clientY){
 const r=joy.getBoundingClientRect();
 const cx=r.left+r.width/2,cy=r.top+r.height/2,max=Math.max(20,Math.min(r.width,r.height)*.31);
 let dx=clientX-cx,dz=clientY-cy,len=Math.hypot(dx,dz);
 if(len>max){dx=dx/len*max;dz=dz/len*max}
 input.x=dx/max;input.z=dz/max;
 knob.style.transform='translate3d('+dx+'px,'+dz+'px,0)';
}
function resetStick(){
 pointer=null;input.x=0;input.z=0;
 knob.style.transform='translate3d(0,0,0)';
}
joy.addEventListener('pointerdown',e=>{
 e.preventDefault();
 pointer=e.pointerId;
 setStick(e.clientX,e.clientY);
 try{joy.setPointerCapture(e.pointerId)}catch(_){}
});
window.addEventListener('pointermove',e=>{
 if(pointer!==e.pointerId)return;
 e.preventDefault();
 setStick(e.clientX,e.clientY);
},{passive:false});
window.addEventListener('pointerup',e=>{if(pointer===e.pointerId)resetStick()});
window.addEventListener('pointercancel',e=>{if(pointer===e.pointerId)resetStick()});
joy.addEventListener('lostpointercapture',()=>{if(pointer!==null)resetStick()});
const sprint=document.getElementById('sprintBtn');
sprint.addEventListener('pointerdown',e=>{e.preventDefault();input.sprint=true});
['pointerup','pointercancel','pointerleave'].forEach(ev=>sprint.addEventListener(ev,()=>input.sprint=false));
function kick(type){
 if(ball.owner!=='player'&&dist(player,ball)>1.35)return;
 ball.owner=null;
 let dx,dz,power;
 if(type==='shoot'){dx=17.5-ball.x;dz=-ball.z*.45;power=17.5}
 else if(Math.hypot(input.x,input.z)>.2){dx=input.x;dz=input.z;power=10.5}
 else{dx=player.dx;dz=player.dz;power=10.5}
 const len=Math.hypot(dx,dz)||1;ball.vx=dx/len*power;ball.vz=dz/len*power;ball.height=.38;
}
document.getElementById('passBtn').addEventListener('pointerdown',e=>{e.preventDefault();kick('pass')});
document.getElementById('shootBtn').addEventListener('pointerdown',e=>{e.preventDefault();kick('shoot')});
window.addEventListener('keydown',e=>{
 const keys={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};
 const k=keys[e.key];if(!k)return;e.preventDefault();
 if(k==='left')input.x=-1;if(k==='right')input.x=1;if(k==='up')input.z=-1;if(k==='down')input.z=1;
 if(e.key==='Shift')input.sprint=true;
});
window.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight','a','d'].includes(e.key))input.x=0;if(['ArrowUp','ArrowDown','w','s'].includes(e.key))input.z=0;if(e.key==='Shift')input.sprint=false});
render();
})();