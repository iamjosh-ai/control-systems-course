/* ============================================================
   Control Systems Mastery Course : SIMULATIONS + DIAGRAMS
   ------------------------------------------------------------
   Exposes window.CTRL_SIMS, window.CTRL_DIAGRAMS, window.CTRL_MATH.
   Plain JS, canvas, offline. No dependencies.

   CTRL_MATH is the numerical core, shared by every sim and
   unit-tested by test-math.js (node):
     poly ops, polynomial roots (Durand-Kerner), transfer function
     step response (state-space, RK4), step metrics, frequency
     response, Routh array, root locus.
   ============================================================ */
"use strict";
(function(root){

/* ---------------- numerical core ---------------- */
const M = {};
// polynomials: arrays of coefficients, highest power first. [1,2,3] = s^2+2s+3
M.trim = p => { let i=0; while(i<p.length-1 && Math.abs(p[i])<1e-14) i++; return p.slice(i); };
M.add = (a,b) => { const n=Math.max(a.length,b.length), r=[]; for(let i=0;i<n;i++){ r.push((a[i-n+a.length]||0)+(b[i-n+b.length]||0)); } return M.trim(r); };
M.mul = (a,b) => { const r=new Array(a.length+b.length-1).fill(0); a.forEach((x,i)=>b.forEach((y,j)=>r[i+j]+=x*y)); return r; };
M.scale = (a,k) => a.map(x=>x*k);
M.evalC = (p,re,im) => { let r=0,i=0; for(const c of p){ const nr=r*re-i*im+c, ni=r*im+i*re; r=nr; i=ni; } return [r,i]; };

// roots via Durand-Kerner; returns [[re,im],...]
M.roots = p => {
  p=M.trim(p); const n=p.length-1; if(n<1) return [];
  const a=p.map(c=>c/p[0]);
  let z=[]; for(let k=0;k<n;k++){ const ang=2*Math.PI*k/n+0.4; z.push([0.9*Math.cos(ang), 0.9*Math.sin(ang)]); }
  const R=1+Math.max(...a.slice(1).map(Math.abs)); z=z.map(([x,y])=>[x*R,y*R]);
  for(let it=0; it<500; it++){
    let delta=0;
    for(let i=0;i<n;i++){
      const [fr,fi]=M.evalC(a,z[i][0],z[i][1]);
      let dr=1,di=0;
      for(let j=0;j<n;j++){ if(j===i) continue; const xr=z[i][0]-z[j][0], xi=z[i][1]-z[j][1]; const nr=dr*xr-di*xi, ni=dr*xi+di*xr; dr=nr; di=ni; }
      const den=dr*dr+di*di||1e-300;
      const qr=(fr*dr+fi*di)/den, qi=(fi*dr-fr*di)/den;
      z[i]=[z[i][0]-qr, z[i][1]-qi]; delta=Math.max(delta,Math.hypot(qr,qi));
    }
    if(delta<1e-12) break;
  }
  return z.map(([x,y])=>[x, Math.abs(y)<1e-7?0:y]);
};

// transfer function num/den -> controllable canonical state-space (strictly or biproper)
M.tf2ss = (num,den) => {
  den=M.trim(den); num=M.trim(num); const a0=den[0]; den=den.map(c=>c/a0); num=num.map(c=>c/a0);
  const n=den.length-1;
  let nn=num.slice(); while(nn.length<n+1) nn.unshift(0);
  const D=nn[0];
  const b=[]; for(let i=1;i<=n;i++) b.push(nn[i]-D*den[i]);
  // x' = A x + B u ; companion form, states x1..xn
  return { n, a:den.slice(1), c:b, D };
};
// simulate y(t) for input u(t), RK4. returns {t:[], y:[]}
M.simTF = (num,den,u,T,dt) => {
  const ss=M.tf2ss(num,den), n=ss.n;
  const steps=Math.ceil(T/dt); let x=new Array(n).fill(0);
  const f=(x,uu)=>{ const dx=new Array(n); for(let i=0;i<n-1;i++) dx[i]=x[i+1]; let s=uu; for(let i=0;i<n;i++) s-=ss.a[i]*x[n-1-i]; dx[n-1]=s; return dx; };
  const out=x=>{ let y=0; for(let i=0;i<n;i++) y+=ss.c[i]*x[n-1-i]; return y; };
  const ts=[], ys=[];
  for(let k=0;k<=steps;k++){
    const t=k*dt, uu=u(t);
    ts.push(t); ys.push(out(x)+ss.D*uu);
    if(n===0) continue;
    const k1=f(x,uu), x2=x.map((v,i)=>v+dt/2*k1[i]);
    const um=u(t+dt/2), k2=f(x2,um), x3=x.map((v,i)=>v+dt/2*k2[i]);
    const k3=f(x3,um), x4=x.map((v,i)=>v+dt*k3[i]);
    const k4=f(x4,u(t+dt));
    x=x.map((v,i)=>v+dt/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]));
  }
  return {t:ts,y:ys};
};
M.step = (num,den,T,dt) => M.simTF(num,den,()=>1,T,dt||T/2000);
// unity negative feedback: G/(1+G)
M.feedback = (gn,gd,hn,hd) => { hn=hn||[1]; hd=hd||[1]; return { num:M.mul(gn,hd), den:M.add(M.mul(gd,hd), M.mul(gn,hn)) }; };

// step metrics: final value, overshoot %, rise time 10-90 %, peak time, 2 % settling time
M.metrics = (t,y,yf) => {
  if(yf==null) yf=y[y.length-1];
  let pk=-Infinity, tp=0; y.forEach((v,i)=>{ if(v>pk){pk=v;tp=t[i];} });
  const os = yf!==0? Math.max(0,(pk-yf)/Math.abs(yf)*100) : 0;
  let t10=null,t90=null; for(let i=0;i<y.length;i++){ if(t10==null && y[i]>=0.1*yf) t10=t[i]; if(t90==null && y[i]>=0.9*yf){ t90=t[i]; break; } }
  let ts=0; for(let i=y.length-1;i>=0;i--){ if(Math.abs(y[i]-yf)>0.02*Math.abs(yf)){ ts=t[Math.min(i+1,t.length-1)]; break; } }
  return { yf, overshoot:os, tr:(t10!=null&&t90!=null)?t90-t10:NaN, tp, ts };
};

// frequency response G(jw): magnitude dB, phase deg (unwrapped)
M.freq = (num,den,w) => {
  let prev=null, off=0;
  return w.map(ww=>{
    const [nr,ni]=M.evalC(num,0,ww), [dr,di]=M.evalC(den,0,ww);
    const d=dr*dr+di*di, re=(nr*dr+ni*di)/d, im=(ni*dr-nr*di)/d;
    let ph=Math.atan2(im,re)*180/Math.PI;
    if(prev!=null){ while(ph+off-prev>180) off-=360; while(ph+off-prev<-180) off+=360; }
    ph+=off; prev=ph;
    return { w:ww, re, im, mag:Math.hypot(re,im), db:20*Math.log10(Math.hypot(re,im)), ph };
  });
};
M.logspace = (a,b,n) => { const r=[]; for(let i=0;i<n;i++) r.push(Math.pow(10,a+(b-a)*i/(n-1))); return r; };
// gain margin (dB) and phase margin (deg) from a dense freq sweep
M.margins = (num,den) => {
  const fr=M.freq(num,den,M.logspace(-3,3,4000));
  let gm=Infinity, wpc=NaN, pm=Infinity, wgc=NaN;
  for(let i=1;i<fr.length;i++){
    const a=fr[i-1], b=fr[i];
    // phase crossover at -180 (mod 360)
    const k=Math.floor((a.ph+180)/360);
    const ref=-180+360*k;
    if((a.ph-ref)*(b.ph-ref)<=0 && a.ph!==b.ph){ const f=(ref-a.ph)/(b.ph-a.ph); const db=a.db+f*(b.db-a.db); if(-db<gm || !isFinite(gm)){ if(isNaN(wpc)){ gm=-db; wpc=a.w+f*(b.w-a.w); } } }
    if(a.db*b.db<=0 && a.db!==b.db && isNaN(wgc)){ const f=(0-a.db)/(b.db-a.db); const ph=a.ph+f*(b.ph-a.ph); pm=180+ph; while(pm>180) pm-=360; while(pm<-180) pm+=360; wgc=a.w+f*(b.w-a.w); }
  }
  return { gm, wpc, pm, wgc };
};

// Routh array; returns {rows, signChanges, special}
M.routh = p => {
  p=M.trim(p); const n=p.length-1; const cols=Math.ceil((n+1)/2);
  const rows=[[],[]];
  for(let i=0;i<cols;i++){ rows[0].push(p[2*i]||0); rows[1].push(p[2*i+1]||0); }
  let special=null; const eps=1e-6;
  for(let r=2;r<=n;r++){
    const a=rows[r-2], b=rows[r-1].slice(), row=[];
    if(b.every(v=>Math.abs(v)<1e-12)){ // row of zeros: auxiliary polynomial derivative
      special=special||"zero-row"; const ord=n-(r-2);
      const prevRow=a; for(let i=0;i<cols;i++){ b[i]=prevRow[i]*(ord-2*i); } rows[r-1]=b;
    } else if(Math.abs(b[0])<1e-12){ special=special||"zero-first"; b[0]=eps; rows[r-1]=b; }
    for(let i=0;i<cols;i++){ row.push(b[0]===0?0:(b[0]*(a[i+1]||0)-a[0]*(b[i+1]||0))/b[0]); }
    rows.push(row);
  }
  const first=rows.slice(0,n+1).map(r=>r[0]);
  let sc=0; for(let i=1;i<first.length;i++) if(Math.sign(first[i])!==Math.sign(first[i-1]) && first[i]!==0 && first[i-1]!==0) sc++;
  return { rows:rows.slice(0,n+1), first, signChanges:sc, special };
};
// closed-loop poles of 1 + K G = 0 for each K
M.locus = (gn,gd,Ks) => Ks.map(K=>({K, poles:M.roots(M.add(gd, M.scale(gn,K)))}));

root.CTRL_MATH = M;

/* ---------------- drawing helpers ---------------- */
let PAL=null;
function pal(){ if(PAL) return PAL; const s=getComputedStyle(document.documentElement); const g=n=>s.getPropertyValue(n).trim()||"#888";
  PAL={bg:g('--bg'),panel:g('--panel'),panel2:g('--panel2'),line:g('--line'),ink:g('--ink'),muted:g('--muted'),accent:g('--accent'),accent2:g('--accent2'),ok:g('--ok'),bad:g('--bad'),warn:g('--warn')}; return PAL; }
function frame(ctx,w,h,xr,yr,opt){
  const P=pal(); opt=opt||{}; const m={l:52,r:14,t:16,b:34};
  const X=x=>m.l+(x-xr[0])/(xr[1]-xr[0])*(w-m.l-m.r);
  const Y=y=>(h-m.b)-(y-yr[0])/(yr[1]-yr[0])*(h-m.t-m.b);
  ctx.strokeStyle=P.line; ctx.lineWidth=1; ctx.font="10px system-ui"; ctx.fillStyle=P.muted;
  const nx=opt.nx||5, ny=opt.ny||4;
  for(let i=0;i<=nx;i++){ const v=xr[0]+i/nx*(xr[1]-xr[0]); const x=X(v); ctx.globalAlpha=.35; ctx.beginPath(); ctx.moveTo(x,m.t); ctx.lineTo(x,h-m.b); ctx.stroke(); ctx.globalAlpha=1; ctx.textAlign="center"; ctx.fillText(opt.xfmt?opt.xfmt(v):fmtN(v),x,h-m.b+13); }
  for(let i=0;i<=ny;i++){ const v=yr[0]+i/ny*(yr[1]-yr[0]); const y=Y(v); ctx.globalAlpha=.35; ctx.beginPath(); ctx.moveTo(m.l,y); ctx.lineTo(w-m.r,y); ctx.stroke(); ctx.globalAlpha=1; ctx.textAlign="right"; ctx.fillText(fmtN(v),m.l-5,y+3); }
  ctx.strokeStyle=P.muted; ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
  ctx.textAlign="center"; if(opt.xlabel) ctx.fillText(opt.xlabel,(m.l+w-m.r)/2,h-4);
  if(opt.ylabel){ ctx.save(); ctx.translate(11,(m.t+h-m.b)/2); ctx.rotate(-Math.PI/2); ctx.fillText(opt.ylabel,0,0); ctx.restore(); }
  return {m,X,Y};
}
function fmtN(v){ const a=Math.abs(v); if(a===0) return "0"; if(a>=100) return v.toFixed(0); if(a>=10) return v.toFixed(1); if(a>=1) return v.toFixed(2).replace(/0$/,""); return v.toFixed(2); }
function line(ctx,F,xs,ys,col,wid,dash){ ctx.strokeStyle=col; ctx.lineWidth=wid||2; ctx.setLineDash(dash||[]); ctx.beginPath(); let started=false; xs.forEach((x,i)=>{ const y=ys[i]; if(!isFinite(y)){started=false;return;} const px=F.X(x), py=F.Y(y); started?ctx.lineTo(px,py):ctx.moveTo(px,py); started=true; }); ctx.stroke(); ctx.setLineDash([]); }
function hline(ctx,F,y,xr,col){ line(ctx,F,[xr[0],xr[1]],[y,y],col,1,[4,4]); }
function makeCanvas(el,h){ const c=el("canvas"); c.style.height=(h||300)+"px"; return c; }
function prep(c){ const dpr=window.devicePixelRatio||1; const w=c.clientWidth, h=c.clientHeight; c.width=w*dpr; c.height=h*dpr; const ctx=c.getContext("2d"); ctx.scale(dpr,dpr); ctx.clearRect(0,0,w,h); return {ctx,w,h}; }
function slider(api,parent,o,on){ const wrap=api.el("div","ctl"); const lab=api.el("label"); const sp=api.el("span"); sp.textContent=o.label; const b=api.el("b"); const f=o.fmt||(v=>v); b.textContent=f(o.val); lab.appendChild(sp); lab.appendChild(b); const inp=api.el("input"); inp.type="range"; inp.min=o.min; inp.max=o.max; inp.step=o.step; inp.value=o.val; inp.oninput=()=>{ const v=parseFloat(inp.value); b.textContent=f(v); on(v); }; wrap.appendChild(lab); wrap.appendChild(inp); parent.appendChild(wrap); return {set:v=>{inp.value=v; b.textContent=f(v);} }; }
function btn(api,parent,text,on,cls){ const b=api.el("button",cls||"ghost"); b.textContent=text; b.onclick=on; parent.appendChild(b); return b; }
function polyStr(p,v){ v=v||"s"; p=M.trim(p); const n=p.length-1; const parts=[]; p.forEach((c,i)=>{ const k=n-i; if(Math.abs(c)<1e-12) return; const a=Math.abs(c); const cs=(a===1&&k>0)?"":(+a.toFixed(3)).toString(); parts.push((c<0?"− ":(parts.length?"+ ":""))+cs+(k>0?v+(k>1?"^"+k:""):"")); }); return parts.join(" ")||"0"; }

const S = {};

/* ---- 1. first-order step response ---- */
S.firstorder = {
  title:"First-order step response",
  desc:"G(s) = K / (τs + 1). Slide gain K and time constant τ. The dashed line marks t = τ, where the output reaches 63.2 % of its final value.",
  controls:[{id:"K",label:"Gain K",min:0.2,max:3,step:0.1,val:1,fmt:v=>v.toFixed(1)},{id:"tau",label:"Time constant τ (s)",min:0.2,max:4,step:0.1,val:1,fmt:v=>v.toFixed(1)}],
  draw(ctx,w,h,v){
    const T=10, r=M.step([v.K],[v.tau,1],T,0.005), F=frame(ctx,w,h,[0,T],[0,3.2],{xlabel:"time (s)",ylabel:"output y(t)"});
    const P=pal(); hline(ctx,F,v.K,[0,T],P.muted); hline(ctx,F,0.632*v.K,[0,T],P.warn);
    line(ctx,F,[v.tau,v.tau],[0,3.2],P.warn,1,[3,3]);
    line(ctx,F,r.t,r.y,P.accent,2.5);
    const m=M.metrics(r.t,r.y,v.K);
    return "y(τ) = "+(v.K*0.632).toFixed(3)+" (63.2 %)   ·   final value = K = "+v.K.toFixed(2)+"   ·   2 % settling ≈ 4τ = "+(4*v.tau).toFixed(2)+" s (sim "+m.ts.toFixed(2)+" s)";
  }
};

/* ---- 2. second-order step response ---- */
S.secondorder = {
  title:"Second-order step response",
  desc:"G(s) = ωn² / (s² + 2ζωn s + ωn²). Damping ratio ζ sets the shape (overshoot); natural frequency ωn sets the speed. Try ζ = 0, 0.2, 0.7, 1, 2.",
  controls:[{id:"z",label:"Damping ratio ζ",min:0,max:2,step:0.01,val:0.5,fmt:v=>v.toFixed(2)},{id:"wn",label:"Natural frequency ωn (rad/s)",min:0.5,max:6,step:0.1,val:2,fmt:v=>v.toFixed(1)}],
  draw(ctx,w,h,v){
    const T=12, wn=v.wn, z=v.z, r=M.step([wn*wn],[1,2*z*wn,wn*wn],T,0.004);
    const F=frame(ctx,w,h,[0,T],[0,2.1],{xlabel:"time (s)",ylabel:"output y(t)"}); const P=pal();
    hline(ctx,F,1,[0,T],P.muted); hline(ctx,F,1.02,[0,T],P.line); hline(ctx,F,0.98,[0,T],P.line);
    line(ctx,F,r.t,r.y,P.accent,2.5);
    const m=M.metrics(r.t,r.y,1);
    const osF = z<1? 100*Math.exp(-Math.PI*z/Math.sqrt(1-z*z)) : 0;
    const type = z===0?"undamped":z<1?"underdamped":z===1?"critically damped":"overdamped";
    return type+"   ·   overshoot "+m.overshoot.toFixed(1)+" % (formula "+osF.toFixed(1)+" %)   ·   peak t "+(z<1&&z>0?m.tp.toFixed(2)+" s":"n/a")+"   ·   Ts(2 %) "+(z>0?m.ts.toFixed(2)+" s (≈4/ζωn = "+(4/(z*wn)).toFixed(2)+")":"never settles");
  }
};

/* ---- 3. pole-zero map linked to step response (drag the pole) ---- */
S.polezero = {
  title:"Pole location ↔ step response",
  desc:"Drag the complex pole pair around the s-plane (left). The step response (right) updates live. Left = faster decay; further from the real axis = faster oscillation; cross into the right half and it blows up.",
  mount(node,api){
    const P=pal(); const wrap=api.el("div"); wrap.style.display="flex"; wrap.style.gap="10px"; wrap.style.flexWrap="wrap";
    const c1=makeCanvas(api.el,280), c2=makeCanvas(api.el,280); c1.style.flex="1 1 260px"; c2.style.flex="2 1 320px"; c1.style.width="auto"; c2.style.width="auto";
    wrap.appendChild(c1); wrap.appendChild(c2); node.appendChild(wrap);
    const ro=api.el("div","readout"); node.appendChild(ro);
    let sig=-1, wd=2; const R=[-6,2], I=[-5,5];
    function draw(){
      let g=prep(c1); let ctx=g.ctx; const F=frame(ctx,g.w,g.h,R,I,{xlabel:"Re(s) = −σ",ylabel:"Im(s) = ±ωd",nx:4,ny:4});
      ctx.fillStyle="rgba(224,104,90,.10)"; ctx.fillRect(F.X(0),F.m.t,F.X(R[1])-F.X(0),g.h-F.m.t-F.m.b);
      ctx.strokeStyle=P.ink; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(F.X(0),F.m.t); ctx.lineTo(F.X(0),g.h-F.m.b); ctx.stroke();
      ctx.strokeStyle=P.accent; ctx.lineWidth=2.5;
      [[sig,wd],[sig,-wd]].forEach(([x,y])=>{ const px=F.X(x),py=F.Y(y); ctx.beginPath(); ctx.moveTo(px-6,py-6); ctx.lineTo(px+6,py+6); ctx.moveTo(px+6,py-6); ctx.lineTo(px-6,py+6); ctx.stroke(); });
      c1._F=F;
      const wn=Math.hypot(sig,wd), den=[1,-2*sig,sig*sig+wd*wd];
      const T=10; const r=M.step([wn*wn],den,T,0.004);
      g=prep(c2); ctx=g.ctx; const lim=Math.max(2.2,Math.min(8,Math.max(...r.y.map(Math.abs).filter(isFinite))*1.1));
      const F2=frame(ctx,g.w,g.h,[0,T],[sig>0?-lim:0,lim],{xlabel:"time (s)",ylabel:"y(t)"}); hline(ctx,F2,1,[0,T],P.muted);
      line(ctx,F2,r.t,r.y.map(y=>Math.max(-lim,Math.min(lim,y))),sig>0?P.bad:P.accent,2.5);
      const z=wn? -sig/wn:0;
      ro.textContent="poles s = "+sig.toFixed(2)+" ± j"+Math.abs(wd).toFixed(2)+"   ·   ωn = "+wn.toFixed(2)+"   ·   ζ = "+z.toFixed(2)+"   ·   "+(sig<0?"STABLE":sig===0?"MARGINAL":"UNSTABLE");
    }
    let drag=false;
    function pick(e){ const F=c1._F; if(!F) return; const r=c1.getBoundingClientRect(); const x=e.clientX-r.left, y=e.clientY-r.top;
      const sx=R[0]+(x-F.m.l)/(r.width-F.m.l-F.m.r)*(R[1]-R[0]); const sy=I[0]+((r.height-F.m.b)-y)/(r.height-F.m.t-F.m.b)*(I[1]-I[0]);
      sig=Math.max(R[0],Math.min(R[1],Math.round(sx*20)/20)); wd=Math.max(0,Math.min(I[1],Math.round(Math.abs(sy)*20)/20)); if(Math.abs(sig)<0.05) sig=0; draw(); }
    c1.addEventListener("pointerdown",e=>{drag=true; c1.setPointerCapture(e.pointerId); pick(e);});
    c1.addEventListener("pointermove",e=>{ if(drag) pick(e); });
    c1.addEventListener("pointerup",()=>drag=false);
    requestAnimationFrame(draw); window.addEventListener("resize",()=>requestAnimationFrame(draw));
  }
};

/* ---- 4. open vs closed loop cruise control with a hill ---- */
S.cruise = {
  title:"Open loop vs closed loop: cruise control on a hill",
  desc:"Car mass model m·v' = F − b·v − d (d = hill force at t = 10 s). Open loop: throttle preset for 25 m/s on the flat. Closed loop: proportional controller F = Kp·(25 − v) + feedforward. Raise Kp and watch the hill matter less (but never zero error with P alone).",
  controls:[{id:"kp",label:"Controller gain Kp (N per m/s)",min:0,max:2000,step:50,val:500,fmt:v=>v.toFixed(0)},{id:"hill",label:"Hill force d (N)",min:0,max:600,step:20,val:300,fmt:v=>v.toFixed(0)}],
  draw(ctx,w,h,v){
    const m=1000, b=50, ref=25, T=40, dt=0.01; const P=pal();
    const Fff=b*ref; let vo=ref, vc=ref; const ts=[],yo=[],yc=[];
    for(let k=0;k*dt<=T;k++){ const t=k*dt, d=t>=10?v.hill:0; ts.push(t); yo.push(vo); yc.push(vc);
      vo+=dt*(Fff-b*vo-d)/m; const F=Fff+v.kp*(ref-vc); vc+=dt*(F-b*vc-d)/m; }
    const F=frame(ctx,w,h,[0,T],[10,27],{xlabel:"time (s)",ylabel:"speed (m/s)"});
    hline(ctx,F,ref,[0,T],P.muted); line(ctx,F,[10,10],[10,27],P.warn,1,[3,3]);
    line(ctx,F,ts,yo,P.bad,2); line(ctx,F,ts,yc,P.accent,2.5);
    ctx.fillStyle=P.bad; ctx.font="11px system-ui"; ctx.textAlign="left"; ctx.fillText("open loop",F.X(31),F.Y(yo[yo.length-1])-6);
    ctx.fillStyle=P.accent; ctx.fillText("closed loop",F.X(31),F.Y(yc[yc.length-1])-6);
    const ssO=v.hill/b, ssC=v.hill/(b+v.kp);
    return "steady-state speed drop: open loop "+ssO.toFixed(2)+" m/s  ·  closed loop "+ssC.toFixed(2)+" m/s  (d / (b + Kp))";
  }
};

/* ---- 5. PID on a plant, live ---- */
const PLANTS = {
  "motor":  {name:"DC motor position  1/(s(s+1))", num:[1], den:[1,1,0]},
  "thermal":{name:"Thermal 1/((s+1)(0.5s+1)(0.2s+1))", num:[1], den:M.mul(M.mul([1,1],[0.5,1]),[0.2,1])},
  "spring": {name:"Mass-spring-damper 1/(s²+0.4s+1)", num:[1], den:[1,0.4,1]},
  "tank":   {name:"Tank level 1/(2s+1)", num:[1], den:[2,1]}
};
function pidLoop(plant,kp,ki,kd,tf){ // C = kp + ki/s + kd s/(tf s+1)  -> num/den
  tf=tf||0.01;
  // C = [kd s^2 + kp s + ki](with filter) : (kp(tf s+1)s + ki(tf s+1) + kd s^2) / (s(tf s+1))
  const cn=M.add(M.add(M.mul([kp,0],[tf,1]),M.scale([tf,1],ki)),[kd,0,0]);
  const cd=M.mul([1,0],[tf,1]);
  const L={num:M.mul(cn,plant.num), den:M.mul(cd,plant.den)};
  return {L, cl:M.feedback(L.num,L.den)};
}
S.pid = {
  title:"PID controller on a plant",
  desc:"Unity feedback loop: controller C(s) = Kp + Ki/s + Kd·s drives the plant. Set gains to zero and add one term at a time: P speeds up and leaves error, I removes error but adds overshoot, D adds damping.",
  mount(node,api){
    const P=pal(); const top=api.el("div","row"); node.appendChild(top);
    let key="spring"; const sel=api.el("select"); Object.keys(PLANTS).forEach(k=>{ const o=api.el("option"); o.value=k; o.textContent=PLANTS[k].name; sel.appendChild(o); }); sel.value=key; sel.onchange=()=>{key=sel.value; draw();};
    sel.style.cssText="background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:6px"; top.appendChild(sel);
    const c=makeCanvas(api.el,300); node.appendChild(c);
    const ctl=api.el("div","controls"); node.appendChild(ctl); const ro=api.el("div","readout"); node.appendChild(ro);
    const g={kp:1,ki:0,kd:0};
    slider(api,ctl,{label:"Kp",min:0,max:20,step:0.1,val:1,fmt:v=>v.toFixed(1)},v=>{g.kp=v;draw();});
    slider(api,ctl,{label:"Ki",min:0,max:10,step:0.05,val:0,fmt:v=>v.toFixed(2)},v=>{g.ki=v;draw();});
    slider(api,ctl,{label:"Kd",min:0,max:5,step:0.05,val:0,fmt:v=>v.toFixed(2)},v=>{g.kd=v;draw();});
    function draw(){
      const pl=PLANTS[key], T=20; const {cl}=pidLoop(pl,g.kp,g.ki,g.kd);
      const unstable=M.roots(cl.den).some(r=>r[0]>1e-6);
      const r=M.step(cl.num,cl.den,T,0.002);
      const {ctx,w,h}=prep(c); const F=frame(ctx,w,h,[0,T],[0,2],{xlabel:"time (s)",ylabel:"output y(t)"});
      hline(ctx,F,1,[0,T],P.muted); line(ctx,F,r.t,r.y.map(y=>Math.max(-1,Math.min(3,y))),unstable?P.bad:P.accent,2.5);
      if(unstable){ ro.textContent="UNSTABLE: closed-loop pole in right half-plane. Reduce gains."; return; }
      const m=M.metrics(r.t,r.y,1);
      ro.textContent="final value "+r.y[r.y.length-1].toFixed(3)+"   ·   steady-state error "+(1-r.y[r.y.length-1]).toFixed(3)+"   ·   overshoot "+m.overshoot.toFixed(1)+" %   ·   Ts(2 %) "+(m.ts>=T-0.01?"> "+T+" s":m.ts.toFixed(2)+" s");
    }
    requestAnimationFrame(draw); window.addEventListener("resize",()=>requestAnimationFrame(draw));
  }
};

/* ---- 6. PID tuning game ---- */
S.pidgame = {
  title:"Game: tune to spec",
  desc:"A hidden plant. Hit the target: overshoot below the limit, 2 % settling time below the limit, zero steady-state error. Fewer tries = more stars. New round = new plant and spec.",
  mount(node,api){
    const P=pal(); const c=makeCanvas(api.el,280); const spec=api.el("div","readout"); node.appendChild(spec); node.appendChild(c);
    const ctl=api.el("div","controls"); node.appendChild(ctl); const row=api.el("div","row"); node.appendChild(row); const ro=api.el("div","readout"); node.appendChild(ro);
    let plant, target, tries=0, g={kp:1,ki:0,kd:0}, last=null, sl=[];
    function newRound(){
      const a=0.5+Math.random()*1.5, b=1+Math.random()*3, k=0.5+Math.random()*1.5;
      plant={num:[k],den:M.mul([1,a],[1,b])};
      target={os:[5,10,15][Math.floor(Math.random()*3)], ts:+(3+Math.random()*4).toFixed(1)};
      tries=0; last=null; g={kp:1,ki:0,kd:0}; sl.forEach((s,i)=>s.set([1,0,0][i]));
      spec.textContent="TARGET → overshoot < "+target.os+" %   ·   settling time Ts(2 %) < "+target.ts+" s   ·   zero steady-state error (you will need some Ki)";
      ro.textContent="Set gains, then press Test."; draw();
    }
    sl.push(slider(api,ctl,{label:"Kp",min:0,max:30,step:0.1,val:1,fmt:v=>v.toFixed(1)},v=>g.kp=v));
    sl.push(slider(api,ctl,{label:"Ki",min:0,max:30,step:0.1,val:0,fmt:v=>v.toFixed(1)},v=>g.ki=v));
    sl.push(slider(api,ctl,{label:"Kd",min:0,max:10,step:0.05,val:0,fmt:v=>v.toFixed(2)},v=>g.kd=v));
    function draw(){
      const {ctx,w,h}=prep(c); const T=15; const F=frame(ctx,w,h,[0,T],[0,2],{xlabel:"time (s)",ylabel:"y(t)"});
      if(!target) return;
      ctx.fillStyle="rgba(111,207,138,.10)"; ctx.fillRect(F.X(target.ts),F.Y(1.02),F.X(T)-F.X(target.ts),F.Y(0.98)-F.Y(1.02));
      hline(ctx,F,1+target.os/100,[0,T],P.warn); line(ctx,F,[target.ts,target.ts],[0,2],P.warn,1,[3,3]); hline(ctx,F,1,[0,T],P.muted);
      if(last) line(ctx,F,last.t,last.y.map(y=>Math.max(-1,Math.min(3,y))),last.ok?P.ok:P.bad,2.5);
    }
    btn(api,row,"Test",()=>{
      tries++; const {cl}=pidLoop(plant,g.kp,g.ki,g.kd); const T=15;
      const unstable=M.roots(cl.den).some(r=>r[0]>1e-6); const r=M.step(cl.num,cl.den,T,0.002);
      const m=M.metrics(r.t,r.y,1); const ess=Math.abs(1-r.y[r.y.length-1]);
      const ok=!unstable && m.overshoot<target.os && m.ts<target.ts && ess<0.02;
      last={t:r.t,y:r.y,ok}; draw();
      if(unstable){ ro.textContent="Try "+tries+": UNSTABLE. Back off the gains."; return; }
      const stars=ok?(tries<=2?"★★★":tries<=5?"★★☆":"★☆☆"):"";
      ro.textContent="Try "+tries+": overshoot "+m.overshoot.toFixed(1)+" % "+(m.overshoot<target.os?"✔":"✗")+"   ·   Ts "+(m.ts>=T-0.01?"> 15":m.ts.toFixed(2))+" s "+(m.ts<target.ts?"✔":"✗")+"   ·   ess "+ess.toFixed(3)+" "+(ess<0.02?"✔":"✗")+(ok?"   ·   SPEC MET "+stars:"");
    },"primary");
    btn(api,row,"New round",newRound);
    newRound(); window.addEventListener("resize",()=>requestAnimationFrame(draw));
  }
};

/* ---- 7. root locus with draggable gain ---- */
const LOCI = {
  "a":{name:"G = 1 / (s(s+2))", num:[1], den:[1,2,0]},
  "b":{name:"G = 1 / (s(s+1)(s+3))", num:[1], den:M.mul([1,1,0],[1,3])},
  "c":{name:"G = (s+2) / (s(s+1))", num:[1,2], den:[1,1,0]},
  "d":{name:"G = 1 / ((s+1)(s²+2s+5))", num:[1], den:M.mul([1,1],[1,2,5])},
  "e":{name:"G = 1 / (s(s+2)(s+4))  [C8 worked example]", num:[1], den:M.mul([1,2,0],[1,4])},
  "f":{name:"G = 1 / (s(s+3)(s+6))  [C8 quiz]", num:[1], den:M.mul([1,3,0],[1,6])}
};
S.rootlocus = {
  title:"Root locus: drag the gain",
  desc:"The grey traces are where the closed-loop poles of 1 + K·G(s) = 0 go as K rises from 0 to large. Slide K to move the poles (blue). × open-loop poles, ○ zeros. The step response shows what those pole positions mean.",
  mount(node,api){
    const P=pal(); const top=api.el("div","row"); node.appendChild(top);
    let key="b", K=1; const sel=api.el("select"); Object.keys(LOCI).forEach(k=>{ const o=api.el("option"); o.value=k; o.textContent=LOCI[k].name; sel.appendChild(o); }); sel.value=key; sel.onchange=()=>{key=sel.value; build(); draw();};
    sel.style.cssText="background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:6px"; top.appendChild(sel);
    const wrap=api.el("div"); wrap.style.cssText="display:flex;gap:10px;flex-wrap:wrap"; node.appendChild(wrap);
    const c1=makeCanvas(api.el,300), c2=makeCanvas(api.el,300); c1.style.flex="1 1 280px"; c2.style.flex="1 1 280px"; c1.style.width="auto"; c2.style.width="auto"; wrap.appendChild(c1); wrap.appendChild(c2);
    const ctl=api.el("div","controls"); node.appendChild(ctl); const ro=api.el("div","readout"); node.appendChild(ro);
    let pts=[];
    function build(){ const Ks=[]; for(let i=0;i<=600;i++) Ks.push(Math.pow(10,-3+i/600*5)); pts=M.locus(LOCI[key].num,LOCI[key].den,Ks); }
    slider(api,ctl,{label:"Gain K (log scale)",min:-2,max:2,step:0.01,val:0,fmt:v=>Math.pow(10,v).toFixed(v<0?3:2)},v=>{K=Math.pow(10,v); draw();});
    function draw(){
      const G=LOCI[key]; let g=prep(c1); let ctx=g.ctx; const F=frame(ctx,g.w,g.h,[-6,2],[-5,5],{xlabel:"Re(s)",ylabel:"Im(s)",nx:4,ny:4});
      ctx.fillStyle="rgba(224,104,90,.10)"; ctx.fillRect(F.X(0),F.m.t,F.X(2)-F.X(0),g.h-F.m.t-F.m.b);
      ctx.fillStyle=P.muted; pts.forEach(p=>p.poles.forEach(([x,y])=>{ if(x>=-6&&x<=2&&y>=-5&&y<=5) ctx.fillRect(F.X(x)-1,F.Y(y)-1,2,2); }));
      ctx.strokeStyle=P.ink; ctx.lineWidth=2; M.roots(G.den).forEach(([x,y])=>{ const px=F.X(x),py=F.Y(y); ctx.beginPath(); ctx.moveTo(px-5,py-5); ctx.lineTo(px+5,py+5); ctx.moveTo(px+5,py-5); ctx.lineTo(px-5,py+5); ctx.stroke(); });
      M.roots(G.num).forEach(([x,y])=>{ ctx.beginPath(); ctx.arc(F.X(x),F.Y(y),5,0,7); ctx.stroke(); });
      const cl=M.feedback(M.scale(G.num,K),G.den); const pl=M.roots(cl.den); const uns=pl.some(r=>r[0]>1e-6);
      ctx.fillStyle=uns?P.bad:P.accent; pl.forEach(([x,y])=>{ ctx.beginPath(); ctx.arc(F.X(x),F.Y(y),5,0,7); ctx.fill(); });
      g=prep(c2); ctx=g.ctx; const T=15; const r=M.step(cl.num,cl.den,T,0.003); const fin=r.y[r.y.length-1];
      const F2=frame(ctx,g.w,g.h,[0,T],[0,2],{xlabel:"time (s)",ylabel:"closed-loop step"}); hline(ctx,F2,1,[0,T],P.muted);
      line(ctx,F2,r.t,r.y.map(y=>Math.max(-1,Math.min(3,y))),uns?P.bad:P.accent,2.5);
      ro.textContent="K = "+K.toFixed(3)+"   ·   closed-loop poles: "+pl.map(([x,y])=>x.toFixed(2)+(y?(y>0?" + j":" − j")+Math.abs(y).toFixed(2):"")).join(",  ")+"   ·   "+(uns?"UNSTABLE":"stable");
    }
    build(); requestAnimationFrame(draw); window.addEventListener("resize",()=>requestAnimationFrame(draw));
  }
};

/* ---- 8. Bode plot with margins + Nyquist toggle ---- */
S.bode = {
  title:"Bode plot and stability margins",
  desc:"Open-loop L(s) = K / (s(s+1)(0.2s+1)). Gain K shifts the magnitude curve up and down; phase does not move. Gain margin = how far |L| is below 0 dB where phase = −180°. Phase margin = how far phase is above −180° where |L| = 0 dB. Toggle Nyquist for the same story on one plot.",
  mount(node,api){
    const P=pal(); let K=1, nyq=false; const row=api.el("div","row"); node.appendChild(row);
    const tb=btn(api,row,"Show Nyquist",()=>{ nyq=!nyq; tb.textContent=nyq?"Show Bode":"Show Nyquist"; draw(); });
    const c=makeCanvas(api.el,380); node.appendChild(c); const ctl=api.el("div","controls"); node.appendChild(ctl); const ro=api.el("div","readout"); node.appendChild(ro);
    slider(api,ctl,{label:"Gain K",min:0.1,max:12,step:0.1,val:1,fmt:v=>v.toFixed(1)},v=>{K=v;draw();});
    const den=M.mul([1,1,0],[0.2,1]);
    function draw(){
      const num=[K]; const w=M.logspace(-2,2,500); const fr=M.freq(num,den,w); const mg=M.margins(num,den);
      const g=prep(c); const ctx=g.ctx;
      if(!nyq){
        const half=g.h/2; ctx.save(); const F=frame(ctx,g.w,half,[-2,2],[-80,40],{ylabel:"|L| (dB)",xfmt:v=>"10^"+v.toFixed(0),nx:4,ny:4});
        line(ctx,F,w.map(Math.log10),fr.map(f=>Math.max(-80,Math.min(40,f.db))),P.accent,2.5); hline(ctx,F,0,[-2,2],P.muted);
        if(isFinite(mg.gm)&&!isNaN(mg.wpc)){ const x=Math.log10(mg.wpc); line(ctx,F,[x,x],[0,-mg.gm],P.warn,3); }
        ctx.restore(); ctx.save(); ctx.translate(0,half);
        const F2=frame(ctx,g.w,half,[-2,2],[-270,-90],{xlabel:"frequency ω (rad/s)",ylabel:"phase (°)",xfmt:v=>"10^"+v.toFixed(0),nx:4,ny:4});
        line(ctx,F2,w.map(Math.log10),fr.map(f=>f.ph),P.accent2,2.5); hline(ctx,F2,-180,[-2,2],P.bad);
        if(!isNaN(mg.wgc)){ const x=Math.log10(mg.wgc); line(ctx,F2,[x,x],[-180,-180+mg.pm],P.warn,3); }
        ctx.restore();
      } else {
        const lim=Math.max(2,Math.min(15,K*1.2)); const F=frame(ctx,g.w,g.h,[-lim,lim/2],[-lim*0.75,lim*0.75],{xlabel:"Re L(jω)",ylabel:"Im L(jω)"});
        const wf=M.logspace(-1.3,2,600), f2=M.freq(num,den,wf);
        line(ctx,F,f2.map(f=>f.re),f2.map(f=>f.im),P.accent,2.5); line(ctx,F,f2.map(f=>f.re),f2.map(f=>-f.im),P.accent2,1.5,[4,3]);
        ctx.fillStyle=P.bad; ctx.beginPath(); ctx.arc(F.X(-1),F.Y(0),5,0,7); ctx.fill(); ctx.font="11px system-ui"; ctx.fillText("−1",F.X(-1)+4,F.Y(0)-8);
        ctx.strokeStyle=P.line; ctx.beginPath(); ctx.arc(F.X(0),F.Y(0),F.X(1)-F.X(0),0,7); ctx.stroke();
      }
      const st = mg.gm>0 && mg.pm>0;
      ro.textContent="gain margin "+(isFinite(mg.gm)?mg.gm.toFixed(1)+" dB at ω = "+mg.wpc.toFixed(2):"∞")+"   ·   phase margin "+(isNaN(mg.wgc)?"∞":mg.pm.toFixed(1)+"° at ω = "+mg.wgc.toFixed(2))+"   ·   closed loop "+(st?"STABLE":"UNSTABLE")+"   ·   (critical K = 6 for this plant)";
    }
    requestAnimationFrame(draw); window.addEventListener("resize",()=>requestAnimationFrame(draw));
  }
};

/* ---- 9. Routh array builder ---- */
S.routh = {
  title:"Routh array builder",
  desc:"Enter characteristic-polynomial coefficients (highest power first, comma separated). The Routh array is built row by row. Count the sign changes in the first column: that is the number of right-half-plane roots. The true roots are shown to check.",
  mount(node,api){
    const row=api.el("div","row"); node.appendChild(row);
    const inp=api.el("input"); inp.type="text"; inp.value="1, 2, 3, 4, 5"; inp.style.cssText="flex:1;min-width:200px;font-family:var(--mono);padding:7px 9px;background:var(--bg);border:1px solid var(--line);border-radius:6px;color:var(--ink)"; row.appendChild(inp);
    const out=api.el("div"); out.style.cssText="font-family:var(--mono);font-size:13px;margin-top:10px;overflow-x:auto"; node.appendChild(out);
    const ro=api.el("div","readout"); node.appendChild(ro);
    ["1, 2, 3, 4, 5","1, 6, 11, 6","1, 1, 2, 8","1, 2, 1, 2","1, 3, 3, 1, 10"].forEach(ex=>btn(api,row,ex,()=>{inp.value=ex; go();}));
    function go(){
      const p=inp.value.split(/[,\s]+/).filter(Boolean).map(Number);
      if(p.length<2||p.some(isNaN)){ out.textContent="Enter at least two numbers."; return; }
      const R=M.routh(p), n=p.length-1; out.textContent="";
      const tbl=api.el("table"); tbl.style.cssText="border-collapse:collapse";
      R.rows.forEach((r,i)=>{ const tr=api.el("tr"); const th=api.el("td"); th.textContent="s^"+(n-i); th.style.cssText="padding:3px 12px;color:var(--muted)"; tr.appendChild(th);
        r.forEach((v,j)=>{ const td=api.el("td"); td.textContent=Math.abs(v)<1e-9?"0":(+v.toFixed(4)).toString(); td.style.cssText="padding:3px 12px;text-align:right;"+(j===0?"color:"+(v<0?"var(--bad)":"var(--accent)")+";font-weight:700":""); tr.appendChild(td); });
        tbl.appendChild(tr); });
      out.appendChild(tbl);
      const rts=M.roots(p); const rhp=rts.filter(r=>r[0]>1e-6).length;
      ro.textContent="polynomial "+polyStr(p)+"   ·   first-column sign changes = "+R.signChanges+(R.special?" ("+(R.special==="zero-row"?"row of zeros: used auxiliary polynomial":"zero in first column: replaced by small ε")+")":"")+"   ·   numerical roots: "+rts.map(([x,y])=>x.toFixed(2)+(y?(y>0?"+":"−")+"j"+Math.abs(y).toFixed(2):"")).join(", ")+"   ·   RHP roots "+rhp;
    }
    inp.oninput=go; go();
  }
};

/* ---- 10. block-diagram sandbox (Simulink-lite) ---- */
const BLK = {
  step:  {label:"Step",   ins:0, outs:1, params:{amp:1,at:1}},
  sine:  {label:"Sine",   ins:0, outs:1, params:{amp:1,w:1}},
  gain:  {label:"Gain",   ins:1, outs:1, params:{k:2}},
  sum:   {label:"Sum",    ins:2, outs:1, params:{signs:"+-"}},
  integ: {label:"∫ dt",   ins:1, outs:1, params:{}},
  tf:    {label:"TF",     ins:1, outs:1, params:{num:"1",den:"1 1"}},
  pid:   {label:"PID",    ins:1, outs:1, params:{kp:1,ki:0,kd:0}},
  sat:   {label:"Sat",    ins:1, outs:1, params:{lim:1}},
  scope: {label:"Scope",  ins:2, outs:0, params:{}}
};
S.blocks = {
  title:"Block-diagram sandbox (Simulink-lite)",
  desc:"Build a system the way Simulink does. Add blocks, drag to place, tap an output port (right) then an input port (left) to wire. Tap a block to edit its parameters. Press Run to simulate; the Scope plots up to two signals. Start from a preset to see a working loop.",
  mount(node,api){
    const P=pal(); const bar=api.el("div","row"); node.appendChild(bar);
    const c=makeCanvas(api.el,340); node.appendChild(c);
    const edit=api.el("div","row"); node.appendChild(edit);
    const sc=makeCanvas(api.el,220); node.appendChild(sc);
    const ro=api.el("div","readout"); node.appendChild(ro);
    let blocks=[], wires=[], nextId=1, sel=null, pend=null, drag=null, result=null;
    const BW=74, BH=40;
    function add(type,x,y,params){ const b={id:nextId++,type,x,y,p:Object.assign({},BLK[type].params,params||{})}; blocks.push(b); return b; }
    function wire(a,ai,b,bi){ wires=wires.filter(w=>!(w.to===b.id&&w.ti===bi)); wires.push({from:a.id,fi:ai||0,to:b.id,ti:bi||0}); }
    function preset(name){
      blocks=[];wires=[];nextId=1;sel=null;pend=null;result=null;
      if(name==="open"){ const s=add("step",20,60), g=add("tf",170,60,{num:"1",den:"1 1"}), o=add("scope",330,60); wire(s,0,g,0); wire(g,0,o,0); wire(s,0,o,1); }
      if(name==="pfb"){ const s=add("step",10,40), su=add("sum",120,40), k=add("gain",220,40,{k:4}), g=add("tf",320,40,{num:"1",den:"1 2 1"}), o=add("scope",440,120);
        wire(s,0,su,0); wire(su,0,k,0); wire(k,0,g,0); wire(g,0,su,1); wire(g,0,o,0); wire(s,0,o,1); }
      if(name==="pid"){ const s=add("step",10,40), su=add("sum",120,40), c2=add("pid",220,40,{kp:3,ki:1.5,kd:0.8}), sa=add("sat",320,40,{lim:5}), g=add("tf",420,40,{num:"1",den:"1 3 2"}), o=add("scope",420,150);
        wire(s,0,su,0); wire(su,0,c2,0); wire(c2,0,sa,0); wire(sa,0,g,0); wire(g,0,su,1); wire(g,0,o,0); wire(s,0,o,1); }
      if(name==="osc"){ const k=add("gain",40,60,{k:-1}), i1=add("integ",170,60), i2=add("integ",300,60), o=add("scope",440,140), st=add("step",40,160,{amp:1,at:0}), su=add("sum",170,160,{signs:"++"});
        // x'' = -x driven by an initial kick: simple harmonic oscillator
        wire(i2,0,k,0); wire(k,0,su,0); wire(st,0,su,1); wire(su,0,i1,0); wire(i1,0,i2,0); wire(i2,0,o,0); wire(i1,0,o,1); blocks.find(b=>b.id===st.id).p.at=0; blocks.find(b=>b.id===st.id).p.amp=1; st.pulse=true; }
      draw(); editor();
    }
    [["Open loop","open"],["P feedback","pfb"],["PID + saturation","pid"],["Oscillator (2 integrators)","osc"],["Clear",""]].forEach(([t,n])=>btn(api,bar,t,()=>preset(n)));
    const addSel=api.el("select"); addSel.style.cssText="background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:6px";
    const o0=api.el("option"); o0.textContent="+ add block"; o0.value=""; addSel.appendChild(o0);
    Object.keys(BLK).forEach(k=>{ const o=api.el("option"); o.value=k; o.textContent=BLK[k].label; addSel.appendChild(o); });
    addSel.onchange=()=>{ if(addSel.value){ sel=add(addSel.value,20+Math.random()*200,20+Math.random()*200); addSel.value=""; draw(); editor(); } }; bar.appendChild(addSel);
    btn(api,bar,"▶ Run",run,"primary");
    function ports(b){ const d=BLK[b.type], r=[]; for(let i=0;i<d.ins;i++) r.push({kind:"in",i,x:b.x,y:b.y+BH*(i+1)/(d.ins+1)}); for(let i=0;i<d.outs;i++) r.push({kind:"out",i,x:b.x+BW,y:b.y+BH*(i+1)/(d.outs+1)}); return r; }
    function draw(){
      const {ctx,w,h}=prep(c); ctx.font="12px system-ui"; ctx.textAlign="center";
      wires.forEach(wi=>{ const a=blocks.find(b=>b.id===wi.from), b=blocks.find(b=>b.id===wi.to); if(!a||!b) return;
        const pa=ports(a).filter(p=>p.kind==="out")[wi.fi], pb=ports(b).filter(p=>p.kind==="in")[wi.ti]; if(!pa||!pb) return;
        ctx.strokeStyle=P.accent2; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(pa.x,pa.y);
        const mx=pb.x>pa.x+20?(pa.x+pb.x)/2:pa.x+16; if(pb.x>pa.x+20){ ctx.lineTo(mx,pa.y); ctx.lineTo(mx,pb.y); } else { const yb=Math.max(a.y,b.y)+BH+18; ctx.lineTo(mx,pa.y); ctx.lineTo(mx,yb); ctx.lineTo(pb.x-16,yb); ctx.lineTo(pb.x-16,pb.y); }
        ctx.lineTo(pb.x,pb.y); ctx.stroke(); ctx.fillStyle=P.accent2; ctx.beginPath(); ctx.moveTo(pb.x,pb.y); ctx.lineTo(pb.x-7,pb.y-4); ctx.lineTo(pb.x-7,pb.y+4); ctx.fill(); });
      blocks.forEach(b=>{ ctx.fillStyle=P.panel2; ctx.strokeStyle=b===sel?P.accent:P.line; ctx.lineWidth=b===sel?2.5:1.5; ctx.beginPath(); ctx.rect(b.x,b.y,BW,BH); ctx.fill(); ctx.stroke();
        ctx.fillStyle=P.ink; ctx.fillText(BLK[b.type].label,b.x+BW/2,b.y+16); ctx.fillStyle=P.muted; ctx.font="10px system-ui"; ctx.fillText(sub(b),b.x+BW/2,b.y+31); ctx.font="12px system-ui";
        ports(b).forEach(p=>{ ctx.fillStyle=(pend&&pend.b===b&&p.kind==="out"&&pend.i===p.i)?P.warn:(p.kind==="in"?P.muted:P.accent); ctx.beginPath(); ctx.arc(p.x,p.y,5,0,7); ctx.fill(); });
        if(b.type==="sum"){ ctx.fillStyle=P.warn; ctx.font="10px system-ui"; const s=b.p.signs||"+-"; ports(b).filter(p=>p.kind==="in").forEach((p,i)=>ctx.fillText(s[i]||"+",p.x+10,p.y+4)); ctx.font="12px system-ui"; } });
      ctx.textAlign="left"; ctx.fillStyle=P.muted; ctx.font="11px system-ui"; ctx.fillText(pend?"now tap an INPUT port (left side of a block)":"tap an output port (blue, right) to start a wire",8,h-8);
    }
    function sub(b){ const p=b.p; switch(b.type){ case "step":return "A="+p.amp+" @t="+p.at; case "sine":return p.amp+"·sin("+p.w+"t)"; case "gain":return "K="+p.k; case "sum":return p.signs; case "tf":return "("+p.num+")/("+p.den+")"; case "pid":return p.kp+"/"+p.ki+"/"+p.kd; case "sat":return "±"+p.lim; default:return ""; } }
    function hit(x,y){ for(const b of blocks.slice().reverse()){ for(const p of ports(b)) if(Math.hypot(p.x-x,p.y-y)<10) return {b,port:p}; if(x>=b.x&&x<=b.x+BW&&y>=b.y&&y<=b.y+BH) return {b}; } return null; }
    function pos(e){ const r=c.getBoundingClientRect(); return [e.clientX-r.left,e.clientY-r.top]; }
    c.addEventListener("pointerdown",e=>{ const [x,y]=pos(e); const h=hit(x,y);
      if(h&&h.port){ if(h.port.kind==="out"){ pend={b:h.b,i:h.port.i}; } else if(pend){ wire(pend.b,pend.i,h.b,h.port.i); pend=null; result=null; } draw(); return; }
      if(h){ sel=h.b; drag={b:h.b,dx:x-h.b.x,dy:y-h.b.y}; c.setPointerCapture(e.pointerId); editor(); } else { sel=null; pend=null; editor(); } draw(); });
    c.addEventListener("pointermove",e=>{ if(!drag) return; const [x,y]=pos(e); drag.b.x=Math.max(0,Math.min(c.clientWidth-BW,x-drag.dx)); drag.b.y=Math.max(0,Math.min(c.clientHeight-BH-14,y-drag.dy)); draw(); });
    c.addEventListener("pointerup",()=>drag=null);
    function editor(){ edit.textContent=""; if(!sel) return; const lab=api.el("span"); lab.textContent=BLK[sel.type].label+" #"+sel.id+":"; lab.style.color="var(--muted)"; edit.appendChild(lab);
      Object.keys(sel.p).forEach(k=>{ const l=api.el("label"); l.style.cssText="font-size:13px;color:var(--muted)"; l.textContent=k+" "; const i=api.el("input"); i.type="text"; i.value=sel.p[k]; i.style.cssText="width:80px;font-family:var(--mono);background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:4px";
        i.onchange=()=>{ const v=i.value; sel.p[k]=(k==="num"||k==="den"||k==="signs")?v:parseFloat(v); draw(); }; l.appendChild(i); edit.appendChild(l); });
      btn(api,edit,"Unwire inputs",()=>{ wires=wires.filter(w=>w.to!==sel.id); draw(); });
      btn(api,edit,"Delete",()=>{ wires=wires.filter(w=>w.to!==sel.id&&w.from!==sel.id); blocks=blocks.filter(b=>b!==sel); sel=null; editor(); draw(); }); }
    function run(){
      const T=20, dt=0.002, N=Math.round(T/dt); const st={}; const out={};
      blocks.forEach(b=>{ if(b.type==="tf"){ const num=String(b.p.num).trim().split(/[\s,]+/).map(Number), den=String(b.p.den).trim().split(/[\s,]+/).map(Number);
          if(den.some(isNaN)||num.some(isNaN)||M.trim(den).length<M.trim(num).length){ ro.textContent="TF #"+b.id+": den order must be ≥ num order"; st.err=1; return; }
          const ss=M.tf2ss(num,den); st[b.id]={ss,x:new Array(ss.n).fill(0)}; }
        if(b.type==="integ") st[b.id]={x:0}; if(b.type==="pid") st[b.id]={i:0,prev:null,d:0}; });
      if(st.err) return;
      // ordering: blocks with state (tf with D=0, integ) output from state, breaking algebraic loops
      const hasState=b=>(b.type==="integ")||(b.type==="tf"&&st[b.id].ss.D===0);
      const inputsOf=b=>{ const r=[]; wires.filter(w=>w.to===b.id).forEach(w=>r[w.ti]=w); return r; };
      const tr=[], y1=[], y2=[]; const scope=blocks.find(b=>b.type==="scope");
      if(!scope){ ro.textContent="Add a Scope block and wire signals into it."; return; }
      for(let k=0;k<=N;k++){
        const t=k*dt; const val={};
        blocks.forEach(b=>{ if(b.type==="integ") val[b.id]=st[b.id].x; if(b.type==="tf"&&st[b.id].ss.D===0){ const s=st[b.id]; let y=0; for(let i=0;i<s.ss.n;i++) y+=s.ss.c[i]*s.x[s.ss.n-1-i]; val[b.id]=y; } });
        const ins={}; let guard=0, progress=true;
        const get=(w)=>w? val[w.from] : 0;
        while(progress && guard++<100){ progress=false;
          for(const b of blocks){ if(val[b.id]!==undefined || b.type==="scope") continue;
            const iw=inputsOf(b); if(iw.some((w,i)=>w&&val[w.from]===undefined)) continue;
            const u=[0,1].map(i=>get(iw[i])); ins[b.id]=u; let y=0;
            switch(b.type){ case "step": y=(t>=b.p.at?b.p.amp:0); if(b.pulse) y=(t<0.05?20:0); break; case "sine": y=b.p.amp*Math.sin(b.p.w*t); break; case "gain": y=b.p.k*u[0]; break;
              case "sum": { const s=b.p.signs||"+-"; y=(s[0]==="-"?-1:1)*u[0]+(s[1]==="-"?-1:1)*u[1]; break; }
              case "sat": y=Math.max(-b.p.lim,Math.min(b.p.lim,u[0])); break;
              case "pid": { const s=st[b.id]; const d=s.prev==null?0:(u[0]-s.prev)/dt; s.d+= (d-s.d)*Math.min(1,dt/0.01); y=b.p.kp*u[0]+b.p.ki*s.i+b.p.kd*s.d; break; }
              case "tf": { const s=st[b.id]; let yy=0; for(let i=0;i<s.ss.n;i++) yy+=s.ss.c[i]*s.x[s.ss.n-1-i]; y=yy+s.ss.D*u[0]; break; } }
            val[b.id]=y; progress=true; }
          // state blocks need their inputs computed too
          for(const b of blocks){ if(!hasState(b)||ins[b.id]) continue; const iw=inputsOf(b); if(iw.some(w=>w&&val[w.from]===undefined)) continue; ins[b.id]=[get(iw[0]),0]; progress=true; }
        }
        if(blocks.some(b=>b.type!=="scope"&&val[b.id]===undefined)){ ro.textContent="Algebraic loop or unwired block: put a TF with a lag, or an integrator, inside every feedback loop."; return; }
        const sw=inputsOf(scope); tr.push(t); y1.push(sw[0]?val[sw[0].from]:NaN); y2.push(sw[1]?val[sw[1].from]:NaN);
        // integrate states (forward Euler at small dt; pid integrator)
        blocks.forEach(b=>{ const u=(ins[b.id]||[0])[0];
          if(b.type==="integ") st[b.id].x+=dt*u;
          if(b.type==="pid"){ st[b.id].i+=dt*u; st[b.id].prev=u; }
          if(b.type==="tf"){ const s=st[b.id], n=s.ss.n; if(!n) return; const x=s.x; const dx=new Array(n); for(let i=0;i<n-1;i++) dx[i]=x[i+1]; let a=u; for(let i=0;i<n;i++) a-=s.ss.a[i]*x[n-1-i]; dx[n-1]=a; for(let i=0;i<n;i++) x[i]+=dt*dx[i]; } });
      }
      result={t:tr,y1,y2}; plotScope();
      const fin=y1[y1.length-1]; ro.textContent="Scope ch1 (blue) final value "+(isFinite(fin)?fin.toFixed(3):"diverged")+(y2.some(isFinite)?"   ·   ch2 (amber) final "+y2[y2.length-1].toFixed(3):"");
    }
    function plotScope(){ const {ctx,w,h}=prep(sc); if(!result){ frame(ctx,w,h,[0,20],[0,1],{xlabel:"time (s)",ylabel:"scope"}); return; }
      const all=result.y1.concat(result.y2).filter(isFinite); let lo=Math.min(0,...all), hi=Math.max(1,...all); if(hi-lo>100){ lo=Math.max(lo,-50); hi=Math.min(hi,50); } const pad=(hi-lo)*0.08;
      const F=frame(ctx,w,h,[0,20],[lo-pad,hi+pad],{xlabel:"time (s)",ylabel:"scope"}); const cl=a=>a.map(v=>Math.max(lo-pad,Math.min(hi+pad,v)));
      line(ctx,F,result.t,cl(result.y2),pal().warn,1.5,[5,3]); line(ctx,F,result.t,cl(result.y1),pal().accent,2.5); }
    preset("pfb"); requestAnimationFrame(()=>{draw(); plotScope();}); window.addEventListener("resize",()=>requestAnimationFrame(()=>{draw();plotScope();}));
  }
};

/* ---- 11. steady-state error vs system type ---- */
S.sserror = {
  title:"Steady-state error and system type",
  desc:"Unity feedback with plant K·G(s). Type 0 has no integrator, type 1 has one. Pick the input: step or ramp. Watch which combinations leave a permanent error and how K changes it.",
  mount(node,api){
    const P=pal(); let type=0, inp="step", K=4; const row=api.el("div","row"); node.appendChild(row);
    const t0=btn(api,row,"Type 0: K/((s+1)(s+2))",()=>{type=0;draw();}), t1=btn(api,row,"Type 1: K/(s(s+2))",()=>{type=1;draw();});
    const i0=btn(api,row,"Step input",()=>{inp="step";draw();}), i1=btn(api,row,"Ramp input",()=>{inp="ramp";draw();});
    const c=makeCanvas(api.el,300); node.appendChild(c); const ctl=api.el("div","controls"); node.appendChild(ctl); const ro=api.el("div","readout"); node.appendChild(ro);
    slider(api,ctl,{label:"Gain K",min:0.5,max:20,step:0.5,val:4,fmt:v=>v.toFixed(1)},v=>{K=v;draw();});
    function draw(){
      [t0,t1].forEach((b,i)=>b.className=i===type?"primary":"ghost"); [i0,i1].forEach((b,i)=>b.className=(i===0)===(inp==="step")?"primary":"ghost");
      const gd=type?[1,2,0]:[1,3,2]; const cl=M.feedback([K],gd); const T=10; const u=inp==="step"?(t=>1):(t=>t);
      const r=M.simTF(cl.num,cl.den,u,T,0.002); const ref=r.t.map(u);
      const {ctx,w,h}=prep(c); const ymax=inp==="step"?1.8:T*1.1; const F=frame(ctx,w,h,[0,T],[0,ymax],{xlabel:"time (s)",ylabel:"reference / output"});
      line(ctx,F,r.t,ref,P.muted,1.5,[5,4]); line(ctx,F,r.t,r.y.map(y=>Math.min(ymax,y)),P.accent,2.5);
      const e=ref[ref.length-1]-r.y[r.y.length-1];
      const theory = inp==="step"? (type?"0 (type 1 tracks a step)":"1/(1+Kp) = 1/(1+K/2) = "+(1/(1+K/2)).toFixed(3)) : (type?"1/Kv = 2/K = "+(2/K).toFixed(3):"∞ (type 0 cannot follow a ramp)");
      ro.textContent="error at t = 10 s: "+e.toFixed(3)+"   ·   theory: e_ss = "+theory;
    }
    draw(); window.addEventListener("resize",()=>requestAnimationFrame(draw));
  }
};

/* ---- 12. Ziegler-Nichols ultimate-gain experiment ---- */
S.zn = {
  title:"Ziegler-Nichols: find the ultimate gain",
  desc:"Plant 1/(s+1)³ under P-only control. Raise Kp until the output oscillates with constant amplitude: that is Ku, and the period is Pu. Then press Apply Z-N PID to set Kp = 0.6Ku, Ti = Pu/2, Td = Pu/8 and see the tuned response.",
  mount(node,api){
    const P=pal(); let kp=2, tuned=null; const c=makeCanvas(api.el,280); node.appendChild(c); const ctl=api.el("div","controls"); node.appendChild(ctl); const row=api.el("div","row"); node.appendChild(row); const ro=api.el("div","readout"); node.appendChild(ro);
    const plant={num:[1],den:M.mul(M.mul([1,1],[1,1]),[1,1])};
    slider(api,ctl,{label:"Kp (P-only)",min:0.5,max:10,step:0.05,val:2,fmt:v=>v.toFixed(2)},v=>{kp=v;tuned=null;draw();});
    btn(api,row,"Apply Z-N PID (using Ku = 8, Pu = 3.63 s)",()=>{ const Ku=8, Pu=2*Math.PI/Math.sqrt(3); tuned={kp:0.6*Ku, ki:0.6*Ku/(Pu/2), kd:0.6*Ku*Pu/8}; draw(); },"primary");
    function draw(){
      const {ctx,w,h}=prep(c); const T=30; const F=frame(ctx,w,h,[0,T],[-0.5,2.5],{xlabel:"time (s)",ylabel:"y(t)"}); hline(ctx,F,1,[0,T],P.muted);
      if(tuned){ const {cl}=pidLoop(plant,tuned.kp,tuned.ki,tuned.kd,0.05); const r=M.step(cl.num,cl.den,T,0.003); line(ctx,F,r.t,r.y,P.ok,2.5); const m=M.metrics(r.t,r.y,1);
        ro.textContent="Z-N PID: Kp = "+tuned.kp.toFixed(2)+", Ki = "+tuned.ki.toFixed(2)+", Kd = "+tuned.kd.toFixed(2)+"   ·   overshoot "+m.overshoot.toFixed(0)+" % (Z-N is aggressive: about 25 % decay ratio by design; refine by hand)"; return; }
      const cl=M.feedback(M.scale(plant.num,kp),plant.den); const r=M.step(cl.num,cl.den,T,0.003);
      line(ctx,F,r.t,r.y.map(y=>Math.max(-0.5,Math.min(2.5,y))),kp>8.001?P.bad:P.accent,2.5);
      ro.textContent="Kp = "+kp.toFixed(2)+"   ·   "+(Math.abs(kp-8)<0.06?"SUSTAINED OSCILLATION: this is Ku = 8, period Pu ≈ 3.63 s":kp>8?"growing oscillation: unstable, back off":"decaying: keep raising Kp");
    }
    draw(); window.addEventListener("resize",()=>requestAnimationFrame(draw));
  }
};

/* ---- 13. lead compensator on Bode ---- */
S.lead = {
  title:"Lead compensation: buying phase margin",
  desc:"Plant G = 4/(s(s+2)). Add a lead compensator C = (s/z + 1)/(s/p + 1) with p > z. It adds positive phase between z and p, raising phase margin and reducing overshoot. Move z and p and compare.",
  controls:[{id:"z",label:"lead zero z",min:0.5,max:10,step:0.1,val:2,fmt:v=>v.toFixed(1)},{id:"p",label:"lead pole p",min:1,max:50,step:0.5,val:10,fmt:v=>v.toFixed(1)}],
  draw(ctx,w,h,v){
    const P=pal(); const gn=[4], gd=[1,2,0]; const cn=[1/v.z,1], cd=[1/v.p,1];
    const L={num:M.mul(gn,cn),den:M.mul(gd,cd)}; const m0=M.margins(gn,gd), m1=M.margins(L.num,L.den);
    const c0=M.feedback(gn,gd), c1=M.feedback(L.num,L.den); const T=6; const r0=M.step(c0.num,c0.den,T,0.002), r1=M.step(c1.num,c1.den,T,0.002);
    const F=frame(ctx,w,h,[0,T],[0,1.8],{xlabel:"time (s)",ylabel:"closed-loop step"}); hline(ctx,F,1,[0,T],P.muted);
    line(ctx,F,r0.t,r0.y,P.muted,2,[5,4]); line(ctx,F,r1.t,r1.y,P.accent,2.5);
    const o0=M.metrics(r0.t,r0.y,1), o1=M.metrics(r1.t,r1.y,1);
    const phimax=Math.asin((v.p-v.z)/(v.p+v.z))*180/Math.PI;
    return "uncompensated (dashed): PM "+m0.pm.toFixed(1)+"°, overshoot "+o0.overshoot.toFixed(1)+" %   ·   with lead: PM "+m1.pm.toFixed(1)+"°, overshoot "+o1.overshoot.toFixed(1)+" %   ·   max lead phase "+(v.p>v.z?phimax.toFixed(1):"0")+"° at ω = √(zp) = "+Math.sqrt(v.z*v.p).toFixed(2);
  }
};

/* ---- 14. state-space: phase portrait ---- */
S.phase = {
  title:"State space: the phase portrait",
  desc:"Mass-spring-damper as two states, x1 = position, x2 = velocity: ẋ = A x with A = [[0, 1], [−k, −c]]. The eigenvalues of A are the poles. Each curve is the state trajectory from a different starting point.",
  controls:[{id:"k",label:"stiffness k",min:-1,max:5,step:0.1,val:2,fmt:v=>v.toFixed(1)},{id:"c",label:"damping c",min:-0.5,max:4,step:0.05,val:0.5,fmt:v=>v.toFixed(2)}],
  draw(ctx,w,h,v){
    const P=pal(); const F=frame(ctx,w,h,[-3,3],[-3,3],{xlabel:"x1 position",ylabel:"x2 velocity",nx:6,ny:6});
    const starts=[[2.5,0],[-2.5,0],[0,2.5],[0,-2.5],[1.5,1.5],[-1.5,-1.5],[2.5,-2],[-2.5,2]];
    starts.forEach((s,si)=>{ let x=s.slice(); const xs=[x[0]], ys=[x[1]]; const dt=0.01;
      for(let i=0;i<1500;i++){ const f=(a)=>[a[1],-v.k*a[0]-v.c*a[1]]; const k1=f(x), k2=f([x[0]+dt/2*k1[0],x[1]+dt/2*k1[1]]), k3=f([x[0]+dt/2*k2[0],x[1]+dt/2*k2[1]]), k4=f([x[0]+dt*k3[0],x[1]+dt*k3[1]]);
        x=[x[0]+dt/6*(k1[0]+2*k2[0]+2*k3[0]+k4[0]), x[1]+dt/6*(k1[1]+2*k2[1]+2*k3[1]+k4[1])]; if(Math.abs(x[0])>6||Math.abs(x[1])>6) break; xs.push(x[0]); ys.push(x[1]); }
      line(ctx,F,xs,ys,si%2?P.accent2:P.accent,1.6); ctx.fillStyle=P.warn; ctx.beginPath(); ctx.arc(F.X(s[0]),F.Y(s[1]),3,0,7); ctx.fill(); });
    const ev=M.roots([1,v.c,v.k]); const st=ev.every(r=>r[0]<-1e-9);
    return "A = [[0, 1], [" + (-v.k).toFixed(1)+", "+(-v.c).toFixed(2)+"]]   ·   eigenvalues: "+ev.map(([x,y])=>x.toFixed(2)+(y?(y>0?" + j":" − j")+Math.abs(y).toFixed(2):"")).join(", ")+"   ·   "+(st?"stable (all spiral or decay to origin)":"NOT asymptotically stable");
  }
};

/* ---- 15. sampling and zero-order hold ---- */
S.sampling = {
  title:"Digital control: sampling and the zero-order hold",
  desc:"A computer only sees the signal at sample instants and holds its output constant between them (ZOH). Slow sampling adds delay, which costs phase margin. Watch the held staircase lag the true signal.",
  controls:[{id:"Ts",label:"Sample period Ts (s)",min:0.05,max:1.5,step:0.05,val:0.4,fmt:v=>v.toFixed(2)},{id:"w",label:"Signal frequency (rad/s)",min:0.5,max:6,step:0.1,val:1.5,fmt:v=>v.toFixed(1)}],
  draw(ctx,w,h,v){
    const P=pal(); const T=8; const F=frame(ctx,w,h,[0,T],[-1.3,1.3],{xlabel:"time (s)",ylabel:"signal"});
    const ts=[], ys=[]; for(let i=0;i<=800;i++){ const t=i/800*T; ts.push(t); ys.push(Math.sin(v.w*t)); }
    line(ctx,F,ts,ys,P.muted,1.5);
    ctx.strokeStyle=P.accent; ctx.lineWidth=2.5; ctx.beginPath(); for(let t=0;t<T;t+=v.Ts){ const y=Math.sin(v.w*t); const t2=Math.min(T,t+v.Ts); if(t===0) ctx.moveTo(F.X(t),F.Y(y)); else ctx.lineTo(F.X(t),F.Y(y)); ctx.lineTo(F.X(t2),F.Y(y)); } ctx.stroke();
    ctx.fillStyle=P.warn; for(let t=0;t<T;t+=v.Ts){ ctx.beginPath(); ctx.arc(F.X(t),F.Y(Math.sin(v.w*t)),3,0,7); ctx.fill(); }
    const ny=Math.PI/v.Ts; const lag=v.w*v.Ts/2*180/Math.PI;
    return "Nyquist frequency π/Ts = "+ny.toFixed(2)+" rad/s "+(v.w>ny?"(signal ABOVE Nyquist: aliasing!)":"")+"   ·   ZOH average delay Ts/2 = "+(v.Ts/2).toFixed(2)+" s   ·   phase lag at this ω ≈ "+lag.toFixed(1)+"°";
  }
};

/* ---- 16. actuator saturation and integrator windup ---- */
S.windup = {
  title:"Integrator windup and anti-windup",
  desc:"PI control (Kp = 5) of plant 1/(s+1) with an actuator that saturates at ±u_max. Grey: actuator unlimited. Red: saturating, plain integrator (winds up, big overshoot). Blue: saturating with anti-windup clamping (integrator frozen while saturated). Lower u_max to make it worse.",
  controls:[{id:"umax",label:"Actuator limit u_max",min:1.1,max:10,step:0.1,val:1.3,fmt:v=>v.toFixed(1)},{id:"ki",label:"Ki",min:0.5,max:10,step:0.1,val:4,fmt:v=>v.toFixed(1)}],
  draw(ctx,w,h,v){
    const P=pal(), kp=5, T=12, dt=0.002;
    function run(lim,clamp){ let y=0,I=0; const ts=[],ys=[];
      for(let k=0;k*dt<=T;k++){ const t=k*dt, r=t>=0.5?1:0, e=r-y; let u=kp*e+v.ki*I; let us=lim?Math.max(-v.umax,Math.min(v.umax,u)):u;
        const sat=us!==u; if(!(clamp&&sat&&Math.sign(e)===Math.sign(u))) I+=e*dt; y+=dt*(-y+us); ts.push(t); ys.push(y); }
      return {ts,ys}; }
    const a=run(false), b=run(true,false), c=run(true,true);
    const F=frame(ctx,w,h,[0,T],[0,2],{xlabel:"time (s)",ylabel:"output y(t)"}); hline(ctx,F,1,[0,T],P.muted);
    line(ctx,F,a.ts,a.ys,P.muted,1.5,[5,4]); line(ctx,F,b.ts,b.ys.map(y=>Math.min(2,y)),P.bad,2.2); line(ctx,F,c.ts,c.ys,P.accent,2.5);
    const os=r=>Math.max(0,(Math.max(...r.ys)-1)*100);
    return "overshoot: unlimited "+os(a).toFixed(1)+" %   ·   saturating, no anti-windup "+os(b).toFixed(1)+" %   ·   with anti-windup "+os(c).toFixed(1)+" %";
  }
};

/* ---- 17. derivative action and measurement noise ---- */
S.dnoise = {
  title:"Derivative kick, noise and filtering",
  desc:"PD control of a mass-spring-damper with noisy position measurement. Pure derivative amplifies the noise into a violent control signal. A first-order filter on the D term (time constant Tf) tames it, at the cost of a little phase lag. Bottom trace: controller output u(t).",
  controls:[{id:"kd",label:"Kd",min:0,max:3,step:0.05,val:1,fmt:v=>v.toFixed(2)},{id:"tf",label:"D filter Tf (s), 0 = none",min:0,max:0.5,step:0.01,val:0,fmt:v=>v.toFixed(2)},{id:"nz",label:"Noise amplitude",min:0,max:0.05,step:0.002,val:0.01,fmt:v=>v.toFixed(3)}],
  draw(ctx,w,h,v){
    const P=pal(), kp=6, T=8, dt=0.002; let x=0,xd=0,df=0,prev=null; const ts=[],ys=[],us=[];
    let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647-0.5; };
    for(let k=0;k*dt<=T;k++){ const t=k*dt, r=t>=0.5?1:0, meas=x+2*v.nz*rnd(), e=r-meas;
      const d=prev==null?0:(e-prev)/dt; prev=e; df = v.tf>0 ? df+(d-df)*dt/v.tf : d;
      const u=kp*e+v.kd*df; xd+=dt*(u-0.8*xd-4*x); x+=dt*xd; ts.push(t); ys.push(x); us.push(u); }
    const half=h*0.55; ctx.save(); const F=frame(ctx,w,half,[0,T],[0,1.8],{ylabel:"y(t)"}); hline(ctx,F,1,[0,T],P.muted); line(ctx,F,ts,ys,P.accent,2.2); ctx.restore();
    ctx.save(); ctx.translate(0,half); const um=Math.max(10,...us.map(Math.abs).slice(300)); const F2=frame(ctx,w,h-half,[0,T],[-um,um],{xlabel:"time (s)",ylabel:"u(t)",ny:2});
    line(ctx,F2,ts,us,P.warn,1); ctx.restore();
    const rms=Math.sqrt(us.slice(1000).reduce((a,u)=>a+u*u,0)/(us.length-1000));
    return "control effort RMS after settling "+rms.toFixed(1)+" (noise reaching the actuator)   ·   peak |u| "+Math.max(...us.map(Math.abs)).toFixed(0)+" (spike at the step = derivative kick)";
  }
};

root.CTRL_SIMS = S;

/* ---------------- diagrams (themeable inline SVG) ---------------- */
const arrow='<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>';
root.CTRL_DIAGRAMS = {
    loop:
'<svg viewBox="0 0 640 210" xmlns="http://www.w3.org/2000/svg" style="color:var(--ink)">'+arrow+
'<text class="dg-txt-l" x="8" y="62">reference r</text><line class="dg-stroke" x1="10" y1="80" x2="92" y2="80" marker-end="url(#ah)"/>'+
'<circle class="dg-stroke" cx="110" cy="80" r="16"/><text class="dg-txt-b" x="110" y="84">Σ</text><text class="dg-txt" x="88" y="70">+</text><text class="dg-txt" x="100" y="110">−</text>'+
'<line class="dg-stroke" x1="126" y1="80" x2="188" y2="80" marker-end="url(#ah)"/><text class="dg-txt" x="157" y="70">error e</text>'+
'<rect class="dg-fill" x="190" y="55" width="110" height="50" rx="6"/><rect class="dg-stroke" x="190" y="55" width="110" height="50" rx="6"/><text class="dg-txt-b" x="245" y="78">Controller</text><text class="dg-txt" x="245" y="94">C(s)</text>'+
'<line class="dg-stroke" x1="300" y1="80" x2="368" y2="80" marker-end="url(#ah)"/><text class="dg-txt" x="334" y="70">input u</text>'+
'<rect class="dg-fill" x="370" y="55" width="110" height="50" rx="6"/><rect class="dg-stroke" x="370" y="55" width="110" height="50" rx="6"/><text class="dg-txt-b" x="425" y="78">Plant</text><text class="dg-txt" x="425" y="94">G(s)</text>'+
'<line class="dg-warn" x1="425" y1="18" x2="425" y2="53" marker-end="url(#ah)"/><text class="dg-txt" x="425" y="13">disturbance d</text>'+
'<line class="dg-stroke" x1="480" y1="80" x2="620" y2="80" marker-end="url(#ah)"/><text class="dg-txt" x="575" y="70">output y</text>'+
'<line class="dg-accent" x1="540" y1="80" x2="540" y2="175"/><rect class="dg-fill" x="370" y="152" width="110" height="44" rx="6"/><rect class="dg-accent" x="370" y="152" width="110" height="44" rx="6"/><text class="dg-txt-b" x="425" y="172">Sensor</text><text class="dg-txt" x="425" y="188">H(s)</text>'+
'<line class="dg-accent" x1="540" y1="175" x2="482" y2="175" marker-end="url(#ah)"/><line class="dg-accent" x1="370" y1="175" x2="110" y2="175"/><line class="dg-accent" x1="110" y1="175" x2="110" y2="98" marker-end="url(#ah)"/><text class="dg-txt" x="240" y="168">measured output (feedback)</text>'+
'</svg>',
    openclosed:
'<svg viewBox="0 0 640 200" xmlns="http://www.w3.org/2000/svg" style="color:var(--ink)">'+arrow+
'<text class="dg-txt-b" x="320" y="16">Open loop: no measurement of the output</text>'+
'<line class="dg-stroke" x1="40" y1="50" x2="160" y2="50" marker-end="url(#ah)"/><text class="dg-txt" x="90" y="42">r</text>'+
'<rect class="dg-stroke" x="162" y="30" width="120" height="40" rx="6"/><text class="dg-txt-b" x="222" y="55">Controller</text>'+
'<line class="dg-stroke" x1="282" y1="50" x2="360" y2="50" marker-end="url(#ah)"/>'+
'<rect class="dg-stroke" x="362" y="30" width="120" height="40" rx="6"/><text class="dg-txt-b" x="422" y="55">Plant</text>'+
'<line class="dg-stroke" x1="482" y1="50" x2="600" y2="50" marker-end="url(#ah)"/><text class="dg-txt" x="560" y="42">y</text>'+
'<text class="dg-txt-b" x="320" y="108">Closed loop: output measured and fed back</text>'+
'<line class="dg-stroke" x1="40" y1="140" x2="92" y2="140" marker-end="url(#ah)"/><circle class="dg-stroke" cx="108" cy="140" r="14"/><text class="dg-txt-b" x="108" y="144">Σ</text>'+
'<line class="dg-stroke" x1="122" y1="140" x2="160" y2="140" marker-end="url(#ah)"/><rect class="dg-stroke" x="162" y="120" width="120" height="40" rx="6"/><text class="dg-txt-b" x="222" y="145">Controller</text>'+
'<line class="dg-stroke" x1="282" y1="140" x2="360" y2="140" marker-end="url(#ah)"/><rect class="dg-stroke" x="362" y="120" width="120" height="40" rx="6"/><text class="dg-txt-b" x="422" y="145">Plant</text>'+
'<line class="dg-stroke" x1="482" y1="140" x2="600" y2="140" marker-end="url(#ah)"/><line class="dg-accent" x1="540" y1="140" x2="540" y2="188"/><line class="dg-accent" x1="540" y1="188" x2="108" y2="188"/><line class="dg-accent" x1="108" y1="188" x2="108" y2="156" marker-end="url(#ah)"/><text class="dg-txt" x="96" y="170">−</text>'+
'</svg>',
    splane:
'<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" style="color:var(--ink)">'+
'<rect x="380" y="10" width="250" height="280" fill="rgba(224,104,90,.10)"/><text class="dg-txt-b" x="505" y="34">Right half-plane: UNSTABLE</text><text class="dg-txt" x="505" y="52">responses grow without bound</text>'+
'<text class="dg-txt-b" x="190" y="34">Left half-plane: STABLE</text><text class="dg-txt" x="190" y="52">responses decay</text>'+
'<line class="dg-stroke" x1="20" y1="150" x2="620" y2="150"/><line class="dg-stroke" x1="380" y1="10" x2="380" y2="290"/><text class="dg-txt-l" x="590" y="168">Re(s)</text><text class="dg-txt-l" x="386" y="22">Im(s)</text>'+
'<line class="dg-line" x1="380" y1="150" x2="170" y2="40"/><line class="dg-line" x1="380" y1="150" x2="170" y2="260"/><text class="dg-txt" x="215" y="80">constant ζ line</text>'+
'<path class="dg-warn" d="M 380 150 m -120 0 a 120 120 0 0 1 120 -120"/><text class="dg-txt" x="300" y="90">constant ωn arc</text>'+
'<text class="dg-ok" x="80" y="155" style="font:700 16px sans-serif;fill:var(--ok);stroke:none">×</text><text class="dg-txt" x="85" y="176">far left: fast decay</text>'+
'<text style="font:700 16px sans-serif;fill:var(--accent)" x="300" y="95">×</text><text style="font:700 16px sans-serif;fill:var(--accent)" x="300" y="215">×</text><text class="dg-txt" x="304" y="236">complex pair: oscillation</text>'+
'<text style="font:700 16px sans-serif;fill:var(--warn)" x="374" y="80">×</text><text class="dg-txt-l" x="390" y="80">on axis: sustained oscillation</text>'+
'<text style="font:700 16px sans-serif;fill:var(--bad)" x="500" y="155">×</text><text class="dg-txt" x="505" y="176">RHP pole: blows up</text>'+
'</svg>',
    secondorder:
'<svg viewBox="0 0 640 260" xmlns="http://www.w3.org/2000/svg" style="color:var(--ink)">'+arrow+
'<line class="dg-stroke" x1="50" y1="220" x2="620" y2="220"/><line class="dg-stroke" x1="50" y1="220" x2="50" y2="15"/><text class="dg-txt" x="600" y="240">time</text>'+
'<line class="dg-line" x1="50" y1="100" x2="620" y2="100" stroke-dasharray="4 4"/><text class="dg-txt-l" x="560" y="94">final value</text>'+
'<rect x="300" y="92" width="320" height="16" fill="rgba(111,207,138,.12)"/><text class="dg-txt-l" x="470" y="124">±2 % band</text>'+
'<path class="dg-accent" d="M50 220 C 110 220, 120 40, 170 45 S 230 120, 260 115 S 300 92, 330 98 S 380 103, 420 100 L 620 100"/>'+
'<line class="dg-warn" x1="168" y1="100" x2="168" y2="46" marker-end="url(#ah)"/><text class="dg-txt-l" x="176" y="68">overshoot Mp</text>'+
'<line class="dg-line" x1="168" y1="45" x2="168" y2="220" stroke-dasharray="3 3"/><text class="dg-txt" x="168" y="236">tp (peak time)</text>'+
'<line class="dg-line" x1="300" y1="100" x2="300" y2="220" stroke-dasharray="3 3"/><text class="dg-txt" x="300" y="236">Ts (settling)</text>'+
'<line class="dg-line" x1="72" y1="208" x2="72" y2="220"/><line class="dg-line" x1="122" y1="112" x2="122" y2="220"/><line class="dg-ok" x1="74" y1="212" x2="120" y2="212" marker-end="url(#ah)"/><text class="dg-txt" x="97" y="204">tr</text>'+
'</svg>',
    reduction:
'<svg viewBox="0 0 640 250" xmlns="http://www.w3.org/2000/svg" style="color:var(--ink)">'+arrow+
'<text class="dg-txt-b" x="110" y="18">Series (cascade)</text>'+
'<rect class="dg-stroke" x="20" y="35" width="60" height="32" rx="4"/><text class="dg-txt-b" x="50" y="56">G1</text><line class="dg-stroke" x1="80" y1="51" x2="118" y2="51" marker-end="url(#ah)"/><rect class="dg-stroke" x="120" y="35" width="60" height="32" rx="4"/><text class="dg-txt-b" x="150" y="56">G2</text>'+
'<text class="dg-txt-b" x="210" y="56">=</text><rect class="dg-accent" x="230" y="35" width="80" height="32" rx="4"/><text class="dg-txt-b" x="270" y="56">G1·G2</text>'+
'<text class="dg-txt-b" x="480" y="18">Parallel</text>'+
'<rect class="dg-stroke" x="380" y="30" width="60" height="28" rx="4"/><text class="dg-txt-b" x="410" y="49">G1</text><rect class="dg-stroke" x="380" y="66" width="60" height="28" rx="4"/><text class="dg-txt-b" x="410" y="85">G2</text>'+
'<text class="dg-txt-b" x="470" y="66">→ Σ =</text><rect class="dg-accent" x="510" y="45" width="100" height="32" rx="4"/><text class="dg-txt-b" x="560" y="66">G1 + G2</text>'+
'<text class="dg-txt-b" x="320" y="128">Negative feedback loop</text>'+
'<line class="dg-stroke" x1="20" y1="170" x2="62" y2="170" marker-end="url(#ah)"/><circle class="dg-stroke" cx="76" cy="170" r="12"/><text class="dg-txt-b" x="76" y="174">Σ</text>'+
'<line class="dg-stroke" x1="88" y1="170" x2="128" y2="170" marker-end="url(#ah)"/><rect class="dg-stroke" x="130" y="154" width="60" height="32" rx="4"/><text class="dg-txt-b" x="160" y="175">G</text>'+
'<line class="dg-stroke" x1="190" y1="170" x2="260" y2="170" marker-end="url(#ah)"/><line class="dg-stroke" x1="230" y1="170" x2="230" y2="222"/><rect class="dg-stroke" x="130" y="206" width="60" height="32" rx="4"/><text class="dg-txt-b" x="160" y="227">H</text>'+
'<line class="dg-stroke" x1="230" y1="222" x2="192" y2="222" marker-end="url(#ah)"/><line class="dg-stroke" x1="130" y1="222" x2="76" y2="222"/><line class="dg-stroke" x1="76" y1="222" x2="76" y2="184" marker-end="url(#ah)"/><text class="dg-txt" x="66" y="196">−</text>'+
'<text class="dg-txt-b" x="300" y="175">=</text><rect class="dg-accent" x="330" y="150" width="160" height="40" rx="4"/><text class="dg-txt-b" x="410" y="167">G</text><line class="dg-line" x1="360" y1="173" x2="460" y2="173"/><text class="dg-txt-b" x="410" y="186">1 + G·H</text>'+
'</svg>',
    bodeasym:
'<svg viewBox="0 0 640 230" xmlns="http://www.w3.org/2000/svg" style="color:var(--ink)">'+
'<line class="dg-stroke" x1="60" y1="20" x2="60" y2="210"/><line class="dg-line" x1="60" y1="90" x2="620" y2="90"/><text class="dg-txt-l" x="8" y="94">0 dB</text><text class="dg-txt" x="590" y="226">log ω</text>'+
'<line class="dg-line" x1="60" y1="210" x2="620" y2="210"/>'+
'<path class="dg-line" d="M60 60 L 230 60 L 450 170 L 620 255" stroke-dasharray="4 3"/>'+
'<path class="dg-accent" d="M60 60 L 230 60 L 450 170"/><path class="dg-accent" d="M450 170 L 560 225" />'+
'<text class="dg-txt-l" x="80" y="52">flat: DC gain 20 log K</text>'+
'<line class="dg-warn" x1="230" y1="40" x2="230" y2="210" stroke-dasharray="3 3"/><text class="dg-txt" x="230" y="34">corner ω = 1/τ (first pole)</text>'+
'<text class="dg-txt-l" x="320" y="110">−20 dB/decade</text>'+
'<line class="dg-warn" x1="450" y1="140" x2="450" y2="210" stroke-dasharray="3 3"/><text class="dg-txt" x="450" y="134">second pole</text><text class="dg-txt-l" x="480" y="190">−40 dB/decade</text>'+
'<path class="dg-ok" d="M200 60 Q 230 72 260 75"/><text class="dg-txt-l" x="250" y="62">true curve −3 dB at corner</text>'+
'</svg>'
};

})(typeof window!=="undefined"?window:globalThis);
