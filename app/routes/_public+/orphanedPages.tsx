import {json, LoaderFunctionArgs} from '@remix-run/node';
import {Link,useLoaderData} from '@remix-run/react';

import {Button} from '~/components/ui/button';

import {Frame} from '~/components/frame';

import {orphanedPages, orphanedPagesLength} from '~/cache.server';
import {urlEncoding} from '~/utils/url-encoding';

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 50;

    const changes = orphanedPages.slice((page - 1) * pageSize, page * pageSize);

    const totalPages = Math.ceil(orphanedPagesLength / pageSize);

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
                    <h1 className="text-2xl font-bold">고립된 문서</h1>
                </div>
                <div className="rounded-lg bg-background shadow-xs">
                    {changes.map((change) => (
                        <div key={change.fullName} className="border-b border-border p-4 hover:bg-muted">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 justify-between">
                                    <Link to={`/wiki/${urlEncoding(change.fullName)}`} className="font-medium text-blue-600 hover:underline">
                                        {change.fullName}
                                    </Link>
                                    <Link to={`/backlink/${urlEncoding(change.fullName)}`} className="font-medium text-blue-600 hover:underline">
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
