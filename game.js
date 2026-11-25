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
const playBtn=document.getElementById('playBtn');
const trainingBtn=document.getElementById('trainingBtn');
const profileBtn=document.getElementById('profileBtn');
const settingsBtn=document.getElementById('settingsBtn');
const trainingOverlay=document.getElementById('trainingOverlay');
const trainingProgress=document.getElementById('trainingProgress');
const trainingTitle=document.getElementById('trainingTitle');
const trainingText=document.getElementById('trainingText');
const trainingTip=document.getElementById('trainingTip');
const trainingMeterFill=document.getElementById('trainingMeterFill');
const trainingNextBtn=document.getElementById('trainingNextBtn');
const trainingBackBtn=document.getElementById('trainingBackBtn');
const menuMessage=document.getElementById('menuMessage');
const authOverlay=document.getElementById('authOverlay');
const authTitle=document.getElementById('authTitle');
const authDescription=document.getElementById('authDescription');
const authMethods=document.getElementById('authMethods');
const authForm=document.getElementById('authForm');
const authStatus=document.getElementById('authStatus');
const authSubmit=document.getElementById('authSubmit');
const authModeToggle=document.getElementById('authModeToggle');
let authMethod='email',authIsRegister=false;
const clockEl=document.getElementById('clock');
const homeEl=document.getElementById('homeScore');
const awayEl=document.getElementById('awayScore');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8fc5d2);
scene.fog=new THREE.Fog(0x8fc5d2,95,210);
const camera=new THREE.PerspectiveCamera(43,1,.1,150);
camera.position.set(0,58,76);
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
sun.shadow.camera.left=-58;sun.shadow.camera.right=58;sun.shadow.camera.top=38;sun.shadow.camera.bottom=-38;
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

const field=new THREE.Mesh(new THREE.PlaneGeometry(105,68),grassA);field.rotation.x=-Math.PI/2;field.receiveShadow=true;scene.add(field);
for(let i=0;i<27;i++){
 const strip=new THREE.Mesh(new THREE.PlaneGeometry(105/27,68),i%2?grassA:grassB);
 strip.rotation.x=-Math.PI/2;strip.position.set(-52.5+(i+.5)*(105/27),.006,0);strip.receiveShadow=true;scene.add(strip);
}
function line(points,material=white,radius=.035){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],.035,p[1])));
 const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*8),radius,6,false),material);
 scene.add(mesh);return mesh;
}
function rect(x1,z1,x2,z2){line([[x1,z1],[x2,z1],[x2,z2],[x1,z2],[x1,z1]])}
rect(-52.5,-34,52.5,34);
line([[0,-34],[0,34]]);
const circlePts=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*2;circlePts.push([Math.cos(a)*9.15,Math.sin(a)*9.15])}line(circlePts);
const spot=(x,z)=>{const m=new THREE.Mesh(new THREE.CircleGeometry(.11,20),white);m.rotation.x=-Math.PI/2;m.position.set(x,.04,z);scene.add(m)};
spot(0,0);spot(-41.5,0);spot(41.5,0);
rect(-52.5,-20.15,-36,20.15);rect(36,-20.15,52.5,20.15);rect(-52.5,-9.16,-47,9.16);rect(47,-9.16,52.5,9.16);
function stand(x,z,sx,sz,rotation=0){
 const base=new THREE.Mesh(new THREE.BoxGeometry(sx,2.4,sz),mat(0x263a36));
 base.position.set(x,1.05,z);base.rotation.y=rotation;base.castShadow=true;base.receiveShadow=true;scene.add(base);
 for(let row=0;row<4;row++){
  const step=new THREE.Mesh(new THREE.BoxGeometry(sx*.98,.24,sz*.92),mat([0x477b72,0x477b72,0x355e59,0x355e59][row]));
  step.position.set(x,.65+row*.48,z+(row-1.5)*.13);step.rotation.y=rotation;scene.add(step);
 }
}
stand(0,-37.5,108,5);stand(0,37.5,108,5);stand(-56,0,5,74);stand(56,0,5,74);

// Thousands-seat atmosphere represented by compact, varied crowd silhouettes.
const crowdMats=[0xd94f45,0xf0d36b,0xe9ecef,0x3f8edb,0x253b32,0x9b6bc4].map(c=>mat(c,.9));
const crowdGeo=new THREE.SphereGeometry(.105,7,6);
for(let side of [-1,1]){
 for(let row=0;row<3;row++){
  for(let col=0;col<64;col++){
   if((col+row)%7===0)continue;
   const person=new THREE.Mesh(crowdGeo,crowdMats[(col*3+row*5)%crowdMats.length]);
   person.position.set(-53+col*1.68,1.75+row*.43,side*(38.2+row*.22));
   person.scale.set(.85,1.35,.8);person.castShadow=false;scene.add(person);
  }
 }
}
for(let side of [-1,1]){
 for(let row=0;row<3;row++){
  for(let col=0;col<46;col++){
   const person=new THREE.Mesh(crowdGeo,crowdMats[(col+row*2)%crowdMats.length]);
   person.position.set(side*(57.1+row*.22),1.7+row*.42,-34+col*1.5);
   person.scale.set(.8,1.3,.8);scene.add(person);
  }
 }
}
// Animated-looking LED advertising fascia around the pitch.
const boardMat=mat(0x102a25,.45,.2);
for(const side of [-1,1]){
 const board=new THREE.Mesh(new THREE.BoxGeometry(106,.62,.22),boardMat);
 board.position.set(0,.36,side*35.5);scene.add(board);
 const signCanvas=document.createElement('canvas');signCanvas.width=1024;signCanvas.height=64;
 const sc=signCanvas.getContext('2d');
 sc.fillStyle='#102a25';sc.fillRect(0,0,1024,64);
 sc.fillStyle='#c7ff83';sc.font='bold 34px Arial';sc.textAlign='center';
 sc.fillText('ULTIMATE FOOTBALL  •  PLAY WITH PASSION  •  ULTIMATE FOOTBALL',512,44);
 const signTex=new THREE.CanvasTexture(signCanvas);signTex.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(105,.52),new THREE.MeshBasicMaterial({map:signTex}));
 sign.position.set(0,.38,side*35.36);sign.rotation.y=side===1?0:Math.PI;scene.add(sign);
}

function goal(x,sign){
 const group=new THREE.Group();const postMat=mat(0xffffff,.35,.35);
 const post=(y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,y,12),postMat);m.position.set(x,y/2,z);m.castShadow=true;group.add(m)};
 post(2.44,-3.66);post(2.44,3.66);
 const bar=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,7.32,12),postMat);bar.rotation.x=Math.PI/2;bar.position.set(x,2.44,0);group.add(bar);
 const netMat=new THREE.MeshBasicMaterial({color:0xe8f4ed,wireframe:true,transparent:true,opacity:.25});
 const net=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.44,7.32),netMat);net.position.set(x+sign*1.2,1.22,0);group.add(net);
 scene.add(group);
}
goal(-52.5,-1);goal(52.5,1);
for(let side of [-1,1]){
 for(let i=0;i<5;i++){
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.13,9,8),metal);
  pole.position.set(side*58,4.5,-27+i*13.5);pole.castShadow=true;scene.add(pole);
  const lamp=new THREE.Mesh(new THREE.BoxGeometry(.9,.28,.65),mat(0xfff2bf,.25));
  lamp.position.set(side*35,9,-14+i*7);scene.add(lamp);
  const glow=new THREE.PointLight(0xffedc2,5,18,2);glow.position.set(side*57,8.7,-14+i*7);scene.add(glow);
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
// 4-3-3 formations: controlled player + 9 outfield teammates + goalkeeper.
const homeSlots=[
 [-40,-25,2],[-40,-8,3],[-40,8,4],[-40,25,5],
 [-19,-17,6],[-19,17,8],[-7,0,7],[4,-14,9],[4,14,11]
];
const awaySlots=[
 [40,-25,2],[40,-8,3],[40,8,4],[40,25,5],
 [19,-17,6],[19,17,8],[7,0,7],[-4,-14,10],[-4,14,11]
];
const teammates=homeSlots.map(([x,z,n])=>{
 const p=makePlayer(0x2d8cff,0xffffff,n);
 p.homeX=x;p.homeZ=z;p.root.position.set(x,0,z);return p;
});
const opponents=awaySlots.map(([x,z,n])=>{
 const p=makePlayer(0xe94e48,0xffd44c,n);
 p.awayX=x;p.awayZ=z;p.root.position.set(x,0,z);return p;
});
const homeKeeper=makePlayer(0x22a878,0xffffff,1);
const awayKeeper=makePlayer(0xf0b33d,0x202020,1);
player.root.position.set(-21,0,0);rival.root.position.set(21,0,0);
homeKeeper.root.position.set(-50,0,0);awayKeeper.root.position.set(50,0,0);
for(const p of [rival,...teammates,...opponents,homeKeeper,awayKeeper])p.root.rotation.y=-Math.PI/2;
const ballGroup=new THREE.Group();scene.add(ballGroup);
const ballMesh=new THREE.Mesh(new THREE.SphereGeometry(.31,24,18),mat(0xffffff,.34));
ballMesh.castShadow=true;ballGroup.add(ballMesh);
const patches=mat(0x18201c,.5);
for(let i=0;i<5;i++){const p=new THREE.Mesh(new THREE.CircleGeometry(.105,5),patches);p.position.set(Math.cos(i*2*Math.PI/5)*.305,Math.sin(i*2*Math.PI/5)*.305,0);p.rotation.z=i*.2;ballMesh.add(p)}
const ballShadow=new THREE.Mesh(new THREE.CircleGeometry(.4,20),new THREE.MeshBasicMaterial({color:0x07140c,transparent:true,opacity:.3}));
ballShadow.rotation.x=-Math.PI/2;ballShadow.position.y=.025;scene.add(ballShadow);
const ball={x:-18.9,z:0,vx:0,vz:0,owner:null,height:.31,spin:0,lastTouch:null,lastTouchLock:0};
const homeActors=[player,...teammates],awayActors=[rival,...opponents];
let aiDecisionCooldown=0;
function ownerKey(actor,side){
 if(actor===player)return 'player';if(actor===rival)return 'rival';
 const index=(side==='home'?teammates:opponents).indexOf(actor);
 return index<0?null:(side==='home'?'mate:':'enemy:')+index;
}
function getBallCarrier(){
 if(ball.owner==='player')return player;if(ball.owner==='rival')return rival;
 if(typeof ball.owner==='string'&&ball.owner.startsWith('mate:'))return teammates[Number(ball.owner.slice(5))]||null;
 if(typeof ball.owner==='string'&&ball.owner.startsWith('enemy:'))return opponents[Number(ball.owner.slice(6))]||null;
 return null;
}
function isHomeOwner(o){return o==='player'||(typeof o==='string'&&o.startsWith('mate:'))}
function isAwayOwner(o){return o==='rival'||(typeof o==='string'&&o.startsWith('enemy:'))}
function setPossession(actor,side){ball.owner=ownerKey(actor,side);ball.vx=0;ball.vz=0;ball.lastTouch=actor;ball.lastTouchLock=.2;}

const state={running:false,last:0,elapsed:0,home:0,away:0};
let tutorialActive=false,tutorialStep=0,tutorialDistance=0;
const input={x:0,z:0,sprint:false};
let cameraMode='broadcast';
let cameraYaw=0;
const cameraBtn=document.getElementById('cameraBtn');
let tackleCooldown=0,aiStealCooldown=0,aiShotCooldown=0;
const goalFlash={until:0};
function scoreGoal(side){
 if(goalFlash.until>state.elapsed)return;
 goalFlash.until=state.elapsed+1.2;
 if(side==='home')state.home++;else state.away++;
 homeEl.textContent=state.home;awayEl.textContent=state.away;
 resetPositions();
}
function tryTackle(){
  if(tackleCooldown>0)return;
  tackleCooldown=.48;
  const carrier=getBallCarrier();
  if(carrier&&isAwayOwner(ball.owner)&&Math.hypot(player.root.position.x-carrier.root.position.x,player.root.position.z-carrier.root.position.z)<2.45){
   ball.owner='player';ball.vx=0;ball.vz=0;
   ball.x=player.root.position.x+Math.sin(player.root.rotation.y)*.52;
   ball.z=player.root.position.z+Math.cos(player.root.rotation.y)*.52;
   if(tutorialActive&&tutorialStep===5)advanceTutorial();
  }else if(!ball.owner&&dist(player,ball)<1.9){ball.owner='player';ball.vx=0;ball.vz=0;}
 }
function checkGoal(){
 // Goal mouths are 4.5 m wide and 2.5 m high; the ball must fully cross the line.
 if(Math.abs(ball.x)>52.35&&Math.abs(ball.z)<3.58&&ball.height<2.38){
  scoreGoal(ball.x>0?'home':'away');
  return true;
 }
 return false;
}

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
 tackleCooldown=Math.max(0,tackleCooldown-dt);
 ball.lastTouchLock=Math.max(0,ball.lastTouchLock-dt);
 const magnitude=Math.hypot(input.x,input.z);
 let moving=false;
 if(magnitude>.08){
  // Chase mode uses camera-relative movement; side mode keeps its old controls.
  const sideView=cameraMode==='side';
  let dx,dz;
  if(sideView){
   dx=input.x/magnitude;
   dz=input.z/magnitude;
  }else{
   // Use the camera's real horizontal viewing basis. The previous yaw-based
   // formula used the opposite screen-right direction in the behind-player
   // view, so dragging left could move the footballer right.
   const forwardInput=-input.z/magnitude;
   const rightInput=input.x/magnitude;
   const viewForward=camera.getWorldDirection(new THREE.Vector3());
   viewForward.y=0;
   viewForward.normalize();
   const viewRight=new THREE.Vector3().crossVectors(viewForward,new THREE.Vector3(0,1,0)).normalize();
   dx=viewRight.x*rightInput+viewForward.x*forwardInput;
   dz=viewRight.z*rightInput+viewForward.z*forwardInput;
  }
  const worldLength=Math.hypot(dx,dz)||1;
  dx/=worldLength;dz/=worldLength;
  player.dx=dx;player.dz=dz;
  const speed=input.sprint?8.7:6.1;
  player.root.position.x=clamp(player.root.position.x+dx*speed*dt,-50,50);
  player.root.position.z=clamp(player.root.position.z+dz*speed*dt,-32,32);
  player.root.rotation.y=Math.atan2(dx,dz);
  moving=true;
 }
 updatePlayerVisual(player,dt,moving);
 if(tutorialActive&&moving&&(tutorialStep!==1||input.sprint))updateTutorialDistance((input.sprint?8.7:6.1)*dt);
 const rivalTarget=tutorialActive&&tutorialStep===5?player.root.position:(isHomeOwner(ball.owner)?player.root.position:(isAwayOwner(ball.owner)?{x:-41.5,z:clamp(ball.z*.35,-2.5,2.5)}:ball));
  const rx=rivalTarget.x-rival.root.position.x,rz=rivalTarget.z-rival.root.position.z,rd=Math.hypot(rx,rz)||1;
  if(rd>.65){
   const speed=isAwayOwner(ball.owner)?5.25:6.5;
   rival.root.position.x=clamp(rival.root.position.x+rx/rd*speed*dt,-50,50);
   rival.root.position.z=clamp(rival.root.position.z+rz/rd*speed*dt,-32,32);
   rival.root.rotation.y=Math.atan2(rx,rz);
  }
  if(!ball.owner&&rd<.9){setPossession(rival,'away')}
  updatePlayerVisual(rival,dt,rd>.65);
  // Autonomous team AI: react to possession, open space, pressure and nearby players.
  const nearest=(arr,x,z)=>arr.reduce((best,p,i)=>{
   const d=Math.hypot(p.root.position.x-x,p.root.position.z-z);
   return d<best.d?{i,d,p}:best;
  },{i:-1,d:Infinity,p:null});
  const moveBot=(bot,tx,tz,speed,group)=>{
   let sx=0,sz=0;
   for(const other of group){
    if(other===bot)continue;
    const dx=bot.root.position.x-other.root.position.x,dz=bot.root.position.z-other.root.position.z,d=Math.hypot(dx,dz);
    if(d>0.01&&d<2.8){const force=(2.8-d)/2.8;sx+=dx/d*force;sz+=dz/d*force}
   }
   tx=clamp(tx+sx*3.2,-48,48);tz=clamp(tz+sz*3.2,-30,30);
   const dx=tx-bot.root.position.x,dz=tz-bot.root.position.z,d=Math.hypot(dx,dz)||1,step=Math.min(d,speed*dt);
   bot.root.position.x+=dx/d*step;bot.root.position.z+=dz/d*step;
   if(d>.22)bot.root.rotation.y=Math.atan2(dx,dz);
   updatePlayerVisual(bot,dt,d>.55);
  };
  const homeHasBall=isHomeOwner(ball.owner),awayHasBall=isAwayOwner(ball.owner),loose=ball.owner===null;
  const homeChaser=nearest(teammates,ball.x,ball.z),awayChaser=nearest(opponents,ball.x,ball.z);
  const currentCarrier=getBallCarrier();
  const pressTarget=currentCarrier?currentCarrier.root.position:{x:ball.x,z:ball.z};
  const homePress=nearest(teammates,pressTarget.x,pressTarget.z);
  const awayPress=nearest(opponents,pressTarget.x,pressTarget.z);
  const time=state.elapsed;
  teammates.forEach((mate,i)=>{
   const bx=ball.x,bz=ball.z,baseX=mate.homeX,baseZ=mate.homeZ;
   const forward=baseX>0,mid=baseX>-25&&baseX<=0;
   let tx=baseX,tz=baseZ,speed=5.8;
   if(homeHasBall){
    tx=baseX+(forward?13:mid?8:3)+clamp((bx+10)*.12,-3,7);
    tz=baseZ*.58+bz*.42+Math.sin(time*1.15+i*1.7)*(forward?3.2:2);
    if(forward&&Math.abs(mate.root.position.z-player.root.position.z)<4)tz+=mate.root.position.z>player.root.position.z?5:-5;
    if(forward)speed=6.8;
   }else if(awayHasBall){
    if(i===homePress.i){tx=pressTarget.x+1.1;tz=pressTarget.z;speed=7.5}
    else if(Math.hypot(mate.root.position.x-pressTarget.x,mate.root.position.z-pressTarget.z)<13){
     tx=(baseX+pressTarget.x)*.5;tz=(baseZ+pressTarget.z)*.5;speed=6.4;
    }else{tx=baseX-5+clamp((bx-baseX)*.16,-5,4);tz=baseZ*.65+bz*.35;speed=6.2}
   }else if(i===homeChaser.i){tx=bx;tz=bz;speed=7.4}
   else{
    tx=baseX+clamp((bx-baseX)*.25,-8,8);
    tz=baseZ*.55+bz*.45+Math.sin(time+i*1.9)*2.4;
    if(homeChaser.d<10){tx+=forward?5:2;tz+=(i%2?4:-4)}
   }
   moveBot(mate,tx,tz,speed,teammates);
  });
  opponents.forEach((enemy,i)=>{
   const bx=ball.x,bz=ball.z,baseX=enemy.awayX,baseZ=enemy.awayZ;
   const forward=baseX<0,mid=baseX<25&&baseX>=0;
   let tx=baseX,tz=baseZ,speed=5.9;
   if(awayHasBall){
    tx=baseX-(forward?13:mid?8:3)-clamp((10-bx)*.12,-3,7);
    tz=baseZ*.58+bz*.42+Math.sin(time*1.1+i*1.6)*(forward?3.1:2.1);
    if(forward)speed=6.8;
   }else if(homeHasBall){
    if(i===awayPress.i){tx=pressTarget.x-1.1;tz=pressTarget.z;speed=7.5}
    else if(Math.hypot(enemy.root.position.x-pressTarget.x,enemy.root.position.z-pressTarget.z)<13){
     tx=(baseX+pressTarget.x)*.5;tz=(baseZ+pressTarget.z)*.5;speed=6.4;
    }else{tx=baseX+5+clamp((bx-baseX)*.16,-4,5);tz=baseZ*.65+bz*.35;speed=6.2}
   }else if(i===awayChaser.i){tx=bx;tz=bz;speed=7.4}
   else{tx=baseX+clamp((bx-baseX)*.25,-8,8);tz=baseZ*.55+bz*.45+Math.sin(time+i*1.8)*2.3}
   moveBot(enemy,tx,tz,speed,opponents);
  });
// AI carrier decisions: carry into space, pass when pressed, shoot near goal.
   aiDecisionCooldown=Math.max(0,aiDecisionCooldown-dt);
   const activeCarrier=getBallCarrier();
   if(activeCarrier&&activeCarrier!==player){
    const homeCarrier=isHomeOwner(ball.owner),direction=homeCarrier?1:-1,root=activeCarrier.root;
    const goalX=direction*52.5,attackZ=clamp(-ball.z*.28,-2.7,2.7);
    const defending=homeCarrier?opponents:homeActors;
    const pressure=defending.reduce((best,p)=>Math.min(best,Math.hypot(p.root.position.x-root.position.x,p.root.position.z-root.position.z)),Infinity);
    const distanceToGoal=Math.abs(goalX-root.position.x);
    if(aiDecisionCooldown<=0&&(distanceToGoal<23||pressure<3.2)){
     const options=(homeCarrier?homeActors:awayActors).filter(p=>p!==activeCarrier)
      .map(p=>({p,forward:(p.root.position.x-root.position.x)*direction,space:defending.reduce((d,e)=>Math.min(d,Math.hypot(e.root.position.x-p.root.position.x,e.root.position.z-p.root.position.z)),Infinity)}))
      .filter(o=>o.forward>3).sort((x,y)=>(y.forward+y.space*.45)-(x.forward+x.space*.45));
     if(distanceToGoal<17&&pressure>2.3){
      const dx=goalX-root.position.x,dz=attackZ-root.position.z,len=Math.hypot(dx,dz)||1;
      ball.owner=null;ball.lastTouch=activeCarrier;ball.lastTouchLock=.28;ball.vx=dx/len*20;ball.vz=dz/len*20;ball.height=.52;
     }else if(options[0]&&pressure<3.2){
      const receiver=options[0].p,dx=receiver.root.position.x-root.position.x,dz=receiver.root.position.z-root.position.z,len=Math.hypot(dx,dz)||1,power=clamp(len*.82,7,13);
      ball.owner=null;ball.lastTouch=activeCarrier;ball.lastTouchLock=.28;ball.vx=dx/len*power;ball.vz=dz/len*power;ball.height=.38;
     }
     aiDecisionCooldown=.85+Math.random()*.55;
    }
    if(ball.owner){
     const dx=goalX-root.position.x,dz=attackZ-root.position.z,len=Math.hypot(dx,dz)||1,stride=Math.min(len,3.15*dt);
     root.rotation.y=Math.atan2(dx,dz);root.position.x+=dx/len*stride;root.position.z+=dz/len*stride;
     updatePlayerVisual(activeCarrier,dt,stride>.02);
    }
   }
     // Goalkeepers track the ball laterally while staying close to their goal line.
  // Goalkeepers read the shot vector and shift toward its projected crossing
  // point instead of simply mirroring the ball's current lateral position.
  const projectAtGoal=(goalX)=>{
   if(Math.abs(ball.vx)<1.2)return ball.z;
   const t=clamp((goalX-ball.x)/ball.vx,0,1.8);
   return ball.z+ball.vz*t;
  };
  const keeperHomeZ=clamp(projectAtGoal(-49.2)*.82,-3.25,3.25);
  const keeperAwayZ=clamp(projectAtGoal(49.2)*.82,-3.25,3.25);
  const homeStep=clamp((ball.x+50)/14,0,1)*4.5;
  const awayStep=clamp((50-ball.x)/14,0,1)*4.5;
  for(const [keeper,gx,gz,defendingShot] of [
   [homeKeeper,-50+homeStep,keeperHomeZ,ball.vx< -3],
   [awayKeeper,50-awayStep,keeperAwayZ,ball.vx>3]
  ]){
   const kx=gx-keeper.root.position.x,kz=gz-keeper.root.position.z;
   const kd=Math.hypot(kx,kz)||1;
   const keeperSpeed=defendingShot?7.2:4.8;
   const ks=Math.min(kd,keeperSpeed*dt);
   keeper.root.position.x+=kx/kd*ks;keeper.root.position.z+=kz/kd*ks;
   if(kd>.2)keeper.root.rotation.y=Math.atan2(kx,kz);
   updatePlayerVisual(keeper,dt,kd>.35);
  }
 const carrier=getBallCarrier();
 if(carrier){
  const a=carrier.root.rotation.y,offset=carrier===player?.82:.76;
  const tx=carrier.root.position.x+Math.sin(a)*offset,tz=carrier.root.position.z+Math.cos(a)*offset;
  ball.x+=(tx-ball.x)*Math.min(1,dt*14);ball.z+=(tz-ball.z)*Math.min(1,dt*14);ball.vx=ball.vz=0;
 }else{
  // Integrate the pass/shot and test the whole travelled segment against all
  // outfield players. This prevents fast passes from tunnelling through bodies.
  const oldX=ball.x,oldZ=ball.z;
  ball.x+=ball.vx*dt;ball.z+=ball.vz*dt;
  const speedBefore=Math.hypot(ball.vx,ball.vz);
  const drag=Math.pow(.987,dt*60);ball.vx*=drag;ball.vz*=drag;
  if(Math.hypot(ball.vx,ball.vz)<.08)ball.vx=ball.vz=0;
  ball.height=.31+Math.abs(Math.sin(state.elapsed*9))*Math.min(.2,speedBefore*.012);
  if(Math.abs(ball.z)>33.8){ball.z=clamp(ball.z,-33.8,33.8);ball.vz*=-.68}
  // Goal-line and post collisions are resolved below after ball integration.
  if(Math.abs(ball.x)>53.8&&Math.abs(ball.z)>3.7){ball.x=clamp(ball.x,-53.8,53.8);ball.vx*=-.55}
  if(Math.abs(ball.x)>53.8&&Math.abs(ball.z)<3.7&&ball.height>=2.38){ball.x=clamp(ball.x,-53.8,53.8);ball.vx*=-.55}
  const sx=ball.x-oldX,sz=ball.z-oldZ,segmentSq=sx*sx+sz*sz;
  let interceptor=null,interceptSide=null,bestImpact=Infinity;
  if(ball.height<1.15&&speedBefore<25){
   for(const [side,actors] of [['home',homeActors],['away',awayActors]])for(const actor of actors){
    const ax=actor.root.position.x-oldX,az=actor.root.position.z-oldZ;
    const t=segmentSq>1e-6?clamp((ax*sx+az*sz)/segmentSq,0,1):0;
    const px=oldX+sx*t,pz=oldZ+sz*t;
    const impact=Math.hypot(actor.root.position.x-px,actor.root.position.z-pz);
    const radius=speedBefore>15?.82:1.02;
    if(!(actor===ball.lastTouch&&ball.lastTouchLock>0)&&impact<radius&&impact<bestImpact){bestImpact=impact;interceptor=actor;interceptSide=side;}
   }
  }
  if(interceptor){
   setPossession(interceptor,interceptSide);
   ball.x=interceptor.root.position.x+Math.sin(interceptor.root.rotation.y)*.68;
   ball.z=interceptor.root.position.z+Math.cos(interceptor.root.rotation.y)*.68;
   ball.height=.31;
  }
 }
 // Goalkeepers react to shots on target and parry them back into play.
 if(!getBallCarrier()&&ball.height<2.35){
  const homeSaveDist=Math.hypot(ball.x-homeKeeper.root.position.x,ball.z-homeKeeper.root.position.z);
  const awaySaveDist=Math.hypot(ball.x-awayKeeper.root.position.x,ball.z-awayKeeper.root.position.z);
  if(ball.x<-44&&ball.vx<0&&homeSaveDist<2.35){
   ball.x=homeKeeper.root.position.x+1.0;ball.vx=Math.max(4.5,Math.abs(ball.vx)*.58);ball.vz*=.42;ball.height=.42;
  }else if(ball.x>44&&ball.vx>0&&awaySaveDist<2.35){
   ball.x=awayKeeper.root.position.x-1.0;ball.vx=-Math.max(4.5,Math.abs(ball.vx)*.58);ball.vz*=.42;ball.height=.42;
  }
 }

 // Goal frame collision: posts and crossbar deflect shots that miss the opening.
 if(Math.abs(Math.abs(ball.x)-52.5)<.34){
  for(const postZ of [-3.66,3.66]){
   const d=Math.hypot(ball.x-Math.sign(ball.x)*52.5,ball.z-postZ);
   if(d<.43&&ball.height<2.65){
    const nx=(ball.x-Math.sign(ball.x)*29)/(d||1),nz=(ball.z-postZ)/(d||1);
    const dot=ball.vx*nx+ball.vz*nz;
    if(dot<0){ball.vx-=1.55*dot*nx;ball.vz-=1.55*dot*nz;}
   }
  }
  if(Math.abs(ball.z)<3.66&&Math.abs(ball.height-2.44)<.38){
   ball.height=2.13;ball.vx*=-.55;ball.vz*=.82;
  }
 }
 if(checkGoal())return;
 // Back net: absorb the ball after it crosses into the goal.
 if(Math.abs(ball.x)>55&&Math.abs(ball.z)<3.66&&ball.height<2.4){
  ball.x=Math.sign(ball.x)*55;ball.vx=0;ball.vz*=.45;
 }
 ballGroup.position.set(ball.x,ball.height,ball.z);
 ballMesh.rotation.x+=ball.vz*dt*1.4;ballMesh.rotation.z-=ball.vx*dt*1.4;
 ballShadow.position.x=ball.x;ballShadow.position.z=ball.z;
 ballShadow.scale.setScalar(1-Math.min(.35,ball.height*.22));
 // Broadcast-style match camera: follows the play, not the controlled player's back.
 // The ball and controlled player stay in view while the pitch remains readable.
 const px=player.root.position.x,pz=player.root.position.z,bx=ball.x,bz=ball.z;
 if(cameraMode==='broadcast'){
  const playX=clamp(px*.42+bx*.58,-24,24);
  const playZ=clamp(pz*.30+bz*.70,-10,10);
  const spread=Math.hypot(px-bx,pz-bz);
  const desiredHeight=57+Math.min(8,spread*.12);
  const follow=1-Math.exp(-dt*2.4);
  camera.position.x+=(playX*.20-camera.position.x)*follow;
  camera.position.y+=(desiredHeight-camera.position.y)*(1-Math.exp(-dt*1.8));
  camera.position.z+=(73-camera.position.z)*follow;
  camera.lookAt(playX*.48,0,playZ*.20);
 }else if(cameraMode==='behind'){
  // Track the player's actual facing direction continuously, including while
  // moving. Previously the yaw only changed while idle, leaving the camera
  // looking from the wrong side during turns.
  const targetYaw=player.root.rotation.y;
  const angleDelta=Math.atan2(Math.sin(targetYaw-cameraYaw),Math.cos(targetYaw-cameraYaw));
  cameraYaw+=angleDelta*(1-Math.exp(-dt*4.2));
  const distance=15.5;
  const desiredX=px-Math.sin(cameraYaw)*distance;
  const desiredZ=pz-Math.cos(cameraYaw)*distance;
  const follow=1-Math.exp(-dt*4.0);
  camera.position.x+=(desiredX-camera.position.x)*follow;
  camera.position.y+=(10.5-camera.position.y)*(1-Math.exp(-dt*3.0));
  camera.position.z+=(desiredZ-camera.position.z)*follow;
  camera.lookAt(px+Math.sin(cameraYaw)*4.1,1.05,pz+Math.cos(cameraYaw)*4.1);
 }else{
  const centerX=px*.42+bx*.58;
  camera.position.x+=(centerX*.28-camera.position.x)*Math.min(1,dt*1.7);
  camera.position.y+=(59-camera.position.y)*Math.min(1,dt*1.7);
  camera.position.z+=(76-camera.position.z)*Math.min(1,dt*1.7);
  camera.lookAt(centerX*.45,0,0);
 }
}
function resetPositions(){
 player.root.position.set(-21,0,0);rival.root.position.set(21,0,0);
 teammates.forEach(m=>m.root.position.set(m.homeX,0,m.homeZ));
 opponents.forEach(e=>e.root.position.set(e.awayX,0,e.awayZ));
 homeKeeper.root.position.set(-50,0,0);awayKeeper.root.position.set(50,0,0);
 ball.x=-18.9;ball.z=0;ball.vx=ball.vz=0;ball.owner=null;ball.height=.31;ball.lastTouch=null;ball.lastTouchLock=0;
}
function render(){renderer.render(scene,camera)}
function resize(){
 const w=window.innerWidth,h=window.innerHeight,aspect=w/h;
 renderer.setSize(w,h,false);
 camera.aspect=aspect;
 if(aspect<1){
  camera.fov=68;
  camera.position.set(0,56,74);
 }else{
  camera.fov=52;
  camera.position.set(0,60,78);
 }
 camera.updateProjectionMatrix();
 camera.lookAt(0,0,0);
}
window.addEventListener('resize',resize,{passive:true});resize();
function updateCameraLabel(){
 cameraBtn.textContent=cameraMode==='broadcast'?'КАМЕРА: ТРАНСЛЯЦИЯ':cameraMode==='behind'?'КАМЕРА: ЗА ИГРОКОМ':'КАМЕРА: СБОКУ';
}
updateCameraLabel();
cameraBtn.addEventListener('click',()=>{
 cameraMode=cameraMode==='broadcast'?'behind':cameraMode==='behind'?'side':'broadcast';
 updateCameraLabel();
});
function frame(now){
 if(!state.running)return;
 const dt=Math.min((now-state.last)/1000,.04);state.last=now;state.elapsed+=dt;
 const sec=Math.floor(state.elapsed);
 clockEl.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
 update(dt);render();requestAnimationFrame(frame);
}
function start(){
 if(state.running)return;
 trainingOverlay.classList.add('hidden');
 overlay.classList.add('hidden');
 state.running=true;state.last=performance.now();requestAnimationFrame(frame);
}
playBtn.addEventListener('click',start);
document.getElementById('playBtnHero')?.addEventListener('click',start);
settingsBtn.addEventListener('click',()=>{menuMessage.textContent='НАСТРОЙКИ: КНОПКА «КАМЕРА» В МАТЧЕ МЕНЯЕТ РАКУРС';});

const tutorialLessons=[
 {title:'ДВИЖЕНИЕ',text:'Проведи игрока вперёд или в сторону левым джойстиком.',tip:'Набери 4 метра движения.',goal:4},
 {title:'УСКОРЕНИЕ',text:'Зажми кнопку «РЫВОК» и пробеги дистанцию.',tip:'Пробеги 5 метров с ускорением.',goal:5},
 {title:'ВЕДЕНИЕ МЯЧА',text:'Мяч у ног. Управляй игроком и веди его в свободную зону.',tip:'Продвинься с мячом на 6 метров.',goal:6},
 {title:'ПАС',text:'Нажми «ПАС», чтобы отправить мяч ближайшему партнёру.',tip:'Выполни настоящий пас кнопкой справа.',goal:1},
 {title:'УДАР',text:'Направь атаку к воротам и нажми «УДАР».',tip:'Попробуй пробить по воротам соперника.',goal:1},
 {title:'ОТБОР',text:'Соперник получил мяч. Подойди и нажми «ОТБОР».',tip:'Отбери мяч у соперника.',goal:1}
];
function setupTutorialStep(){
 const lesson=tutorialLessons[tutorialStep];tutorialDistance=0;
 trainingProgress.textContent='УПРАЖНЕНИЕ '+(tutorialStep+1)+' / '+tutorialLessons.length;
 trainingTitle.textContent=lesson.title;trainingText.textContent=lesson.text;trainingTip.textContent=lesson.tip;trainingMeterFill.style.width='0%';
 if(tutorialStep===0){player.root.position.set(-20,0,0);ball.owner=null;ball.x=-18.9;ball.z=0;}
 if(tutorialStep===1){player.root.position.set(-15,0,0);ball.owner=null;ball.x=-5;ball.z=0;}
 if(tutorialStep===2||tutorialStep===3||tutorialStep===4){player.root.position.set(tutorialStep===2?-12:12,0,0);player.root.rotation.y=Math.PI/2;ball.owner='player';ball.x=player.root.position.x+.82;ball.z=0;ball.vx=ball.vz=0;}
 if(tutorialStep===5){player.root.position.set(0,0,0);rival.root.position.set(1.45,0,0);rival.root.rotation.y=-Math.PI/2;ball.owner='rival';ball.x=2.27;ball.z=0;ball.vx=ball.vz=0;}
}
function advanceTutorial(){
 tutorialStep++;
 if(tutorialStep>=tutorialLessons.length){tutorialActive=false;trainingOverlay.classList.add('hidden');state.running=false;overlay.classList.remove('hidden');menuMessage.textContent='АКАДЕМИЯ ПРОЙДЕНА · ВСЕ 6 УПРАЖНЕНИЙ ВЫПОЛНЕНЫ';return;}
 setupTutorialStep();
}
function updateTutorialDistance(amount){
 if(!tutorialActive||amount<=0||tutorialStep>2)return;
 tutorialDistance+=amount;trainingMeterFill.style.width=Math.min(100,tutorialDistance/tutorialLessons[tutorialStep].goal*100)+'%';
 if(tutorialDistance>=tutorialLessons[tutorialStep].goal)advanceTutorial();
}
function openTraining(){
 tutorialActive=true;tutorialStep=0;state.home=0;state.away=0;homeEl.textContent='0';awayEl.textContent='0';
 overlay.classList.add('hidden');trainingOverlay.classList.remove('hidden');resetPositions();setupTutorialStep();
 state.running=true;state.last=performance.now();requestAnimationFrame(frame);
}
trainingBtn.addEventListener('click',openTraining);
trainingBackBtn.addEventListener('click',()=>{tutorialActive=false;state.running=false;trainingOverlay.classList.add('hidden');overlay.classList.remove('hidden');resetPositions();});
profileBtn.addEventListener('click',()=>{
 authOverlay.classList.remove('hidden');authMethods.classList.remove('hidden');authForm.classList.add('hidden');
 authTitle.textContent='ТВОЙ АККАУНТ';authDescription.textContent='Выбери удобный способ входа. Гостевой режим останется доступен.';
 authStatus.textContent='Реальный вход подключим после настройки Firebase.';
});
document.getElementById('authBackBtn').addEventListener('click',()=>authOverlay.classList.add('hidden'));
authMethods.addEventListener('click',e=>{
 const button=e.target.closest('[data-auth]');if(!button)return;
 authMethod=button.dataset.auth;
 if(authMethod==='email'||authMethod==='phone'){
  authMethods.classList.add('hidden');authForm.classList.remove('hidden');
  const email=document.getElementById('authEmail'),password=document.getElementById('authPassword');
  const phone=document.getElementById('authPhone'),code=document.getElementById('authCode');
  email.classList.toggle('hidden',authMethod!=='email');password.classList.toggle('hidden',authMethod!=='email');
  phone.classList.toggle('hidden',authMethod!=='phone');code.classList.add('hidden');
  authTitle.textContent=authMethod==='email'?'ВХОД ПО ПОЧТЕ':'ВХОД ПО ТЕЛЕФОНУ';
  authModeToggle.classList.toggle('hidden',authMethod!=='email');
  authSubmit.textContent=authMethod==='email'?'ВОЙТИ':'ОТПРАВИТЬ SMS';
  authStatus.textContent='Форма готова. Для реального входа нужен проект Firebase.';
 }else{
  authStatus.textContent=(authMethod==='apple'?'Apple ID':'Google')+': подключим после настройки Firebase и OAuth-провайдера.';
 }
});
authModeToggle.addEventListener('click',()=>{
 authIsRegister=!authIsRegister;
 authTitle.textContent=authIsRegister?'РЕГИСТРАЦИЯ':'ВХОД ПО ПОЧТЕ';
 authSubmit.textContent=authIsRegister?'СОЗДАТЬ АККАУНТ':'ВОЙТИ';
 authModeToggle.textContent=authIsRegister?'УЖЕ ЕСТЬ АККАУНТ':'СОЗДАТЬ АККАУНТ';
});
authSubmit.addEventListener('click',()=>{
 authStatus.textContent='Пока не подключено: пришли публичную веб-конфигурацию Firebase, и я подключу реальную проверку аккаунта. Пароль или секретные ключи не присылай.';
});
settingsBtn.addEventListener('click',()=>{menuMessage.textContent='Настройки управления и звука добавим следующим этапом.';});
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
 let dx,dz,power;
 if(type==='shoot'){
  // The controlled team attacks the goal on the positive X side.
  dx=53-ball.x;dz=-ball.z*.28;power=22;
 }else{
  // Pass to the closest available teammate instead of blindly following
  // the joystick direction. Scale power so the ball slows near the receiver.
  const receiver=teammates.map(mate=>{
   const mx=mate.root.position.x-player.root.position.x,mz=mate.root.position.z-player.root.position.z;
   const distance=Math.hypot(mx,mz);
   const space=opponents.reduce((best,enemy)=>Math.min(best,Math.hypot(enemy.root.position.x-mate.root.position.x,enemy.root.position.z-mate.root.position.z)),Infinity);
   const forward=mx;
   const lane=opponents.reduce((best,enemy)=>{
    const ex=enemy.root.position.x-player.root.position.x,ez=enemy.root.position.z-player.root.position.z;
    const t=clamp((ex*mx+ez*mz)/(distance*distance||1),0,1);
    return Math.min(best,Math.hypot(player.root.position.x+mx*t-enemy.root.position.x,player.root.position.z+mz*t-enemy.root.position.z));
   },Infinity);
   return {mate,distance,score:forward*.55+space*.8+lane*.35-Math.abs(mz)*.08};
  }).filter(o=>o.distance>3).sort((a,b)=>b.score-a.score)[0];
  if(receiver){
   dx=receiver.mate.root.position.x-ball.x;
   dz=receiver.mate.root.position.z-ball.z;
   power=clamp(receiver.distance*.78,5,13);
  }else{
   dx=player.dx;dz=player.dz;power=10.5;
  }
 }
 const len=Math.hypot(dx,dz)||1;
 ball.owner=null;ball.lastTouch=player;ball.lastTouchLock=.28;
 ball.vx=dx/len*power;ball.vz=dz/len*power;ball.height=.38;
 if(tutorialActive&&((tutorialStep===3&&type==='pass')||(tutorialStep===4&&type==='shoot')))advanceTutorial();
}
document.getElementById('passBtn').addEventListener('pointerdown',e=>{e.preventDefault();kick('pass')});
document.getElementById('shootBtn').addEventListener('pointerdown',e=>{e.preventDefault();kick('shoot')});
const tackleBtn=document.getElementById('tackleBtn');
tackleBtn.addEventListener('pointerdown',e=>{e.preventDefault();tryTackle()});
tackleBtn.addEventListener('click',tryTackle);
window.addEventListener('keydown',e=>{
 const keys={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};
 if(e.key==='Shift'){input.sprint=true;return;}
 const k=keys[e.key];if(!k)return;e.preventDefault();
 if(k==='left')input.x=-1;if(k==='right')input.x=1;if(k==='up')input.z=-1;if(k==='down')input.z=1;
});
window.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight','a','d'].includes(e.key))input.x=0;if(['ArrowUp','ArrowDown','w','s'].includes(e.key))input.z=0;if(e.key==='Shift')input.sprint=false});
render();
})();