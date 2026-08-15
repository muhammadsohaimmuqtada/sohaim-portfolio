(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(pointer:fine)').matches;
  q('#year').textContent=new Date().getFullYear();

  const menu=q('.menu'), nav=q('.nav');
  menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
  qa('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

  if(fine && !reduce){
    const c=q('.cursor'); let tx=innerWidth/2,ty=innerHeight/2,x=tx,y=ty;
    addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;c.classList.add('on')},{passive:true});
    const tick=()=>{x+=(tx-x)*.2;y+=(ty-y)*.2;c.style.left=x+'px';c.style.top=y+'px';requestAnimationFrame(tick)};tick();
    qa('a,button,.portrait-stage,.project-panel').forEach(el=>{el.addEventListener('pointerenter',()=>c.classList.add('hot'));el.addEventListener('pointerleave',()=>c.classList.remove('hot'))});
    qa('.magnetic').forEach(el=>{
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.12}px)`});
      el.addEventListener('pointerleave',()=>el.style.transform='');
    });
  }

  const stage=q('#portraitStage'), real=q('#realLayer'), line=q('#wipeLine'), wrap=q('#characterWrap');
  const setWipe=(p)=>{p=clamp(p,5,95);real.style.setProperty('--wipe',p+'%');line.style.setProperty('--wipe',p+'%')};
  setWipe(42);
  if(stage && !reduce){
    const move=e=>{
      const r=stage.getBoundingClientRect(); const px=clamp((e.clientX-r.left)/r.width,0,1); const py=clamp((e.clientY-r.top)/r.height,0,1);
      setWipe(px*100);
      if(fine){stage.style.transform=`rotateX(${(.5-py)*6}deg) rotateY(${(px-.5)*10}deg) translateZ(0)`;qa('[data-depth]',wrap).forEach(el=>{const d=+el.dataset.depth;el.style.translate=`${(px-.5)*28*d}px ${(py-.5)*22*d}px`})}
    };
    stage.addEventListener('pointermove',move);
    stage.addEventListener('pointerleave',()=>{
      stage.style.transform='';
      qa('[data-depth]',wrap).forEach(el=>el.style.translate='');
      if(window.gsap){const state={p:parseFloat(getComputedStyle(real).getPropertyValue('--wipe'))||42};gsap.to(state,{p:42,duration:.65,ease:'power3.out',onUpdate:()=>setWipe(state.p)})}
    });
    if(window.gsap){const state={p:16};setWipe(state.p);gsap.timeline({delay:.45}).to(state,{p:76,duration:1.15,ease:'power3.inOut',onUpdate:()=>setWipe(state.p)}).to(state,{p:42,duration:.75,ease:'power3.out',onUpdate:()=>setWipe(state.p)})}
  }

  const hasGSAP=!!(window.gsap&&window.ScrollTrigger);
  let lenis=null;
  if(hasGSAP && !reduce){
    gsap.registerPlugin(ScrollTrigger);
    if(window.Lenis){
      lenis=new Lenis({duration:1.18,smoothWheel:true,wheelMultiplier:.92,touchMultiplier:1.05,anchors:true});
      lenis.on('scroll',ScrollTrigger.update);
      gsap.ticker.add(time=>lenis.raf(time*1000));
      gsap.ticker.lagSmoothing(0);
    }
    gsap.from('.hero-copy>*',{y:34,opacity:0,duration:.9,stagger:.09,ease:'power3.out',delay:.08});
    gsap.from('.character-wrap',{x:70,opacity:0,rotateY:-8,duration:1.1,ease:'power3.out',delay:.12});
    gsap.from('.hero-meta',{y:22,opacity:0,duration:.8,ease:'power3.out',delay:.55});
    gsap.to('.hero-copy',{yPercent:-12,opacity:.25,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.7}});
    gsap.to('.character-wrap',{yPercent:10,scale:.92,rotateZ:-1.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.7}});
    gsap.to('.hero-lines',{rotate:18,scale:1.18,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.7}});

    const panels=qa('.project-panel'), dots=qa('.project-dots button'), progress=q('#projectProgress');
    let active=0;
    const showPanel=(idx,dir=1)=>{
      idx=clamp(idx,0,panels.length-1); if(idx===active&&panels[idx].classList.contains('active')) return;
      const prev=panels[active], next=panels[idx];
      panels.forEach(p=>p.classList.remove('active')); next.classList.add('active'); dots.forEach((d,i)=>d.classList.toggle('active',i===idx));
      gsap.killTweensOf([prev,next]);
      gsap.to(prev,{opacity:0,y:-55*dir,z:-160,rotateX:-5*dir,scale:.96,duration:.46,ease:'power2.in',pointerEvents:'none'});
      gsap.fromTo(next,{opacity:0,y:65*dir,z:-200,rotateX:7*dir,scale:.94},{opacity:1,y:0,z:0,rotateX:0,scale:1,duration:.68,ease:'power3.out',pointerEvents:'auto'});
      gsap.fromTo(q('.project-object',next),{rotateY:dir*24,rotateX:-dir*10,scale:.83},{rotateY:0,rotateX:0,scale:1,duration:.8,ease:'power3.out'});
      active=idx;
    };
    panels[0].style.opacity=1;panels[0].style.transform='none';
    ScrollTrigger.create({trigger:'.work-story',start:'top top',end:'bottom bottom',scrub:.5,onUpdate:self=>{
      const p=self.progress; progress.style.width=(p*100)+'%'; const idx=Math.min(4,Math.floor(p*5)); if(idx!==active)showPanel(idx,idx>active?1:-1);
    }});
    dots.forEach((d,i)=>d.addEventListener('click',()=>{const el=q('.work-story');const y=el.offsetTop+(el.offsetHeight-innerHeight)*(i/4);if(lenis)lenis.scrollTo(y,{duration:1.1});else scrollTo({top:y,behavior:'smooth'})}));
    gsap.from('.work-heading',{x:-60,opacity:0,scrollTrigger:{trigger:'.work-story',start:'top 72%',end:'top 35%',scrub:.6}});

    gsap.from('.about-copy h2 span',{x:-90,opacity:0,scrollTrigger:{trigger:'.about',start:'top 70%',end:'top 35%',scrub:.55}});
    gsap.from('.about-copy h2 em',{x:120,opacity:0,scrollTrigger:{trigger:'.about',start:'top 70%',end:'top 35%',scrub:.55}});
    gsap.from('.role-stack article',{x:70,opacity:0,stagger:.09,scrollTrigger:{trigger:'.about',start:'top 60%',end:'top 25%',scrub:.5}});
    gsap.to('.about-mesh',{rotate:50,scale:1.2,ease:'none',scrollTrigger:{trigger:'.about',start:'top bottom',end:'bottom top',scrub:.7}});
    gsap.from('.contact-copy',{scale:.83,opacity:0,scrollTrigger:{trigger:'.contact',start:'top 75%',end:'top 32%',scrub:.6}});
    gsap.to('.contact-orbit',{rotate:45,scale:1.18,ease:'none',scrollTrigger:{trigger:'.contact',start:'top bottom',end:'bottom top',scrub:.7}});
    ['work','about','contact'].forEach(id=>ScrollTrigger.create({trigger:'#'+id,start:'top 45%',end:'bottom 45%',onToggle:s=>{if(s.isActive)qa('.nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id))}}));
  }
})();