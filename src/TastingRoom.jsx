import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight} from '@phosphor-icons/react';
import './tasting-room.css';
const works=[{id:'classic',name:'原味可颂',en:'Le Croissant',image:'crumb',note:'酥脆之外，是轻盈。',copy:'薄脆的外壳，包裹蓬松的内里。把黄油的香气，留在层与层之间。',number:'01'}, {id:'chocolate',name:'巧克力酥',en:'Le Chocolat',image:'chocolate',note:'浓郁，也可以轻盈。',copy:'酥层在舌尖散开，可可的醇厚随后抵达。两种性格，在一口之间相遇。',number:'02'}];
export default function TastingRoom(){
 const [selected,setSelected]=useState(()=>new URLSearchParams(location.search).get('piece')==='classic'?0:1),[spread,setSpread]=useState(55),[lens,setLens]=useState(false);
 const scene=useRef(),detail=useRef();const work=works[selected];
 useEffect(()=>{document.title='风味藏品室 · 有赞烘焙';return()=>{document.title='有赞烘焙'}},[]);
 const choose=i=>{setSelected(i);const url=new URL(location.href);url.searchParams.set('piece',works[i].id);history.replaceState(null,'',url)};
 const tilt=e=>{if(!matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches)return;const r=e.currentTarget.getBoundingClientRect();scene.current.style.setProperty('--tilt-x',`${((e.clientY-r.top)/r.height-.5)*-8}deg`);scene.current.style.setProperty('--tilt-y',`${((e.clientX-r.left)/r.width-.5)*10}deg`)};
 const inspect=e=>{const r=detail.current.getBoundingClientRect();const x=Math.max(18,Math.min(82,(e.clientX-r.left)/r.width*100)),y=Math.max(18,Math.min(82,(e.clientY-r.top)/r.height*100));detail.current.style.setProperty('--lens-x',`${x}%`);detail.current.style.setProperty('--lens-y',`${y}%`)};
 return <main className="tasting-room">
  <header className="tasting-nav"><a href="/">YOUZAN BAKERY <span>有赞烘焙</span></a><a href="/">返回首页 <ArrowUpRight size={16}/></a></header>
  <section className="tasting-hero" aria-labelledby="tasting-title">
   <div className="tasting-heading"><h1 id="tasting-title">风味，<br/>值得细看。</h1><p className="tasting-italic">The tasting room.</p><div className="tasting-tabs" role="group" aria-label="选择烘焙作品">{works.map((p,i)=><button key={p.id} aria-pressed={selected===i} onClick={()=>choose(i)}>{p.name}</button>)}</div><div className="tasting-description" key={work.id} aria-live="polite"><h2>{work.note}</h2><p>{work.copy}</p></div></div>
   <div className="tasting-object" ref={scene} onPointerMove={tilt} onPointerLeave={()=>{scene.current.style.setProperty('--tilt-x','0deg');scene.current.style.setProperty('--tilt-y','0deg')}}>
    <svg className="tasting-orbit" viewBox="0 0 600 600" fill="none" aria-hidden="true"><circle cx="300" cy="300" r="265"/><g><path d="M 290 35 h20 M 300 25 v20 M 25 300 h20 M 35 290 v20 M 555 300 h20 M 565 290 v20 M 290 565 h20 M 300 555 v20"/></g></svg>
    <figure className={`tasting-product tasting-product-${work.id}`} key={work.id}><img src={`/assets/${work.image}.webp`} alt={work.name} fetchPriority="high"/><figcaption>{work.en}</figcaption></figure>
    <span className="tasting-index"><b>{work.number}</b> / 02</span>
    <div className="tasting-arrows"><button aria-label="上一件作品" onClick={()=>choose(1-selected)}><ArrowLeft size={22} weight="thin"/></button><button aria-label="下一件作品" onClick={()=>choose(1-selected)}><ArrowRight size={22} weight="thin"/></button></div>
   </div>
   <a className="tasting-scroll" href="#structure">细看每一层 <span>↓</span></a>
  </section>
  <section className="tasting-study" id="structure" aria-labelledby="structure-title">
   <div className={`tasting-macro ${lens?'is-inspecting':''}`} ref={detail} onPointerMove={inspect}>
    <img src="/assets/crumb.webp" alt="可颂剖面的蜂窝状酥层" loading="lazy"/>
    <div className="tasting-lens" aria-hidden="true"/>
    <button className="lens-toggle" aria-pressed={lens} onClick={()=>setLens(!lens)}>{lens?'退出细看':'放大细看'} <span>{lens?'−':'+'}</span></button>
    <span className="macro-caption">AIR. BUTTER. A LITTLE WONDER.</span>
   </div>
   <div className="tasting-study-copy"><h2 id="structure-title">轻盈的结构。</h2><p>在折叠与舒展之间，<br/>给空气留出位置。<br/>酥脆与柔软，就这样相遇。</p>
    <div className="lamination" style={{'--spread':spread/100}} aria-hidden="true">{Array.from({length:7},(_,i)=><div className="lamination-layer" style={{'--layer':i}} key={i}><svg viewBox="0 0 400 170" preserveAspectRatio="none"><ellipse cx="200" cy="85" rx="170" ry="62"/><ellipse cx="200" cy="85" rx="148" ry="48"/><path d="M65 85 Q135 28 200 85 T335 85 M85 105 Q165 50 225 100 T315 90"/></svg></div>)}</div>
    <div className="lamination-control"><span>收起</span><input aria-label="展开酥层" type="range" min="0" max="100" value={spread} onChange={e=>setSpread(Number(e.target.value))}/><span>展开酥层</span></div><p className="study-footnote">滑动，看看层次如何舒展。<span>形态示意 / A STUDY OF LAYERS</span></p>
   </div>
  </section>
  <footer className="tasting-end"><p>把细节看尽。<br/><i>把风味留给下一口。</i></p><a href="/">回到有赞的世界 <ArrowUpRight size={28} weight="thin"/></a><div><span>YOUZAN BAKERY</span><span>有赞烘焙 · 品牌概念体验</span></div></footer>
 </main>
}
