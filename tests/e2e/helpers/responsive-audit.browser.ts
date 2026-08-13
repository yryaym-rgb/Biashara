/**
 * Browser-side layout audit helpers — plain JS, injected via page.addInitScript.
 * Must not use function declarations (tsx __name injection breaks page.evaluate).
 */
export const RESPONSIVE_AUDIT_INIT_SCRIPT = `
window.__biasharaResponsiveAudit = {
  describeElement(el) {
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute('role');
    const text = (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 48);
    const id = el.id ? '#' + el.id : '';
    const classes =
      el.className && typeof el.className === 'string'
        ? '.' + el.className.split(/\\s+/).slice(0, 2).join('.')
        : '';
    return [tag, role ? '[role=' + role + ']' : '', id, classes, text ? '"' + text + '"' : '']
      .filter(Boolean)
      .join(' ');
  },
  isElementVisible(el) {
    if (!(el instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return false;
    if (rect.bottom < 0 || rect.top > window.innerHeight) return false;
    if (rect.right < 0 || rect.left > window.innerWidth) return false;
    return true;
  },
  isAncestorOf(ancestor, descendant) {
    let node = descendant;
    while (node) {
      if (node === ancestor) return true;
      node = node.parentElement;
    }
    return false;
  },
  intersectionArea(a, b) {
    const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
    const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
    return xOverlap * yOverlap;
  },
  runChecks(params) {
    const audit = window.__biasharaResponsiveAudit;
    const {
      interactiveSelector,
      textSelector,
      minArea,
      minSize,
      minGap,
      isMobile,
    } = params;

    const seen = new Set();
    const elements = [
      ...document.querySelectorAll(interactiveSelector),
      ...document.querySelectorAll(textSelector),
    ];
    const boxes = [];
    for (const el of elements) {
      if (!audit.isElementVisible(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) continue;
      boxes.push({ el, rect, desc: audit.describeElement(el) });
    }

    const overlapIssues = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const boxA = boxes[i];
        const boxB = boxes[j];
        if (audit.isAncestorOf(boxA.el, boxB.el) || audit.isAncestorOf(boxB.el, boxA.el)) continue;
        const area = audit.intersectionArea(boxA.rect, boxB.rect);
        if (area < minArea) continue;
        const key = [boxA.desc, boxB.desc].sort().join('||');
        if (seen.has(key)) continue;
        seen.add(key);
        overlapIssues.push({ a: boxA.desc, b: boxB.desc, area });
      }
    }

    const tapIssues = [];
    if (isMobile) {
      const interactive = [...document.querySelectorAll(interactiveSelector)].filter(audit.isElementVisible);
      const rects = interactive.map((el) => ({
        rect: el.getBoundingClientRect(),
        desc: audit.describeElement(el),
      }));

      for (const { rect, desc } of rects) {
        if (rect.width < minSize || rect.height < minSize) {
          tapIssues.push(
            'undersized tap target (' + Math.round(rect.width) + '×' + Math.round(rect.height) + 'px): ' + desc,
          );
        }
      }

      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const rectA = rects[i];
          const rectB = rects[j];
          const horizontalGap =
            rectB.rect.x >= rectA.rect.x + rectA.rect.width
              ? rectB.rect.x - (rectA.rect.x + rectA.rect.width)
              : rectA.rect.x >= rectB.rect.x + rectB.rect.width
                ? rectA.rect.x - (rectB.rect.x + rectB.rect.width)
                : -1;
          const verticalGap =
            rectB.rect.y >= rectA.rect.y + rectA.rect.height
              ? rectB.rect.y - (rectA.rect.y + rectA.rect.height)
              : rectA.rect.y >= rectB.rect.y + rectB.rect.height
                ? rectA.rect.y - (rectB.rect.y + rectB.rect.height)
                : -1;
          const sameRow =
            horizontalGap >= 0 &&
            horizontalGap < minGap &&
            audit.intersectionArea(rectA.rect, rectB.rect) > 0;
          const sameCol =
            verticalGap >= 0 &&
            verticalGap < minGap &&
            audit.intersectionArea(rectA.rect, rectB.rect) > 0;
          if (sameRow || sameCol) {
            const gap = sameRow ? horizontalGap : verticalGap;
            tapIssues.push(
              'tap targets too close (' + Math.round(gap) + 'px gap): ' + rectA.desc + ' ↔ ' + rectB.desc,
            );
          }
        }
      }
    }

    const truncationIssues = [];
    for (const el of document.querySelectorAll('button, a, label, h1, h2, h3, [role="tab"]')) {
      if (!audit.isElementVisible(el)) continue;
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.width < 20) continue;
      const clipped = el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2;
      const ellipsis = style.textOverflow === 'ellipsis' && style.overflow === 'hidden';
      const wrapsAwkwardly =
        el instanceof HTMLElement &&
        el.tagName === 'BUTTON' &&
        el.scrollHeight > rect.height + 8 &&
        (el.textContent || '').trim().length > 0;
      if (clipped || ellipsis || wrapsAwkwardly) {
        truncationIssues.push(audit.describeElement(el));
      }
    }

    const ctaIssues = [];
    for (const cta of document.querySelectorAll('.gold-gradient, [class*="gold-gradient"]')) {
      if (!audit.isElementVisible(cta)) continue;
      const rect = cta.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) {
        ctaIssues.push('CTA outside viewport bounds: ' + audit.describeElement(cta));
        continue;
      }
      const topEl = document.elementFromPoint(cx, cy);
      if (topEl && !cta.contains(topEl) && topEl !== cta) {
        ctaIssues.push(
          'CTA covered by ' + audit.describeElement(topEl) + ': ' + audit.describeElement(cta),
        );
      }
      let parent = cta.parentElement;
      while (parent) {
        const ps = window.getComputedStyle(parent);
        if (ps.overflowX === 'hidden' || ps.overflow === 'hidden') {
          const pr = parent.getBoundingClientRect();
          if (rect.right > pr.right + 1 || rect.left < pr.left - 1) {
            ctaIssues.push('CTA clipped by overflow:hidden parent: ' + audit.describeElement(cta));
            break;
          }
        }
        parent = parent.parentElement;
      }
    }

    return {
      overlapIssues: overlapIssues.slice(0, 12),
      tapIssues: tapIssues.slice(0, 15),
      truncationIssues: truncationIssues.slice(0, 10),
      ctaIssues: ctaIssues.slice(0, 8),
    };
  },
};
`;
