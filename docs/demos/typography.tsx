import '../../src/style.css';
import { LxConfigProvider, Link, Paragraph, Text, Title } from '../../src';

export default function TypographyDemo() {
  return (
    <LxConfigProvider>
      <div style={{ maxInlineSize: 520 }}>
        <Title level={2}>客户资料</Title>
        <Paragraph type="secondary">把清晰的标题、正文和操作放在稳定的阅读层级中。</Paragraph>
        <Paragraph ellipsis={{ rows: 2 }}>
          客户资料包含名称、联系人、所属行业及最近一次跟进记录。文本过长时按指定行数截断，避免挤压旁边的操作。
        </Paragraph>
        <Text copyable={{ text: 'KH-1024' }}>KH-1024</Text>
        <span style={{ marginInline: 'var(--lx-space-lg)' }}>
          <Link href="#customer">查看客户</Link>
        </span>
      </div>
    </LxConfigProvider>
  );
}
