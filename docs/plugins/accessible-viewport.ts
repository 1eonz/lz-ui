type HtmlDocument = (selector: string) => {
  length: number;
  attr: (name: string, value: string) => unknown;
};

type PluginApi = {
  modifyHTML: (callback: (html: HtmlDocument) => HtmlDocument) => void;
};

/**
 * Dumi 2.4.49 的默认 viewport 会限制用户放大文档。
 * 在 HTML 生成阶段替换唯一声明，保证静态页、开发页和 demo iframe 都能缩放。
 */
export default function accessibleViewport(api: PluginApi) {
  api.modifyHTML((html) => {
    const viewport = html('meta[name="viewport"]');

    if (viewport.length !== 1) {
      throw new Error(`预期唯一 viewport meta，实际找到 ${viewport.length} 个`);
    }

    viewport.attr('content', 'width=device-width, initial-scale=1.0');
    return html;
  });
}
