/** 描述 HTML 标签中参与静态资源校验的属性引用。 */
export interface DocsExportReference {
  name: 'href' | 'src';
  value: string;
}

/** 描述静态文档导出校验结果，错误数组为空表示文件结构检查通过。 */
export interface DocsExportValidationResult {
  htmlCount: number;
  checkedReferences: number;
  nestedDemoPageCount: number;
  errors: string[];
}

/** 静态导出校验选项。 */
export interface DocsExportValidationOptions {
  /** 在内置必需页面之外继续校验这些相对路径。 */
  requiredPages?: readonly string[];
}

/** 必须随文档站一同导出的组件页和关键 demo 页。 */
export declare const requiredDocsExportPages: readonly string[];

/** 隔离构建使用的集中必需页面集合。 */
export declare const requiredDocsExportPageSets: Readonly<{
  'empty-skeleton': readonly string[];
}>;

/** 使用 HTML5 解析规则抽取标签中的 href/src 属性，忽略注释和原始文本内容。 */
export declare function extractReferences(html: string): DocsExportReference[];

/** 校验指定 docs-dist 目录中的必需页面、demo 和本地 JS/CSS 资源引用。 */
export declare function validateDocsExport(
  docsDistPath?: string,
  options?: DocsExportValidationOptions,
): Promise<DocsExportValidationResult>;
