(()=>{
const canvas=document.getElementById('pitch');
const ctx=canvas.getContext('2d');
const overlay=document.getElementById('overlay');
const startBtn=document.getElementById('startBtn');
const clockEl=document.getElementById('clock');
const homeEl=document.getElementById('homeScore');
const awayEl=document.getElementById('awayScore');
const W=1200,H=720;
let running=false,last=0,elapsed=0,home=0,away=0;
const input={x:0,y:0,sprint:false};
const player={x:390,y:360,r:24,speed:300,dx:1,dy:0};
const rival={x:820,y:360,r:25,speed:190,dx:-1,dy:0,kickCooldown:0};
const ball={x:440,y:360,r:13,vx:0,vy:0,owner:null};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

function field(){
 ctx.fillStyle='#126b39';ctx.fillRect(0,0,W,H);
 for(let i=0;i<10;i++){ctx.fillStyle=i%2?'#177541':'#126b39';ctx.fillRect(i*120,0,120,H)}
 ctx.strokeStyle='#eaf5e5';ctx.lineWidth=4;ctx.strokeRect(22,22,W-44,H-44);
 ctx.beginPath();ctx.moveTo(W/2,22);ctx.lineTo(W/2,H-22);ctx.stroke();
 ctx.beginPath();ctx.arc(W/2,H/2,105,0,Math.PI*2);ctx.stroke();
 ctx.strokeRect(22,215,160,290);ctx.strokeRect(W-182,215,160,290);
 ctx.strokeRect(22,285,70,150);ctx.strokeRect(W-92,285,70,150);
 ctx.fillStyle='#eaf5e5';ctx.fillRect(0,285,22,150);ctx.fillRect(W-22,285,22,150);
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(W/2,H/2,5,0,Math.PI*2);ctx.fill();
 // Subtle goal nets
 ctx.strokeStyle='#ffffff88';ctx.lineWidth=2;
 for(let y=295;y<430;y+=18){ctx.beginPath();ctx.moveTo(4,y);ctx.lineTo(18,y);ctx.stroke();ctx.beginPath();ctx.moveTo(W-4,y);ctx.lineTo(W-18,y);ctx.stroke()}
}
function playerDraw(p,shirt,number){
 ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(p.x,p.y+18,27,11,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=shirt;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
 ctx.lineWidth=4;ctx.strokeStyle='#f4ffe9';ctx.stroke();
 ctx.fillStyle='#102016';ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(number,p.x,p.y+1);
 ctx.fillStyle='#f4d3b0';ctx.beginPath();ctx.arc(p.x+p.dx*7,p.y-17+p.dy*4,11,0,Math.PI*2);ctx.fill();
}
function ballDraw(){
 ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(ball.x+3,ball.y+8,16,7,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#222';ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle='#222';
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.arc(ball.x+Math.cos(a)*6,ball.y+Math.sin(a)*6,2.5,0,Math.PI*2);ctx.fill()}
}
function render(){field();playerDraw(player,'#b9ef63','10');playerDraw(rival,'#e85e50','9');ballDraw()}
function reset(){
 player.x=390;player.y=360;player.dx=1;player.dy=0;
 rival.x=820;rival.y=360;rival.dx=-1;rival.dy=0;rival.kickCooldown=.7;
 ball.x=440;ball.y=360;ball.vx=ball.vy=0;ball.owner=null;
 input.x=input.y=0;
}
function update(dt){
 const mag=Math.hypot(input.x,input.y);
 if(mag>.08){
  const dx=input.x/mag,dy=input.y/mag;
  player.dx=dx;player.dy=dy;
  const speed=player.speed*(input.sprint?1.42:1);
  player.x=clamp(player.x+dx*speed*dt,48,W-48);
  player.y=clamp(player.y+dy*speed*dt,48,H-48);
 }
 // Ball control: keep it close to the player's feet while dribbling.
 if(ball.owner==='player'){
  const lead=player.r+ball.r+8;
  const targetX=player.x+player.dx*lead,targetY=player.y+player.dy*lead;
  ball.x+=(targetX-ball.x)*Math.min(1,dt*15);
  ball.y+=(targetY-ball.y)*Math.min(1,dt*15);
  ball.vx=ball.vy=0;
 }else{
  if(!ball.owner&&distance(player,ball)<player.r+ball.r+17&&Math.hypot(ball.vx,ball.vy)<260)ball.owner='player';
  if(ball.owner==='rival'){
   const lead=rival.r+ball.r+8;
   ball.x+=(rival.x+rival.dx*lead-ball.x)*Math.min(1,dt*13);
   ball.y+=(rival.y+rival.dy*lead-ball.y)*Math.min(1,dt*13);
   ball.vx=ball.vy=0;
  }else{
   ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
   const drag=Math.pow(.982,dt*60);ball.vx*=drag;ball.vy*=drag;
   if(Math.hypot(ball.vx,ball.vy)<8){ball.vx=0;ball.vy=0}
  }
 }
 // Opponent chases the ball and can win possession.
 const target=ball.owner==='player'?player:ball;
 const tx=target.x-rival.x,ty=target.y-rival.y,td=Math.hypot(tx,ty)||1;
 const rx=tx/td,ry=ty/td;
 rival.dx=rx;rival.dy=ry;
 const rivalSpeed=rival.speed*(ball.owner==='rival'?1:1.08);
 rival.x=clamp(rival.x+rx*rivalSpeed*dt,48,W-48);
 rival.y=clamp(rival.y+ry*rivalSpeed*dt,48,H-48);
 rival.kickCooldown=Math.max(0,rival.kickCooldown-dt);
 if(distance(rival,ball)<rival.r+ball.r+12&&ball.owner!=='rival'){
  ball.owner='rival';ball.vx=ball.vy=0;
 }
 if(ball.owner==='rival'&&rival.kickCooldown<=0&&rival.x<260){
  ball.owner=null;ball.vx=-560;ball.vy=(360-ball.y)*.55;rival.kickCooldown=1.1;
 }
 // Player can recover a loose ball or challenge the opponent.
 if(ball.owner==='rival'&&distance(player,rival)<player.r+rival.r+5&&distance(player,ball)<75)ball.owner='player';
 // Field boundaries and goal detection.
 if(ball.owner===null){
  if(ball.y<38){ball.y=38;ball.vy=Math.abs(ball.vy)*.72}
  if(ball.y>H-38){ball.y=H-38;ball.vy=-Math.abs(ball.vy)*.72}
  if(ball.x<22&&ball.y>285&&ball.y<435){away++;score();reset()}
  else if(ball.x>W-22&&ball.y>285&&ball.y<435){home++;score();reset()}
  else{
   if(ball.x<35){ball.x=35;ball.vx=Math.abs(ball.vx)*.72}
   if(ball.x>W-35){ball.x=W-35;ball.vx=-Math.abs(ball.vx)*.72}
  }
 }
}
function score(){homeEl.textContent=home;awayEl.textContent=away}
function frame(t){
 if(!running)return;
 const dt=Math.min((t-last)/1000,.035);last=t;elapsed+=dt;
 const sec=Math.floor(elapsed);
 clockEl.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
 update(dt);render();requestAnimationFrame(frame);
}
function start(){if(running)return;running=true;overlay.classList.add('hidden');last=performance.now();requestAnimationFrame(frame)}
startBtn.addEventListener('click',start);
const joy=document.getElementById('joystick'),knob=document.getElementById('joyKnob');
let pointer=null;
function joyMove(e){
 if(pointer!==e.pointerId)return;
 const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,max=r.width*.31;
 let dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy);
 if(len>max){dx=dx/len*max;dy=dy/len*max}
 input.x=dx/max;input.y=dy/max;
 knob.style.transform='translate('+dx+'px,'+dy+'px)';
}
function joyEnd(e){if(pointer!==e.pointerId)return;pointer=null;input.x=input.y=0;knob.style.transform='translate(0,0)'}
joy.addEventListener('pointerdown',e=>{e.preventDefault();pointer=e.pointerId;joy.setPointerCapture(pointer);joyMove(e)});
joy.addEventListener('pointermove',joyMove);joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
const sprint=document.getElementById('sprintBtn');
sprint.addEventListener('pointerdown',e=>{e.preventDefault();input.sprint=true});
['pointerup','pointercancel','pointerleave'].forEach(ev=>sprint.addEventListener(ev,()=>input.sprint=false));
function kick(type){
 const d=distance(player,ball);
 if(ball.owner!=='player'&&d>player.r+ball.r+45)return;
 ball.owner=null;
 let dx,dy,power;
 if(type==='shoot'){
  dx=W-ball.x;dy=360-ball.y;power=790;
 }else{
  if(Math.hypot(input.x,input.y)>.2){dx=input.x;dy=input.y}
  else{dx=player.dx;dy=player.dy}
  if(dx<.15){dx=1;dy*=.5}
  power=390;
 }
 const len=Math.hypot(dx,dy)||1;
 ball.vx=dx/len*power;ball.vy=dy/len*power;
}
document.getElementById('passBtn').addEventListener('pointerdown',e=>{e.preventDefault();kick('pass')});
document.getElementById('shootBtn').addEventListener('pointerdown',e=>{e.preventDefault();kick('shoot')});
render();
})();