(() => {
const canvas=document.getElementById('pitch'),ctx=canvas.getContext('2d');
const overlay=document.getElementById('overlay'),startBtn=document.getElementById('startBtn');
const clockEl=document.getElementById('clock'),homeEl=document.getElementById('homeScore'),awayEl=document.getElementById('awayScore');
const W=900,H=600,keys=new Set();let running=false,last=0,elapsed=0,home=0,away=0;
const player={x:300,y:300,r:19,speed:245,vx:0,vy:0};
const rival={x:620,y:300,r:19};
const ball={x:340,y:300,r:10,vx:0,vy:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function resetPositions(){player.x=300;player.y=300;rival.x=620;rival.y=300;ball.x=340;ball.y=300;ball.vx=ball.vy=0}
function drawField(){
 ctx.fillStyle='#16743e';ctx.fillRect(0,0,W,H);
 for(let i=0;i<9;i++){ctx.fillStyle=i%2?'#197b42':'#14703b';ctx.fillRect(i*100,0,100,H)}
 ctx.strokeStyle='#d9f2d6';ctx.lineWidth=4;ctx.strokeRect(18,18,W-36,H-36);
 ctx.beginPath();ctx.moveTo(W/2,18);ctx.lineTo(W/2,H-18);ctx.stroke();
 ctx.beginPath();ctx.arc(W/2,H/2,82,0,Math.PI*2);ctx.stroke();
 ctx.strokeRect(18,180,125,240);ctx.strokeRect(W-143,180,125,240);
 ctx.strokeRect(18,245,55,110);ctx.strokeRect(W-73,245,55,110);
 ctx.fillStyle='#e8f4dc';ctx.fillRect(0,245,18,110);ctx.fillRect(W-18,245,18,110);
}
function person(p,color,number){
 ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(p.x,p.y+13,20,8,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
 ctx.fillStyle='#102014';ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(number,p.x,p.y+1);
}
function draw(){
 drawField();person(player,'#c8f56d','10');person(rival,'#f36b59','9');
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#17251c';ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle='#17251c';ctx.beginPath();ctx.arc(ball.x,ball.y,3,0,Math.PI*2);ctx.fill();
}
function move(dt){
 let dx=0,dy=0;
 if(keys.has('ArrowLeft')||keys.has('a')||keys.has('left'))dx--;
 if(keys.has('ArrowRight')||keys.has('d')||keys.has('right'))dx++;
 if(keys.has('ArrowUp')||keys.has('w')||keys.has('up'))dy--;
 if(keys.has('ArrowDown')||keys.has('s')||keys.has('down'))dy++;
 const len=Math.hypot(dx,dy)||1;player.x=clamp(player.x+dx/len*player.speed*dt,40,W-40);player.y=clamp(player.y+dy/len*player.speed*dt,40,H-40);
 const d=Math.hypot(player.x-ball.x,player.y-ball.y);
 if(d<player.r+ball.r+5){const a=Math.atan2(ball.y-player.y,ball.x-player.x);ball.x=player.x+Math.cos(a)*(player.r+ball.r+2);ball.y=player.y+Math.sin(a)*(player.r+ball.r+2);ball.vx+=Math.cos(a)*25;ball.vy+=Math.sin(a)*25}
 const rd=Math.hypot(rival.x-ball.x,rival.y-ball.y);
 if(rd<rival.r+ball.r+4){const a=Math.atan2(ball.y-rival.y,ball.x-rival.x);ball.vx+=Math.cos(a)*55;ball.vy+=Math.sin(a)*55}
 rival.x+=clamp(ball.x-rival.x,-1,1)*85*dt;rival.y+=clamp(ball.y-rival.y,-1,1)*85*dt;
 ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.vx*=Math.pow(.985,dt*60);ball.vy*=Math.pow(.985,dt*60);
 if(ball.y<30||ball.y>H-30)ball.vy*=-.75;
 if(ball.x<18&&ball.y>245&&ball.y<355){away++;score();resetPositions()}
 else if(ball.x>W-18&&ball.y>245&&ball.y<355){home++;score();resetPositions()}
 else if(ball.x<30||ball.x>W-30)ball.vx*=-.75;
 ball.x=clamp(ball.x,25,W-25);ball.y=clamp(ball.y,25,H-25);
}
function score(){homeEl.textContent=home;awayEl.textContent=away}
function frame(t){if(!running)return;const dt=Math.min((t-last)/1000,.04);last=t;elapsed+=dt;clockEl.textContent=new Date(elapsed*1000).toISOString().slice(14,19);move(dt);draw();requestAnimationFrame(frame)}
function start(){if(running)return;running=true;overlay.classList.add('hidden');last=performance.now();requestAnimationFrame(frame)}
startBtn.addEventListener('click',start);
document.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys.add(k);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault()});
document.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys.delete(k)});
document.querySelectorAll('[data-move]').forEach(btn=>{const k=btn.dataset.move;const down=e=>{e.preventDefault();keys.add(k)},up=e=>{e.preventDefault();keys.delete(k)};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointerleave',up);btn.addEventListener('pointercancel',up)});
function kick(power){const d=Math.hypot(player.x-ball.x,player.y-ball.y);if(d<player.r+ball.r+32){let dx=ball.x-player.x,dy=ball.y-player.y,l=Math.hypot(dx,dy)||1;ball.vx=dx/l*power;ball.vy=dy/l*power}else{ball.vx=power;ball.vy=0}}
document.getElementById('passBtn').addEventListener('click',()=>kick(300));
document.getElementById('shootBtn').addEventListener('click',()=>kick(620));
draw();
})();