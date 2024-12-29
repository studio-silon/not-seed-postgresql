import React, {useState} from 'react';
import {json,LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';

import {Button} from '~/components/ui/button';

import {Frame} from '~/components/frame';

import {prisma} from '~/db.server';
import {JoinName} from '~/utils/wiki';

async function getContributions(type: string, skip: number, pageSize: number, userId: number | undefined, identifier: string) {
    if (type === 'user') {
        if (!userId) {
            throw new Response('Not Found', {status: 404});
        }

        return {
            contributions: await prisma.wikiVersion.findMany({
                where: {
                    userId,
                },
                include: {
                    wiki: {
                        select: {
                            namespace: true,
                            title: true,
                        },
                    },
                },
                orderBy: {createdAt: 'desc'},
                skip,
                take: pageSize,
            }),
            totalVersions: await prisma.wikiVersion.count({
                where: {
                    userId,
                },
            }),
        };
    } else {
        return {
            contributions: await prisma.wikiVersion.findMany({
                where: {
                    userId: null,
                    ipAddress: identifier,
                },
                include: {
                    wiki: {
                        select: {
                            namespace: true,
                            title: true,
                        },
                    },
                },
                orderBy: {createdAt: 'desc'},
                skip,
                take: pageSize,
            }),
            totalVersions: await prisma.wikiVersion.count({
                where: {
                    ipAddress: identifier,
                },
            }),
        };
    }
}

export async function loader({params, request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const type = params.type as 'user' | 'ip';
    const identifier = params['*'] || '';
    const pageSize = 40;
    const skip = (page - 1) * pageSize;

    const user = await prisma.user.findUnique({
        where: {
            username: identifier,
        },
        select: {
            id: true,
        },
    });

    const {contributions, totalVersions} = await getContributions(type, skip, pageSize, user?.id, identifier);

    const totalPages = Math.ceil(totalVersions / pageSize);

    return json({
        contributions,
        totalPages,
        type,
        identifier,
    });
}

export default function ContributionPage() {
    const {contributions, totalPages, type, identifier} = useLoaderData<typeof loader>();
    const [currentPage, setCurrentPage] = useState(1);

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="bg-background rounded-lg shadow-xs mb-6 p-4">
                    <h1 className="text-2xl font-bold">
                        {type === 'user' ? `사용자 기여` : `IP 기여`}: {identifier}
                    </h1>
                </div>

                <div className="bg-background rounded-lg shadow-xs">
                    {contributions.map((contribution, index) => (
                        <div key={index} className="border-b border-border p-4 hover:bg-muted">
                            <div className="flex items-center gap-2">
                                <a href={`/wiki/${JoinName(contribution.wiki.namespace, contribution.wiki.title)}`} className="font-medium text-blue-600 hover:underline">
                                    {JoinName(contribution.wiki.namespace, contribution.wiki.title)}
                                </a>
                                <span className="text-sm text-gray-500">r{contribution.rever}</span>
                            </div>

                            {contribution.log && <p className="mt-1 text-sm text-gray-600">{contribution.log}</p>}

                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:justify-start justify-between">
                                <span>{new Date(contribution.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-6">
                    <Button variant="ghost" disabled={currentPage <= 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                        이전
                    </Button>
                    <span>
                        페이지 {currentPage} / {totalPages}
                    </span>
                    <Button variant="ghost" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
                        다음
                    </Button>
                </div>
            </div>
        </Frame>
    );
}
