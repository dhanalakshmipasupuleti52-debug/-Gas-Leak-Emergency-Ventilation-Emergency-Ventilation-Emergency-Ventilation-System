/* ---------- DataProvider abstraction: swap Simulation for Hardware later ---------- */
class SimulationDataProvider{
  step(){
    const dt=S.ts,max=2**S.bits-1;
    // Gas dynamics: first-order lag toward target (smooth, no jumps) + small noise
    if(st.mode==='INCREASING')st.target=Math.min(100,st.target+1.2);
    if(st.mode==='RANDOM')st.target=Math.max(8,Math.min(100,st.target+(Math.random()-.42)*9));
    st.gas=Math.max(0,Math.min(100,st.gas+(st.target-st.gas)*.12+(Math.random()-.5)*.4));
    // MQ-2 analog output -> STM32 ADC: ADC = (Vin/Vref)*(2^N-1)
    st.v=st.sensor?Math.min(S.vref,st.gas/100*S.vref+(Math.random()-.5)*.01):0;
    st.adc=Math.max(0,Math.round(st.v/S.vref*max));st.lastT=now();
    st.gasM=st.sensor?st.adc/max*100:0;
    // PID: u = Kp*e + Ki*sum(e)*Ts + Kd*(e-e_prev)/Ts, error = gas - safe level
    st.e=st.gasM-S.safe;st.integ+=st.e*dt;
    if(S.ki>0)st.integ=Math.max(0,Math.min(100/S.ki,st.integ)); // anti-windup: Ki*integral kept inside 0..100
    st.P=S.kp*st.e;st.I=S.ki*st.integ;st.Dt=S.kd*(st.e-st.prevE)/dt;st.prevE=st.e;
    st.u=Math.max(0,Math.min(100,st.P+st.I+st.Dt));
    // Safety supervisor on top of PID
    const L=level(st.gasM);let pwm=st.u;
    if(!st.sensor)pwm=100;else if(L==3)pwm=100;else if(L==2)pwm=Math.max(pwm,85);else if(L==0)pwm=Math.max(pwm,10);
    st.pwm=Math.min(pwm,S.maxPwm);
    const nl=st.sensor?L:4;
    if(nl!==st.lvl)this.onLevel(nl);
    if(st.tick%4===0)this.tx();
    if(!st.fdcan&&st.tick%4===0)st.drop+=4;
    st.tick++;
    for(const[k,v]of[['gas',st.gasM],['pwm',st.pwm],['pid',st.u],['adc',st.adc]]){st.ser[k].push(v);if(st.ser[k].length>60)st.ser[k].shift()}
  }
  onLevel(nl){
    const old=st.lvl;st.lvl=nl;st.ack=false;
    st.hist.forEach(h=>{if(h.status==='ACTIVE')h.status='RESOLVED'});
    st.hist.unshift({ts:now(),ev:nl===0?'Returned to normal':nl===4?'Sensor disconnected':AL[nl]+' gas level',gas:Math.round(st.gasM),pwm:Math.round(st.pwm),alarm:AL[nl],status:nl===0?'RESOLVED':'ACTIVE'});
    if(nl>=3||nl===4)send(nl===4?'FAULT':'EMERGENCY',nl===4?2:1,nl===4?'SENSOR_FAULT':'EMERGENCY '+AL[nl],'FF');
    send('ALARM',0x102,AL[nl],'0'+nl);
  }
  tx(){send('GAS_LEVEL',0x100,Math.round(st.gasM)+'%',Math.round(st.gasM).toString(16).toUpperCase().padStart(2,'0'));
    send('FAN_PWM',0x101,Math.round(st.pwm)+'%',Math.round(st.pwm).toString(16).toUpperCase().padStart(2,'0'));
    send('ALARM',0x102,AL[st.lvl],'0'+st.lvl);send('SYSTEM',0x103,st.sensor?'NORMAL':'SENSOR_FAULT',st.sensor?'00':'FF')}
}
class HardwareDataProvider{step(){throw new Error('HardwareDataProvider is not implemented. Connect a WebSocket/API delivering {gasLevel, adcValue, fanPwm, pidOutput, alarmStatus, sensorStatus, fdcanStatus, timestamp}.')}}
const provider=new SimulationDataProvider();

function send(name,id,txt,hex){
  if(!st.fdcan)return;st.tx++;st.rx++;
  if(name==='GAS_LEVEL')st.rxs.gas=parseInt(hex,16);if(name==='ALARM')st.rxs.alarm=txt;
  st.log.unshift({t:now(),id:'0x'+id.toString(16).toUpperCase().padStart(3,'0'),name,txt,hex});if(st.log.length>200)st.log.pop();st.lv++;
}
function setMode(m){
  st.mode=m;st.sensor=m!=='FAULT';
  const t={NORMAL:5,LOW:38,HIGH:70,CRITICAL:94};if(m in t)st.target=t[m];
  if(m==='INCREASING'||m==='RANDOM')st.target=st.gas;
}
function run(n){for(let i=0;i<n;i++)provider.step()}

