/* rendering */
function chart(el){const d=st.ser[el.dataset.s],m=+el.dataset.m,c=el.dataset.c,mx=el.dataset.s==='adc'?2**S.bits-1:m;
  const pts=d.map((v,i)=>`${(i/59*300).toFixed(1)},${(88-Math.min(v,mx)/mx*84).toFixed(1)}`).join(' ');
  el.innerHTML=`<svg viewBox="0 0 300 90" preserveAspectRatio="none">${[22,45,67].map(y=>`<line x1="0" x2="300" y1="${y}" y2="${y}" stroke="#1e2d44" stroke-width="1" vector-effect="non-scaling-stroke"/>`).join('')}<polyline fill="none" stroke="${c}" stroke-width="2" vector-effect="non-scaling-stroke" points="${pts}"/></svg>`}
function update(){
  const L=st.lvl,col=COL[L],ok=st.sensor,max=2**S.bits-1,buz=(L>=2)&&!st.ack;
  T('hClk',new Date().toLocaleString('en-GB'));T('hSys',L===0?'SYSTEM NORMAL':'SYSTEM '+AL[L],col);
  T('d_gas',ok?st.gasM.toFixed(0)+'%':'--',col);T('d_lvl',AL[L],col);T('d_pwm',st.pwm.toFixed(0)+'%');T('d_pwms',fanLbl(st.pwm));
  T('d_pid',st.u.toFixed(0)+'%');T('d_alarm',AL[L],col);T('d_alarms',buz?'Buzzer ON':st.ack&&L>=2?'Acknowledged':'Buzzer off');
  T('d_can',st.fdcan?'CONNECTED':'DISCONNECTED',st.fdcan?'var(--gn)':'var(--rd)');T('d_cans','TX '+st.tx+' / RX '+st.rx);
  T('d_sens',ok?'CONNECTED':'DISCONNECTED',ok?'var(--gn)':'var(--rd)');T('d_senss','MQ-2 on ADC');T('d_mode','SIMULATION');T('d_modes','Scenario: '+st.mode);
  const b=$('d_ban');b.style.borderColor=col;b.style.background=`color-mix(in srgb, ${col} 12%, #0f1724)`;b.classList.toggle('pulse',L>=3);T('d_bt',L===4?'SENSOR FAULT':AL[L],col);
  T('d_bs',L===0?'No alarm':L===1?'Warning notification':L===2?'Buzzer + increased ventilation':L===3?'Emergency alarm, max fan, FDCAN emergency sent':'Safe state: max ventilation, fault sent on FDCAN');
  const rpm=Math.round(st.pwm*30);T('d_rpm',rpm+' RPM');T('d_fl',fanLbl(st.pwm)+' ventilation');
  T('g_gas',ok?st.gasM.toFixed(1)+'%':'--',col);T('g_v',st.v.toFixed(3)+' V');T('g_adc',st.adc);T('g_adcs','of '+max);T('g_st',ok?AL[L]:'SENSOR FAULT',col);
  T('g_res',S.bits+'-bit');T('g_fs','1 kHz');T('g_ref',S.vref+' V');T('g_ls',st.lastT);
  T('g_calc',`${st.v.toFixed(3)} / ${S.vref} x ${max} = ${st.adc}`);
  T('p_g',st.gasM.toFixed(1)+'%');T('p_t',S.safe+'%');T('p_e',st.e.toFixed(1));T('p_p',st.P.toFixed(1));T('p_i',st.I.toFixed(1));T('p_d',st.Dt.toFixed(1));T('p_u',st.u.toFixed(1)+'%');
  T('f_rpm',rpm);T('f_vs',fanLbl(st.pwm));T('f_pwm',st.pwm.toFixed(0)+'%');T('f_lv',fanLbl(st.pwm));T('f_md',st.pwm>0?'ENA PWM ACTIVE':'STANDBY');T('f_vent',L>=3||L===4?'EMERGENCY':L>=1?'ELEVATED':'NORMAL',col);
  T('f_calc',`${(st.pwm*10).toFixed(0)} us / 1000 us x 100 = ${st.pwm.toFixed(0)}%`);
  T('c_st',st.fdcan?'ACTIVE':'DISCONNECTED');T('c_tx',st.tx);T('c_rx',st.rx);T('c_dr',st.drop);const h=st.tx+st.drop?Math.round(st.tx/(st.tx+st.drop)*100):100;T('c_h',(st.fdcan?'':'LOST ')+h+'%',st.fdcan?'var(--gn)':'var(--rd)');
  const fv=[ok?st.v.toFixed(2)+' V':'no signal',st.adc+' counts',st.fdcan?'running':'running (bus down)',AL[L],st.u.toFixed(0)+'%',st.pwm.toFixed(0)+'% duty',st.pwm>0?'driving':'idle',rpm+' RPM',st.fdcan?'TX '+st.tx:'down',buz?'BUZZER ON':'idle'];fv.forEach((v,i)=>T('fv'+i,v));
  document.querySelectorAll('.ch').forEach(chart);
  document.querySelectorAll('[data-m]').forEach(x=>x.classList&&x.classList.contains('btn')&&x.classList.toggle('on',x.dataset.m===st.mode));
  const sl=$('sl');if(document.activeElement!==sl)sl.value=Math.round(st.target);T('slv',Math.round(st.target));
  if(st.hv!==st.hist.length){st.hv=st.hist.length;$('d_hist').innerHTML=st.hist.slice(0,5).map(x=>`<tr><td>${x.ts}</td><td>${x.ev}</td><td>${x.gas}%</td><td>${x.pwm}%</td><td style="color:${COL[AL.indexOf(x.alarm)]}">${x.alarm}</td></tr>`).join('')||'<tr><td colspan="5" class="s">No events yet</td></tr>';rh()}
  if(st.lvShown!==st.lv){st.lvShown=st.lv;$('c_log').innerHTML=st.log.slice(0,25).map(l=>`<tr><td>${l.t}</td><td>TX &rarr;</td><td>0x01</td><td>${l.id}</td><td>${l.name}: ${l.txt}</td><td>${l.hex}</td></tr>`).join('')||'<tr><td colspan="6" class="s">No frames</td></tr>'}
}
/* Buzzer sound (Web Audio): beeps every 0.7 s while CRITICAL / SENSOR FAULT, until acknowledged or muted */
let actx=null,sndOn=true;
const ctxGet=()=>{actx=actx||new(window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();return actx};
function beep(){try{const a=ctxGet(),o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=1000;g.gain.setValueAtTime(.08,a.currentTime);g.gain.setValueAtTime(0,a.currentTime+.25);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.25)}catch(e){}}
document.addEventListener('pointerdown',()=>{try{ctxGet()}catch(e){}},{once:true});
$('snd').onclick=e=>{sndOn=!sndOn;e.target.textContent='🔊 Sound: '+(sndOn?'ON':'OFF');e.target.classList.toggle('on',sndOn);if(sndOn)beep()};
setInterval(()=>{if(sndOn&&st.lvl>=3&&!st.ack)beep()},700);
let lastF=performance.now();
(function spin(t){const dt=(t-lastF)/1000;lastF=t;st.ang=(st.ang+st.pwm*30*dt*.36)%360;document.querySelectorAll('.bl').forEach(g=>g.setAttribute('transform','rotate('+st.ang.toFixed(1)+')'));requestAnimationFrame(spin)})(lastF);
let timer;function startTimer(){clearInterval(timer);timer=setInterval(()=>{try{provider.step();update();$('err').textContent=''}catch(e){$('err').textContent=e.message}},Math.max(50,S.ts*1000))}
run(60);st.log=[];st.tx=st.rx=0;st.hist=[];st.hv=-1;st.lvShown=-1;fillInputs();rt();show('dash');update();startTimer();
