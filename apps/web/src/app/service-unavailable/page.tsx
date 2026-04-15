import type { Metadata } from 'next';
import { ServiceUnavailableScreen } from './service-unavailable-screen';

export const metadata: Metadata = {
  title: 'Tạm ngưng phục vụ',
  description:
    'Hệ thống tạm không phản hồi. Vui lòng thử lại sau hoặc quay về trang chủ.',
  robots: { index: false, follow: false },
};

export default function ServiceUnavailablePage() {
  return <ServiceUnavailableScreen />;
}
