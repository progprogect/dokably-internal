export const showLinkPanelIfNeeded = (element: Element) => {
  if (!element) return;
  if (element.tagName !== 'A') return;

  setTimeout(() => {
    element.dispatchEvent(new Event('click'));
  }, 120);
};
