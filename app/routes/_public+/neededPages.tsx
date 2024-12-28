import {json, LoaderFunction, LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, Link, useRevalidator} from '@remix-run/react';
import {Frame} from '~/components/frame';
import {Button} from '~/components/ui/button';
import {neededPages, neededPagesLength} from '~/cache.server';
import {urlEncoding} from '~/utils/url-encoding';

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 50;

    const changes = neededPages.slice((page - 1) * pageSize, page * pageSize);

    const totalPages = Math.ceil(neededPagesLength / pageSize);

    return json({
        changes,
        page,
        totalPages,
    });
}

export default function NeededPages() {
    const {changes, page, totalPages} = useLoaderData<typeof loader>();

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="mb-6 flex items-center justify-between rounded-lg">
                    <h1 className="text-2xl font-bold">작성이 필요한 문서</h1>
                </div>
                <div className="rounded-lg bg-background shadow-sm">
                    {changes.map((change) => (
                        <div key={change} className="border-b border-border p-4 hover:bg-muted">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 justify-between">
                                    <Link to={`/wiki/${urlEncoding(change)}`} className="font-medium text-blue-600 hover:underline">
                                        {change}
                                    </Link>
                                    <Link to={`/backlink/${urlEncoding(change)}`} className="font-medium text-blue-600 hover:underline">
                                        <Button variant="ghost">역링크</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="mt-4 flex justify-between">
                        {page > 1 && (
                            <Link to={`?page=${page - 1}`}>
                                <Button variant="ghost">이전</Button>
                            </Link>
                        )}
                        <span className="py-2">
                            {page} / {totalPages}
                        </span>
                        {page < totalPages && (
                            <Link to={`?page=${page + 1}`}>
                                <Button variant="ghost">다음</Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </Frame>
    );
}