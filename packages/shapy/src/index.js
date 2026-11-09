import './shapy-bg.js';

export * from './catalog.js';
export { createSeed } from './seed.js';

function toAttributeName(name) {
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

export function createShapy() {
  return {
    mount(container, options = {}) {
      if (!container) return null;
      container.replaceChildren();
      const element = document.createElement('shapy-background');
      for (const [key, value] of Object.entries(options)) {
        if (value === undefined || value === null || value === false) continue;
        const attribute = toAttributeName(key);
        if (value === true) {
          element.setAttribute(attribute, '');
        } else if (typeof value === 'object') {
          element.setAttribute(attribute, JSON.stringify(value));
        } else {
          element.setAttribute(attribute, String(value));
        }
      }
      container.appendChild(element);
      return element;
    }
  };
}
