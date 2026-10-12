import { useSyncExternalStore } from 'react';
import { Descriptions } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

const narrowViewportQuery = '(max-width: 575px)';

function subscribeToDescriptionsViewport(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const mediaQuery = window.matchMedia(narrowViewportQuery);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

function getDescriptionsLayout(): 'horizontal' | 'vertical' {
  return typeof window !== 'undefined' && window.matchMedia(narrowViewportQuery).matches
    ? 'vertical'
    : 'horizontal';
}

function getServerDescriptionsLayout(): 'horizontal' {
  // 中文注释：服务端与 hydration 首帧统一用横向布局，挂载后再同步窄屏媒体查询结果。
  return 'horizontal';
}

function useResponsiveDescriptionsLayout(): 'horizontal' | 'vertical' {
  return useSyncExternalStore(
    subscribeToDescriptionsViewport,
    getDescriptionsLayout,
    getServerDescriptionsLayout,
  );
}

export default function DescriptionsBasicDemo() {
  const layout = useResponsiveDescriptionsLayout();
  const vertical = layout === 'vertical';

  return (
    <DataDisplayDemoFrame demoId="descriptions-basic-demo">
      <Descriptions
        title="战略合作框架协议核心履约项"
        column={1}
        layout={layout}
        styles={{
          // 中文注释：设计稿按 12 列网格分配标签 4 列、值 8 列；此比例仅供 demo 展示，不改变组件默认布局。
          label: { width: vertical ? '100%' : '33.333%', minWidth: 0 },
          content: {
            width: vertical ? '100%' : '66.667%',
            minWidth: 0,
            overflowWrap: 'anywhere',
          },
        }}
        items={[
          { key: 'uid', label: '协议系统全局 UID', children: 'CTR-2024-GLOBAL-09941' },
          { key: 'supplier', label: '签约主体机构', children: '深蓝智造工业互联科技有限公司' },
          {
            key: 'terms',
            label: '结算条款与 SLA 级别',
            children: 'NET 60 天月结 · Tier-1 战略合作方',
          },
          {
            key: 'deposit',
            label: '履约保证金账户状态',
            children: '¥ 5,000,000.00（足额质押）',
          },
          {
            key: 'legal-signature',
            label: '首席法务审计签名状态',
            children: '周铭轩 · CA 数字证书已验签',
          },
        ]}
      />
    </DataDisplayDemoFrame>
  );
}
