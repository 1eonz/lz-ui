import type { CustomRenderer, FormRendererRegistry } from './types';

const globalRenderers = new Map<string, CustomRenderer>();

/**
 * 默认注册表保持精简和显式；应用需要隔离独立部署的表单时，
 * 可向 DynamicForm 传入局部注册表。
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
