import EmptyDemo from './empty';
import SkeletonDemo from './skeleton';

/** 旧组合入口复用独立页面的示例，避免创建和重试行为在两处产生差异。 */
export default function EmptySkeletonDemo() {
  return (
    <>
      <EmptyDemo />
      <SkeletonDemo />
    </>
  );
}
