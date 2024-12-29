import {json, LoaderFunction} from '@remix-run/node';
import {Link, useLoaderData, useParams} from '@remix-run/react';

import {ArrowLeft} from 'lucide-react';

import {Button} from '~/components/ui/button';

import {Frame} from '~/components/frame';

import {Acl} from '@/system/acl';
import {Wiki} from '@/system/wiki';

import {prisma} from '~/db.server';
import metaTitle from '~/utils/meta';
import {getUser, getUserData} from '~/utils/sessions.server';
import {JoinName} from '~/utils/wiki';

interface BacklinkData {
    wiki: {
        id: number;
        namespace: string;
        title: string;
    };
    backlinks: {
        from: {
            id: number;
            namespace: string;
            title: string;
        };
        type: 'category' | 'link' | 'image' | 'include' | 'redirect';
    }[];
}

export const meta = metaTitle<typeof loader>((data) => (data.wiki ? '역링크: ' + JoinName(data.wiki.namespace, data.wiki.title) : ''));

export const loader: LoaderFunction = async ({params, request}) => {
    const [namespace, title] = Wiki.splitName(params['*'] || '');
    const wiki = await Wiki.getPage(namespace, title);

    if (!wiki) {
        throw new Response('Page not found', {status: 404});
    }

    const user = await getUser(request);
    const userData = await getUserData(request);

    if (!(await Acl.isAllowed(wiki, user, userData, 'read'))) {
        throw new Response('Forbidden', {status: 403});
    }

    const backlinks = await prisma.backlink.findMany({
        where: {
            to: Wiki.joinName(namespace, title),
        },
        include: {
            from: {
                select: {
                    id: true,
                    namespace: true,
                    title: true,
                },
            },
        },
    });

    return json({wiki, backlinks});
};

const TypeToKorean = {
    category: '분류',
    link: '링크',
    image: '파일',
    include: '포함',
    redirect: '넘겨주기',
};

export default function BacklinkPage() {
    const {backlinks} = useLoaderData<BacklinkData>();
    const params = useParams();

    const groupedBacklinks = backlinks.reduce(
        (acc, backlink) => {
            const type = backlink.type;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(backlink);
            return acc;
        },
        {} as Record<string, typeof backlinks>,
    );

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">{params['*']}의 역링크</h1>
                    <Link to={`/wiki/${params['*']}`}>
                        <Button variant="ghost" size="sm" className="size-8 p-0">
                            <ArrowLeft className="h-4 w-4 m-auto" />
                        </Button>
                    </Link>
                </div>

                {Object.entries(groupedBacklinks).length > 0 ? (
                    Object.entries(groupedBacklinks).map(([type, links]) => (
                        <div key={type} className="mb-6">
                            <h2 className="text-lg font-semibold mb-3">
                                {TypeToKorean[type as keyof typeof TypeToKorean]} ({links.length})
                            </h2>
                            <ul className="space-y-2">
                                {links.map((backlink) => (
                                    <li key={`${backlink.from.id}-${type}`} className="p-3 rounded bg-secondary-100/40 hover:bg-muted-100 transition-colors duration-200">
                                        <Link to={`/wiki/${JoinName(backlink.from.namespace, backlink.from.title)}`} className="text-brand hover:underline">
                                            {JoinName(backlink.from.namespace, backlink.from.title)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600">이 문서를 참조하는 문서가 없습니다.</p>
                    </div>
                )}
            </div>
        </Frame>
    );
}
