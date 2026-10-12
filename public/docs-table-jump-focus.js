(() => {
  const findMainContent = () => {
    const main = document.querySelector('main');
    if (!(main instanceof HTMLElement)) return null;

    // Dumi 的 main 同时包含侧栏和正文；将焦点交给 article 才能跳过重复导航。
    const content = main.querySelector('article') ?? main.querySelector('.dumi-default-content');
    if (!(content instanceof HTMLElement)) return null;

    return content;
  };

  const resolveMainTarget = () => {
    const content = findMainContent();
    if (!content) return null;

    if (!content.id) content.id = 'lx-docs-main-content';
    if (!content.hasAttribute('tabindex')) content.tabIndex = -1;
    content.classList.add('lx-docs-main-content');

    const heading = content.querySelector('h1');
    if (heading instanceof HTMLElement) {
      if (!heading.id) heading.id = 'lx-docs-main-heading';
      // 路由切换可能复用正文容器；每次解析都重绑当前页面标题，避免沿用旧页面名称。
      content.setAttribute('aria-labelledby', heading.id);
      content.removeAttribute('aria-label');
    } else {
      content.removeAttribute('aria-labelledby');
      content.setAttribute('aria-label', '主要内容');
    }

    return content;
  };

  let observedMain = null;
  let observedContent = null;
  let observedHeading = null;
  let mainContentObserver = null;
  let initialTabPending = true;

  const observeMainContent = (main, content, heading) => {
    mainContentObserver?.disconnect();
    observedMain = main;
    observedContent = content;
    observedHeading = heading;

    if (!(main instanceof HTMLElement)) {
      mainContentObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
      return;
    }

    const observeChildChanges = (target) => {
      if (target instanceof HTMLElement) {
        mainContentObserver.observe(target, { childList: true });
      }
    };

    observeChildChanges(main.parentElement);
    if (content instanceof HTMLElement) {
      observeChildChanges(content.parentElement);
      observeChildChanges(content);
    }

    if (!(heading instanceof HTMLElement)) {
      const pendingTarget = content ?? main;
      mainContentObserver.observe(pendingTarget, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      return;
    }

    observeChildChanges(heading.parentElement);
    mainContentObserver.observe(heading, {
      attributes: true,
      attributeFilter: ['id'],
      childList: true,
      characterData: true,
      subtree: true,
    });
  };

  mainContentObserver = new MutationObserver(() => {
    const currentMain = document.querySelector('main');
    const currentContent = findMainContent();
    const currentHeading = currentContent?.querySelector('h1') ?? null;
    if (
      currentMain !== observedMain ||
      currentContent !== observedContent ||
      currentHeading !== observedHeading
    ) {
      observeMainContent(currentMain, currentContent, currentHeading);
    }
    resolveMainTarget();
  });

  const ensureSkipLink = () => {
    if (!document.body) return null;

    let skipLink = document.querySelector('a.lx-docs-skip-link');
    if (!(skipLink instanceof HTMLAnchorElement)) {
      const link = document.createElement('a');
      link.href = '#lx-docs-main-content';
      link.className = 'lx-docs-skip-link';
      document.body.prepend(link);
      skipLink = link;
    }

    // 无障碍名称包含可见短文案和完整目标含义，确保标签名称符合可见名称要求。
    if (skipLink.textContent !== '跳至正文') skipLink.textContent = '跳至正文';
    if (skipLink.getAttribute('aria-label') !== '跳至正文，跳转到主要内容') {
      skipLink.setAttribute('aria-label', '跳至正文，跳转到主要内容');
    }

    return skipLink;
  };

  const addSkipLink = () => {
    // 跳转入口不依赖 Dumi 正文；正文尚未渲染时也应先进入浏览器的原生 Tab 顺序。
    const skipLink = ensureSkipLink();
    const main = resolveMainTarget();
    if (!skipLink || !main) return false;

    observeMainContent(document.querySelector('main'), main, main.querySelector('h1'));
    return true;
  };

  const handleInitialTab = (event) => {
    if (
      event.key !== 'Tab' ||
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      !initialTabPending
    ) {
      return;
    }
    if (event.shiftKey || document.activeElement !== document.body) return;

    // keydown 默认行为会在监听器返回后移动焦点；缺链时必须在同一事件中补建并接管，避免越过入口。
    const skipLink = ensureSkipLink();
    if (!skipLink) return;

    event.preventDefault();
    skipLink.focus();
    initialTabPending = false;
  };

  const focusMainWhenReady = () => {
    let observer = null;
    let timeoutId;

    const stopObserving = () => {
      observer?.disconnect();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };

    const tryFocus = () => {
      const main = resolveMainTarget();
      if (!main || !(main.querySelector('h1') instanceof HTMLElement)) return false;

      main.scrollIntoView({ block: 'start', behavior: 'instant' });
      main.focus({ preventScroll: true });
      return true;
    };

    if (tryFocus()) return;

    observer = new MutationObserver(() => {
      if (tryFocus()) stopObserving();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    timeoutId = window.setTimeout(stopObserving, 5_000);
  };

  const handleJumpClick = (event) => {
    if (
      event.button !== 0 ||
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !(event.target instanceof Element)
    ) {
      return;
    }

    const skipLink = event.target.closest('a.lx-docs-skip-link');
    if (skipLink instanceof HTMLAnchorElement) {
      window.requestAnimationFrame(focusMainWhenReady);
      return;
    }

    const link = event.target.closest('a.lx-docs-table-jump');
    if (!(link instanceof HTMLAnchorElement)) return;

    const targetUrl = new URL(link.href, window.location.href);
    if (
      targetUrl.origin !== window.location.origin ||
      targetUrl.pathname !== window.location.pathname ||
      !targetUrl.hash
    ) {
      return;
    }

    const targetId = decodeURIComponent(targetUrl.hash.slice(1));
    window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;

      target.scrollIntoView({ block: 'start', behavior: 'instant' });
      target.focus({ preventScroll: true });
    });
  };

  const handleApiTableKeydown = (event) => {
    if (
      (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      !(event.target instanceof Element)
    ) {
      return;
    }

    const region = event.target.closest(
      '.lx-docs-table, .lx-empty-api-table, .lx-skeleton-api-table',
    );
    if (!(region instanceof HTMLElement)) return;

    const maxScrollLeft = region.scrollWidth - region.clientWidth;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextScrollLeft = Math.min(maxScrollLeft, Math.max(0, region.scrollLeft + direction * 64));
    if (nextScrollLeft === region.scrollLeft) return;

    event.preventDefault();
    region.scrollLeft = nextScrollLeft;
  };

  // Dumi 的客户端根节点最初为空；等 React 提交 main 后再注入链接，避免过早检查而漏掉目标。
  if (!addSkipLink()) {
    const observer = new MutationObserver(() => {
      if (addSkipLink()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  document.addEventListener('click', handleJumpClick, true);
  document.addEventListener('keydown', handleInitialTab, true);
  document.addEventListener('keydown', handleApiTableKeydown);
})();
