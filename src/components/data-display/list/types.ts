import type { ListProps as AntListProps } from 'antd';
/** 泛型列表属性；rowKey 和稳定 key 由调用者的项目数据提供。 */
export type ListProps<T> = AntListProps<T>;
