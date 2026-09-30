import type { PaginationProps as AntPaginationProps } from 'antd';

/** Ant Design 5 pagination props, kept intact so controlled and uncontrolled modes behave natively. */
export type PaginationProps = AntPaginationProps;

/** The public AntD pagination root is an unordered list element. */
export type PaginationRef = HTMLUListElement;
