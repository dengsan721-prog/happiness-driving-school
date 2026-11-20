(function () {
  const assetVersion = new URL(document.currentScript.src).search;
  let libraries;
  let loadPromise;
  function loadData() {
    if (libraries) return Promise.resolve();
    if (!loadPromise) {
      loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `library-data.js${assetVersion}`;
        script.onload = () => {
          const source = window.handbookLibraryData;
          libraries = new Map(source.questions.map(library => [library.id, library]));
          libraries.set('happinessFamilyAnswers', source.family);
          libraries.set('sixMinuteCollection', source.minutes);
          resolve();
        };
        script.onerror = () => { loadPromise = null; script.remove(); reject(new Error('资料加载失败')); };
        document.body.appendChild(script);
      });
    }
    return loadPromise;
  }
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const copyButton = (value, label = '复制') => `<button class="copy-btn library-copy" type="button" data-library-copy="${encodeURIComponent(value)}">${label}</button>`;

  function entriesFor(library) {
    const groups = library.modules || library.categories;
    return groups.flatMap(group => (group.courses || group.items).map(item => ({
      category: group.title,
      ...item,
      searchText: [group.title, item.title, ...(item.questions || []), ...(item.homework || []), ...(item.lines || [])].join(' ').toLowerCase()
    })));
  }

  function itemHtml(item) {
    const isQuestion = Array.isArray(item.questions);
    const groups = isQuestion
      ? [{ title: '互动问句', lines: item.questions }, { title: '课后作业', lines: item.homework || [] }]
      : [{ title: '', lines: item.lines || [] }];
    const title = item.order ? `${item.order}. ${item.title}` : item.title;
    const wholeText = [item.category, title, ...groups.flatMap(group => [group.title, ...group.lines.map((line, index) => isQuestion ? `${index + 1}. ${line}` : line)])].filter(Boolean).join('\n');
    const body = groups.filter(group => group.lines.length).map(group => `<div class="library-item-section">${group.title ? `<h5>${group.title}</h5>` : ''}${isQuestion ? `<ol>${group.lines.map(line => `<li>${copyButton(line)}${escapeHtml(line)}</li>`).join('')}</ol>` : group.lines.map(line => `<p>${copyButton(line)}${escapeHtml(line)}</p>`).join('')}</div>`).join('');
    return `<details class="library-item"><summary><span class="library-item-label">${item.order ? `<span class="library-item-order">${escapeHtml(item.order)}</span>` : ''}<span>${escapeHtml(item.title)}</span></span>${copyButton(wholeText)}<span class="library-toggle" aria-hidden="true">⌄</span></summary><div class="library-item-body">${body}</div></details>`;
  }

  function render(view) {
    const state = view.libraryState;
    const query = state.search.value.trim().toLowerCase();
    const matches = state.entries.filter(item => (state.category === '全部' || item.category === state.category) && (!query || item.searchText.includes(query)));
    const visible = matches.slice(0, state.limit);
    state.results.innerHTML = state.categories.slice(1).map(category => {
      const items = visible.filter(item => item.category === category);
      if (!items.length) return '';
      const total = matches.filter(item => item.category === category).length;
      return `<section class="library-module"><div class="library-module-head"><h4>${escapeHtml(category)}</h4><span>${items.length} / ${total} ${state.isQuestion ? '课' : '条'}</span></div><div class="library-item-list">${items.map(itemHtml).join('')}</div></section>`;
    }).join('') || '<p class="library-meta">没有找到相关内容，换个词试试。</p>';
    state.meta.textContent = `共 ${matches.length} ${state.isQuestion ? '课' : '条'}，当前显示 ${visible.length} ${state.isQuestion ? '课' : '条'}；点标题展开`;
    state.more.hidden = matches.length <= state.limit;
    state.filters.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.category === state.category));
  }

  async function init(view) {
    if (!view || view.libraryState || view.dataset.loading) return;
    view.dataset.loading = 'true';
    const meta = view.querySelector('.library-meta');
    meta.textContent = '正在打开资料…';
    try {
      await loadData();
    } catch (error) {
      meta.textContent = '资料暂时没打开，请再点一次这个小模块。';
      delete view.dataset.loading;
      return;
    }
    const library = libraries.get(view.dataset.libraryView);
    if (!library) return;
    const entries = entriesFor(library);
    const categories = ['全部', ...new Set(entries.map(item => item.category))];
    const filters = view.querySelector('.library-filter');
    filters.innerHTML = categories.map(category => `<button type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)} <span>${category === '全部' ? entries.length : entries.filter(item => item.category === category).length}</span></button>`).join('');
    view.libraryState = {
      entries,
      categories,
      isQuestion: Array.isArray(library.modules?.[0]?.courses),
      category: '全部',
      limit: 12,
      search: view.querySelector('.library-search'),
      filters,
      meta: view.querySelector('.library-meta'),
      results: view.querySelector('.library-results'),
      more: view.querySelector('.library-more')
    };
    let timer;
    view.libraryState.search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { view.libraryState.limit = 12; render(view); }, 120);
    });
    filters.addEventListener('click', event => {
      const button = event.target.closest('[data-category]');
      if (!button) return;
      view.libraryState.category = button.dataset.category;
      view.libraryState.limit = 12;
      render(view);
    });
    view.libraryState.more.addEventListener('click', () => {
      view.libraryState.limit += 12;
      render(view);
    });
    render(view);
    delete view.dataset.loading;
  }

  document.addEventListener('click', event => {
    const submodule = event.target.closest('[data-submodule-link]');
    if (submodule) init(document.getElementById(submodule.dataset.submoduleLink)?.querySelector('[data-library-view]'));
    const button = event.target.closest('[data-library-copy]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const value = decodeURIComponent(button.dataset.libraryCopy);
    const copied = () => {
      const old = button.textContent;
      button.textContent = '已复制 ✓';
      setTimeout(() => { button.textContent = old; }, 1400);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(copied).catch(() => fallbackCopy(value, copied));
    } else {
      fallbackCopy(value, copied);
    }
  });

  function fallbackCopy(value, done) {
    const area = document.createElement('textarea');
    area.value = value;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    done();
  }
})();
