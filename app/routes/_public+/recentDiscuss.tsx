import {json, LoaderFunction, LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, Link, useRevalidator} from '@remix-run/react';
import {prisma} from '~/db.server';
import {Frame} from '~/components/frame';
import {JoinName} from '~/utils/wiki';
import {Button} from '~/components/ui/button';
import {MessageSquare, Lock} from 'lucide-react';
import {useEffect} from 'react';
import {UserPopover} from '~/components/user-popover';
import {urlEncoding} from '~/utils/url-encoding';

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 50;

    const discussions = await prisma.discussion.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            wiki: {
                select: {
                    namespace: true,
                    title: true,
                },
            },
            user: {
                select: {
                    username: true,
                },
            },
        },
    });

    const totalDiscussions = await prisma.discussion.count();
    const totalPages = Math.ceil(totalDiscussions / pageSize);

    return json({
        discussions,
        page,
        totalPages,
    });
}

export default function RecentDiscussions() {
    const {discussions, page, totalPages} = useLoaderData<typeof loader>();

    const revalidator = useRevalidator();

    useEffect(() => {
        const timer = setInterval(() => {
            revalidator.revalidate();
        }, 10000);

        return () => {
            clearInterval(timer);
        };
    }, [revalidator]);

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">최근 토론</h1>
                </div>

                <div className="bg-background rounded-lg shadow-sm">
                    {discussions.map((discussion) => (
                        <div key={discussion.id} className="border-b border-border p-4 hover:bg-muted">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Link to={`/wiki/${urlEncoding(JoinName(discussion.wiki.namespace, discussion.wiki.title))}`} className="text-sm text-gray-600 hover:underline">
                                        {JoinName(discussion.wiki.namespace, discussion.wiki.title)}
                                    </Link>
                                    <span className="text-gray-400">•</span>
                                    <Link to={`/thread/${discussion.id}`} className="font-medium text-blue-600 hover:underline">
                                        {discussion.title}
                                    </Link>
                                    {discussion.status === 0 && <Lock className="h-4 w-4 text-gray-500" />}
                                </div>
                            </div>

                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:justify-start justify-between">
                                <UserPopover username={discussion.user?.username} ip={discussion.ipAddress ?? '0.0.0.0'} />
                                <span className="mx-2 hidden sm:inline">•</span>
                                <span>{formatDate(discussion.createdAt)}</span>
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
