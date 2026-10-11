/* tests */
const TESTS=[
 ['Normal air condition','Fan stays at normal state, no alarm',()=>{setMode('NORMAL');run(80);return[st.lvl===0&&st.pwm<=40,`Gas ${st.gasM.toFixed(0)}%, PWM ${st.pwm.toFixed(0)}%, ${AL[st.lvl]}`]}],
 ['Low gas detection','Warning indication',()=>{setMode('LOW');run(80);return[st.lvl===1,`Gas ${st.gasM.toFixed(0)}%, ${AL[st.lvl]}`]}],
 ['Increasing gas level','Fan speed increases',()=>{setMode('NORMAL');run(60);const p0=st.pwm;setMode('INCREASING');run(35);return[st.pwm>p0+10,`PWM ${p0.toFixed(0)}% -> ${st.pwm.toFixed(0)}%`]}],
 ['High gas level','Maximum ventilation and alarm',()=>{setMode('CRITICAL');run(100);return[st.pwm>=S.maxPwm&&st.lvl===3&&!st.ack,`PWM ${st.pwm.toFixed(0)}%, ${AL[st.lvl]}, buzzer ${st.ack?'OFF':'ON'}`]}],
 ['Sensor disconnection','Fault detected, safe response (max ventilation)',()=>{setMode('FAULT');run(20);return[st.lvl===4&&st.pwm>=S.maxPwm,`${AL[st.lvl]}, PWM ${st.pwm.toFixed(0)}%`]}],
 ['FDCAN transmission','Correct status received by monitoring node',()=>{st.fdcan=true;setMode('CRITICAL');run(40);return[st.rxs.alarm===AL[st.lvl]&&Math.abs(st.rxs.gas-st.gasM)<10,`RX alarm ${st.rxs.alarm}, RX gas ${st.rxs.gas}%`]}]];
const TR=TESTS.map(()=>null);
function runTest(i){try{const[ok,txt]=TESTS[i][2]();TR[i]={ok,txt,t:now()}}catch(e){TR[i]={ok:false,txt:'Error: '+e.message,t:now()}}rt()}
function rt(){$('t_body').innerHTML=TESTS.map((t,i)=>{const r=TR[i];return`<tr><td>${i+1}</td><td>${t[0]}</td><td>${t[1]}</td><td>${r?r.txt:'--'}</td><td class="${r?r.ok?'pass':'fail':''}">${r?r.ok?'PASS':'FAIL':'NOT RUN'}</td><td>${r?r.t:'--'}</td><td><button class="btn" data-t="${i}">Run</button></td></tr>`}).join('')}
$('p_test').onclick=e=>{if(e.target.dataset.t)runTest(+e.target.dataset.t);if(e.target.id==='tAll'){TESTS.forEach((_,i)=>runTest(i));setMode('NORMAL');toast('All tests complete')}};

