import {W,H,type Scene,type GameOptions,type Engine,type Input} from './types';
export function createLoop(scene:Scene,options:GameOptions):Engine{
const {canvas,onSnapshot,onFinish}=options;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');canvas.width=W;canvas.height=H;
let raf=0,previous=0,report=0,disposed=false,finished=false;const input:Input={left:false,right:false,pointer:null,action:false,direction:0};
const publish=()=>onSnapshot({...scene.snapshot});
const clearInput=()=>{input.left=false;input.right=false;input.action=false;input.direction=0};
const pause=()=>{if(scene.snapshot.phase==='running'){scene.snapshot.phase='paused';clearInput();publish()}};
const setInput=(key:'left'|'right'|'action',pressed:boolean)=>{if(scene.snapshot.phase!=='running')return;input[key]=pressed;if(pressed&&key!=='action')input.direction=key==='left'?-1:1};
const onKey=(e:KeyboardEvent)=>{const key=e.key.toLowerCase();if(['arrowleft','arrowright',' ','a','d','escape','p'].includes(key)){e.preventDefault();if((key==='escape'||key==='p')&&e.type==='keydown'&&!e.repeat){if(scene.snapshot.phase==='running')pause();else if(scene.snapshot.phase==='paused'){scene.snapshot.phase='running';publish()}return}if(e.repeat)return;if(key===' '&&e.type==='keydown')setInput('action',true);if(key==='arrowleft'||key==='a')setInput('left',e.type==='keydown');if(key==='arrowright'||key==='d')setInput('right',e.type==='keydown')}};
const pointer=(e:PointerEvent)=>{const bounds=canvas.getBoundingClientRect();input.pointer=(e.clientX-bounds.left)/bounds.width*W};
const down=(e:PointerEvent)=>{canvas.focus({preventScroll:true});pointer(e);if(scene.snapshot.phase==='running')input.action=true;canvas.setPointerCapture(e.pointerId)};
const blur=()=>pause();const visibility=()=>{if(document.hidden)pause()};
canvas.addEventListener('keydown',onKey);canvas.addEventListener('keyup',onKey);canvas.addEventListener('pointermove',pointer);canvas.addEventListener('pointerdown',down);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
function tick(now:number){if(disposed)return;const dt=Math.min((now-previous)/1000||0,0.05);previous=now;
if(scene.snapshot.phase==='running'){scene.snapshot.elapsed+=dt;scene.update(dt,input);input.action=false;input.direction=0}
scene.draw(ctx!);if(now-report>100){report=now;publish()}if(scene.snapshot.phase==='over'&&!finished){finished=true;publish();onFinish({...scene.snapshot})}raf=requestAnimationFrame(tick)}
raf=requestAnimationFrame(tick);publish();
const start=()=>{scene.snapshot.phase='running';canvas.focus({preventScroll:true});publish()};
return{start,pause,resume:()=>{if(scene.snapshot.phase==='paused')start()},restart:()=>{scene.reset();finished=false;clearInput();input.pointer=null;start()},input:setInput,destroy:()=>{disposed=true;cancelAnimationFrame(raf);clearInput();canvas.removeEventListener('keydown',onKey);canvas.removeEventListener('keyup',onKey);canvas.removeEventListener('pointermove',pointer);canvas.removeEventListener('pointerdown',down);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility)}};
}
