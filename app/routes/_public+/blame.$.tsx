import React from 'react';
import {Link} from 'react-router-dom';
import {json, LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, useParams} from '@remix-run/react';

import {ArrowLeft} from 'lucide-react';

import {Button} from '~/components/ui/button';

import {Frame} from '~/components/frame';

import {Wiki} from '@/system/wiki';

import {prisma} from '~/db.server';

export async function loader({params, request}: LoaderFunctionArgs) {
    const [namespace, title] = Wiki.splitName(params['*'] || '');

    const url = new URL(request.url);
    const rever = Number(url.searchParams.get('rev')) || null;

    const wiki = await prisma.wiki.findUnique({
        where: {
            title_namespace: {
                namespace,
                title,
            },
        },
        select: {
            id: true,
            versions: {
                orderBy: {rever: 'desc'},
                ...(rever
                    ? {
                          where: {rever},
                      }
                    : {}),
                take: 1,
                select: {
                    user: {
                        select: {
                            username: true,
                        },
                    },
                    ipAddress: true,
                    id: true,
                    rever: true,
                    createdAt: true,
                    content: true,
                    blame: true,
                },
            },
        },
    });

    if (!wiki || !wiki.versions[0]) {
        throw new Response('Page not found', {status: 404});
    }

    const currentVersion = wiki.versions[0];
    const blame = await prisma.blame.findFirst({
        where: {
            reverId: currentVersion.id,
        },
    });

    if (!blame) {
        throw new Response('Blame data not found', {status: 404});
    }

    const lineOwners: Record<number, number> = JSON.parse(blame.lineOwners);

    const uniqueRevers = [...new Set(Object.values(lineOwners))];
    const versionInfo = await prisma.wikiVersion.findMany({
        where: {
            wikiId: wiki.id,
            rever: {
                in: uniqueRevers,
            },
        },
        select: {
            user: {
                select: {
                    username: true,
                },
            },
            ipAddress: true,
            id: true,
            rever: true,
            createdAt: true,
        },
    });

    const versionMap = new Map(
        versionInfo.map((v) => [
            v.rever,
            {
                author: v.user?.username || v.ipAddress || '0.0.0.0',
                date: v.createdAt.toLocaleString(),
            },
        ]),
    );

    const enrichedLineOwners: Record<number, {rever: number; author: string; date: string}> = {};
    Object.entries(lineOwners).forEach(([lineNum, rever]) => {
        const info = versionMap.get(rever);
        if (info) {
            enrichedLineOwners[Number(lineNum)] = {
                rever,
                author: info.author,
                date: info.date,
            };
        }
    });

    return json({
        content: currentVersion.content,
        lineOwners: enrichedLineOwners,
    });
}

export default function BlamePage() {
    const {lineOwners, content} = useLoaderData<typeof loader>();
    const params = useParams();
    const lines = content.split('\n').filter((line) => line.trim());

    return (
        <Frame>
            <div className="flex flex-col p-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">{params['*']}의 Blame</h1>
                    <Link to={`/wiki/${params['*']}`}>
                        <Button variant="ghost" size="sm" className="size-8 p-0">
                            <ArrowLeft className="h-4 w-4 m-auto" />
                        </Button>
                    </Link>
                </div>

                <div className="rounded-lg shadow-xs overflow-auto bg-background">
                    <div className="grid grid-cols-[auto_1fr] divide-x">
                        <div className="overflow-x-auto">
                            <pre className="p-2">
                                {lines.map((line, index) => {
                                    const info = lineOwners[index];

                                    return (
                                        <div key={index} className="flex gap-2 hover:bg-gray-muted/20">
                                            <div className="p-2 border-b text-sm hover:bg-gray-muted/50">
                                                <div className="font-medium">{info.author}</div>
                                                <div className="text-muted-foreground text-xs">rev.{info.rever}</div>
                                            </div>
                                            <span className="text-muted-foreground select-none w-12 text-right pr-4">{index + 1}</span>
                                            <code className="whitespace-pre-wrap break-words">{line}</code>
                                        </div>
                                    );
                                })}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </Frame>
    );
}
