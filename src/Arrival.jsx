import {useEffect,useState} from 'react';

export function Arrival({resources,onEnter}) {
 const [minimum,setMinimum]=useState(false),[slow,setSlow]=useState(false),[leaving,setLeaving]=useState(false);
 useEffect(()=>{const a=setTimeout(()=>setMinimum(true),650),b=setTimeout(()=>setSlow(true),2500),c=setTimeout(()=>setLeaving(true),8000);return()=>[a,b,c].forEach(clearTimeout)},[]);
 useEffect(()=>{if(minimum&&resources.done===resources.total)setLeaving(true)},[minimum,resources]);
 useEffect(()=>{if(!leaving)return;const timer=setTimeout(onEnter,matchMedia('(prefers-reduced-motion: reduce)').matches?0:950);return()=>clearTimeout(timer)},[leaving,onEnter]);
 return <div className={`arrival${leaving?' is-leaving':''}`} aria-label="准备品牌影像" aria-busy={!leaving}>
  <div className="arrival-top"><span>有赞烘焙</span><span>AN OBSESSION WITH THE EVERYDAY.</span></div>
  <div className="arrival-art" aria-hidden="true"><svg viewBox="0 0 440 440" fill="none">{Array.from({length:16},(_,i)=>{const t=i/15;return <path key={i} style={{'--strand':i}} d={`M ${65+35*t} ${105+235*t} C ${285-100*t} ${-10+120*t}, ${140+110*t} ${420-100*t}, ${365-20*t} ${100+235*t}`}/>})}</svg></div>
  <div className="arrival-title" aria-hidden="true">YOUZAN</div>
  <div className="arrival-bottom"><p>美好，正在层层展开。<span>EVERY LAYER, WORTH THE WAIT.</span></p><div className="arrival-state"><span role="status">{leaving?'即将进入':resources.failed?'影像稍后抵达':slow?'正在准备影像':'正在展开风味'}</span><div className="arrival-marks" aria-hidden="true">{Array.from({length:resources.total},(_,i)=><i className={i<resources.done?'ready':''} key={i}/>)}</div><button onClick={()=>setLeaving(true)} style={{visibility:slow&&!leaving?'visible':'hidden'}}>先行浏览 ↗</button></div></div>
 </div>
}
