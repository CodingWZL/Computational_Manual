(() => {
  const tasks=window.MANUAL||[];
  const nav=document.getElementById('software-nav'), list=document.getElementById('task-list');
  const detail=document.getElementById('detail-panel'), search=document.getElementById('search');
  const empty=document.getElementById('empty-state'), resultCount=document.getElementById('result-count');
  const order=['VASP','Gaussian','ORCA','GROMACS','Linux'];
  const icons={VASP:'V',Gaussian:'G',ORCA:'O',GROMACS:'M',Linux:'⌘'};
  let active='VASP', activeId=null, query='';
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const visible=()=>tasks.filter(t=>(query||active==='*'||t.software===active)&&(!query||JSON.stringify(t).toLowerCase().includes(query)));
  function renderNav(){
    const counts={}; order.forEach(n=>counts[n]=tasks.filter(t=>t.software===n).length);
    let html='<div class="nav-group"><div class="nav-label">MANUAL</div><button class="nav-button '+(active==='*'?'active':'')+'" data-software="*"><span class="nav-icon">◫</span><span>全部任务 <small>All tasks</small></span><span class="nav-count">'+tasks.length+'</span></button></div>';
    order.forEach(n=>{html+='<div class="nav-group"><button class="nav-button '+(active===n?'active':'')+'" data-software="'+n+'"><span class="nav-icon">'+icons[n]+'</span><span>'+n+'</span><span class="nav-count">'+counts[n]+'</span></button></div>'});
    nav.innerHTML=html;
  }
  function renderList(){
    const rows=visible(), groups=new Map(); rows.forEach(t=>{if(!groups.has(t.group))groups.set(t.group,[]);groups.get(t.group).push(t)});
    let html='';
    groups.forEach((items,g)=>{
      html+='<section class="task-group"><div class="group-heading">'+esc(g)+'</div>';
      items.forEach(t=>{html+='<button class="task-card '+(activeId===t.id?'selected':'')+'" data-id="'+esc(t.id)+'"><span class="task-title-row"><span class="task-title">'+esc(t.title)+'</span><span class="task-arrow">↗</span></span><span class="task-en">'+esc(t.en)+'</span><span class="task-summary">'+esc(t.summary)+'</span><span class="task-level">'+esc(t.level)+'</span></button>'});
      html+='</section>';
    });
    list.innerHTML=html; empty.hidden=rows.length>0; resultCount.textContent=rows.length+' '+(rows.length===1?'TASK':'TASKS');
    document.getElementById('task-count').textContent=tasks.length;
    const heading=query?'搜索结果':(active==='*'?'全部任务':active);
    document.getElementById('list-title').innerHTML=esc(heading)+' <span>'+(query?'Search results':'Step-by-step workflows')+'</span>';
    list.querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>selectTask(b.dataset.id)));
  }
  function renderDetail(t){
    let html='<div class="detail-body"><div class="detail-top"><span class="detail-category">'+esc(t.software)+' <b>/</b> '+esc(t.group)+'</span><span class="detail-level">'+esc(t.level)+'</span></div>';
    html+='<h2>'+esc(t.title)+'</h2><div class="detail-en-title">'+esc(t.en)+'</div><p class="detail-summary">'+esc(t.summary)+'<span>'+esc(t.summaryEn)+'</span></p>';
    html+='<div class="objective"><div class="block-heading">本任务要完成什么 <span>OBJECTIVE</span></div><p>'+esc(t.objective)+'</p></div><div class="overview-grid">';
    html+='<section class="overview-card"><h3>完成后应得到 <span>EXPECTED RESULT</span></h3><ul><li>'+esc(t.steps[t.steps.length-1].output)+'</li><li>'+esc(t.steps[t.steps.length-1].check)+'</li></ul></section><section class="overview-card"><h3>输入与文件 <span>INPUTS</span></h3><ul>';
    t.inputs.forEach(x=>html+='<li>'+esc(x)+'</li>');
    html+='</ul></section></div><div class="workflow-heading"><div><div class="eyebrow">STEP-BY-STEP</div><h3>计算流程 <span>Workflow</span></h3></div><div class="step-count">'+t.steps.length+' STEPS</div></div><div class="workflow-steps">';
    t.steps.forEach((s,si)=>{
      html+='<section class="workflow-step"><div class="step-number">'+String(si+1).padStart(2,'0')+'</div><div class="step-content"><h4>'+esc(s.title)+'</h4><div class="step-en">'+esc(s.en)+'</div><p class="step-purpose">'+esc(s.purpose)+'</p>';
      (s.commands||[]).forEach((c,ci)=>{html+='<div class="command-card"><div class="command-head"><span><b>用途</b> '+esc(c.purpose)+'</span><button class="copy-button" data-step="'+si+'" data-cmd="'+ci+'">复制 / COPY</button></div><pre><code>'+esc(c.code)+'</code></pre>'+(c.notes?'<p class="step-purpose">'+esc(c.notes)+'</p>':'')+'</div>'});
      html+='<div class="step-outcomes"><p><b>预期结果 / Output</b>'+esc(s.output)+'</p><p><b>检查点 / Check</b>'+esc(s.check)+'</p></div></div></section>';
    });
    html+='</div>';
    if((t.cautions||[]).length){html+='<section class="cautions"><h3>适用边界与注意事项 <span>CAUTIONS</span></h3><ul>';t.cautions.forEach(x=>html+='<li>'+esc(x)+'</li>');html+='</ul></section>'}
    if(t.reference) html+='<p class="step-purpose">官方参考 / Official reference: <a href="'+esc(t.reference)+'" target="_blank" rel="noopener noreferrer">'+esc(t.reference)+'</a></p>';
    html+='<div class="source-credit"><span>资料整理 / EDITOR</span><strong>Zhilong Wang（汪志龙）</strong></div></div>';
    detail.innerHTML=html;
    detail.querySelectorAll('.copy-button').forEach(b=>b.addEventListener('click',async()=>{
      const code=t.steps[Number(b.dataset.step)].commands[Number(b.dataset.cmd)].code;
      try{await navigator.clipboard.writeText(code);toast('已复制命令 / Command copied')}catch{toast('浏览器未开放剪贴板权限 / Clipboard unavailable')}
    }));
  }
  function selectTask(id){
    const t=tasks.find(x=>x.id===id);if(!t)return;activeId=id;if(!query)active=t.software;
    renderNav();renderList();renderDetail(t);document.getElementById('sidebar').classList.remove('open');
    document.getElementById('mobile-menu').setAttribute('aria-expanded','false');
  }
  let toastTimer;
  function toast(message){let n=document.querySelector('.toast');if(!n){n=document.createElement('div');n.className='toast';document.body.appendChild(n)}n.textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.remove(),1800)}
  nav.addEventListener('click',e=>{
    const b=e.target.closest('[data-software]');if(!b)return;active=b.dataset.software;query='';search.value='';activeId=null;renderNav();renderList();
    detail.innerHTML='<div class="detail-placeholder"><span class="placeholder-icon">↗</span><div class="eyebrow">CHOOSE A TASK</div><h2>选择一项计算任务</h2><p>每个任务列出输入文件、分步操作、单条命令用途和检查点。<br><span>Each task lists inputs, ordered actions, command purposes, and checks.</span></p></div>';
  });
  search.addEventListener('input',()=>{query=search.value.trim().toLowerCase();activeId=null;renderNav();renderList()});
  document.addEventListener('keydown',e=>{
    if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();search.focus()}
    if(e.key==='Escape'&&document.activeElement===search){search.value='';query='';renderList();search.blur()}
  });
  document.getElementById('mobile-menu').addEventListener('click',e=>{const open=document.getElementById('sidebar').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open))});
  renderNav();renderList();
})();
