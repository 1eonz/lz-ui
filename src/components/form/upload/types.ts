import type { UploadProps } from 'antd';
import type { UploadRef } from 'antd/es/upload/Upload';

/** AntD Upload 属性；仅在宿主提供 action/customRequest 时发起请求。 */
export type LxUploadProps = UploadProps;
/** AntD 公开上传实例；挂载期间可读 nativeElement/fileList，文件选择由实际触发控件负责。 */
export type LxUploadRef = UploadRef;
