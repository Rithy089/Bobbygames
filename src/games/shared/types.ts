export type Phase='ready'|'running'|'paused'|'over';
export type Snapshot={phase:Phase;score:number;lives:number;combo:number;height:number;distance:number;elapsed:number};
export type Input={left:boolean;right:boolean;pointer:number|null;action:boolean;direction:-1|0|1};
export type Engine={start:()=>void;pause:()=>void;resume:()=>void;restart:()=>void;input:(key:'left'|'right'|'action',pressed:boolean)=>void;destroy:()=>void};
export type GameOptions={canvas:HTMLCanvasElement;onSnapshot:(s:Snapshot)=>void;onFinish:(s:Snapshot)=>void;audio:(kind:'catch'|'miss'|'perfect')=>void};
export type Scene={snapshot:Snapshot;update:(dt:number,input:Input)=>void;draw:(ctx:CanvasRenderingContext2D)=>void;reset:()=>void};
export const W=800,H=600;
export const freshSnapshot=():Snapshot=>({phase:'ready',score:0,lives:3,combo:0,height:0,distance:0,elapsed:0});
