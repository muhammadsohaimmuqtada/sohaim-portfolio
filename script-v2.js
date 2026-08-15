(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const q = (s, r=document) => r.querySelector(s);
  const qa = (s, r=document) => [...r.querySelectorAll(s)];
  q('#year').textContent = new Date().getFullYear();

  qa('[data-delay]').forEach(el => el.style.setProperty('--delay', `${el.dataset.delay}ms`));
  requestAnimationFrame(() => qa('.intro-reveal').forEach(el => el.classList.add('in')));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.12, rootMargin:'0px 0px -8%'});
    qa('.reveal').forEach(el => io.observe(el));
  } else qa('.reveal').forEach(el => el.classList.add('in'));

  const menu=q('.menu'), nav=q('.nav');
  menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
  qa('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

  const frame=q('#portraitFrame'), real=q('#realPortrait'), ring=q('#scannerRing'), rig=q('#characterRig');
  if(frame && !reduce){
    const move=e=>{
      const r=frame.getBoundingClientRect(); const x=((e.clientX-r.left)/r.width)*100, y=((e.clientY-r.top)/r.height)*100;
      real.style.setProperty('--x',`${x}%`); real.style.setProperty('--y',`${y}%`); real.style.setProperty('--radius',`${Math.min(r.width*.36,160)}px`);
      ring.style.left=`${x}%`; ring.style.top=`${y}%`;
      if(fine){ const rx=(.5-y/100)*7, ry=(x/100-.5)*10; rig.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`; }
    };
    frame.addEventListener('pointermove',move);
    frame.addEventListener('pointerleave',()=>{real.style.setProperty('--radius','0px');ring.style.left='50%';ring.style.top='50%';rig.style.transform='';});
  }

  qa('.project-row').forEach(row=>{
    row.addEventListener('pointerenter',()=>{
      qa('.project-row').forEach(x=>x.classList.remove('active')); row.classList.add('active');
      q('#visualIndex').textContent=row.dataset.index; q('#visualSymbol').textContent=row.dataset.symbol;
      const core=q('#visualCore'); core.animate([{transform:'rotateY(0deg) scale(1)'},{transform:'rotateY(22deg) scale(.92)'},{transform:'rotateY(0deg) scale(1)'}],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)'});
    });
  });

  if(fine && !reduce){
    const cursor=q('.cursor'); let tx=innerWidth/2,ty=innerHeight/2,x=tx,y=ty;
    addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;cursor.classList.add('on')},{passive:true});
    const tick=()=>{x+=(tx-x)*.18;y+=(ty-y)*.18;cursor.style.left=x+'px';cursor.style.top=y+'px';requestAnimationFrame(tick)};tick();
    qa('a,button,#portraitFrame,.project-row').forEach(el=>{el.addEventListener('pointerenter',()=>cursor.classList.add('hot'));el.addEventListener('pointerleave',()=>cursor.classList.remove('hot'));});
  }

  const sections=['work','about','contact'].map(id=>document.getElementById(id)).filter(Boolean); const navLinks=qa('.nav a');
  if('IntersectionObserver' in window){const nio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${e.target.id}`));}),{rootMargin:'-38% 0px -55%'});sections.forEach(s=>nio.observe(s));}

  if (!reduce) {
    import('https://cdnjs.cloudflare.com/ajax/libs/three.js/0.179.1/three.module.min.js').then(THREE => {
      const canvas=q('#world');
      const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.setSize(innerWidth,innerHeight,false);
      const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);camera.position.set(0,0,8.4);
      const root=new THREE.Group();scene.add(root);
      const green=0x0d503a, pale=0x668c7c;
      const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(1.5,.22,120,14),new THREE.MeshBasicMaterial({color:green,wireframe:true,transparent:true,opacity:.13}));knot.position.set(3.8,.55,-1.6);root.add(knot);
      const ico=new THREE.Mesh(new THREE.IcosahedronGeometry(1.1,1),new THREE.MeshBasicMaterial({color:pale,wireframe:true,transparent:true,opacity:.09}));ico.position.set(-4.8,-2.1,-2.2);root.add(ico);
      const ringGroup=new THREE.Group(); for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(2.1+i*.48,.008,4,110),new THREE.MeshBasicMaterial({color:green,transparent:true,opacity:.10-i*.02}));m.rotation.x=1.05+i*.2;m.rotation.y=.2*i;ringGroup.add(m)}ringGroup.position.set(3.7,.6,-2.1);root.add(ringGroup);
      const count=260;const pos=new Float32Array(count*3);for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*15;pos[i*3+1]=(Math.random()-.5)*9;pos[i*3+2]=-2-Math.random()*5}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:green,size:.018,transparent:true,opacity:.24}));root.add(pts);
      let mx=0,my=0,scroll=0; addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5);my=(e.clientY/innerHeight-.5)},{passive:true}); addEventListener('scroll',()=>scroll=scrollY/(document.documentElement.scrollHeight-innerHeight),{passive:true});
      const clock=new THREE.Clock();
      function render(){const t=clock.getElapsedTime();knot.rotation.x=t*.08; knot.rotation.y=t*.12;ico.rotation.x=-t*.08;ico.rotation.z=t*.1;ringGroup.rotation.z=t*.045;pts.rotation.y=t*.006;camera.position.x+=(mx*.42-camera.position.x)*.025;camera.position.y+=(-my*.26-camera.position.y)*.025;root.rotation.z=(scroll-.5)*.12;root.position.y=scroll*-1.2;renderer.render(scene,camera);requestAnimationFrame(render)}render();
      addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));});
    }).catch(()=>document.documentElement.classList.add('no-webgl'));
  }
})();
