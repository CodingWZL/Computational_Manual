(() => {
  const data = window.MANUAL || [];
  const nav = document.getElementById('software-nav');
  const list = document.getElementById('task-list');
  const detail = document.getElementById('detail-panel');
  const search = document.getElementById('search');
  const empty = document.getElementById('empty-state');
  const resultCount = document.getElementById('result-count');
  const softwareOrder = ['VASP', 'Gaussian', 'ORCA', 'GROMACS', 'Linux'];
  const icons = {VASP:'V', Gaussian:'G', ORCA:'O', GROMACS:'M', Linux:'⌘'};
  let activeSoftware = 'VASP';
  let selectedId = null;
  let query = '';

  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const matchesQuery = item => !query || [item.title,item.en,item.summary,item.command,item.software,...item.tags].join(' ').toLowerCase().includes(query);
  const visibleItems = () => data.filter(item => (query ? true : item.software === activeSoftware) && matchesQuery(item));

  function renderNav() {
    const counts = Object.fromEntries(softwareOrder.map(name => [name, data.filter(item => item.software === name).length]));
    nav.innerHTML = `<div class="nav-group"><div class="nav-label">LIBRARY</div><button class="nav-button ${activeSoftware==='*'?'active':''}" data-software="*"><span class="nav-icon">◫</span><span>全部条目 <span style="color:#98a39d">/ All</span></span><span class="nav-count">${data.length}</span></button></div>` +
      softwareOrder.map((name, index) => `<div class="nav-group"><div class="nav-label">${['FIRST-PRINCIPLES','MOLECULAR QUANTUM','MOLECULAR QUANTUM','CLASSICAL MD','COMPUTING ENVIRONMENT'][index]}</div><button class="nav-button ${activeSoftware===name?'active':''}" data-software="${name}"><span class="nav-icon">${icons[name]}</span><span>${name}</span><span class="nav-count">${counts[name]}</span></button></div>`).join('');
  }

  function renderList() {
    const items = visibleItems();
    const grouped = new Map();
    items.forEach(item => { if (!grouped.has(item.group)) grouped.set(item.group, []); grouped.get(item.group).push(item); });
    list.innerHTML = [...grouped.entries()].map(([group, entries]) => `<div class="list-group"><div class="nav-label">${escapeHTML(group)}</div>${entries.map(item => `<button class="task-card ${selectedId===item.id?'selected':''}" data-id="${escapeHTML(item.id)}"><span class="task-topline"><span class="task-title">${escapeHTML(item.title)}</span><span class="task-arrow">↗</span></span><span class="task-subtitle">${escapeHTML(item.en)}</span><span class="task-tags">${item.tags.slice(0,3).map(tag=>`<span class="tag">${escapeHTML(tag)}</span>`).join('')}</span></button>`).join('')}</div>`).join('');
    empty.hidden = items.length !== 0;
    resultCount.textContent = `${items.length} ${items.length===1?'ENTRY':'ENTRIES'}`;
    document.getElementById('task-count').textContent = data.length;
    const name = activeSoftware === '*' ? '全部操作' : activeSoftware;
    document.getElementById('list-title').innerHTML = `${query ? '搜索结果' : escapeHTML(name)} <span>${query ? 'Search results' : 'Quick reference'}</span>`;
    list.querySelectorAll('.task-card').forEach(button => button.addEventListener('click', () => selectItem(button.dataset.id)));
  }

  function renderDetail(item) {
    detail.innerHTML = `<div class="detail-body">
      <div class="detail-meta"><span class="detail-category">${escapeHTML(item.software)} / ${escapeHTML(item.group)}</span><span class="detail-id">${escapeHTML(item.id.toUpperCase())}</span></div>
      <h2>${escapeHTML(item.title)}</h2><div class="detail-en-title">${escapeHTML(item.en)}</div>
      <p class="detail-summary">${escapeHTML(item.summary)}<span class="en">${escapeHTML(item.summaryEn || item.en)}</span></p>
      ${item.purpose ? `<div class="purpose">${escapeHTML(item.purpose)}</div>` : ''}
      <div class="block-heading"><span>COMMAND / INPUT</span><button class="copy-button" id="copy-command">复制命令 · COPY</button></div>
      <div class="code-wrap"><pre><code>${escapeHTML(item.command)}</code></pre></div>
      <div class="block-heading"><span>NOTES / 执行要点</span></div>
      <ul class="detail-notes">${item.notes.map(note=>`<li>${escapeHTML(note)}</li>`).join('')}</ul>
      <div class="source-note"><strong>来源 / Source</strong> · ${escapeHTML(item.source)}<br>命令运行前请按本机版本、许可、调度器与计算约定复核。</div>
    </div>`;
    document.getElementById('copy-command').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(item.command); showToast('已复制 / Copied'); }
      catch { showToast('浏览器未开放剪贴板权限 / Clipboard unavailable'); }
    });
  }

  function selectItem(id) {
    const item = data.find(entry => entry.id === id);
    if (!item) return;
    selectedId = id;
    if (!query) activeSoftware = item.software;
    renderNav(); renderList(); renderDetail(item);
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('mobile-menu').setAttribute('aria-expanded','false');
  }

  let toastTimer;
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
    toast.textContent = message; clearTimeout(toastTimer); toastTimer = setTimeout(()=>toast.remove(), 1800);
  }

  nav.addEventListener('click', event => {
    const button = event.target.closest('[data-software]');
    if (!button) return;
    activeSoftware = button.dataset.software; query = ''; search.value = ''; selectedId = null;
    renderNav(); renderList();
    detail.innerHTML = `<div class="detail-placeholder"><span class="placeholder-icon">↗</span><div class="eyebrow">SELECT A WORKFLOW</div><h2>${activeSoftware==='*'?'选择一项操作':'选择 '+escapeHTML(activeSoftware)+' 操作'}</h2><p>选择条目以查看输入示例与注意事项。<br><span>Select an entry to view the example and practical notes.</span></p></div>`;
  });
  search.addEventListener('input', () => { query = search.value.trim().toLowerCase(); selectedId = null; renderNav(); renderList(); });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape' && document.activeElement === search) { search.value=''; query=''; renderList(); search.blur(); }
  });
  document.getElementById('mobile-menu').addEventListener('click', event => {
    const open = document.getElementById('sidebar').classList.toggle('open');
    event.currentTarget.setAttribute('aria-expanded', String(open));
  });
  renderNav(); renderList();
})();
