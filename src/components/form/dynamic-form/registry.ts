import type { CustomRenderer, FormRendererRegistry } from './types';

const globalRenderers = new Map<string, CustomRenderer>();

/**
 * The default registry is intentionally tiny and explicit. A local registry can be passed to
 * DynamicForm when an application needs isolation between independently deployed forms.
 */
export const defaultRendererRegistry: FormRendererRegistry = {
  register(name, renderer) {
    globalRenderers.set(name, renderer);
  },
  resolve(name) {
    return globalRenderers.get(name);
  },
};

export function registerRenderer(name: string, renderer: CustomRenderer): void {
  defaultRendererRegistry.register(name, renderer);
}

export function resolveRenderer(
  name?: string,
  registry = defaultRendererRegistry,
): CustomRenderer | undefined {
  return name ? registry.resolve(name) : undefined;
}
