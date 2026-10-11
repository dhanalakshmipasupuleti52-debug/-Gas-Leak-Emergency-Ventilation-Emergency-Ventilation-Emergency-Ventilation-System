const $=id=>document.getElementById(id),T=(id,v,c)=>{const e=$(id);if(e){e.textContent=v;if(c)e.style.color=c}},now=()=>new Date().toLocaleTimeString('en-GB');
const D={safe:20,warn:30,danger:60,crit:80,kp:2,ki:.4,kd:.5,ts:.25,bits:12,vref:3.3,maxPwm:100};
let S={...D};try{Object.assign(S,JSON.parse(localStorage.getItem('gvs')||'{}'))}catch(e){}
const saveS=()=>{try{localStorage.setItem('gvs',JSON.stringify(S))}catch(e){}};
const AL=['NORMAL','WARNING','DANGER','CRITICAL','SENSOR FAULT'],COL=['var(--gn)','var(--yl)','var(--or)','var(--rd)','var(--rd)'];
const level=g=>g>=S.crit?3:g>=S.danger?2:g>=S.warn?1:0;
const fanLbl=p=>p<=0?'OFF':p<=30?'LOW':p<=60?'NORMAL':p<=80?'HIGH':'MAXIMUM';
const st={gas:5,target:5,mode:'NORMAL',sensor:true,integ:0,prevE:0,e:0,P:0,I:0,Dt:0,u:0,pwm:10,adc:0,v:0,gasM:0,lvl:0,ack:false,fdcan:true,tx:0,rx:0,drop:0,log:[],hist:[],lv:0,hv:0,ser:{gas:[],pwm:[],pid:[],adc:[]},tick:0,ang:0,rxs:{gas:0,alarm:'NORMAL'},lastT:'--'};

