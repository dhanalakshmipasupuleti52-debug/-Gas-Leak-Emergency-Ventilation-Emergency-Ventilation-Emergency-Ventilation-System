/* ---------- behaviour ---------- */
function show(p){document.querySelectorAll('.page').forEach(e=>e.classList.toggle('on',e.id==='p_'+p));document.querySelectorAll('aside button').forEach(b=>b.classList.toggle('on',b.dataset.p===p))}
const toast=m=>{const t=$('toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2500)};
document.querySelector('aside').onclick=e=>{if(e.target.dataset.p)show(e.target.dataset.p)};
$('scen').onclick=e=>{const m=e.target.dataset.m;if(m)setMode(m);if(e.target.id==='recon')setMode('NORMAL')};
$('sl').oninput=e=>{st.mode='MANUAL';st.sensor=true;st.target=+e.target.value};
$('ack').onclick=()=>{st.ack=true;toast('Alarm acknowledged (buzzer silenced)')};
$('cSim').onclick=()=>{if(!st.fdcan)return toast('Bus disconnected');send('MANUAL_TEST',0x1FF,'Test frame','AA')};
$('cClr').onclick=()=>{st.log=[];st.lv++};$('cDis').onclick=()=>{st.fdcan=false};$('cCon').onclick=()=>{st.fdcan=true};
$('p_flow').onclick=e=>{const b=e.target.closest('[data-f]');if(!b)return;document.querySelectorAll('.fb').forEach(x=>x.classList.remove('on'));b.classList.add('on');$('fx').textContent=FL[b.dataset.f][0]+': '+FL[b.dataset.f][1]};
function fillInputs(){document.querySelectorAll('[data-k]').forEach(i=>{if(document.activeElement!==i)i.value=S[i.dataset.k]})}
document.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.k;if(!k)return;const v=+e.target.value;
  if(!isFinite(v)||v<0){fillInputs();return toast('Invalid value')}
  const n={...S,[k]:v};if(!(n.warn<n.danger&&n.danger<n.crit)||n.ts<.05||n.maxPwm>100||n.maxPwm<1){fillInputs();return toast('Rejected: thresholds must rise (warn<danger<critical), Ts>=0.05, PWM 1-100')}
  S=n;saveS();st.integ=0;fillInputs();startTimer();toast('Saved')});
$('reset').onclick=()=>{S={...D};saveS();fillInputs();startTimer();toast('Defaults restored')};
const fh=()=>st.hist.filter(h=>(!$('h_f').value||h.alarm===$('h_f').value)&&Object.values(h).join(' ').toLowerCase().includes($('h_q').value.toLowerCase()));
const hrow=h=>`<tr><td>${h.ts}</td><td>${h.ev}</td><td>${h.gas}%</td><td>${h.pwm}%</td><td style="color:${COL[AL.indexOf(h.alarm)]}">${h.alarm}</td><td>${h.status}</td></tr>`;
const rh=()=>{$('h_body').innerHTML=fh().map(hrow).join('')||'<tr><td colspan="6" class="s">No events</td></tr>'};
$('h_q').oninput=$('h_f').onchange=rh;$('h_clr').onclick=()=>{st.hist=[];st.hv=-1};
$('h_csv').onclick=()=>{const t=[['Timestamp','Event','Gas','PWM','Alarm','Status'],...fh().map(h=>[h.ts,h.ev,h.gas,h.pwm,h.alarm,h.status])].map(r=>r.join(',')).join('\n');
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download='alarm_history.csv';a.click()}catch(e){}
  try{navigator.clipboard.writeText(t)}catch(e){}toast('CSV exported (also copied to clipboard)')};

