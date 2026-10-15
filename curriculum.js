/* ============================================================
   Control Systems Mastery Course : CURRICULUM
   ------------------------------------------------------------
   Parts: "101" (C0 to C5) then "201" (C6 to C11). Each part is
   block-staged on its own (all modules at L3, then L2, then L1),
   per Research\rams-pedagogy-decision-2026-06-19.md. The
   Simulation Lab is free:true (never locked, listed last).

   Grounding (OneDrive - DB Cargo (UK) Ltd\Research\):
     control-systems-101-2026-10-08.md   notebook 99711aae (tutor playlist,
                                         66 of 71 videos, CTMS, Wikipedia)
     control-systems-201-2026-10-08.md   notebook f72eb24f (201 part, pending)
     control-systems-interactive-pedagogy-2026-10-08.md  notebook cdfd3fae
       (predict / guided task / reflect framing; documented misconceptions)
   Every worked number below is from the 101 brief (arithmetic checked there)
   or derived from its formulae and re-checked in node. Items marked
   EXT are extension material the playlist does not cover (101 brief, Gaps 5).

   Block types : heading | prose | formula | example | recall | sim
                 | diagram | quickcheck | predict | match | video
   Question types: mcq {q,options,answer,explain}
                   numeric {q,answer,tol,unit,worked}
                   multistep {q,steps:[{prompt,answer,tol,unit}],worked}
   LaTeX: R`...` (String.raw) so backslashes need no escaping.
   ============================================================ */
const R = String.raw;
const YT = id => "https://www.youtube.com/watch?v=" + id;

const CURRICULUM = {
  schemaVersion: 1,
  staging: "block",
  title: "Control Systems 101 + 201 · Mastery Course",
  modules: [

  /* ===================================================================
     C0 · MATHS TOOLKIT
     =================================================================== */
  {
    id:"c0", part:"101", title:"101 · C0 · Maths toolkit",
    stages:[
      { stage:3, title:"C0 · L3 · Why Laplace?",
        blocks:[
          {type:"heading",text:"Turning calculus into algebra"},
          {type:"prose",text:R`Every physical system you will control (a car, a motor, a spring, a circuit) is described by a differential equation: an equation linking a quantity to its rates of change. Solving those directly is slow. The Laplace transform swaps each function of time $f(t)$ for a function of a new variable $s$, written $F(s)$. In the $s$ world, differentiating becomes multiplying by $s$ and integrating becomes dividing by $s$. Differential equations turn into ordinary algebra.

The variable $s$ is a complex number, $s = \sigma + j\omega$. It is not a real number, and that matters: the position of special values of $s$ on a 2D map (the s-plane) will tell you whether a system is stable and how it moves.`},
          {type:"heading",text:"Complex numbers in two minutes"},
          {type:"prose",text:R`A complex number $z = a + jb$ has a real part $a$ and an imaginary part $b$ ($j = \sqrt{-1}$; engineers use $j$ because $i$ is current). Plot it as a point: across by $a$, up by $b$. Its size (magnitude) is the distance from the origin, $|z| = \sqrt{a^2+b^2}$, and its angle is $\theta = \arctan2(b,a)$. The conjugate $z^* = a - jb$ is its mirror image in the real axis.`},
          {type:"example",label:"Worked",text:R`$z = 3 + 4j$: $|z| = \sqrt{9+16} = 5$, $\arg z = 53.13^\circ$, conjugate $3 - 4j$.`},
          {type:"predict",q:"A real physical system has a complex pole at s = −1 + 2j. Must there be another pole? Where?",a:R`Yes, at $-1 - 2j$, its conjugate. Real systems have real-valued coefficients, so complex poles always come in conjugate pairs. In a published signals-and-systems concept inventory, 77 per cent of students chose a pole set without its conjugate pair (pedagogy brief, Wage et al.). Do not be one of them.`},
          {type:"diagram",id:"splane",caption:"The s-plane: you will place poles here from C3 onwards."},
          {type:"recall",q:"Why do control engineers use the Laplace transform?",a:"It turns differential equations into algebra: differentiation becomes multiplication by s, integration becomes division by s."},
          {type:"video",title:"Intro to Control 1.2 · Laplace Transform Review",url:YT("UjNKKH0Z_uU")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"mcq",q:"The variable s in the Laplace transform is…",options:["a real number","a complex number","always an integer","a time in seconds"],answer:1,explain:R`s = σ + jω is complex.`},
          {type:"numeric",q:"Magnitude of z = 3 + 4j?",answer:5,tol:0.01,worked:"√(3² + 4²) = 5."},
          {type:"mcq",q:"In the Laplace domain, differentiating a signal (zero initial conditions) becomes…",options:["dividing by s","multiplying by s","adding s","no change"],answer:1,explain:"L{f'} = sF(s) − f(0)."},
          {type:"mcq",q:"A real system has a pole at −2 + 3j. Which other pole must it have?",options:["2 + 3j","−2 − 3j","2 − 3j","none"],answer:1,explain:"Complex poles of real systems come in conjugate pairs."},
          {type:"numeric",q:"Angle of z = 3 + 4j, in degrees?",answer:53.13,tol:0.2,unit:"°",worked:"arctan(4/3) = 53.13°."}
        ]}
      },
      { stage:2, title:"C0 · L2 · Transform pairs and the final value theorem",
        blocks:[
          {type:"heading",text:"Definition and properties"},
          {type:"formula",tex:R`F(s)=\int_0^\infty f(t)\,e^{-st}\,dt`,caption:"Laplace transform"},
          {type:"formula",tex:R`\mathcal L\{\dot f\}=sF(s)-f(0^-)\qquad \mathcal L\{\ddot f\}=s^2F(s)-sf(0^-)-\dot f(0^-)\qquad \mathcal L\Big\{\int_0^t f\Big\}=\frac{F(s)}{s}`,caption:"Derivative and integral properties"},
          {type:"prose",text:R`The pairs you will use constantly: unit impulse $\delta(t) \to 1$; unit step $u(t) \to 1/s$; ramp $t \to 1/s^2$; $e^{-at} \to 1/(s+a)$; $\sin\omega t \to \omega/(s^2+\omega^2)$; $\cos\omega t \to s/(s^2+\omega^2)$; $t e^{-at} \to 1/(s+a)^2$.`},
          {type:"match",pairs:[["unit step u(t)","1/s"],["ramp t","1/s²"],["e^(−at)","1/(s+a)"],["impulse δ(t)","1"],["sin ωt","ω/(s²+ω²)"]]},
          {type:"heading",text:"Final value theorem (FVT)"},
          {type:"formula",tex:R`\lim_{t\to\infty}y(t)=\lim_{s\to0}sY(s)\qquad \lim_{t\to0^+}y(t)=\lim_{s\to\infty}sY(s)`,caption:"Final and initial value theorems"},
          {type:"prose",text:R`The FVT gives the steady-state value without solving for $y(t)$. It is valid only if every pole of $sY(s)$ is strictly in the left half-plane. A single pole of $Y(s)$ at the origin is fine because the factor $s$ cancels it.`},
          {type:"predict",q:R`Apply the FVT to $Y(s)=\frac{1}{s(s-2)}$. What does it give, and should you believe it?`,a:R`It gives $-0.5$, but $sY = 1/(s-2)$ has a pole at $+2$ (right half-plane), so the FVT is invalid: $y(t)$ actually grows without bound. Likewise $\frac{9}{s(s^2+9)}$ gives 1 but $y(t)$ oscillates forever. Always check the poles first.`},
          {type:"recall",q:"When is the final value theorem valid?",a:"When all poles of sY(s) are strictly in the left half-plane."},
          {type:"video",title:"Intro to Control 11.4 · Steady State Error with the Final Value Theorem",url:YT("p0b6lKINo0A")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"mcq",q:"The Laplace transform of a unit step is…",options:["1","1/s","1/s²","s"],answer:1,explain:"Standard pair."},
          {type:"mcq",q:"L{e^(−at)} is…",options:["1/(s−a)","1/(s+a)","a/s","s/(s+a)"],answer:1,explain:"Standard pair."},
          {type:"mcq",q:"The final value theorem may be used when…",options:["for any Y(s)","all poles of sY(s) are in the open left half-plane","Y(s) has poles on the imaginary axis","the system is unstable"],answer:1,explain:"Otherwise y(t) has no finite limit."},
          {type:"numeric",q:"Y(s) = 3 / (s(s+4)). Final value y(∞)?",answer:0.75,tol:0.005,worked:"sY = 3/(s+4), pole at −4 (valid) → 3/4."},
          {type:"numeric",q:"Y(s) = 5 / (s(s+2)(s+5)). Final value y(∞)?",answer:0.5,tol:0.01,worked:"sY = 5/((s+2)(s+5)) → 5/10. Poles −2, −5: valid."},
          {type:"mcq",q:"Y(s) = 1/(s(s−2)). The FVT result of −0.5 is…",options:["correct","meaningless: y(t) diverges","correct but negative","the initial value"],answer:1,explain:"sY has a right half-plane pole, so the FVT does not apply."}
        ]}
      },
      { stage:1, title:"C0 · L1 · Partial fractions in practice",
        blocks:[
          {type:"heading",text:"From Y(s) back to y(t)"},
          {type:"prose",text:R`To get a time response, split $Y(s)$ into simple fractions whose inverse transforms you know from the table, then read off $y(t)$ term by term.`},
          {type:"example",label:"Worked",text:R`$Y(s)=\frac{1}{s(s+2)}=\frac{A}{s}+\frac{B}{s+2}$. Cover-up: $A = \frac{1}{0+2} = 0.5$, $B = \frac{1}{-2} = -0.5$.

So $y(t) = 0.5 - 0.5e^{-2t} = 0.5(1-e^{-2t})$. At $t = 1$: $0.5(1 - 0.1353) = 0.4323$. Check with the FVT: $sY = 1/(s+2) \to 0.5$. Agrees.`},
          {type:"recall",q:"In y(t) = 0.5(1 − e^(−2t)), which term is the transient and which the steady state?",a:"0.5 is the steady state; −0.5e^(−2t) is the transient that decays (because the pole at −2 is in the left half-plane)."}
        ],
        test:{ numQuestions:3, pool:[
          {type:"numeric",q:"y(t) = L⁻¹{1/(s(s+2))}. Value at t = 1 s?",answer:0.4323,tol:0.005,worked:"0.5(1 − e^(−2)) = 0.5 × 0.8647."},
          {type:"multistep",q:"Y(s) = 1/(s(s+2)) = A/s + B/(s+2).",steps:[{prompt:"A",answer:0.5,tol:0.001},{prompt:"B",answer:-0.5,tol:0.001}],worked:"Cover-up rule: A = 1/2, B = 1/(−2)."},
          {type:"numeric",q:"Y(s) = 3/(s(s+4)) = A/s + B/(s+4). Value of A?",answer:0.75,tol:0.005,worked:"A = 3/(0+4)."},
          {type:"numeric",q:"Y(s) = 3/(s(s+4)). y(t) at t = 0.25 s?",answer:0.4741,tol:0.005,worked:"y = 0.75(1 − e^(−4t)); at t = 0.25: 0.75(1 − e^(−1)) = 0.75 × 0.6321."}
        ]}
      }
    ]
  },

  /* ===================================================================
     C1 · FEEDBACK AND THE CONTROL LOOP
     =================================================================== */
  {
    id:"c1", part:"101", title:"101 · C1 · Feedback and the control loop",
    stages:[
      { stage:3, title:"C1 · L3 · What a control system is",
        blocks:[
          {type:"heading",text:"Making a process do what you want"},
          {type:"prose",text:R`A control system makes a physical process (the plant) behave as you want, by commanding it and usually correcting it. Cruise control measures speed, compares it with the target and adjusts the throttle, so the car holds speed up a hill. A thermostat, a DC motor speed regulator and the governor on a steam engine are all control systems. Control is not only about computers: the mechanical governor has no electronics at all.`},
          {type:"diagram",id:"loop",caption:"The parts of a feedback loop."},
          {type:"match",pairs:[["Plant","the process being controlled"],["Sensor","measures the output"],["Controller","computes the command from the error"],["Reference","the value you want (setpoint)"],["Disturbance","an outside push you did not ask for"],["Error","reference minus measured output"]]},
          {type:"heading",text:"Open loop and closed loop"},
          {type:"diagram",id:"openclosed",caption:"Open loop never checks the result; closed loop measures and corrects."},
          {type:"prose",text:R`Open loop sends a command and never checks the result: a toaster on a timer, a boiler on a timer. It is cheap, needs no sensor and is fine when the model is accurate and disturbances are small. Closed loop measures the output, subtracts it from the reference and acts on the error. It corrects for disturbances and model errors, but it costs a sensor and, if the gain or lag is wrong, it can oscillate or go unstable.`},
          {type:"predict",q:"The car is cruising at 25 m/s on the flat. At t = 10 s it starts up a hill. Which loop holds speed better, open or closed, and will either hold it exactly?",a:"Closed loop holds it much better because the speed drop appears as an error and the controller pushes back. With a proportional controller alone it will NOT hold it exactly: a small steady error remains. You will see why in C5."},
          {type:"sim",sim:"cruise"},
          {type:"quickcheck",q:"In the simulation, where does the sensor act?",options:["Between controller and engine","On the measured speed, fed back to the comparison with 25 m/s","Inside the hill","It has no sensor"],answer:1,explain:"Feedback is information flow: the measured output goes back and is compared with the reference. Students often describe the behaviour and miss the information path (pedagogy brief, Mioduser 1996; Hallstrom 2021)."},
          {type:"prose",text:"Reflect: set Kp to 0 in the simulation. What kind of system have you made? (Answer: open loop. With no gain on the error, the measurement does nothing.)"},
          {type:"recall",q:"Name one advantage and one risk of closed-loop control.",a:"Advantage: it corrects disturbances and model errors. Risk: wrong gain or lag can make it oscillate or go unstable; it also needs a sensor."},
          {type:"video",title:"Course Introduction: Introduction to Control",url:YT("KKIjmxcpRFA")},
          {type:"video",title:"Intro to Control 10.1 · Feedback Control Basics",url:YT("eaxK7_PIsLg")}
        ],
        test:{ numQuestions:5, pool:[
          {type:"mcq",q:"Which of these is a closed-loop system?",options:["A toaster with a fixed timer","A timed central-heating boiler with no sensor","A room thermostat switching a heater","A manually set tap"],answer:2,explain:"Only the thermostat measures the output and acts on the error."},
          {type:"mcq",q:"The error signal in a unity-feedback loop is…",options:["R + Y","R − Y","Y − R","R × Y"],answer:1,explain:"Reference minus measured output."},
          {type:"mcq",q:"The component that computes the corrective command from the error is the…",options:["plant","sensor","controller","disturbance"],answer:2,explain:"The controller."},
          {type:"mcq",q:"The main weakness of open-loop control is that it…",options:["is always unstable","cannot correct for disturbances or model errors","needs a sensor","cannot use a controller"],answer:1,explain:"It never checks the result."},
          {type:"mcq",q:"Feedback with too much gain or lag can…",options:["never destabilise a stable plant","destabilise a stable plant","remove all noise","convert the plant to open loop"],answer:1,explain:"Feedback is not automatically good."},
          {type:"mcq",q:"A mechanical steam-engine governor is…",options:["not a controller because it has no computer","a feedback controller","an open-loop timer","a sensor only"],answer:1,explain:"It senses speed and adjusts steam: feedback without electronics."}
        ]}
      },
      { stage:2, title:"C1 · L2 · The closed-loop transfer function",
        blocks:[
          {type:"heading",text:"Deriving it"},
          {type:"prose",text:R`Each block is a transfer function: output equals block times input. Write the loop as two equations. The plant output is $Y = G_pG_cE$. The error is $E = R - HY$, where $H$ is the sensor. Substitute and collect $Y$:`},
          {type:"formula",tex:R`Y=G_pG_c(R-HY)\;\Rightarrow\; T(s)=\frac{Y(s)}{R(s)}=\frac{G_c(s)G_p(s)}{1+G_c(s)G_p(s)H(s)}`,caption:"Closed-loop transfer function. Unity feedback: H = 1."},
          {type:"prose",text:R`The minus sign at the summing junction is in that $+$ in the denominator. Drop it and you have positive feedback. The sensor is not free either: its dynamics and noise sit in the loop and appear in the denominator.`},
          {type:"diagram",id:"reduction",caption:"The feedback rule G / (1 + GH) is one of three reduction rules (the others return in 201)."},
          {type:"heading",text:"EXT · Sensitivity: why feedback helps"},
          {type:"formula",tex:R`L=GC,\quad S=\frac{1}{1+L},\quad T=\frac{L}{1+L},\quad S+T=1,\quad Y=TR+SD`,caption:"Loop gain L, sensitivity S, complementary sensitivity T (standard form; not in the playlist)"},
          {type:"prose",text:R`An output disturbance $D$ reaches the output multiplied by $S$. Big loop gain means small $S$, so disturbances are squashed. A drifting plant gain changes the closed loop by only $S$ times as much. The catch: $S + T = 1$, and sensor noise passes through $T$, so you cannot be small everywhere at once.`},
          {type:"recall",q:"Write the closed-loop transfer function for controller Gc, plant Gp, sensor H.",a:"T = GcGp / (1 + GcGpH)."},
          {type:"video",title:"Intro to Control 10.2 · Closed-Loop Transfer Function",url:YT("GBv5iiKA6gw")},
          {type:"video",title:"Intro to Control 12.1 · Closed-Loop Transfer Function with a Sensor Transfer Function",url:YT("xfmaLD1-I_g")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"mcq",q:"For controller Gc, plant Gp and sensor H, the closed-loop transfer function is…",options:["GcGp/(1 − GcGpH)","GcGp/(1 + GcGpH)","GcGpH/(1 + GcGp)","GcGp + H"],answer:1,explain:"From Y = GpGc(R − HY)."},
          {type:"numeric",q:"Plant 1/(s+1), Kp = 3, unity feedback. Closed-loop pole location?",answer:-4,tol:0.01,unit:"rad/s",worked:"T = 3/(s+1+3) = 3/(s+4); pole at −4."},
          {type:"numeric",q:"Gc = 3, Gp = 1/(s+1), sensor H = 2. Closed-loop pole?",answer:-7,tol:0.01,unit:"rad/s",worked:"T = (3/(s+1))/(1 + 6/(s+1)) = 3/(s+7)."},
          {type:"mcq",q:"Dropping the minus sign at the summing junction gives…",options:["the same loop","positive feedback","open loop","a faster stable loop"],answer:1,explain:"The sign is part of the maths."},
          {type:"numeric",q:"EXT: loop gain at DC L(0) = 19. Sensitivity S(0)?",answer:0.05,tol:0.001,worked:"1/(1+19)."}
        ]}
      },
      { stage:1, title:"C1 · L1 · Numbers from the loop",
        blocks:[
          {type:"example",label:"Worked",text:R`Plant $G_p=\frac{1}{s+1}$, proportional controller $K_p = 3$, unity feedback, unit step.

$T(s)=\frac{3}{s+4}$. By the FVT, $y_{ss}=\lim_{s\to0}s\cdot\frac{3}{s+4}\cdot\frac1s=\frac34=0.75$. So $e_{ss}=1-0.75=0.25$: a 25 per cent offset. Raise $K_p$ to 9 and $T=\frac{9}{s+10}$, $y_{ss}=0.9$: smaller offset, and the pole moves from −4 to −10, so it is faster too.`},
          {type:"example",label:"Cruise control",text:R`The simulation car: $m\dot v+bv=u-d$ with $m=1000$ kg and $b=50$ N s/m (CTMS values). With proportional feedback $u = u_{ff} + K_p(v_{ref}-v)$, a hill force $d$ gives a steady speed drop of $\frac{d}{b+K_p}$. For $d = 300$ N and $K_p = 500$: $\frac{300}{550} = 0.545$ m/s. Open loop ($K_p = 0$): $\frac{300}{50} = 6$ m/s. Check both in the simulation above.`},
          {type:"example",label:"EXT · sensitivity",text:R`$L(0) = 19$ gives $S(0) = 0.05$ and $T(0) = 0.95$. An output disturbance is reduced 20 times. A 10 per cent rise in plant gain changes the closed-loop gain by only $0.05 \times 10\% = 0.5\%$.`}
        ],
        test:{ numQuestions:4, pool:[
          {type:"numeric",q:"Plant 1/(s+1), Kp = 3, unity feedback, unit step. Steady-state output?",answer:0.75,tol:0.005,worked:"T(0) = 3/4."},
          {type:"numeric",q:"Same loop with Kp = 9. Steady-state output?",answer:0.9,tol:0.005,worked:"T = 9/(s+10), T(0) = 0.9."},
          {type:"numeric",q:"Cruise car (b = 50 N s/m) with P control Kp = 500. Hill force 300 N. Steady speed drop?",answer:0.545,tol:0.01,unit:"m/s",worked:"d/(b + Kp) = 300/550."},
          {type:"multistep",q:"Plant 1/(s+1), Kp = 4, unity feedback, unit step.",steps:[{prompt:"Closed-loop pole (rad/s)",answer:-5,tol:0.01},{prompt:"Steady-state output",answer:0.8,tol:0.005},{prompt:"Steady-state error",answer:0.2,tol:0.005}],worked:"T = 4/(s+5): pole −5, y_ss = 0.8, e_ss = 0.2."}
        ]}
      }
    ]
  },

  /* ===================================================================
     C2 · MODELLING PHYSICAL SYSTEMS
     =================================================================== */
  {
    id:"c2", part:"101", title:"101 · C2 · Modelling physical systems",
    stages:[
      { stage:3, title:"C2 · L3 · From physics to a model",
        blocks:[
          {type:"heading",text:"The recipe"},
          {type:"prose",text:R`1. Apply a physical law (Newton's second law, Kirchhoff's voltage law).
2. Write the differential equation linking input to output.
3. Laplace transform it with zero initial conditions.
4. Form the transfer function $G(s) = Y(s)/U(s)$.

Transfer functions apply only to linear time-invariant (LTI) systems. Real systems are often nonlinear and must be linearised about an operating point first (201 covers this). A transfer function also assumes zero initial conditions: it describes how the system responds, not where it started.`},
          {type:"prose",text:"The order of a system is the number of independent energy stores, not the number of components. A mass and a spring store kinetic and potential energy: second order. An RC circuit stores energy only in the capacitor: first order."},
          {type:"quickcheck",q:"A car modelled as a mass with linear drag (cruise control) is what order?",options:["zeroth","first","second","third"],answer:1,explain:"One energy store (the kinetic energy of the mass), so first order: m v' + b v = u."},
          {type:"recall",q:"What sets the order of a system?",a:"The number of independent energy stores."},
          {type:"video",title:"Intro to Control 3.2 · Physical System Transfer Function",url:YT("zYYsaL839mw")},
          {type:"video",title:"Intro to Control 4.3 · Linear Versus Nonlinear Systems",url:YT("sJqWMJcuEPs")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"mcq",q:"A transfer function assumes…",options:["non-zero initial conditions","zero initial conditions","a nonlinear plant","no input"],answer:1,explain:"Initial conditions are not in G(s)."},
          {type:"mcq",q:"The order of a dynamic system is set by…",options:["the number of components","the number of independent energy stores","the number of sensors","the gain"],answer:1,explain:"Energy stores."},
          {type:"mcq",q:"Transfer functions are defined for…",options:["any system directly","linear time-invariant systems (nonlinear ones are linearised first)","only electrical systems","only discrete systems"],answer:1,explain:"LTI only."},
          {type:"mcq",q:"A mass-spring-damper is…",options:["first order","second order","third order","zeroth order"],answer:1,explain:"Two energy stores: mass and spring."},
          {type:"mcq",q:"Step 3 of the modelling recipe is…",options:["choose PID gains","Laplace transform the ODE with zero initial conditions","measure the output","draw a Bode plot"],answer:1,explain:"Law, ODE, Laplace, G(s)."}
        ]}
      },
      { stage:2, title:"C2 · L2 · Four standard models",
        blocks:[
          {type:"heading",text:"Mass-spring-damper"},
          {type:"formula",tex:R`m\ddot x+b\dot x+kx=F\qquad G(s)=\frac{X(s)}{F(s)}=\frac{1}{ms^2+bs+k}\qquad \omega_n=\sqrt{k/m},\;\; \zeta=\frac{b}{2\sqrt{km}}`,caption:"Newton's second law"},
          {type:"heading",text:"RC circuit"},
          {type:"formula",tex:R`RC\,\dot v_C+v_C=v_{in}\qquad G(s)=\frac{V_C(s)}{V_{in}(s)}=\frac{1}{RCs+1}\qquad \tau=RC`,caption:"Kirchhoff's voltage law"},
          {type:"heading",text:"Cruise control"},
          {type:"formula",tex:R`m\dot v+bv=u\qquad P(s)=\frac{1}{ms+b}=\frac{1/b}{(m/b)s+1}\qquad K_{DC}=\frac1b,\;\;\tau=\frac mb`,caption:"Newton with linear drag (CTMS)"},
          {type:"heading",text:"DC motor speed"},
          {type:"formula",tex:R`L\dot i+Ri+K\omega=v,\quad J\dot\omega+b\omega=Ki\qquad G(s)=\frac{\Omega(s)}{V(s)}=\frac{K}{(Js+b)(Ls+R)+K^2}`,caption:"Electrical loop plus rotor torque balance (CTMS)"},
          {type:"sim",sim:"blocks"},
          {type:"prose",text:"Try it: in the sandbox, select the TF block and enter num 1, den 1 0.2 1 (the CTMS mass-spring-damper, m = 1, b = 0.2, k = 1). Wire Step to TF to Scope and run. Predict first: lightly damped, so expect a lot of ringing."},
          {type:"recall",q:"Transfer function of a mass-spring-damper, force to displacement?",a:"1 / (ms² + bs + k)."},
          {type:"video",title:"Intro to Control 2.1 · Modeling R, L, and C in the Frequency Domain",url:YT("XlEqX4xBSAg")},
          {type:"video",title:"Intro to Control 2.3 · Transfer Function for an R-C System",url:YT("wXyxNpyj0tg")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"mcq",q:"The mass-spring-damper transfer function X(s)/F(s) is…",options:["1/(ms + b)","1/(ms² + bs + k)","k/(ms² + bs)","ms² + bs + k"],answer:1,explain:"Laplace of m x'' + b x' + k x = F."},
          {type:"numeric",q:"RC circuit, R = 1 kΩ, C = 500 µF. Time constant?",answer:0.5,tol:0.01,unit:"s",worked:"τ = RC = 1000 × 500×10⁻⁶."},
          {type:"numeric",q:"Cruise control, m = 1000 kg, b = 50 N s/m. Time constant?",answer:20,tol:0.1,unit:"s",worked:"τ = m/b."},
          {type:"numeric",q:"Mass 2 kg, spring 50 N/m. Undamped natural frequency?",answer:5,tol:0.01,unit:"rad/s",worked:"√(k/m) = √25."},
          {type:"numeric",q:"Mass 2 kg, spring 50 N/m, damper 20 N s/m. Damping ratio?",answer:1,tol:0.01,worked:"ζ = b/(2√(km)) = 20/(2 × 10): critically damped."}
        ]}
      },
      { stage:1, title:"C2 · L1 · Model numbers",
        blocks:[
          {type:"example",label:"Cruise control",text:R`$m=1000$ kg, $b=50$ N s/m. $K_{DC}=1/50=0.02$ (m/s)/N and $\tau=m/b=20$ s. A 500 N step force gives $v_{ss}=0.02\times500=10$ m/s, and 63.2 per cent of that (6.32 m/s) is reached at $t = 20$ s.`},
          {type:"example",label:"DC motor (CTMS)",text:R`$J=0.01$, $b=0.1$, $K=0.01$, $R=1$, $L=0.5$. DC gain $G(0)=\frac{K}{bR+K^2}=\frac{0.01}{0.1001}\approx0.0999$ rad/s per volt.`},
          {type:"example",label:"Mass-spring-damper (CTMS PID example)",text:R`$m=1$, $b=10$, $k=20$: $G(s)=\frac{1}{s^2+10s+20}$, DC gain $G(0)=1/20=0.05$ m/N. You meet this plant again in C5.`}
        ],
        test:{ numQuestions:4, pool:[
          {type:"numeric",q:"Cruise car (m = 1000 kg, b = 50 N s/m), 500 N constant force. Steady-state speed?",answer:10,tol:0.1,unit:"m/s",worked:"500/50."},
          {type:"numeric",q:"Same car: time to reach 63.2 % of final speed?",answer:20,tol:0.5,unit:"s",worked:"t = τ = m/b."},
          {type:"numeric",q:"DC motor (J = 0.01, b = 0.1, K = 0.01, R = 1, L = 0.5). DC gain, rad/s per V?",answer:0.0999,tol:0.001,worked:"K/(bR + K²) = 0.01/0.1001."},
          {type:"numeric",q:"Mass-spring-damper m = 1, b = 10, k = 20. DC gain in m/N?",answer:0.05,tol:0.001,worked:"1/k."},
          {type:"multistep",q:"Mass-spring-damper m = 1 kg, b = 0.2 N s/m, k = 1 N/m (CTMS).",steps:[{prompt:"ωn (rad/s)",answer:1,tol:0.01},{prompt:"ζ",answer:0.1,tol:0.005}],worked:"ωn = √(k/m) = 1; ζ = b/(2√(km)) = 0.2/2."}
        ]}
      }
    ]
  },

  /* ===================================================================
     C3 · TRANSFER FUNCTIONS, POLES AND STABILITY
     =================================================================== */
  {
    id:"c3", part:"101", title:"101 · C3 · Poles, zeros and stability",
    stages:[
      { stage:3, title:"C3 · L3 · Where the poles are is how it behaves",
        blocks:[
          {type:"heading",text:"Poles and zeros"},
          {type:"prose",text:R`Factor a transfer function: zeros are the roots of the numerator, poles are the roots of the denominator. Poles decide stability. Zeros only change the shape of the response (a left half-plane zero adds overshoot; a right half-plane zero causes an initial dip the wrong way).`},
          {type:"diagram",id:"splane",caption:"Stability is read straight off the s-plane."},
          {type:"prose",text:R`All poles with negative real part (left half-plane): stable, every response decays. Simple poles on the imaginary axis: marginally stable, a sustained oscillation or constant. Any pole with positive real part: unstable, the response grows without bound. Bounded-input bounded-output (BIBO) stability means every bounded input gives a bounded output.`},
          {type:"predict",q:"Drag the pole pair from the left half-plane towards the imaginary axis. Predict what happens to the oscillation as you go, and what happens when you cross.",a:"The decay gets slower and slower (less damping) until on the axis it oscillates forever. Cross into the right half-plane and the oscillation grows. Further from the real axis means faster oscillation."},
          {type:"sim",sim:"polezero"},
          {type:"quickcheck",q:"Which pole set could belong to a real physical system?",options:["−1 + 2j only","−1 + 2j and −1 − 2j","−1 + 2j and 1 + 2j","2j and 3j"],answer:1,explain:"Complex poles of real systems come as conjugate pairs. The simulation pairs them for you automatically; on paper you must do it yourself."},
          {type:"prose",text:"Reflect: why does the simulation only let you drag one pole? (Answer: the other is its conjugate and moves with it.)"},
          {type:"recall",q:"Do poles or zeros decide stability?",a:"Poles. Zeros shape the response."},
          {type:"video",title:"Intro to Control 7.1 · Poles and Zeros",url:YT("Em5TuH4TVr4")},
          {type:"video",title:"Intro to Control 7.2 · Poles and Stability",url:YT("flLDEJYrICk")}
        ],
        test:{ numQuestions:5, pool:[
          {type:"mcq",q:"A stable linear system has all poles…",options:["at the origin","on the imaginary axis","in the left half-plane","in the right half-plane"],answer:2,explain:"Strictly negative real parts."},
          {type:"mcq",q:"Which statement is correct?",options:["Zeros decide stability","Poles decide stability; zeros shape the response","Neither affects the response","Zeros are denominator roots"],answer:1,explain:"Poles: stability. Zeros: shape."},
          {type:"mcq",q:"Simple poles on the imaginary axis give a system that is…",options:["asymptotically stable","marginally stable","unstable by exponential growth","overdamped"],answer:1,explain:"Sustained oscillation, neither decaying nor growing."},
          {type:"mcq",q:"A right half-plane zero typically causes…",options:["faster settling","initial undershoot","instability by itself","no effect"],answer:1,explain:"The response first moves the wrong way."},
          {type:"mcq",q:"A system has poles at −3 and +0.5. It is…",options:["stable","marginally stable","unstable","critically damped"],answer:2,explain:"One right half-plane pole is enough."},
          {type:"mcq",q:"Moving a complex pole pair further from the real axis (same real part) makes the response…",options:["oscillate faster","decay faster","unstable","slower"],answer:0,explain:"The imaginary part is the damped frequency ωd."}
        ]}
      },
      { stage:2, title:"C3 · L2 · Reading a transfer function",
        blocks:[
          {type:"formula",tex:R`G(s)=\frac{Y(s)}{U(s)}=K\frac{\prod(s-z_i)}{\prod(s-p_i)}\qquad K_{DC}=G(0)\ \text{(stable systems only)}`,caption:"Factored form; DC (steady-state) gain"},
          {type:"prose",text:R`To read a first-order transfer function, put it in standard form $\frac{K}{\tau s+1}$ by dividing top and bottom by the constant in the denominator. $K$ is the DC gain, $\tau$ the time constant, the pole is at $-1/\tau$.`},
          {type:"example",label:"Worked",text:R`$G(s)=\frac{10}{2s+5}$. Divide by 5: $\frac{2}{0.4s+1}$. So $K = 2$, $\tau = 0.4$ s, pole at $s = -2.5$: stable.`},
          {type:"prose",text:R`DC gain is $G(0)$ only for a stable system. For an unstable one the output never settles, so there is no steady-state gain to speak of.`},
          {type:"recall",q:"Put 10/(2s + 5) into standard form.",a:"2 / (0.4s + 1): K = 2, τ = 0.4 s."},
          {type:"video",title:"Intro to Control 3.3 · Transfer Function and System Gain",url:YT("KDN8W_HaeAY")},
          {type:"video",title:"Intro to Control 8.4 · Bounded-Input Bounded-Output (BIBO) Stability",url:YT("VsU1Tqgd2-k")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"numeric",q:"G(s) = 10/(2s + 5). DC gain?",answer:2,tol:0.01,worked:"G(0) = 10/5."},
          {type:"numeric",q:"G(s) = 10/(2s + 5). Pole location?",answer:-2.5,tol:0.01,unit:"rad/s",worked:"Root of 2s + 5 = 0."},
          {type:"numeric",q:"G(s) = 10/(2s + 5). Time constant?",answer:0.4,tol:0.005,unit:"s",worked:"Standard form 2/(0.4s + 1)."},
          {type:"numeric",q:"G(s) = 6/(3s + 2). DC gain?",answer:3,tol:0.01,worked:"G(0) = 6/2."},
          {type:"mcq",q:"DC gain equals G(0)…",options:["always","only for stable systems","only for unstable systems","never"],answer:1,explain:"An unstable output has no steady state."}
        ]}
      },
      { stage:1, title:"C3 · L1 · Finding poles",
        blocks:[
          {type:"example",label:"Worked",text:R`$s^2+4s+13=0$: $s=\frac{-4\pm\sqrt{16-52}}{2}=-2\pm j3$. Matching to $s^2+2\zeta\omega_ns+\omega_n^2$: $\omega_n=\sqrt{13}=3.606$ rad/s, $\zeta=\frac{4}{2\times3.606}=0.555$. Stable (real part −2), oscillating at $\omega_d = 3$ rad/s.`},
          {type:"sim",sim:"routh"},
          {type:"prose",text:"The Routh builder shows the numerical roots of any polynomial. Type 1, 4, 13 and check the worked example. (How the Routh array itself works is 201.)"}
        ],
        test:{ numQuestions:3, pool:[
          {type:"numeric",q:"s² + 4s + 13 = 0. Damping ratio ζ?",answer:0.555,tol:0.005,worked:"ωn = √13 = 3.606, ζ = 4/(2 × 3.606)."},
          {type:"multistep",q:"Poles of s² + 4s + 13 = σ ± jω.",steps:[{prompt:"σ (real part)",answer:-2,tol:0.01},{prompt:"ω (imaginary part, positive)",answer:3,tol:0.01}],worked:"(−4 ± √(16 − 52))/2 = −2 ± j3."},
          {type:"numeric",q:"s² + 2s + 5 = 0. Natural frequency ωn?",answer:2.236,tol:0.005,unit:"rad/s",worked:"√5."},
          {type:"numeric",q:"s² + 2s + 5 = 0. Damping ratio ζ?",answer:0.447,tol:0.005,worked:"2/(2√5) = 0.4472."}
        ]}
      }
    ]
  },

  /* ===================================================================
     C4 · TIME RESPONSE
     =================================================================== */
  {
    id:"c4", part:"101", title:"101 · C4 · Time response",
    stages:[
      { stage:3, title:"C4 · L3 · Speed and shape",
        blocks:[
          {type:"heading",text:"First order: the time constant"},
          {type:"prose",text:R`A first-order system $\frac{K}{\tau s+1}$ responds to a step by rising smoothly towards $K$. The time constant $\tau$ is the time to reach 63.2 per cent of the final value, not the time to finish. The response never quite reaches 100 per cent, so settling time is defined with a tolerance band: about $4\tau$ for 2 per cent. Gain $K$ sets where it ends up; $\tau$ sets how fast.`},
          {type:"predict",q:"Double τ while keeping K fixed. Sketch the new step response before you move the slider.",a:"Same final value, half as fast: every point on the curve is reached at twice the time."},
          {type:"sim",sim:"firstorder"},
          {type:"heading",text:"Second order: damping ratio and natural frequency"},
          {type:"prose",text:R`A second-order system has two numbers. The damping ratio $\zeta$ sets the shape: $\zeta = 0$ oscillates forever; $0 < \zeta < 1$ (underdamped) overshoots and rings down; $\zeta = 1$ (critically damped) is the fastest response with no overshoot; $\zeta > 1$ (overdamped) is slow with no overshoot. The natural frequency $\omega_n$ only stretches or squeezes time.`},
          {type:"diagram",id:"secondorder",caption:"The step-response terms: rise time, peak time, overshoot, settling time."},
          {type:"predict",q:"Overshoot depends on which: ζ, ωn, or both? Decide, then test it by moving only ωn.",a:"ζ only. Moving ωn changes the time axis but the peak height stays the same."},
          {type:"sim",sim:"secondorder"},
          {type:"prose",text:"Guided task: find the damping ratio that gives 10 per cent overshoot. Write your value down; you will calculate it exactly in L1."},
          {type:"recall",q:"What does τ mean for a first-order system?",a:"The time to reach 63.2 % of the final value."},
          {type:"video",title:"Intro to Control 9.1 · System Time Response Terms",url:YT("uKUA147B3D8")},
          {type:"video",title:"Intro to Control 9.3 · Second Order System: Damping & Natural Frequency",url:YT("pzRTyxf31fw")}
        ],
        test:{ numQuestions:5, pool:[
          {type:"mcq",q:"For a first-order step response, at t = τ the output has reached about…",options:["50 %","63.2 %","86.5 %","95 %"],answer:1,explain:"1 − e^(−1) = 0.632."},
          {type:"mcq",q:"In K/(τs + 1), increasing K (τ fixed) mainly…",options:["speeds up the response","scales the final value","moves the pole","makes it unstable"],answer:1,explain:"The pole at −1/τ is unchanged."},
          {type:"mcq",q:"Percent overshoot of a standard second-order system depends on…",options:["ωn only","ζ only","both equally","neither"],answer:1,explain:"ωn only scales time."},
          {type:"mcq",q:"A second-order system with ζ = 1 is…",options:["undamped","underdamped","critically damped","overdamped"],answer:2,explain:"Repeated real pole."},
          {type:"mcq",q:"With ζ = 0 the step response…",options:["settles in one second","oscillates indefinitely","decays without oscillation","diverges"],answer:1,explain:"Poles at ±jωn."},
          {type:"mcq",q:"Settling time for a first-order system is defined using…",options:["the time to reach 100 %","a tolerance band, e.g. 2 %","the time constant only","the peak"],answer:1,explain:"It never reaches 100 % in finite time."}
        ]}
      },
      { stage:2, title:"C4 · L2 · The response formulae",
        blocks:[
          {type:"formula",tex:R`G(s)=\frac{K}{\tau s+1}:\qquad y(t)=K\left(1-e^{-t/\tau}\right)`,caption:"First-order unit step response"},
          {type:"prose",text:R`Milestones: $t=\tau$: 63.2 %; $2\tau$: 86.5 %; $3\tau$: 95.0 % (5 % settling); $4\tau$: 98.2 % (about 2 % settling). Rise time 10 to 90 per cent: $T_r=\tau\ln9\approx2.2\tau$ (standard result; the playlist defines rise time but does not derive 2.2τ).`},
          {type:"formula",tex:R`G(s)=\frac{\omega_n^2}{s^2+2\zeta\omega_ns+\omega_n^2},\qquad s_{1,2}=-\zeta\omega_n\pm j\omega_n\sqrt{1-\zeta^2}`,caption:"Standard second-order system"},
          {type:"formula",tex:R`\omega_d=\omega_n\sqrt{1-\zeta^2},\quad T_p=\frac{\pi}{\omega_d},\quad \%OS=100\,e^{-\zeta\pi/\sqrt{1-\zeta^2}},\quad T_s(2\%)\approx\frac{4}{\zeta\omega_n}`,caption:"Damped frequency, peak time, overshoot, settling time"},
          {type:"formula",tex:R`\zeta=\frac{-\ln(\%OS/100)}{\sqrt{\pi^2+\ln^2(\%OS/100)}}`,caption:"Inverse: damping ratio from a target overshoot"},
          {type:"prose",text:R`The settling-time formula is an approximation. Higher-order systems can often be treated as second order using the dominant (slowest) complex pole pair, but only if the other poles are much faster.`},
          {type:"recall",q:"Peak time formula?",a:"Tp = π / ωd, with ωd = ωn√(1 − ζ²)."},
          {type:"video",title:"Intro to Control 9.2 · Second-Order System Time Response",url:YT("ZqzLugaRiJs")},
          {type:"video",title:"Intro to Control 9.4 · System Response with Zeros",url:YT("tCkc6jBLb40")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"numeric",q:"ζ = 0.5, ωn = 4 rad/s. Percent overshoot?",answer:16.3,tol:0.2,unit:"%",worked:"100 e^(−0.5π/√0.75) = 100 e^(−1.8138)."},
          {type:"numeric",q:"ζ = 0.5, ωn = 4 rad/s. Peak time?",answer:0.907,tol:0.005,unit:"s",worked:"π/(4√0.75) = π/3.4641."},
          {type:"numeric",q:"ζ = 0.5, ωn = 4 rad/s. Damped frequency ωd?",answer:3.464,tol:0.01,unit:"rad/s",worked:"4√0.75."},
          {type:"numeric",q:"ζ = 0.5, ωn = 4 rad/s. 2 % settling time using 4/(ζωn)?",answer:2,tol:0.1,unit:"s",worked:"4/2."},
          {type:"numeric",q:"First order: fraction of final value reached at t = 2τ, in %?",answer:86.5,tol:0.2,unit:"%",worked:"1 − e^(−2) = 0.8647."}
        ]}
      },
      { stage:1, title:"C4 · L1 · Calculating responses",
        blocks:[
          {type:"example",label:"First order",text:R`$G(s)=\frac{10}{2s+5}=\frac{2}{0.4s+1}$, step of magnitude 4. Final value $2\times4=8$. $y(0.4)=8(1-e^{-1})=5.057$; $y(1.2)=8(1-e^{-3})=7.602$; $y(1.6)=8(1-e^{-4})=7.853$. $T_r=2.2\times0.4=0.88$ s; 2 per cent settling $\approx4\tau=1.6$ s.`},
          {type:"example",label:"Second order",text:R`$\zeta=0.5$, $\omega_n=4$ rad/s. Poles $-2\pm j3.464$. $T_p=\pi/3.464=0.907$ s. $\%OS=16.3\%$. $T_s(2\%)\approx4/2=2.0$ s.`},
          {type:"example",label:"Design backwards",text:R`For 10 per cent overshoot: $\ln(0.1)=-2.3026$, so $\zeta=\frac{2.3026}{\sqrt{\pi^2+2.3026^2}}=\frac{2.3026}{3.895}=0.591$. Compare with the value you found by eye in L3.`}
        ],
        test:{ numQuestions:5, pool:[
          {type:"numeric",q:"G(s) = 2/(0.4s + 1), unit step. Output at t = 1.2 s?",answer:1.9,tol:0.01,worked:"2(1 − e^(−3)) = 2 × 0.9502."},
          {type:"numeric",q:"ζ = 0.2, ωn = 10 rad/s. Percent overshoot?",answer:52.7,tol:0.3,unit:"%",worked:"100 e^(−0.2π/√0.96) = 100 e^(−0.6413)."},
          {type:"numeric",q:"ζ = 0.2, ωn = 10 rad/s. Peak time?",answer:0.321,tol:0.005,unit:"s",worked:"π/(10√0.96) = π/9.798."},
          {type:"numeric",q:"Damping ratio for 10 % overshoot?",answer:0.591,tol:0.005,worked:"2.3026/√(π² + 2.3026²)."},
          {type:"numeric",q:"Cruise car τ = 20 s. Approximate 5 % settling time (3τ)?",answer:60,tol:2,unit:"s",worked:"3 × 20."},
          {type:"numeric",q:"Cruise car τ = 20 s. Approximate 2 % settling time (4τ)?",answer:80,tol:2,unit:"s",worked:"4 × 20 (78 with 3.9τ is fine)."},
          {type:"numeric",q:"Damping ratio for 20 % overshoot?",answer:0.456,tol:0.005,worked:"ln(0.2) = −1.6094; 1.6094/√(π² + 1.6094²) = 0.4559."}
        ]}
      }
    ]
  },

  /* ===================================================================
     C5 · PID CONTROL
     =================================================================== */
  {
    id:"c5", part:"101", title:"101 · C5 · PID control",
    stages:[
      { stage:3, title:"C5 · L3 · Present, past and future",
        blocks:[
          {type:"heading",text:"Three ways to react to error"},
          {type:"prose",text:R`A PID controller adds three reactions to the error. Proportional (P) reacts to the present error: bigger error, bigger push. Integral (I) reacts to the accumulated past error: as long as any error remains, it keeps building up the push, which is how it removes steady offset. Derivative (D) reacts to the trend: it acts like a damper, pushing against fast changes before they overshoot.

You do not always need all three. PI and PD controllers are common.`},
          {type:"predict",q:"Which of Kp, Ki, Kd removes the steady offset you saw with P-only cruise control?",a:"Ki. D does nothing to a constant error (its rate of change is zero) and P alone always leaves some offset on a plant like this."},
          {type:"sim",sim:"pid"},
          {type:"prose",text:"Guided tasks: (1) set Ki and Kd to zero and raise Kp: faster, smaller offset, more overshoot. (2) Add Ki: the offset disappears but overshoot grows. (3) Add Kd: overshoot falls. Beginners typically set Kp far too low and find Kd the hardest to tune (pedagogy brief, Brumar et al. 2025)."},
          {type:"sim",sim:"pidgame"},
          {type:"prose",text:"Debrief after the game (play alone improved tuning speed but not theory scores in the study, so do this part): when a try failed, was it overshoot (too little Kd or too much Ki), settling time (too little Kp or too much Ki) or steady-state error (no Ki)? Write one sentence for each."},
          {type:"quickcheck",q:"You enter a negative Kp by mistake. What happens?",options:["Slower response","Positive feedback: the loop pushes the wrong way and diverges","No change","Zero steady-state error"],answer:1,explain:"A wrong-sign gain turns negative feedback into positive feedback (pedagogy brief, Woo and Lee 1997)."},
          {type:"recall",q:"What does each PID term react to?",a:"P: present error. I: accumulated past error. D: rate of change (trend) of the error."},
          {type:"video",title:"Intro to Control 10.3 · Proportional Feedback Control",url:YT("vO8w3cQiTwE")},
          {type:"video",title:"Intro to Control 10.4 · Integral and Derivative Control Introduction",url:YT("Qt7sFiT82x0")},
          {type:"video",title:"Intro to Control MP.1 · Feedback Control in Matlab Simulink",url:YT("wD-JFtDx5SU"),note:"The block sandbox in the Simulation Lab is a simplified version of this."}
        ],
        test:{ numQuestions:5, pool:[
          {type:"mcq",q:"Pure proportional control on a type 0 plant gives…",options:["zero steady-state error","a non-zero steady-state error for a step","infinite gain","always instability"],answer:1,explain:"e_ss = 1/(1 + Kp G(0))."},
          {type:"mcq",q:"Which PID term removes steady-state error for a step?",options:["P","I","D","none"],answer:1,explain:"It adds a pole at the origin."},
          {type:"mcq",q:"The derivative term responds to…",options:["the accumulated error","the present error","the rate of change of error","the setpoint only"],answer:2,explain:"It does nothing to a constant error."},
          {type:"mcq",q:"Increasing Kp alone typically…",options:["increases rise time","decreases rise time","removes overshoot","has no effect"],answer:1,explain:"CTMS effect table; overshoot increases too."},
          {type:"mcq",q:"Increasing Kd alone typically…",options:["removes steady-state error","decreases overshoot","increases rise time a lot","makes the plant first order"],answer:1,explain:"D acts like added damping."},
          {type:"mcq",q:"Increasing Ki alone typically…",options:["eliminates steady-state error but increases overshoot","removes overshoot","has no effect on settling","makes the loop open"],answer:0,explain:"CTMS effect table."}
        ]}
      },
      { stage:2, title:"C5 · L2 · PID mathematics",
        blocks:[
          {type:"formula",tex:R`u(t)=K_pe(t)+K_i\int_0^t e\,d\tau+K_d\frac{de}{dt}\qquad C(s)=K_p+\frac{K_i}{s}+K_ds`,caption:"PID law in time and in s"},
          {type:"prose",text:R`Effect of raising each gain on its own (CTMS table; a guide, not a law, because gains interact):
Kp: rise time down, overshoot up, settling small change, steady-state error down.
Ki: rise time down, overshoot up, settling up, steady-state error eliminated.
Kd: rise time small change, overshoot down, settling down, steady-state error no change.`},
          {type:"formula",tex:R`e_{ss}=\frac{1}{1+K_pG(0)}\quad\text{(P control, type 0 plant, unit step)}`,caption:"Why P alone leaves an offset"},
          {type:"prose",text:R`Integral action puts a pole at the origin ($K_i/s$). The open-loop DC gain becomes infinite, so $e_{ss}=0$ for a step.

EXT (not in the playlist): derivative action amplifies high-frequency sensor noise, so real controllers filter it. If the actuator saturates (throttle fully open), the integrator keeps accumulating error and overshoots badly when it finally recovers: integrator windup, handled with anti-windup clamping. The sandbox PID preset includes a saturation block so you can see this.`},
          {type:"recall",q:"Write C(s) for a PID controller.",a:"C(s) = Kp + Ki/s + Kd s."}
        ],
        test:{ numQuestions:4, pool:[
          {type:"numeric",q:"Type 0 plant with G(0) = 0.05, Kp = 300, unity feedback, unit step. Steady-state error?",answer:0.0625,tol:0.001,worked:"1/(1 + 300 × 0.05) = 1/16."},
          {type:"numeric",q:"Type 0 plant with G(0) = 2, Kp = 4.5. Steady-state error for a unit step?",answer:0.1,tol:0.001,worked:"1/(1 + 9)."},
          {type:"mcq",q:"EXT: why is derivative action usually filtered?",options:["It reduces overshoot too much","It amplifies high-frequency noise","It removes the integral term","It needs a negative gain"],answer:1,explain:"D has rising gain with frequency."},
          {type:"mcq",q:"EXT: integrator windup occurs when…",options:["the sensor fails","the actuator saturates while the integrator keeps accumulating error","Kd is too small","the plant is first order"],answer:1,explain:"The integral state grows while the output cannot respond."},
          {type:"mcq",q:"Integral action removes step error because it…",options:["adds a pole at the origin","adds a zero at the origin","reduces the gain","removes the sensor"],answer:0,explain:"Ki/s: infinite DC loop gain."}
        ]}
      },
      { stage:1, title:"C5 · L1 · A worked PID design",
        blocks:[
          {type:"example",label:"CTMS mass-spring-damper, P control",text:R`$G(s)=\frac{1}{s^2+10s+20}$, $K_p=300$, unity feedback. Closed loop $T=\frac{300}{s^2+10s+320}$.

Steady state: $x_{ss}=300/320=0.9375$, $e_{ss}=1/(1+300\times0.05)=0.0625$.

Shape: $\omega_n=\sqrt{320}=17.89$ rad/s, $\zeta=\frac{10}{2\times17.89}=0.280$, so $\%OS=100e^{-\zeta\pi/\sqrt{1-\zeta^2}}\approx40.1\%$ and $T_s\approx\frac{4}{\zeta\omega_n}=\frac{4}{5}=0.8$ s. Fast but very oscillatory with an offset: exactly why CTMS goes on to add D (to damp) and I (to remove the offset).`},
          {type:"prose",text:"Build it: in the block sandbox (Simulation Lab), load P feedback, set the Gain to 300 and the TF to num 1, den 1 10 20, run, and read the scope final value. You should see about 0.9375."}
        ],
        test:{ numQuestions:3, pool:[
          {type:"numeric",q:"Plant 1/(s² + 10s + 20), Kp = 300, unity feedback, unit step. Steady-state output?",answer:0.9375,tol:0.002,worked:"300/320."},
          {type:"multistep",q:"Closed loop 300/(s² + 10s + 320).",steps:[{prompt:"ωn (rad/s)",answer:17.89,tol:0.05},{prompt:"ζ",answer:0.28,tol:0.005},{prompt:"2 % settling time 4/(ζωn) (s)",answer:0.8,tol:0.02}],worked:"ωn = √320; ζ = 10/(2ωn); ζωn = 5."},
          {type:"numeric",q:"Closed loop 300/(s² + 10s + 320). Percent overshoot?",answer:40.1,tol:0.5,unit:"%",worked:"ζ = 0.2795: 100 e^(−0.2795π/√(1 − 0.0781)) = 40.07 %."}
        ]}
      }
    ]
  },

  /* ===================================================================
     C6 · BLOCK DIAGRAMS AND STEADY-STATE ERROR          (201 brief 2.1, 2.2)
     =================================================================== */
  {
    id:"c6", part:"201", title:"201 · C6 · Block diagrams and accuracy",
    stages:[
      { stage:3, title:"C6 · L3 · Reducing diagrams, tracking inputs",
        blocks:[
          {type:"heading",text:"Block diagrams are algebra drawn as boxes"},
          {type:"prose",text:"Any tangle of blocks can be collapsed to one transfer function with three moves: series (multiply), parallel (add) and feedback (G over 1 + GH). When loops overlap, you first move a pickoff point or summing junction so the loops become nestable. Mason's gain formula does the same job in one pass on a signal-flow graph."},
          {type:"diagram",id:"reduction",caption:"The three reduction rules."},
          {type:"quickcheck",q:"You move a pickoff point downstream past block G (with the signal flow). The moved branch must be multiplied by…",options:["G","1/G","−G","nothing"],answer:1,explain:"Ask: does every path to the output still see the same blocks? Downstream you have picked off G times too much, so divide by G. Upstream (against the flow) you multiply by G. Swapping these is the classic mistake."},
          {type:"heading",text:"System type: how many inputs you can track"},
          {type:"prose",text:"Steady-state error is what is left once the transients die. System type is the number of pure integrators (poles at s = 0) in the open-loop forward path. Each integrator lets the loop track one more order of input with zero error: type 0 holds a step with an offset; type 1 tracks a step exactly and a ramp with a constant lag; type 2 tracks a ramp exactly."},
          {type:"predict",q:"A type 1 loop is given a ramp input. Zero error, constant error, or growing error?",a:"Constant error, 1/Kv. It follows the ramp at the right slope but lags behind it by a fixed amount."},
          {type:"sim",sim:"sserror"},
          {type:"prose",text:"Guided task: fill in the 2 × 2 grid (type 0 or 1, step or ramp) from the simulation before reading the table in L2. Then reflect: why does a loop built from perfect components still show error? (Because the controller only acts when there is error. A type 0 loop needs some error to keep producing output; students find this hard to accept, per the pedagogy brief, Albright 2001.)"},
          {type:"recall",q:"What is system type?",a:"The number of open-loop poles at s = 0 (integrators) in the forward path."},
          {type:"video",title:"Intro to Control 11.2 · More Steady State Error",url:YT("cJaOvAF-V-c")}
        ],
        test:{ numQuestions:5, pool:[
          {type:"mcq",q:"Negative feedback, forward G, feedback H. T = ?",options:["G/(1 − GH)","G/(1 + GH)","GH/(1 + G)","G(1 + H)"],answer:1,explain:"Positive feedback would give G/(1 − GH)."},
          {type:"mcq",q:"Moving a pickoff point downstream past a block G, the moved branch is multiplied by…",options:["G","1/G","−G","nothing"],answer:1,explain:"Upstream needs G."},
          {type:"mcq",q:"Unity feedback, G(s) = 10/(s(s+2)). System type?",options:["0","1","2","3"],answer:1,explain:"One pole at s = 0."},
          {type:"mcq",q:"Steady-state error of a type 1 unity-feedback system to a step is…",options:["1/Kv","1/(1+Kp)","0","infinite"],answer:2,explain:"The integrator removes step error."},
          {type:"mcq",q:"System type is read from…",options:["the closed-loop poles","the open-loop poles at s = 0 in the forward path","the number of zeros","the sensor gain"],answer:1,explain:"A common slip is to look at closed-loop poles."},
          {type:"mcq",q:"Raising Kp on a type 0 plant…",options:["removes step error completely","shrinks step error but never removes it","has no effect on error","makes it type 1"],answer:1,explain:"1/(1+Kp) never reaches 0."}
        ]}
      },
      { stage:2, title:"C6 · L2 · Error constants and Mason's rule",
        blocks:[
          {type:"formula",tex:R`K_p=\lim_{s\to0}G(s),\quad K_v=\lim_{s\to0}sG(s),\quad K_a=\lim_{s\to0}s^2G(s)`,caption:"Position, velocity and acceleration error constants (unity feedback)"},
          {type:"prose",text:R`Steady-state error table (unit inputs; scale by the amplitude A for a step A, a ramp At or a parabola ½At²):
Type 0: step $1/(1+K_p)$, ramp $\infty$, parabola $\infty$.
Type 1: step 0, ramp $1/K_v$, parabola $\infty$.
Type 2: step 0, ramp 0, parabola $1/K_a$.

The FVT behind this table is valid only if the closed loop is stable. Check stability first (C7).`},
          {type:"formula",tex:R`T=\frac{\sum_k P_k\Delta_k}{\Delta},\qquad \Delta=1-\sum L_i+\sum L_iL_j-\dots`,caption:"Mason's gain formula (L_iL_j: pairs of loops that do not touch)"},
          {type:"prose",text:R`$P_k$ is the gain of forward path $k$; $\Delta_k$ is $\Delta$ with every loop that touches path $k$ removed. A negative-feedback loop gain carries its own minus sign. Two loops touch if they share any node, even if their blocks look separate.`},
          {type:"recall",q:"Steady-state error of a type 1 loop to a unit ramp?",a:"1/Kv, with Kv = lim s→0 of sG(s)."},
          {type:"video",title:"Intro to Control 12.1 · Closed-Loop Transfer Function with a Sensor Transfer Function",url:YT("xfmaLD1-I_g"),note:"No playlist video covers Mason's rule."}
        ],
        test:{ numQuestions:4, pool:[
          {type:"multistep",q:"Unity feedback, G(s) = 20/(s+4), unit step.",steps:[{prompt:"Kp",answer:5,tol:0.01},{prompt:"e_ss",answer:0.167,tol:0.002}],worked:"Kp = 20/4 = 5; e_ss = 1/6."},
          {type:"multistep",q:"Unity feedback, G(s) = 50/(s(s+5)), input r(t) = 3t.",steps:[{prompt:"Kv",answer:10,tol:0.01},{prompt:"e_ss",answer:0.3,tol:0.005}],worked:"Kv = 50/5 = 10; e_ss = 3/10."},
          {type:"multistep",q:"Unity feedback, G(s) = 100(s+2)/(s²(s+10)), input r(t) = ½t².",steps:[{prompt:"Ka",answer:20,tol:0.01},{prompt:"e_ss",answer:0.05,tol:0.001}],worked:"Ka = 100 × 2/10 = 20; e_ss = 1/20."},
          {type:"mcq",q:"The FVT-based error table needs…",options:["any closed loop","a stable closed loop","a stable open loop","a ramp input"],answer:1,explain:"Check stability first."},
          {type:"mcq",q:"In Mason's rule, two loops 'touch' if they…",options:["have blocks drawn next to each other","share any node","have the same gain","are both negative feedback"],answer:1,explain:"Sharing a node is enough."}
        ]}
      },
      { stage:1, title:"C6 · L1 · Designing for accuracy",
        blocks:[
          {type:"example",label:"Reduction",text:R`$G_1 = 5$ in series with $G_2=\frac{1}{s+2}$, feedback $H = 3$. $G=\frac{5}{s+2}$, $T=\frac{5/(s+2)}{1+15/(s+2)}=\frac{5}{s+17}$. The pole moves from −2 to −17 (faster) and the DC gain drops from 2.5 to $5/17 \approx 0.294$.`},
          {type:"example",label:"Gain for a ramp spec",text:R`$G(s)=\frac{K(s+3)(s+5)}{s(s+7)(s+8)}$, want 10 per cent error to a unit ramp. Type 1, so $e_{ss}=1/K_v=0.1$, $K_v=10$. $K_v=\frac{15K}{56}$, so $K=37.33$. Check stability: $s^3+15s^2+354.7s+560$; $15\times354.7>560$, stable, so the FVT is legitimate.`},
          {type:"example",label:"The catch",text:R`$G(s)=\frac{K}{s(s+4)}$, want $e_{ss}\le0.05$ to a unit ramp: $K_v=K/4$, so $K\ge80$. Closed loop $s^2+4s+80$: $\omega_n=8.944$, $\zeta=0.224$, overshoot 48.6 per cent. The accuracy spec has wrecked the damping. Fixing that needs compensation (C10).`}
        ],
        test:{ numQuestions:3, pool:[
          {type:"numeric",q:"G1 = 5, G2 = 1/(s+2), feedback H = 3. Closed-loop DC gain?",answer:0.294,tol:0.002,worked:"T = 5/(s+17); T(0) = 5/17."},
          {type:"numeric",q:"G(s) = K(s+3)(s+5)/(s(s+7)(s+8)). K for 10 % error to a unit ramp?",answer:37.33,tol:0.05,worked:"Kv = 15K/56 = 10."},
          {type:"multistep",q:"G(s) = K/(s(s+4)), unity feedback.",steps:[{prompt:"Least K for e_ss ≤ 0.05 to a unit ramp",answer:80,tol:0.1},{prompt:"ζ at that K",answer:0.224,tol:0.002},{prompt:"Overshoot (%)",answer:48.6,tol:0.3}],worked:"Kv = K/4 ≥ 20; s² + 4s + 80: ωn = 8.944, ζ = 0.2236, OS = e^(−0.7207) = 48.6 %."}
        ]}
      }
    ]
  },

  /* ===================================================================
     C7 · STABILITY AND ROUTH-HURWITZ                     (201 brief 2.3)
     =================================================================== */
  {
    id:"c7", part:"201", title:"201 · C7 · Stability and Routh-Hurwitz",
    stages:[
      { stage:3, title:"C7 · L3 · Counting unstable roots without solving",
        blocks:[
          {type:"prose",text:"A linear system is stable when every closed-loop pole has a negative real part. For a cubic or higher you cannot easily solve for the roots by hand, but you rarely need them: you only need to know how many are in the right half-plane. The Routh-Hurwitz criterion counts them from the coefficients alone, and it is the quickest way to find the range of gain K that keeps a loop stable."},
          {type:"prose",text:"First, a free check: if any coefficient is missing or has a different sign from the rest, the system is not stable. Stop there."},
          {type:"predict",q:"s⁴ + 2s³ + 3s² + 4s + 5: every coefficient is positive. Stable?",a:"Not necessarily. Positive coefficients are necessary but not sufficient. This one has two right half-plane roots. Build it in the simulation below."},
          {type:"sim",sim:"routh"},
          {type:"prose",text:"Guided task: try 1, 6, 11, 6 (stable), then 1, 6, 11, 66 and 1, 6, 11, 70. Where does it tip over? Reflect: what does a row of zeros mean physically? (Try 1, 7, 6, 42, 8, 56.)"},
          {type:"recall",q:"What does the number of sign changes in the Routh first column tell you?",a:"The number of right half-plane roots."},
          {type:"recall",q:"Is marginally stable the same as stable?",a:"No. Poles on the jω axis: a bounded input at the resonant frequency gives an unbounded output, so BIBO stability fails."},
          {type:"video",title:"Intro to Control 7.3 · More Poles and Stability",url:YT("6v6bwgc3jCU")},
          {type:"video",title:"Intro to Control 8.1 · Imaginary Poles and Stability",url:YT("Io3Lw_ExH2g"),note:"No playlist video covers the Routh array itself."}
        ],
        test:{ numQuestions:4, pool:[
          {type:"mcq",q:"Number of right half-plane roots equals…",options:["the number of negative coefficients","the number of sign changes in the Routh first column","the order of the polynomial","the number of zero rows"],answer:1,explain:"Routh-Hurwitz criterion."},
          {type:"mcq",q:"All coefficients positive means…",options:["definitely stable","necessary but not sufficient for stability","definitely unstable","marginally stable"],answer:1,explain:"Example: s⁴ + 2s³ + 3s² + 4s + 5 has 2 RHP roots."},
          {type:"mcq",q:"s³ + 2s² − s + 4: stable?",options:["yes","no: a coefficient has the wrong sign","need the full array to tell","marginally"],answer:1,explain:"Necessary condition fails."},
          {type:"mcq",q:"Marginally stable systems are…",options:["BIBO stable","not BIBO stable: resonance can give unbounded output","always unstable by exponential growth","the same as critically damped"],answer:1,explain:"Bounded input at the resonant frequency gives growing output."}
        ]}
      },
      { stage:2, title:"C7 · L2 · Building the array, and its special cases",
        blocks:[
          {type:"prose",text:R`For $D(s)=a_Ns^N+\dots+a_0$: row 1 is $a_N, a_{N-2}, \dots$; row 2 is $a_{N-1}, a_{N-3}, \dots$. Each later entry uses the two rows above:`},
          {type:"formula",tex:R`b_1=\frac{a_{N-1}a_{N-2}-a_Na_{N-3}}{a_{N-1}}`,caption:"A row may be multiplied by any positive constant to simplify"},
          {type:"prose",text:R`Special case 1: a zero in the first column (rest of the row non-zero). Replace it by a small $\epsilon>0$, finish the array, let $\epsilon\to0^+$ and count sign changes. A zero there does not by itself mean instability.

Special case 2: a whole row of zeros. The row above gives an auxiliary polynomial $P(s)$ (even powers). Replace the zero row with the coefficients of $P'(s)$ and continue. The roots of $P(s)$ are symmetric about the origin (often $\pm j\omega$ pairs) and are also roots of $D(s)$. If no sign changes follow, they lie on the $j\omega$ axis: marginally stable.`},
          {type:"example",label:"Range of K",text:R`$s^3+10s^2+31s+K$. Rows: $1, 31$ / $10, K$ / $\frac{310-K}{10}$ / $K$. Stable for $0<K<310$.`},
          {type:"recall",q:"How do you handle a whole row of zeros?",a:"Form the auxiliary polynomial from the row above, differentiate it, and use those coefficients as the new row."}
        ],
        test:{ numQuestions:4, pool:[
          {type:"mcq",q:"A single zero in the first column (rest of row non-zero) is handled by…",options:["declaring instability","replacing it with ε > 0 and taking the limit","an auxiliary polynomial","multiplying the row by −1"],answer:1,explain:"Then count sign changes."},
          {type:"mcq",q:"A whole row of zeros indicates…",options:["a repeated real root only","roots symmetric about the origin, found from the auxiliary polynomial","an arithmetic error","a pole at the origin only"],answer:1,explain:"Often a ±jω pair."},
          {type:"numeric",q:"s³ + 10s² + 31s + K. Upper limit of K for stability?",answer:310,tol:0.5,worked:"s¹ row (310 − K)/10 > 0."},
          {type:"numeric",q:"s³ + 6s² + 11s + K. Upper limit of K for stability?",answer:66,tol:0.5,worked:"6 × 11 = 66."},
          {type:"numeric",q:"How many RHP roots has s⁴ + 2s³ + 3s² + 4s + 5?",answer:2,tol:0,worked:"First column 1, 2, 1, −6, 5: two sign changes."}
        ]}
      },
      { stage:1, title:"C7 · L1 · Gain limits in practice",
        blocks:[
          {type:"example",label:"Zero in first column",text:R`$s^4+s^3+3s^2+3s+3$. Rows: $1,3,3$ / $1,3$ / $\epsilon,3$ / $3-3/\epsilon$ / $3$. Signs $+,+,+,-,+$: two sign changes, two RHP roots (numerically $0.288\pm1.416j$).`},
          {type:"example",label:"Row of zeros",text:R`$s^5+7s^4+6s^3+42s^2+8s+56$. The $s^4$ row $7,42,56$ divided by 7 is $1,6,8$, and the $s^3$ row is all zero. $P(s)=s^4+6s^2+8$, $P'(s)=4s^3+12s\to1,3$. No sign changes follow. $P=(s^2+2)(s^2+4)$: roots $\pm j\sqrt2$, $\pm j2$, and the fifth root is −7. Marginally stable.`},
          {type:"example",label:"Loop design",text:R`$L(s)=\frac{K}{s(s+1)(s+5)}$: characteristic $s^3+6s^2+5s+K$, $s^1$ row $\frac{30-K}{6}$, so $0<K<30$. At $K=30$ the auxiliary $6s^2+30$ gives oscillation at $\omega=\sqrt5=2.236$ rad/s. The largest $K_v=K/5$ is 6, but at the limit the margins are zero, so practical designs use a fraction of it.`}
        ],
        test:{ numQuestions:3, pool:[
          {type:"multistep",q:"L(s) = K/(s(s+1)(s+5)), unity feedback.",steps:[{prompt:"Upper limit of K",answer:30,tol:0.1},{prompt:"Oscillation frequency at the limit (rad/s)",answer:2.236,tol:0.005},{prompt:"Kv at the limit",answer:6,tol:0.01}],worked:"s³ + 6s² + 5s + K: (30 − K)/6 > 0; 6ω² = 30; Kv = K/5."},
          {type:"numeric",q:"s⁴ + s³ + 3s² + 3s + 3: number of RHP roots?",answer:2,tol:0,worked:"ε method: signs +, +, +, −, +."},
          {type:"numeric",q:"s⁵ + 7s⁴ + 6s³ + 42s² + 8s + 56: number of roots on the jω axis?",answer:4,tol:0,worked:"Auxiliary s⁴ + 6s² + 8 = (s² + 2)(s² + 4)."}
        ]}
      }
    ]
  },

  /* ===================================================================
     C8 · ROOT LOCUS                                      (201 brief 2.4)
     =================================================================== */
  {
    id:"c8", part:"201", title:"201 · C8 · Root locus",
    stages:[
      { stage:3, title:"C8 · L3 · Where the poles go as gain rises",
        blocks:[
          {type:"prose",text:"The root locus is the path traced by the closed-loop poles as one gain K goes from 0 to infinity in 1 + KG(s) = 0. It starts at the open-loop poles (K = 0) and ends at the open-loop zeros or heads off to infinity. At a glance it tells you how much gain you can use before oscillation or instability, and what damping you get at each gain."},
          {type:"predict",q:"For G = 1/(s(s+2)(s+4)), as K rises, where does the pole pair near the origin go, and what happens to overshoot?",a:"The two poles at 0 and −2 move towards each other, meet near −0.85, then split into a complex pair heading up and right. Overshoot rises with K, and at K = 48 the pair crosses the jω axis: the loop goes unstable."},
          {type:"sim",sim:"rootlocus"},
          {type:"prose",text:"Guided task: pick the [C8 worked example] plant. Find the K where the poles leave the real axis, and the K where they cross into the red region. Reflect: which open-loop pole controls the branch that goes unstable? (Students who rely on software often have no feel for this, per the pedagogy brief, Cardona 2018.)"},
          {type:"quickcheck",q:"As K changes, the open-loop poles…",options:["move along the locus","stay fixed; the closed-loop poles move","disappear","move to the zeros"],answer:1,explain:"The × marks never move. The locus is where the closed-loop poles go."},
          {type:"recall",q:"Where does the root locus start and end?",a:"Starts at the open-loop poles (K = 0); ends at the open-loop zeros or at infinity along asymptotes."},
          {type:"video",title:"Intro to Control 12.3 · Root Locus Basics Part 1",url:YT("-eaJDo9Bvy8")},
          {type:"video",title:"Intro to Control 13.3 · Root Locus for Stability!",url:YT("I8od43imOUc")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"mcq",q:"The root locus starts (K = 0) at…",options:["the open-loop zeros","the open-loop poles","the origin","the jω axis"],answer:1,explain:"At K = 0 the closed-loop poles are the open-loop poles."},
          {type:"mcq",q:"As K → ∞, branches go to…",options:["the origin","the m zeros and along n − m asymptotes","the poles","the jω axis"],answer:1,explain:"Rule 3."},
          {type:"mcq",q:"Real-axis segments of the locus lie…",options:["to the right of an odd number of poles and zeros","to the left of an odd number of real poles and zeros","between any two poles","to the left of every pole"],answer:1,explain:"Rule 2."},
          {type:"mcq",q:"Breakaway points are…",options:["always halfway between poles","found by solving dK/ds = 0 and keeping roots on the locus","at the centroid","at the zeros"],answer:1,explain:"Reject any root not on a valid segment."},
          {type:"mcq",q:"Asymptotes describe the locus…",options:["at all gains","only as K → ∞","only near K = 0","only on the real axis"],answer:1,explain:"Not the low-gain path."}
        ]}
      },
      { stage:2, title:"C8 · L2 · The sketching rules",
        blocks:[
          {type:"prose",text:R`For $1+KG(s)=0$ with $n$ poles and $m$ zeros:
1. $n$ branches, symmetric about the real axis.
2. Real-axis segments lie to the left of an odd number of real poles plus zeros.
3. $n-m$ asymptotes at angles $\theta_a=\frac{(2k+1)180^\circ}{n-m}$, meeting at the centroid $\sigma_a=\frac{\sum p_i-\sum z_i}{n-m}$.
4. Breakaway and break-in points: roots of $dK/ds=0$ that lie on the locus.
5. Angle of departure from a complex pole: $\sum\angle\text{zeros}-\sum\angle\text{poles}=180^\circ$ at the test point.
6. jω crossing: substitute $s=j\omega$ (or use Routh) and solve for $\omega$ and $K$.`},
          {type:"formula",tex:R`K=\frac{\prod|s_0-p_i|}{\prod|s_0-z_j|}`,caption:"Magnitude condition: the gain at a point s₀ on the locus"},
          {type:"recall",q:"Centroid of the asymptotes?",a:"(Σ poles − Σ zeros)/(n − m)."}
        ],
        test:{ numQuestions:4, pool:[
          {type:"numeric",q:"L(s) = K/(s(s+3)(s+6)). Asymptote centroid?",answer:-3,tol:0.01,worked:"(0 − 3 − 6)/3."},
          {type:"numeric",q:"L(s) = K/(s(s+3)(s+6)). How many asymptotes?",answer:3,tol:0,worked:"n − m = 3 − 0."},
          {type:"mcq",q:"Asymptote angles for n − m = 3 are…",options:["0°, 90°, 180°","60°, 180°, 300°","45°, 135°","90°, 270°"],answer:1,explain:"(2k+1)180°/3."},
          {type:"numeric",q:"G = (s+2)/(s(s+4)(s+6)). Asymptote centroid?",answer:-4,tol:0.01,worked:"(0 − 4 − 6 − (−2))/(3 − 1) = −8/2."},
          {type:"mcq",q:"The gain at a point on the locus is found from…",options:["the angle condition","the magnitude condition","the centroid","Routh only"],answer:1,explain:"K = Π|s₀ − pᵢ| / Π|s₀ − zⱼ|."}
        ]}
      },
      { stage:1, title:"C8 · L1 · A full sketch with numbers",
        blocks:[
          {type:"example",label:"Worked",text:R`$G(s)=\frac{1}{s(s+2)(s+4)}$. Poles $0,-2,-4$; three branches. Real axis: $[-2,0]$ and $(-\infty,-4]$. Centroid $-2$; angles $60^\circ,180^\circ,300^\circ$.

$K=-(s^3+6s^2+8s)$, $dK/ds=0\Rightarrow3s^2+12s+8=0\Rightarrow s=-0.845$ (on the locus) or $-3.155$ (not on it, rejected). Gain at breakaway $K=0.845\times1.155\times3.155=3.08$.

jω crossing: $s^3+6s^2+8s+K$ at $s=j\omega$: $\omega(8-\omega^2)=0\Rightarrow\omega=2.828$; $K=6\omega^2=48$. Stable for $0<K<48$. Check all of these in the simulation.`}
        ],
        test:{ numQuestions:3, pool:[
          {type:"multistep",q:"L(s) = K/(s(s+3)(s+6)): the breakaway point.",steps:[{prompt:"Breakaway point (on the locus)",answer:-1.268,tol:0.005},{prompt:"Gain at breakaway",answer:10.39,tol:0.05}],worked:"3s² + 18s + 18 = 0 → −3 ± √3; keep −1.268; K = 1.268 × 1.732 × 4.732."},
          {type:"multistep",q:"L(s) = K/(s(s+3)(s+6)): the limit of stability.",steps:[{prompt:"Critical gain",answer:162,tol:0.5},{prompt:"Crossing frequency (rad/s)",answer:4.243,tol:0.005}],worked:"s³ + 9s² + 18s + K: ω = √18, K = 9 × 18."},
          {type:"numeric",q:"G = 1/(s(s+2)(s+4)). Gain at which the locus crosses the jω axis?",answer:48,tol:0.5,worked:"ω = √8, K = 6ω² = 48."},
          {type:"numeric",q:"G = 1/(s(s+2)(s+4)). Breakaway point?",answer:-0.845,tol:0.005,worked:"3s² + 12s + 8 = 0, keep the root in [−2, 0]."}
        ]}
      }
    ]
  },

  /* ===================================================================
     C9 · FREQUENCY RESPONSE                         (201 brief 2.5, 2.6)
     =================================================================== */
  {
    id:"c9", part:"201", title:"201 · C9 · Frequency response",
    stages:[
      { stage:3, title:"C9 · L3 · Bode, Nyquist and margins",
        blocks:[
          {type:"prose",text:"Feed a stable system a sine wave and, once settled, out comes a sine of the same frequency, scaled and shifted. The Bode plot shows that scaling (magnitude in dB) and shift (phase) against log frequency. Because logs turn products into sums, you can sketch it factor by factor with straight lines."},
          {type:"diagram",id:"bodeasym",caption:"Each pole bends the magnitude slope down by 20 dB per decade."},
          {type:"prose",text:"Margins measure how far the loop is from the critical point −1. Gain margin: how much extra gain you can add before instability, read where the phase is −180°. Phase margin: how much extra lag you can add, read where the magnitude is 0 dB."},
          {type:"predict",q:"Raise the gain K. Which moves on the Bode plot: magnitude, phase, or both? What happens to the margins?",a:"Only the magnitude curve moves (up). Phase is unchanged. The 0 dB crossing moves right where the phase is worse, so both margins shrink; at K = 6 the gain margin hits zero."},
          {type:"sim",sim:"bode"},
          {type:"prose",text:"Guided task: find the K that gives a 45° phase margin. Then switch to Nyquist and watch the curve approach −1 as K rises. Reflect: which plot is easier for which question? Students who only memorise sketching rules struggle to link them to closed-loop stability (pedagogy brief, Mitchell 2012)."},
          {type:"quickcheck",q:"Gain margin is measured at…",options:["the gain crossover frequency","the phase crossover frequency (−180°)","the bandwidth","the corner frequency"],answer:1,explain:"Swapping the two crossovers is the classic slip."},
          {type:"recall",q:"Define phase margin.",a:"180° plus the loop phase at the gain crossover frequency (where |L| = 1)."},
          {type:"video",title:"Intro to Control 15.3 · Bode Plot Stability",url:YT("JNt8pgDigzs")},
          {type:"video",title:"Intro to Control 16.1 · Nyquist Criterion Introduction",url:YT("xST-_r0Mo-U")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"mcq",q:"A real pole contributes, above its corner…",options:["+20 dB/dec","−20 dB/dec, and −45° phase at the corner","−40 dB/dec","−90° at the corner"],answer:1,explain:"Standard asymptote."},
          {type:"mcq",q:"Gain margin is measured at…",options:["gain crossover","phase crossover (−180°)","bandwidth","corner frequency"],answer:1,explain:"Phase margin is at gain crossover."},
          {type:"mcq",q:"Raising K on a Bode plot…",options:["shifts phase down","shifts magnitude up, phase unchanged","shifts both","changes the corner frequencies"],answer:1,explain:"K is a constant factor: flat in dB, 0° phase."},
          {type:"mcq",q:"Resonant peaking in a second-order magnitude response occurs when…",options:["ζ > 1","ζ < 0.707","ζ = 1","always"],answer:1,explain:"Below 0.707."},
          {type:"mcq",q:"In Z = N + P, a stable closed loop requires…",options:["N = P","Z = P","Z = 0","N = 0 always"],answer:2,explain:"Z counts closed-loop RHP poles."}
        ]}
      },
      { stage:2, title:"C9 · L2 · Asymptotes, peaking and the Nyquist criterion",
        blocks:[
          {type:"prose",text:R`Asymptotes (each factor normalised to unit DC gain): constant $K$: flat at $20\log_{10}K$. Integrator $1/s$: −20 dB/dec through 0 dB at 1 rad/s, −90°. Real pole: flat to $\omega_c$ then −20 dB/dec; phase −45° at $\omega_c$ (true magnitude is 3 dB below the asymptote there). Second order: flat to $\omega_n$ then −40 dB/dec; phase passes −90° at $\omega_n$.`},
          {type:"formula",tex:R`\omega_r=\omega_n\sqrt{1-2\zeta^2},\qquad M_r=\frac{1}{2\zeta\sqrt{1-\zeta^2}}\qquad(\zeta<0.707)`,caption:"Resonant frequency and peak: the peak is below ωn"},
          {type:"formula",tex:R`PM=180^\circ+\angle L(j\omega_{gc}),\qquad GM=\frac{1}{|L(j\omega_{180})|}\ \ (\text{or } -20\log_{10}|L(j\omega_{180})|\ \text{dB})`,caption:"Margins"},
          {type:"formula",tex:R`Z=N+P`,caption:"Nyquist: Z closed-loop RHP poles, N clockwise encirclements of −1, P open-loop RHP poles"},
          {type:"prose",text:R`Rules of thumb (from course notes; treat as guides): $\zeta\approx PM/100$ for $PM\lesssim60^\circ$; aim for PM 30° to 60° and GM 2 to 5 (6 to 14 dB). Positive margins guarantee stability only for open-loop stable loops; otherwise count encirclements.`},
          {type:"recall",q:"Where is the resonant peak: at ωn, above it, or below it?",a:"Below it: ωr = ωn√(1 − 2ζ²)."},
          {type:"video",title:"Intro to Control 15.1 · Bode Plot Approximations",url:YT("5NULqxQfPk8")},
          {type:"video",title:"Intro to Control 16.4 · Nyquist Stability Criterion",url:YT("32RbwQddfQQ")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"multistep",q:"A second-order factor has ζ = 0.1.",steps:[{prompt:"Mr (absolute)",answer:5.03,tol:0.05},{prompt:"Mr (dB)",answer:14,tol:0.1}],worked:"1/(0.2√0.99) = 5.03; 20 log 5.03 = 14.0 dB."},
          {type:"multistep",q:"|L(jω180)| = 0.2.",steps:[{prompt:"GM (absolute)",answer:5,tol:0.01},{prompt:"GM (dB)",answer:13.98,tol:0.05}],worked:"1/0.2; 20 log 5."},
          {type:"numeric",q:"ζ = 0.2, ωn = 10 rad/s. Resonant frequency ωr?",answer:9.59,tol:0.02,unit:"rad/s",worked:"10√(1 − 0.08) = 10√0.92."},
          {type:"mcq",q:"The rule ζ ≈ PM/100 holds for…",options:["any PM","PM up to about 60°","PM above 60° only","GM, not PM"],answer:1,explain:"Do not stretch it beyond 60°."}
        ]}
      },
      { stage:1, title:"C9 · L1 · Margins from the equations",
        blocks:[
          {type:"example",label:"Margins",text:R`$L(s)=\frac{1}{s(s+1)(s+2)}$, $P=0$. $L(j\omega)=\frac{1}{-3\omega^2+j\omega(2-\omega^2)}$: phase −180° when $\omega^2=2$, $\omega_{180}=1.414$. There $|L|=1/6$, so $GM=6$ (15.56 dB). Gain crossover: $\omega\sqrt{\omega^2+1}\sqrt{\omega^2+4}=1\Rightarrow\omega_{gc}\approx0.445$. Phase $-90-24.0-12.5=-126.6^\circ$, $PM\approx53.4^\circ$. Nyquist crosses the real axis at −1/6, no encirclement of −1: stable.`},
          {type:"example",label:"Bode sketch",text:R`$G(s)=\frac{100(s+2)}{s(s^2+4s+100)}=\frac{2(1+s/2)}{s(1+0.04s+s^2/100)}$. $\omega_n=10$, $\zeta=0.2$. −20 dB/dec at low frequency (6.02 dB at 1 rad/s); the zero at 2 rad/s flattens it at 0 dB; at 10 rad/s it drops to −40 dB/dec. Peak $\omega_r=9.59$ rad/s, $M_r=2.55$ (8.14 dB).`},
          {type:"example",label:"PM and damping",text:R`$L=\frac{20}{s(s+4)}$: $\omega^4+16\omega^2-400=0$, $\omega_{gc}=3.68$, phase −132.6°, PM = 47.4°. Closed loop $s^2+4s+20$: $\zeta=0.447$, close to $PM/100=0.47$; exact overshoot 20.8 per cent.`}
        ],
        test:{ numQuestions:3, pool:[
          {type:"multistep",q:"L(s) = 1/(s(s+1)(s+2)).",steps:[{prompt:"Phase crossover ω180 (rad/s)",answer:1.414,tol:0.005},{prompt:"Gain margin (dB)",answer:15.56,tol:0.05}],worked:"ω² = 2; |L| = 1/6; 20 log 6."},
          {type:"numeric",q:"L(s) = 1/(s(s+1)(s+2)). Phase margin (degrees)?",answer:53.4,tol:0.5,unit:"°",worked:"ωgc ≈ 0.445; phase −126.6°."},
          {type:"multistep",q:"L(s) = 20/(s(s+4)).",steps:[{prompt:"ωgc (rad/s)",answer:3.68,tol:0.02},{prompt:"PM (°)",answer:47.4,tol:0.3}],worked:"ω⁴ + 16ω² − 400 = 0 → ω² = 13.54; phase −90 − arctan(0.92) = −132.6°."},
          {type:"numeric",q:"G = 100(s+2)/(s(s² + 4s + 100)). Resonant peak Mr in dB?",answer:8.14,tol:0.05,unit:"dB",worked:"Mr = 1/(0.4 × 0.9798) = 2.55."}
        ]}
      }
    ]
  },

  /* ===================================================================
     C10 · PID TUNING AND COMPENSATION                (201 brief 2.7, 2.8)
     =================================================================== */
  {
    id:"c10", part:"201", title:"201 · C10 · Tuning and compensation",
    stages:[
      { stage:3, title:"C10 · L3 · Real controllers",
        blocks:[
          {type:"heading",text:"Ziegler-Nichols: a starting point from one experiment"},
          {type:"prose",text:"Turn off I and D. Raise Kp until the output oscillates steadily: that gain is the ultimate gain Ku and the oscillation period is Tu. A table then gives PID settings. Ziegler-Nichols aims for quarter-amplitude decay, so it overshoots a lot and is not very robust: treat it as a starting point, not the answer."},
          {type:"predict",q:"Will a Ziegler-Nichols PID be gentle or aggressive?",a:"Aggressive: designed for quarter-amplitude decay, so expect large overshoot that you then refine by hand."},
          {type:"sim",sim:"zn"},
          {type:"heading",text:"Three things every real PID needs"},
          {type:"prose",text:"Anti-windup: when the actuator saturates, the loop is effectively broken and the integrator keeps growing. When it finally recovers, the stored integral causes a big overshoot. Windup happens in normal operation, not only with faulty actuators."},
          {type:"sim",sim:"windup"},
          {type:"prose",text:"Derivative on measurement, and a derivative filter: differentiating the error turns a setpoint step into a spike (derivative kick), and differentiating noisy measurements amplifies the noise. Bigger Kd does not always mean more damping."},
          {type:"sim",sim:"dnoise"},
          {type:"heading",text:"Lead and lag compensators"},
          {type:"prose",text:"A lead compensator adds phase near crossover, improving damping and speed (but it raises high-frequency gain, so noise too). A lag compensator raises low-frequency gain to cut steady-state error while leaving crossover phase almost untouched. Lag adds negative phase, not positive: it works by lowering gain at crossover."},
          {type:"sim",sim:"lead"},
          {type:"prose",text:"Reflect: what did you pay for the extra phase margin? (High-frequency gain: noise reaches the actuator more.)"},
          {type:"recall",q:"What is integrator windup?",a:"The integral state keeps growing while the actuator is saturated, causing large overshoot and slow recovery."},
          {type:"video",title:"Intro to Control 11.3 · PID Control Example",url:YT("FSAfFw_dqgA"),note:"The playlist does not cover Ziegler-Nichols, windup, filtering or lead/lag; those rest on Åström and Murray, CTMS and lecture notes."}
        ],
        test:{ numQuestions:5, pool:[
          {type:"mcq",q:"In Ziegler-Nichols closed-loop tuning you…",options:["apply a step and read the dead time","raise Kp with I and D off until sustained oscillation","set Ti = Td","tune only the derivative"],answer:1,explain:"Record Ku and Tu."},
          {type:"mcq",q:"Integrator windup is…",options:["the integrator running too slowly","the integral state growing while the actuator is saturated","noise on the derivative","a sensor offset"],answer:1,explain:"Happens in normal use whenever the actuator saturates."},
          {type:"mcq",q:"Derivative kick after a setpoint step is removed by…",options:["raising Kd","differentiating the measurement instead of the error","removing the integrator","lowering Kp only"],answer:1,explain:"Derivative on measurement."},
          {type:"mcq",q:"A lag compensator is mainly used to…",options:["add phase lead","raise low-frequency gain to cut steady-state error with little change near crossover","increase bandwidth","cancel a pole at the origin"],answer:1,explain:"It adds negative phase, kept small by placing corners well below crossover."},
          {type:"mcq",q:"Ziegler-Nichols settings are…",options:["final tuned values","a starting point: aggressive, low robustness","always overdamped","only for PI"],answer:1,explain:"Quarter-amplitude decay design."},
          {type:"mcq",q:"The price of a lead compensator is…",options:["lower phase margin","higher high-frequency gain (noise)","steady-state error","a slower response"],answer:1,explain:"HF gain rises by a = p/z."}
        ]}
      },
      { stage:2, title:"C10 · L2 · Tuning tables and compensator formulae",
        blocks:[
          {type:"formula",tex:R`C(s)=K_p\left(1+\frac{1}{T_is}+T_ds\right),\qquad K_i=\frac{K_p}{T_i},\quad K_d=K_pT_d`,caption:"Standard (ideal) PID form"},
          {type:"prose",text:R`Ziegler-Nichols closed loop (ultimate gain $K_u$, period $T_u$):
P: $K_p=0.5K_u$.
PI: $K_p=0.45K_u$, $T_i=T_u/1.2$.
PID: $K_p=0.6K_u$, $T_i=0.5T_u$, $T_d=0.125T_u$.

Ziegler-Nichols open loop (reaction curve; plant gain $K_0$, time constant $T$, dead time $L$, $a=K_0L/T$):
P: $1/a$. PI: $0.9/a$, $T_i=3L$. PID: $1.2/a$, $T_i=2L$, $T_d=0.5L$.`},
          {type:"formula",tex:R`D(s)=\frac{K_ds}{1+sT_f},\quad T_f=\frac{T_d}{N}\qquad \dot I=K_ie+\frac{1}{T_t}(u-v)`,caption:"Filtered derivative (N typically 5 to 20); back-calculation anti-windup (rule of thumb Tt ≈ √(Ti Td) for PID)"},
          {type:"formula",tex:R`C_{lead}(s)=\frac{1+s/z}{1+s/p},\ p>z,\ a=\frac pz,\qquad \sin\phi_m=\frac{a-1}{a+1},\quad \omega_m=\sqrt{zp}`,caption:"Lead: maximum phase φm at ωm; gain √a there, a at high frequency"},
          {type:"recall",q:"ZN closed-loop PID settings?",a:"Kp = 0.6Ku, Ti = 0.5Tu, Td = 0.125Tu."}
        ],
        test:{ numQuestions:4, pool:[
          {type:"multistep",q:"ZN closed loop: Ku = 12, Tu = 2 s. PID settings:",steps:[{prompt:"Kp",answer:7.2,tol:0.01},{prompt:"Ti (s)",answer:1,tol:0.01},{prompt:"Td (s)",answer:0.25,tol:0.01},{prompt:"Ki",answer:7.2,tol:0.01},{prompt:"Kd",answer:1.8,tol:0.01}],worked:"0.6 × 12; 0.5 × 2; 0.125 × 2; Kp/Ti; Kp Td."},
          {type:"multistep",q:"ZN open loop: K0 = 2, T = 10 s, L = 1.5 s. PID settings:",steps:[{prompt:"Kp",answer:4,tol:0.01},{prompt:"Ti (s)",answer:3,tol:0.01},{prompt:"Td (s)",answer:0.75,tol:0.01}],worked:"1.2T/(K0L) = 12/3; 2L; 0.5L."},
          {type:"multistep",q:"A lead compensator must add 40° at its centre frequency.",steps:[{prompt:"a = p/z",answer:4.6,tol:0.02},{prompt:"Gain at ωm (dB)",answer:6.63,tol:0.05},{prompt:"High-frequency gain (dB)",answer:13.25,tol:0.05}],worked:"(1 + sin40°)/(1 − sin40°) = 4.60; 10 log a; 20 log a."},
          {type:"multistep",q:"PID Kp = 3, Ti = 4 s, Td = 1 s, filter N = 10.",steps:[{prompt:"Tt for back-calculation (s)",answer:2,tol:0.01},{prompt:"Tf (s)",answer:0.1,tol:0.001},{prompt:"HF gain of derivative path",answer:30,tol:0.1}],worked:"√(Ti Td) = 2; Td/N; Kp N."}
        ]}
      },
      { stage:1, title:"C10 · L1 · Designing a tune and a compensator",
        blocks:[
          {type:"example",label:"Ziegler-Nichols",text:R`$P(s)=\frac{1}{(s+1)^3}$. Characteristic $s^3+3s^2+3s+(1+K_p)$. At $s=j\omega$: $3\omega-\omega^3=0\Rightarrow\omega_u=\sqrt3=1.732$; $1+K_u-3\omega^2=0\Rightarrow K_u=8$. $T_u=2\pi/\sqrt3=3.628$ s. PID: $K_p=4.8$, $T_i=1.814$ s ($K_i=2.65$), $T_d=0.4535$ s ($K_d=2.18$). These are the numbers in the Z-N simulation.`},
          {type:"example",label:"Lead design",text:R`$G(s)=\frac{10}{s(s+2)}$, want $PM\ge50^\circ$. Uncompensated: $\omega_{c0}=2.863$, $PM=34.9^\circ$. Need $\phi_m=50-34.9+10$ (safety) $=25.1^\circ$, $a=2.46$. New crossover where $|G|=1/\sqrt a=0.637$: $\omega_{gc}=3.719$. $z=\omega_{gc}/\sqrt a=2.37$, $p=\omega_{gc}\sqrt a=5.84$. $C(s)=\frac{1+s/2.369}{1+s/5.839}$; check gives $PM\approx53.3^\circ$.`},
          {type:"example",label:"Lag design",text:R`$G(s)=\frac{10}{s(s+1)(s+5)}$ with gain $K$; want $K_v=10$, $PM\ge45^\circ$. $K_v=2K\Rightarrow K=5$. Crossover where the plant phase is about −130°: $\omega\approx0.65$. Magnitude there 12.79, so $\beta=12.79$; zero at 0.065, pole at 0.00508 rad/s. Controller $5\cdot\frac{1+s/0.065}{1+s/0.00508}$.`}
        ],
        test:{ numQuestions:3, pool:[
          {type:"multistep",q:"P(s) = 1/(s+1)³, ZN closed loop.",steps:[{prompt:"Ku",answer:8,tol:0.01},{prompt:"Tu (s)",answer:3.63,tol:0.01},{prompt:"PID Kp",answer:4.8,tol:0.01},{prompt:"PID Ti (s)",answer:1.814,tol:0.005}],worked:"ω = √3; Ku = 3ω² − 1 = 8; Tu = 2π/√3; 0.6Ku; 0.5Tu."},
          {type:"multistep",q:"Lead for G = 10/(s(s+2)), PM ≥ 50°, 10° safety.",steps:[{prompt:"Uncompensated PM (°)",answer:34.9,tol:0.2},{prompt:"a",answer:2.46,tol:0.02},{prompt:"zero z (rad/s)",answer:2.37,tol:0.02},{prompt:"pole p (rad/s)",answer:5.84,tol:0.03}],worked:"ωc0 = 2.863; φm = 25.1°; ωgc = 3.719; z = ωgc/√a, p = ωgc√a."},
          {type:"numeric",q:"Lag for G = 10/(s(s+1)(s+5)), Kv = 10. Gain K?",answer:5,tol:0.01,worked:"Kv = 10K/5 = 2K."}
        ]}
      }
    ]
  },

  /* ===================================================================
     C11 · STATE SPACE, DIGITAL CONTROL, LINEARISATION  (201 brief 2.9 to 2.11)
     =================================================================== */
  {
    id:"c11", part:"201", title:"201 · C11 · State space, digital, linearisation",
    stages:[
      { stage:3, title:"C11 · L3 · Three wider views",
        blocks:[
          {type:"heading",text:"State space"},
          {type:"prose",text:"State space writes an nth-order differential equation as n first-order ones, one per state (for a mass-spring: position and velocity). It is the same system, just another description, and the choice of states is not unique. The eigenvalues of the A matrix are the poles."},
          {type:"predict",q:"Set damping c negative in the phase portrait. Spiral in, spiral out, or a closed loop?",a:"Spiral out: the eigenvalues have positive real part. With c = 0 the trajectories are closed loops (marginal); negative stiffness k gives a saddle: an unstable equilibrium you can balance on in theory but never in practice."},
          {type:"sim",sim:"phase"},
          {type:"heading",text:"Digital control"},
          {type:"prose",text:"A digital controller sees the plant only at sample instants and holds each output constant until the next (the zero-order hold). Sampling too slowly loses information (aliasing), and the hold behaves like a delay of about half a sample, which eats phase margin."},
          {type:"predict",q:"Sample a 1.5 rad/s sine with Ts = 1.5 s. Will the held signal look like the original?",a:"No. The Nyquist frequency π/Ts ≈ 2.1 rad/s is only just above 1.5, so the staircase is crude and badly delayed. Push the frequency above Nyquist and it aliases to a different, slower wave."},
          {type:"sim",sim:"sampling"},
          {type:"heading",text:"Linearisation"},
          {type:"prose",text:"Most real plants are nonlinear, but everything in this course needs linear models. Pick an equilibrium, describe small deviations from it, and keep only the first-order Taylor term. The model is valid only near that point and describes deviations, not absolute values."},
          {type:"recall",q:"What are the poles of a state-space model?",a:"The eigenvalues of A (roots of det(sI − A) = 0)."},
          {type:"video",title:"Intro to Control 6.1 · State-Space Model Basics",url:YT("g9G8b7FxEHc")},
          {type:"video",title:"Intro to Control 5.3 · Understanding Linearization",url:YT("0SGnWCroLxs")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"mcq",q:"The poles of ẋ = Ax + Bu are…",options:["the entries of B","the eigenvalues of A","the zeros of C","always real"],answer:1,explain:"det(sI − A) = 0."},
          {type:"mcq",q:"In the z-plane the stability boundary is…",options:["the imaginary axis","the unit circle","the real axis","z = 0"],answer:1,explain:"All poles need |z| < 1."},
          {type:"mcq",q:"Controllability means…",options:["the system is stable","you can move the poles anywhere with state feedback","the output is measurable","A is diagonal"],answer:1,explain:"It is about being able to place poles, not about current stability."},
          {type:"mcq",q:"A linearised model is valid…",options:["everywhere","near its operating (equilibrium) point","only for large signals","only at t = 0"],answer:1,explain:"It describes small deviations."},
          {type:"mcq",q:"The zero-order hold behaves roughly like…",options:["a gain of 2","a delay of about half a sample","an integrator","a lead compensator"],answer:1,explain:"Phase lag ≈ ωT/2."}
        ]}
      },
      { stage:2, title:"C11 · L2 · The formulae",
        blocks:[
          {type:"formula",tex:R`\dot x=Ax+Bu,\quad y=Cx+Du,\qquad G(s)=C(sI-A)^{-1}B+D`,caption:"State space and its transfer function"},
          {type:"formula",tex:R`\mathcal C=[B\;\;AB\;\;\dots\;\;A^{n-1}B],\quad \text{controllable}\iff\operatorname{rank}\mathcal C=n`,caption:"Controllability matrix"},
          {type:"prose",text:R`Controllable canonical form for $\frac{b_1s+b_0}{s^2+a_1s+a_0}$: $A=\begin{bmatrix}0&1\\-a_0&-a_1\end{bmatrix}$, $B=\begin{bmatrix}0\\1\end{bmatrix}$, $C=[b_0\;\;b_1]$, $D=0$ (textbooks differ on this convention).`},
          {type:"formula",tex:R`z=e^{sT},\qquad \frac{a}{s+a}\xrightarrow{\text{ZOH}}\frac{1-e^{-aT}}{z-e^{-aT}},\qquad s\approx\frac2T\frac{z-1}{z+1}\ \text{(Tustin)}`,caption:"Pole mapping, ZOH equivalent, Tustin"},
          {type:"prose",text:R`Sampling theorem: $\omega_s\ge2\omega_{max}$; frequencies above $\omega_s/2$ alias. Rule of thumb for control (course notes): sample period $T$ between $\frac{1}{30\,BW}$ and $\frac{1}{10\,BW}$, with BW the closed-loop bandwidth in rad/s.`},
          {type:"formula",tex:R`A=\frac{\partial f}{\partial x}\Big|_{x_e,u_e},\quad B=\frac{\partial f}{\partial u}\Big|_{x_e,u_e},\qquad \Delta\dot x=A\Delta x+B\Delta u`,caption:"Linearisation about an equilibrium"},
          {type:"recall",q:"ZOH equivalent of a/(s+a)?",a:"(1 − e^(−aT)) / (z − e^(−aT))."},
          {type:"video",title:"Intro to Control 6.3 · State-Space Model to Transfer Function",url:YT("CwB8FzXWvgY")},
          {type:"video",title:"Intro to Control 8.2 · State-Space Eigenvalues and Stability",url:YT("x-gVDJr3118")}
        ],
        test:{ numQuestions:4, pool:[
          {type:"mcq",q:"Under ZOH sampling, a pole at s = −a maps to…",options:["z = 1 − aT","z = e^(−aT)","z = 1/(1 + aT)","z = −aT"],answer:1,explain:"Forward Euler gives 1 − aT, backward Euler 1/(1 + aT)."},
          {type:"numeric",q:"A continuous pole at s = −4 is sampled with T = 0.05 s. z-plane pole?",answer:0.8187,tol:0.0005,worked:"e^(−0.2)."},
          {type:"numeric",q:"A 70 Hz sine is sampled at 100 Hz. Apparent frequency?",answer:30,tol:0.1,unit:"Hz",worked:"Aliased about the 50 Hz Nyquist frequency: |70 − 100|."},
          {type:"multistep",q:"ZOH discretisation of 2/(s+2) at T = 0.25 s gives b/(z − c).",steps:[{prompt:"b",answer:0.3935,tol:0.0005},{prompt:"c",answer:0.6065,tol:0.0005}],worked:"aT = 0.5: 1 − e^(−0.5), e^(−0.5)."},
          {type:"mcq",q:"Tustin's method…",options:["has no frequency distortion","warps frequency, so prewarp at the frequency that matters","can map stable poles outside the unit circle","is the same as ZOH"],answer:1,explain:"ωa = (2/T) tan(ωd T/2)."}
        ]}
      },
      { stage:1, title:"C11 · L1 · Working the numbers",
        blocks:[
          {type:"example",label:"State space",text:R`$G(s)=\frac{3s+5}{s^2+4s+3}$: $A=\begin{bmatrix}0&1\\-3&-4\end{bmatrix}$, $B=\begin{bmatrix}0\\1\end{bmatrix}$, $C=[5\;\;3]$. $\det(sI-A)=s^2+4s+3$: eigenvalues −1, −3, equal to the poles. $AB=[1,-4]^T$, $\mathcal C=\begin{bmatrix}0&1\\1&-4\end{bmatrix}$, $\det=-1\ne0$: controllable.`},
          {type:"example",label:"Uncontrollable",text:R`$A=\begin{bmatrix}1&0\\0&2\end{bmatrix}$, $B=\begin{bmatrix}1\\0\end{bmatrix}$: $\mathcal C=\begin{bmatrix}1&1\\0&0\end{bmatrix}$, rank 1. The second state ($\lambda=2$, unstable) is untouched by the input, so no feedback can fix it.`},
          {type:"example",label:"ZOH",text:R`$G(s)=\frac{5}{s+5}$, $T=0.1$ s: $G(z)=\frac{0.3935}{z-0.6065}$, i.e. $y_{k+1}=0.6065y_k+0.3935u_k$. Step: $y_1=0.3935$, $y_2=0.6321=1-e^{-1}$, exactly the continuous response at $t=0.2$ s. Final value $0.3935/(1-0.6065)=1$.`},
          {type:"example",label:"Pendulum",text:R`$\ddot\theta=-\frac gl\sin\theta$ about $\theta=0$: $\sin\theta\approx\theta$, so $\omega_n=\sqrt{g/l}$. With $l=0.5$ m: $\omega_n=4.43$ rad/s, period 1.42 s. About $\theta=\pi$ the linearisation is $\Delta\ddot\theta=+\frac gl\Delta\theta$: unstable (the inverted pendulum).`}
        ],
        test:{ numQuestions:4, pool:[
          {type:"multistep",q:"G(s) = 2/(s² + 3s + 2) in controllable canonical form.",steps:[{prompt:"A[2,1] (bottom-left)",answer:-2,tol:0},{prompt:"A[2,2] (bottom-right)",answer:-3,tol:0},{prompt:"det of controllability matrix",answer:-1,tol:0}],worked:"A = [[0,1],[−2,−3]]; AB = [1, −3]ᵀ; C = [[0,1],[1,−3]], det −1."},
          {type:"numeric",q:"A = [[1,0],[0,2]], B = [1,0]ᵀ. Rank of the controllability matrix?",answer:1,tol:0,worked:"[[1,1],[0,0]]: not controllable."},
          {type:"multistep",q:"G = 5/(s+5), ZOH, T = 0.1 s, unit step.",steps:[{prompt:"y1",answer:0.3935,tol:0.0005},{prompt:"y2",answer:0.6321,tol:0.0005},{prompt:"final value",answer:1,tol:0.001}],worked:"y(k+1) = 0.6065 y(k) + 0.3935."},
          {type:"multistep",q:"Pendulum, l = 0.5 m, g = 9.81 m/s², linearised about θ = 0.",steps:[{prompt:"ωn (rad/s)",answer:4.43,tol:0.01},{prompt:"Period (s)",answer:1.42,tol:0.01}],worked:"√19.62; 2π/4.43."},
          {type:"multistep",q:"Closed-loop bandwidth 20 rad/s. Sample-period range by the rule 1/(30 BW) to 1/(10 BW):",steps:[{prompt:"Shortest (ms)",answer:1.67,tol:0.01},{prompt:"Longest (ms)",answer:5,tol:0.01}],worked:"1/600 s and 1/200 s."}
        ]}
      }
    ]
  },

  /* ===================================================================
     SIMULATION LAB (free, never locked)
     =================================================================== */
  {
    id:"lab", free:true, title:"Simulation Lab (always open)",
    stages:[
      { stage:3, title:"Lab · every simulation",
        blocks:[
          {type:"prose",text:"Every interactive simulation and diagram in the course, unlocked, for free play and revision. The 201 simulations here are taught properly in the 201 modules."},
          {type:"video",title:"Tutor-recommended playlist (YouTube)",url:"https://www.youtube.com/playlist?list=PLmK1EnKxphikZ4mmCz2NccSnHZb7v1wV-",note:"Opens online. The app itself works offline."},
          {type:"heading",text:"Build it yourself"},
          {type:"sim",sim:"blocks"},
          {type:"heading",text:"101"},
          {type:"sim",sim:"cruise"},
          {type:"sim",sim:"firstorder"},
          {type:"sim",sim:"secondorder"},
          {type:"sim",sim:"polezero"},
          {type:"sim",sim:"pid"},
          {type:"sim",sim:"pidgame"},
          {type:"heading",text:"201"},
          {type:"sim",sim:"sserror"},
          {type:"sim",sim:"routh"},
          {type:"sim",sim:"rootlocus"},
          {type:"diagram",id:"bodeasym",caption:"Bode magnitude asymptotes."},
          {type:"sim",sim:"bode"},
          {type:"sim",sim:"zn"},
          {type:"sim",sim:"windup"},
          {type:"sim",sim:"dnoise"},
          {type:"sim",sim:"lead"},
          {type:"sim",sim:"phase"},
          {type:"sim",sim:"sampling"}
        ]
      }
    ]
  }
  ]
};
