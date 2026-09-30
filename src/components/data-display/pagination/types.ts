import type { PaginationProps as AntPaginationProps } from 'antd';

/** 沿用 AntD 分页参数，保留受控和非受控模式，不额外推算业务总数。 */
export type PaginationProps = AntPaginationProps;

/** 实际分页 ul；隐藏和卸载时为 null，多 React 根需设置不同 identifierPrefix。 */
export type PaginationRef = HTMLUListElement;
