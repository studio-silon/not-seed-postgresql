import {json, LoaderFunction, LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, Link, useRevalidator} from '@remix-run/react';
import {prisma} from '~/db.server';
import {Frame} from '~/components/frame';
import {JoinName} from '~/utils/wiki';
import {ReverTypeToMessage} from '~/utils/wiki';
import {Button} from '~/components/ui/button';
import {useEffect} from 'react';
import {UserPopover} from '~/components/user-popover';
import {ReverMiniDiff} from '~/components/rever-mini-diff';
import {urlEncoding} from '~/utils/url-encoding';

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 50;

    const changes = await prisma.wiki.findMany({
        where: {isRedirect: false},
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: {
            updatedAt: 'asc',
        },
        select: {
            id: true,
            rever: true,
            namespace: true,
            title: true,
            versions: {
                take: 1,
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    user: {
                        select: {
                            username: true,
                        },
                    },
                    added: true,
                    removed: true,
                    log: true,
                    createdAt: true,
                    ipAddress: true,
                    type: true,
                    data: true,
                },
            },
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

export default function OldPages() {
    const {changes, page, totalPages} = useLoaderData<typeof loader>();

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="mb-6 flex items-center justify-between rounded-lg">
                    <h1 className="text-2xl font-bold">오래된 문서들</h1>
                </div>
                <div className="rounded-lg bg-background shadow-xs">
                    {changes
                        .filter((change) => change.versions[0])
                        .map((change) => (
                            <div key={change.id} className="border-b border-border p-4 hover:bg-muted">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <Link to={`/wiki/${urlEncoding(JoinName(change.namespace, change.title))}`} className="font-medium text-blue-600 hover:underline">
                                            {JoinName(change.namespace, change.title)}
                                        </Link>
                                        <Link to={`/wiki/${urlEncoding(JoinName(change.namespace, change.title))}?rever=${change.rever}`} className="text-sm text-gray-500">
                                            r{change.rever}
                                        </Link>
                                        {change.versions[0].type !== 0 && <span className="text-sm text-gray-500">{ReverTypeToMessage(change.versions[0])}</span>}
                                        <ReverMiniDiff rever={change.versions[0]} />
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 sm:ml-0">
                                        <Link to={`/history/${urlEncoding(JoinName(change.namespace, change.title))}`}>
                                            <Button variant="ghost" size="sm">
                                                역사
                                            </Button>
                                        </Link>
                                        <Link to={`/diff/${urlEncoding(JoinName(change.namespace, change.title))}?rever=${change.rever}`}>
                                            <Button variant="ghost" size="sm">
                                                비교
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {change.versions[0].log && <p className="mt-1 text-sm text-gray-600">{change.versions[0].log}</p>}

                                <div className="mt-2 flex items-center justify-between text-sm text-gray-500 sm:justify-start">
                                    <UserPopover username={change.versions[0].user?.username} ip={change.versions[0].ipAddress ?? '0.0.0.0'} />
                                    <span className="mx-2 hidden sm:inline">•</span>
                                    <span>{new Date(change.versions[0].createdAt).toLocaleString()}</span>
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
