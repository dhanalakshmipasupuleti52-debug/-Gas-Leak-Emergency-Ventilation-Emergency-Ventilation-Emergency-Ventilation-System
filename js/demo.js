/* demo mode */
const SEQ=[['NORMAL','NORMAL',5],['INCREASING','GAS LEAK DETECTED > WARNING > PID RESPONSE > FAN SPEED UP',9],['HIGH','DANGER > MAXIMUM VENTILATION',6],['CRITICAL','EMERGENCY ALARM > FDCAN ALERT',8],['NORMAL','GAS LEVEL DECREASES',14]];
let dT=[];
function demoRun(){dT.forEach(clearTimeout);dT=[];let t=0;$('demoSt').innerHTML=SEQ.map((s,i)=>`<span id="ds${i}">${s[1]}</span>`).join('')+'<span id="dsE">SYSTEM RETURNS TO NORMAL</span>';
  SEQ.forEach((s,i)=>{dT.push(setTimeout(()=>{setMode(s[0]);document.querySelectorAll('#demoSt span').forEach(x=>x.classList.remove('on'));$('ds'+i).classList.add('on')},t*1000));t+=s[2]});
  dT.push(setTimeout(()=>{document.querySelectorAll('#demoSt span').forEach(x=>x.classList.remove('on'));$('dsE').classList.add('on')},t*1000))}
$('demoBtn').onclick=()=>{document.body.classList.add('demo');show('dash');demoRun()};
$('demoRun').onclick=demoRun;$('demoExit').onclick=()=>{document.body.classList.remove('demo');dT.forEach(clearTimeout)};

