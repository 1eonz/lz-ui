import { useState, useSyncExternalStore } from 'react';
import { Button, Descriptions } from 'lx-ui';
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
  return 'horizontal';
}

function useResponsiveDescriptionsLayout(): 'horizontal' | 'vertical' {
  return useSyncExternalStore(
    subscribeToDescriptionsViewport,
    getDescriptionsLayout,
    getServerDescriptionsLayout,
  );
}

export default function DescriptionsDemo() {
  const [long, setLong] = useState(false);
  const layout = useResponsiveDescriptionsLayout();
  const vertical = layout === 'vertical';

  return (
    <DataDisplayDemoFrame demoId="descriptions-long-demo">
      <Button onClick={() => setLong((value) => !value)}>
        {long ? '恢复摘要' : '显示完整合同说明'}
      </Button>
      <Descriptions
        title="战略合作框架协议核心履约项"
        column={1}
        layout={layout}
        styles={{
          // 中文注释：沿用设计稿 12 列网格的 4:8 比例；这里只作为可交互示例，不改变组件默认值。
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
          {
            key: 'note',
            label: '合同履约说明',
            children: long
              ? '本协议涵盖华东、华南与华北区域的智能制造设备采购、安装调试及售后维护。供应商须在接到服务请求后四小时内响应，并在一个工作日内提交包含责任人、预计完成日期及验收依据的整改记录。每季度由双方复核服务等级、故障响应时限和备件库存；未经采购方书面同意，不得转包核心维护工作。合同附件、验收记录与主协议具有同等效力，争议处理依照双方签署的补充条款执行。'
              : '设备采购、安装调试与售后维护框架协议；摘要内容可展开查看。',
          },
        ]}
      />
    </DataDisplayDemoFrame>
  );
}
