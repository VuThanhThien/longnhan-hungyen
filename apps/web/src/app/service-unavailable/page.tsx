import { buildSeoMetadata } from '@/lib/seo';
import { ServiceUnavailableScreen } from './service-unavailable-screen';

export const metadata = buildSeoMetadata({
  title: 'Tạm ngưng phục vụ',
  description:
    'Hệ thống nhanhunguyen.com tạm không phản hồi. Vui lòng thử lại sau hoặc quay về trang chủ.',
  canonicalPath: '/service-unavailable',
  robots: { index: false, follow: false },
});

export default function ServiceUnavailablePage() {
  return <ServiceUnavailableScreen />;
}
