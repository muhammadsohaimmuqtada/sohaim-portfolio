(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(pointer:fine)').matches;
  const mobile=matchMedia('(max-width:980px)').matches;
  q('#year').textContent=new Date().getFullYear();

  const loader=q('.page-loader');
  addEventListener('load',()=>{ if(window.gsap&&!reduce) gsap.to(loader,{opacity:0,duration:.45,delay:.15,ease:'power2.out',onComplete:()=>loader.remove()}); else loader?.remove(); },{once:true});
  setTimeout(()=>loader?.remove(),2200);

  const menu=q('.menu'),nav=q('.nav');
  menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
  qa('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

  let lenis=null;
  if(window.Lenis&&!reduce){
    lenis=new Lenis({duration:1.12,smoothWheel:true,wheelMultiplier:.9,touchMultiplier:1.05});
    lenis.on('scroll',()=>window.ScrollTrigger?.update());
    const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);
  }
  qa('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');const el=id&&q(id);if(!el)return;e.preventDefault();if(lenis)lenis.scrollTo(el,{offset:-70,duration:1.15});else el.scrollIntoView({behavior:reduce?'auto':'smooth'});}));

  if(fine&&!reduce){
    const c=q('.cursor');let tx=innerWidth/2,ty=innerHeight/2,x=tx,y=ty;
    addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;c.classList.add('on')},{passive:true});
    const ctick=()=>{x+=(tx-x)*.19;y+=(ty-y)*.19;c.style.left=x+'px';c.style.top=y+'px';requestAnimationFrame(ctick)};ctick();
    qa('a,button,.portrait-stage,.project-panel').forEach(el=>{el.addEventListener('pointerenter',()=>c.classList.add('hot'));el.addEventListener('pointerleave',()=>c.classList.remove('hot'))});
    qa('.magnetic').forEach(el=>{
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.07}px,${(e.clientY-r.top-r.height/2)*.10}px)`});
      el.addEventListener('pointerleave',()=>el.style.transform='');
    });
  }

  const stage=q('#portraitStage'),tilt=q('#portraitTilt'),real=q('#realLayer'),line=q('#wipeLine'),band=q('#blendBand'),wrap=q('#characterWrap');
  const state={target:50,current:50,tiltX:0,tiltY:0,targetX:0,targetY:0,user:false};
  const setSplit=p=>{const v=clamp(p,24,76)+'%';tilt.style.setProperty('--split',v);real.style.setProperty('--split',v);line.style.left=v;band.style.left=v};
  const heroTick=()=>{
    state.current+=(state.target-state.current)*.105;
    state.tiltX+=(state.targetX-state.tiltX)*.10;
    state.tiltY+=(state.targetY-state.tiltY)*.10;
    setSplit(state.current);
    if(fine&&!reduce)tilt.style.transform=`rotateX(${state.tiltX.toFixed(3)}deg) rotateY(${state.tiltY.toFixed(3)}deg)`;
    requestAnimationFrame(heroTick);
  };heroTick();
  if(stage&&!reduce){
    const move=e=>{const r=stage.getBoundingClientRect(),px=clamp((e.clientX-r.left)/r.width,0,1),py=clamp((e.clientY-r.top)/r.height,0,1);state.user=true;state.target=24+px*52;if(fine){state.targetX=(.5-py)*3.2;state.targetY=(px-.5)*5.2;qa('[data-depth]',wrap).forEach(el=>{const d=+el.dataset.depth;el.style.translate=`${(px-.5)*18*d}px ${(py-.5)*14*d}px`})}};
    stage.addEventListener('pointermove',move,{passive:true});
    stage.addEventListener('pointerleave',()=>{state.target=50;state.targetX=0;state.targetY=0;qa('[data-depth]',wrap).forEach(el=>el.style.translate='')});
    if(window.gsap){const intro={p:32};state.current=32;state.target=32;gsap.timeline({delay:.5}).to(intro,{p:68,duration:1.05,ease:'power3.inOut',onUpdate:()=>{if(!state.user)state.target=intro.p}}).to(intro,{p:50,duration:.72,ease:'power3.out',onUpdate:()=>{if(!state.user)state.target=intro.p}})}
  }

  const hasGSAP=!!(window.gsap&&window.ScrollTrigger);
  if(hasGSAP&&!reduce){
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-copy>*',{y:32,opacity:0,duration:.9,stagger:.08,ease:'power3.out',delay:.12});
    gsap.from('.character-wrap',{x:58,opacity:0,scale:.97,duration:1.05,ease:'power3.out',delay:.15});
    gsap.from('.hero-meta',{y:18,opacity:0,duration:.8,ease:'power3.out',delay:.62});
    gsap.to('.hero-copy',{yPercent:-11,opacity:.30,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.8}});
    gsap.to('.character-wrap',{yPercent:9,scale:.94,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.8}});
    gsap.to('.hero-lines',{rotate:16,scale:1.17,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.8}});

    const panels=qa('.project-panel'),progress=q('#projectProgress'),current=q('#projectCurrent');
    const renderProjects=p=>{
      const pos=p*(panels.length-1);
      panels.forEach((panel,i)=>{
        const d=i-pos,ad=Math.abs(d),vis=clamp(1-ad,0,1);
        const z=-Math.min(ad,1.35)*170;
        const y=d*78;
        const scale=1-Math.min(ad,1)*.055;
        gsap.set(panel,{opacity:vis,y,z,scale,rotateX:clamp(d*5,-7,7),pointerEvents:ad<.5?'auto':'none'});
        const obj=q('.project-object',panel);if(obj)gsap.set(obj,{rotateY:clamp(d*18,-22,22),rotateX:clamp(-d*7,-9,9)});
      });
      progress.style.width=(p*100)+'%';
      current.textContent=String(Math.min(5,Math.round(pos)+1)).padStart(2,'0');
    };
    renderProjects(0);
    ScrollTrigger.create({trigger:'.work-story',start:'top top',end:'bottom bottom',scrub:.55,onUpdate:self=>renderProjects(self.progress)});
    gsap.from('.work-heading',{x:-56,opacity:0,scrollTrigger:{trigger:'.work-story',start:'top 72%',end:'top 34%',scrub:.55}});

    gsap.from('.about-copy h2 span',{x:-100,opacity:0,scrollTrigger:{trigger:'.about',start:'top 72%',end:'top 36%',scrub:.55}});
    gsap.from('.about-copy h2 em',{x:120,opacity:0,scrollTrigger:{trigger:'.about',start:'top 72%',end:'top 36%',scrub:.55}});
    gsap.from('.role-stack article',{x:68,opacity:0,stagger:.08,scrollTrigger:{trigger:'.about',start:'top 60%',end:'top 28%',scrub:.45}});
    gsap.to('.about-mesh',{rotate:48,scale:1.18,ease:'none',scrollTrigger:{trigger:'.about',start:'top bottom',end:'bottom top',scrub:.7}});
    gsap.from('.contact-copy',{scale:.84,opacity:0,scrollTrigger:{trigger:'.contact',start:'top 76%',end:'top 34%',scrub:.58}});
    gsap.to('.contact-orbit',{rotate:42,scale:1.16,ease:'none',scrollTrigger:{trigger:'.contact',start:'top bottom',end:'bottom top',scrub:.7}});
    ['work','about','contact'].forEach(id=>ScrollTrigger.create({trigger:'#'+id,start:'top 45%',end:'bottom 45%',onToggle:s=>{if(s.isActive)qa('.nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id))}}));
  } else if(mobile){qa('.project-panel').forEach(p=>{p.style.opacity=1;p.style.transform='none'})}
})();
