import './shapy-bg.js';

export * from './catalog.js';
export { createSeed } from './seed.js';

export function createShapy() {
  return {
    mount(container, options = {}) {
      if (!container) return null;
      container.replaceChildren();
      const element = document.createElement('shapy-background');
      if (typeof element.setOptions === 'function') element.setOptions(options);
      container.appendChild(element);
      return element;
    }
  };
}
