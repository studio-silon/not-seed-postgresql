import React from 'react';
import {json, LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, Link, useNavigate} from '@remix-run/react';
import {Button} from '~/components/ui/button';
import {Frame} from '~/components/frame';
import {getUser} from '~/utils/sessions.server';
import {ArrowLeft} from 'lucide-react';
import {prisma} from '~/db.server';
import {User} from '~/system/.server/user';
import metaTitle from '~/utils/meta';
import {JoinName} from '~/utils/wiki';
import {UserPopover} from '~/components/user-popover';

export const meta = metaTitle<typeof loader>(() => `Permission History`);

interface PermissionHistoryEntry {
    id: number;
    target: string | null;
    targetType: string | null;
    range: string | null;
    targetUser: {
        username: string;
    } | null;
    targetPage: {
        title: string;
        namespace: string;
    } | null;
    targetIp: string | null;
    action: string;
    type: number;
    log: string | null;
    createdAt: string;
    user: {
        username: string;
    };
}

function getTypeMessage(type: number): string {
    switch (type) {
        case 0:
            return '사용자 관리';
        case 1:
            return '권한 추가';
        case 2:
            return '권한 제거';
        case 3:
            return 'ACL 추가';
        case 4:
            return 'ACL 제거';
        default:
            return '알 수 없음';
    }
}

function formatHistoryEntry(entry: PermissionHistoryEntry): React.ReactNode {
    const actor = entry.user.username;
    const typeMsg = getTypeMessage(entry.type);

    if (entry.targetUser && entry.targetType === 'group') {
        return (
            <span>
                <UserPopover username={actor} ip={'0.0.0.0'} />
                님이 <UserPopover username={entry.targetUser.username} ip={'0.0.0.0'} />
                님을 {entry.action} 그룹에 {entry.type === 1 ? '추가' : '제거'}
            </span>
        );
    }

    if (entry.action === 'batchRevert') {
        if (entry.targetUser) {
            return (
                <span>
                    <UserPopover username={actor} ip={'0.0.0.0'} />
                    님이 <UserPopover username={entry.targetUser.username} ip={'0.0.0.0'} />
                    님의 {entry.target !== 'Invalid Date' ? `${entry.target}부터의 ` : ''}모든 행위를 일괄 되돌리기 했습니다.
                </span>
            );
        }

        return (
            <span>
                <UserPopover username={actor} ip={'0.0.0.0'} />
                님이 <UserPopover ip={entry.targetIp || '0.0.0.0'} /> 님의 {entry.target !== 'Invalid Date' ? `${entry.target}부터의 ` : ''}모든 행위를 일괄 되돌리기 했습니다.
            </span>
        );
    }

    if (entry.targetUser) {
        return (
            <span>
                <UserPopover username={actor} ip={'0.0.0.0'} />
                님이 <UserPopover username={entry.targetUser.username} ip={'0.0.0.0'} />
                {entry.type === 2 ? '님의' : '님에게'} {entry.action} {typeMsg}
            </span>
        );
    }

    if (entry.targetPage) {
        const pageName = JoinName(entry.targetPage.namespace, entry.targetPage.title);
        return (
            <span>
                <UserPopover username={actor} ip={'0.0.0.0'} />
                님이 {pageName} 문서에서 {entry.range} 범위로 {entry.targetType}: {entry.target} {entry.action} {typeMsg}
            </span>
        );
    }

    if (entry.target) {
        return (
            <span>
                <UserPopover username={actor} ip={'0.0.0.0'} />
                님이 {entry.target}의 {entry.action} {typeMsg}
            </span>
        );
    }

    return (
        <span>
            <UserPopover username={actor} ip={'0.0.0.0'} />
            님이 {entry.action} {typeMsg}
        </span>
    );
}

export async function loader({request}: LoaderFunctionArgs) {
    const user = await getUser(request);

    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const perPage = 20;

    const [history, total] = await Promise.all([
        prisma.permissionHistory.findMany({
            take: perPage,
            skip: (page - 1) * perPage,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                targetUser: {
                    select: {
                        username: true,
                    },
                },
                targetPage: {
                    select: {
                        title: true,
                        namespace: true,
                    },
                },
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        }),
        prisma.permissionHistory.count(),
    ]);

    return json({
        history,
        currentPage: page,
        totalPages: Math.ceil(total / perPage),
    });
}

export default function PermissionHistoryRoute() {
    const {history, currentPage, totalPages} = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">권한 변경 기록</h1>
                    <Button variant="ghost" size="sm" className="size-8 p-0" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 m-auto" />
                    </Button>
                </div>

                <div className="space-y-4">
                    {history.map((entry) => (
                        <div key={entry.id} className="p-4 bg-background rounded-lg shadow-xs hover:bg-muted/50 transition-colors">
                            <p className="text-foreground">{formatHistoryEntry(entry)}</p>
                            {entry.log && <p className="text-foreground text-sm mt-1">사유: {entry.log}</p>}
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mt-6">
                    <Link to={`?page=${Math.max(1, currentPage - 1)}`}>
                        <Button variant="ghost" disabled={currentPage <= 1}>
                            이전
                        </Button>
                    </Link>
                    <span className="text-sm text-gray-600">
                        페이지 {currentPage} / {totalPages}
                    </span>
                    <Link to={`?page=${Math.min(totalPages, currentPage + 1)}`}>
                        <Button variant="ghost" disabled={currentPage >= totalPages}>
                            다음
                        </Button>
                    </Link>
                </div>
            </div>
        </Frame>
    );
}
