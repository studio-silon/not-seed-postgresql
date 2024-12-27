import {json, LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, Link} from '@remix-run/react';
import {prisma} from '~/db.server';
import {Frame} from '~/components/frame';
import {JoinName} from '~/utils/wiki';
import {Button} from '~/components/ui/button';
import {urlEncoding} from '~/utils/url-encoding';

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 50;

    const changes = await prisma.wiki.findMany({
        where: {
            isRedirect: false,
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: {
            content: 'asc',
        },
        select: {
            id: true,
            rever: true,
            namespace: true,
            title: true,
            /*char_count: {
                select: {
                    _count: {
                        content: true,
                    },
                },
            },*/
        },
    });

    const totalChanges = await prisma.wiki.count({
        where: {
            deleted: false,
        },
    });
    const totalPages = Math.ceil(totalChanges / pageSize);

    return json({
        changes,
        page,
        totalPages,
    });
}

export default function ShortestPages() {
    const {changes, page, totalPages} = useLoaderData<typeof loader>();

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="mb-6 flex items-center justify-between rounded-lg">
                    <h1 className="text-2xl font-bold">내용이 짧은 문서</h1>
                </div>
                <div className="rounded-lg bg-background shadow-sm">
                    {changes.map((change) => {
                        const url = urlEncoding(JoinName(change.namespace, change.title));

                        return (
                            <div key={change.id} className="border-b border-border p-4 hover:bg-muted">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 justify-between">
                                        <Link to={`/wiki/${url}`} className="font-medium text-blue-600 hover:underline">
                                            {JoinName(change.namespace, change.title)}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
