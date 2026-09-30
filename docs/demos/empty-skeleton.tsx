import EmptyDemo from './empty';
import SkeletonDemo from './skeleton';

/** Legacy combination entry reuses the working specimens from the dedicated
 * pages, so creation and retry actions cannot drift between demonstrations. */
export default function EmptySkeletonDemo() {
  return (
    <>
      <EmptyDemo />
      <SkeletonDemo />
    </>
  );
}
