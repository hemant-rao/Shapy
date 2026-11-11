import './shapy-bg.js';

export * from './catalog.js';
export { createSeed } from './seed.js';

/**
 * Composition and timeline engine version. The seed-stability contract scopes
 * pixel-identical output to the same engine version and major package version.
 */
export const SHAPY_ENGINE_VERSION = 1;

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
