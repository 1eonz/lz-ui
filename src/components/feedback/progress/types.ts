import type { ProgressProps as AntProgressProps } from 'antd';
import type { Progress as AntProgress } from 'antd';
import type { ComponentRef } from 'react';

/**
 * AntD >=5.24 的公开进度属性，覆盖 line、circle、dashboard 和 steps。
 * 总比例限制在0–100，成功分段再限制为不超过总值；NaN/Infinity 归零。
 * format 接收规范值并完整保留返回内容，成功分段不替代总 aria-valuenow。
 */
export type ProgressProps = AntProgressProps;

/** AntD 原生 div ref；挂载后可用，卸载后为 null。 */
export type ProgressRef = ComponentRef<typeof AntProgress>;
