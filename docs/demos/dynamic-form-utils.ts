import type { DynamicFormRef } from '../../src';

// 稳定定位公开 className 命中的控件根节点，不读取第三方控件内部结构。
export const dynamicFormTouchTargetClassName = 'lx-docs-dynamic-form-touch-target';

type DynamicFormInstance = DynamicFormRef['form'];
type DynamicFormFieldName = Parameters<DynamicFormInstance['scrollToField']>[0];

/**
 * 让校验字段或新建流程的焦点落在文档吸顶导航下方；Ant Design 的公开
 * scrollToField behavior 提供滚动容器和目标位置，页面滚动时扣除可见顶栏，
 * 内嵌滚动容器仍沿用原位置，避免把 Dumi 页面布局假设带进表单控件。
 */
export function scrollDynamicFormFieldIntoView(
  form: DynamicFormInstance | undefined,
  name: DynamicFormFieldName,
): void {
  const header = document.querySelector<HTMLElement>('.dumi-default-header');
  const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom ?? 0);

  form?.scrollToField(name, {
    focus: true,
    // Form.Item 的标签位于控件上方；start 会让标签落入吸顶栏覆盖区，居中可同时保留两者。
    block: 'center',
    scrollMode: 'always',
    behavior: (actions) =>
      actions.forEach(({ el, top, left }) => {
        const page = el === document.scrollingElement;
        el.scrollTo({
          top: page ? Math.max(0, top - headerBottom) : top,
          left,
          behavior: 'auto',
        });
      }),
  });
}
