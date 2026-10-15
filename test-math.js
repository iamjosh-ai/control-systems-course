/* Unit checks for the numerical core in sims.js against textbook results.
   Usage: node test-math.js   (exit 0 = pass) */
"use strict";
const fs=require("fs");
const g={}; new Function("window","globalThis","getComputedStyle","document",fs.readFileSync("sims.js","utf8"))(g,g,()=>({getPropertyValue:()=>""}),{documentElement:{}});
const M=g.CTRL_MATH; let fails=0;
const chk=(name,got,want,tol)=>{ const ok=Math.abs(got-want)<=tol; if(!ok) fails++; console.log((ok?"  PASS  ":"  FAIL  ")+name+"  got "+(+got.toFixed(4))+" want "+want); };
// 1st order: y(tau) = 63.2 %
{ const r=M.step([1],[2,1],10,0.001); const i=r.t.findIndex(t=>t>=2); chk("1st order y(τ)",r.y[i],0.6321,0.002); chk("1st order final",r.y[r.y.length-1],0.9933,0.002); }
// 2nd order zeta 0.5 overshoot 16.3 %, wn=2: tp = pi/(wn sqrt(1-z^2)) = 1.814
{ const r=M.step([4],[1,2,4],15,0.001); const m=M.metrics(r.t,r.y,1); chk("2nd order OS% ζ=0.5",m.overshoot,16.30,0.1); chk("2nd order tp",m.tp,1.8138,0.01); }
// roots
{ const r=M.roots([1,6,11,6]).map(x=>x[0]).sort((a,b)=>a-b); chk("roots (s+1)(s+2)(s+3) a",r[0],-3,1e-6); chk("roots b",r[1],-2,1e-6); chk("roots c",r[2],-1,1e-6); }
// Routh: s^4+2s^3+3s^2+4s+5 -> 2 RHP roots
{ chk("Routh 1,2,3,4,5 sign changes",M.routh([1,2,3,4,5]).signChanges,2,0); chk("Routh 1,6,11,6 stable",M.routh([1,6,11,6]).signChanges,0,0); }
// 1/(s+1)^3: Ku=8, critical; margins of K/(s(s+1)(0.2s+1)) -> K crit = 6
{ const d=M.mul(M.mul([1,1],[1,1]),[1,1]); chk("Ku of 1/(s+1)^3 (GM in dB at K=1 = 20log8)",M.margins([1],d).gm,20*Math.log10(8),0.05);
  const den=M.mul([1,1,0],[0.2,1]); const m=M.margins([6],den); chk("K=6 GM≈0 dB",m.gm,0,0.05); }
// steady state: type 0 K/((s+1)(s+2)) step error 1/(1+K/2), K=4 -> 1/3
{ const cl=M.feedback([4],[1,3,2]); const r=M.step(cl.num,cl.den,20,0.002); chk("type-0 step ess",1-r.y[r.y.length-1],1/3,0.002); }
// phase margin of 4/(s(s+2)) : wgc where |L|=1 -> w^2 (w^2+4)=16 -> w=1.572, PM = 180-90-atan(w/2)=51.8
{ chk("PM of 4/(s(s+2))",M.margins([4],[1,2,0]).pm,51.83,0.2); }
console.log(fails?"RESULT: FAIL "+fails:"RESULT: PASS"); process.exit(fails?1:0);
