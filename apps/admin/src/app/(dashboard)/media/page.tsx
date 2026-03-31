import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaManager } from '@/components/media/media-manager';

export default function MediaPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Media" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thư viện media</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaManager />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
