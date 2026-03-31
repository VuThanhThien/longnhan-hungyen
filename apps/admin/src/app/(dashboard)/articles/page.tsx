import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminFetch } from '@/lib/admin-api-client';
import { toList } from '@/lib/admin-data';
import { formatDateShort } from '@/lib/utils';
import type { Article } from '@longnhan/types';

async function deleteArticleAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  if (!id) return;

  await adminFetch(`/articles/${id}`, { method: 'DELETE' });
  revalidatePath('/articles');
}

export default async function ArticlesPage() {
  const rawArticles = await adminFetch<unknown>('/articles/admin?page=1&limit=50').catch(() => []);
  const articles = toList<Article>(rawArticles);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Bài viết" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh sách bài viết ({articles.length})</CardTitle>
            <Link href="/articles/new" className="inline-flex h-9 items-center rounded-md bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700">
              + Thêm bài viết
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>{article.title}</TableCell>
                    <TableCell>{article.status}</TableCell>
                    <TableCell>{formatDateShort(article.updatedAt)}</TableCell>
                    <TableCell className="space-x-3">
                      <Link href={`/articles/${article.id}/edit`} className="text-sm text-green-700 hover:underline">
                        Sửa
                      </Link>
                      <form action={deleteArticleAction} className="inline">
                        <input type="hidden" name="id" value={article.id} />
                        <button className="text-sm text-red-600 hover:underline">Xóa</button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
                {articles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                      Chưa có bài viết
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
