import {json, LoaderFunction, LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, Link} from '@remix-run/react';
import {prisma} from '~/db.server';
import {Frame} from '~/components/Frame';
import {JoinName} from '~/utils/wiki';
import {ReverTypeToMessage} from '~/utils/wiki';
import {Button} from '~/stories/Button';

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 50;

    const changes = await prisma.wiki.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
        where: {
            deleted: false,
        },
        orderBy: {
            updatedAt: 'desc',
        },
        include: {
            versions: {
                take: 1,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            username: true,
                        },
                    },
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

export default function RecentChanges() {
    const {changes, page, totalPages} = useLoaderData<typeof loader>();

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-sm">
                    <h1 className="text-2xl font-bold">최근 변경</h1>
                </div>
                <div className="bg-white rounded-lg shadow-sm">
                    {changes.map((change) => (
                        <div key={change.id} className="border-b border-gray-100 p-4 hover:bg-gray-50">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Link to={`/wiki/${JoinName(change.namespace, change.title)}`} className="font-medium text-blue-600 hover:underline">
                                        {JoinName(change.namespace, change.title)}
                                    </Link>
                                    <Link to={`/wiki/${JoinName(change.namespace, change.title)}?rever=${change.rever}`} className="text-sm text-gray-500">
                                        r{change.rever}
                                    </Link>
                                    <span className="text-sm text-gray-500">{ReverTypeToMessage(change.versions[0])}</span>
                                </div>
                                <div className="ml-auto sm:ml-0 flex items-center gap-2">
                                    <Link to={`/history/${JoinName(change.namespace, change.title)}`}>
                                        <Button variant="ghost" size="sm">
                                            역사
                                        </Button>
                                    </Link>
                                    <Link to={`/diff/${JoinName(change.namespace, change.title)}?rever=${change.rever}`}>
                                        <Button variant="ghost" size="sm">
                                            비교
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {change.versions[0].log && <p className="mt-1 text-sm text-gray-600">{change.versions[0].log}</p>}

                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:justify-start justify-between">
                                <span>{change.versions[0].user?.username || change.versions[0].ipAddress || 'Unknown'}</span>
                                <span className="mx-2 hidden sm:inline">•</span>
                                <span>{new Date(change.versions[0].createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between mt-4">
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
