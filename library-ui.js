(function () {
  const source = window.handbookLibraryData;
  if (!source) return;

  const libraries = new Map(source.questions.map(library => [library.id, library]));
  libraries.set('happinessFamilyAnswers', source.family);
  libraries.set('sixMinuteCollection', source.minutes);
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

  function linesHtml(lines) {
    return lines.map((line, index) => `<div class="library-line"><span class="library-line-no">${index + 1}</span><p>${escapeHtml(line)}</p>${copyButton(line)}</div>`).join('');
  }

  function cardHtml(item) {
    const groups = item.questions
      ? [{ title: '互动问句', lines: item.questions }, { title: '课后作业', lines: item.homework || [] }]
      : [{ title: '', lines: item.lines || [] }];
    const wholeText = [item.category, item.title, ...groups.flatMap(group => [group.title, ...group.lines.map((line, index) => `${index + 1}. ${line}`)])].filter(Boolean).join('\n');
    return `<article class="library-card"><span class="library-category">${escapeHtml(item.category)}</span><div class="library-card-head"><h4>${escapeHtml(item.title)}</h4>${copyButton(wholeText, '整条复制')}</div>${groups.map(group => `${group.title ? `<h5 class="library-group-title">${group.title}</h5>` : ''}${linesHtml(group.lines)}`).join('')}</article>`;
  }

  function render(view) {
    const state = view.libraryState;
    const query = state.search.value.trim().toLowerCase();
    const matches = state.entries.filter(item => (state.category === '全部' || item.category === state.category) && (!query || item.searchText.includes(query)));
    state.results.innerHTML = matches.slice(0, state.limit).map(cardHtml).join('') || '<p class="library-meta">没有找到相关内容，换个词试试。</p>';
    state.meta.textContent = `共 ${matches.length} 条，当前显示 ${Math.min(state.limit, matches.length)} 条`;
    state.more.hidden = matches.length <= state.limit;
    state.filters.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.category === state.category));
  }

  function init(view) {
    if (!view || view.libraryState) return;
    const library = libraries.get(view.dataset.libraryView);
    if (!library) return;
    const entries = entriesFor(library);
    const categories = ['全部', ...new Set(entries.map(item => item.category))];
    const filters = view.querySelector('.library-filter');
    filters.innerHTML = categories.map(category => `<button type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
    view.libraryState = {
      entries,
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
  }

  document.addEventListener('click', event => {
    const submodule = event.target.closest('[data-submodule-link]');
    if (submodule) init(document.getElementById(submodule.dataset.submoduleLink)?.querySelector('[data-library-view]'));
    const button = event.target.closest('[data-library-copy]');
    if (!button) return;
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
