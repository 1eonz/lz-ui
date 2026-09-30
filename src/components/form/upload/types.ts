import type { UploadProps } from 'antd';
import type { UploadRef } from 'antd/es/upload/Upload';

/** AntD Upload props; requests occur only when the host supplies action/customRequest. */
export type LxUploadProps = UploadProps;
/** Public upload handle for focus and file dialog control. */
export type LxUploadRef = UploadRef;
