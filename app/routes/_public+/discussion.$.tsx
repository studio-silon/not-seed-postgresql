import {useEffect, useRef, useState} from 'react';
import {json, LoaderFunctionArgs} from '@remix-run/node';
import {Form, Link, useLoaderData, useNavigate} from '@remix-run/react';
import {Jsonify} from '@remix-run/server-runtime/dist/jsonify';

import {Prisma} from '@prisma/client';
import {ArrowLeft, Lock, PlusIcon, Unlock} from 'lucide-react';

import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Toggle} from '~/components/ui/toggle';

import {Frame} from '~/components/frame';

import {Acl} from '@/system/acl';
import {User} from '@/system/user';
import {Wiki} from '@/system/wiki';

import metaTitle from '~/utils/meta';
import {getUser, getUserData} from '~/utils/sessions.server';
import {JoinName} from '~/utils/wiki';

type Discussion = Jsonify<Prisma.PromiseReturnType<typeof Wiki.getDiscussion>>;

export const meta = metaTitle<typeof loader>((data) => (data.wiki ? `토론: ${JoinName(data.wiki.namespace, data.wiki.title)}` : ''));

export async function loader({request, params}: LoaderFunctionArgs & {params: {'*': string}}) {
    const [namespace, title] = Wiki.splitName(params['*']);
    const wiki = await Wiki.getPage(namespace, title);

    if (!wiki) {
        throw new Response('Not Found', {status: 404});
    }

    const userData = await getUserData(request);
    const user = await getUser(request);

    if (wiki && !(await Acl.isAllowed(wiki, user, userData, 'read'))) {
        throw new Response('Forbidden', {status: 403});
    }

    const discussions = await Wiki.getDiscussions(wiki.id);

    return json({
        wiki,
        discussions,
        canUpdateState: await User.checkPermission('update_thread_status', user),
    });
}

export async function action({request}: {request: Request}) {
    const formData = await request.formData();
    const action = formData.get('action');
    const userData = await getUserData(request);
    const user = await getUser(request);
    const wikiId = parseInt(formData.get('wikiId') as string);

    const wiki = await Wiki.getPageById(wikiId);

    if (!wiki) {
        throw new Response('Not Found', {status: 404});
    }

    if (wiki && !(await Acl.isAllowed(wiki, user, userData, 'read'))) {
        throw new Response('Forbidden', {status: 403});
    }

    switch (action) {
        case 'create': {
            if (wiki && !(await Acl.isAllowed(wiki, user, userData, 'thread_create'))) {
                throw new Response('Forbidden', {status: 403});
            }
            const title = formData.get('title') as string;
            await Wiki.createDiscussion(wikiId, title, userData);
            break;
        }
        case 'status': {
            if (!(await User.checkPermission('update_thread_status', user))) {
                throw new Response('Forbidden', {status: 403});
            }
            const discussionId = parseInt(formData.get('discussionId') as string);
            const status = parseInt(formData.get('status') as string) as 0 | 1;
            await Wiki.updateDiscussionStatus(discussionId, status);
            break;
        }
        default:
            throw new Error('Invalid action');
    }
    return null;
}

interface DiscussionItemProps {
    discussion: Discussion;
    wikiId: number;
    canUpdateState: boolean;
}

function DiscussionItem({discussion, wikiId, canUpdateState}: DiscussionItemProps) {
    if (!discussion) return;

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
        <div className="border-b border-border p-4 hover:bg-muted">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Link to={`/thread/${discussion.id}`}>
                        <h3 className="font-medium text-blue-600 hover:underline">{discussion.title}</h3>
                    </Link>
                    {discussion.status === 0 && <Lock className="h-4 w-4 text-gray-800" />}
                </div>
                <div className="text-sm text-gray-500 font-medium">{formatDate(discussion.createdAt)}</div>
            </div>

            <div className="flex justify-end mt-4">
                {canUpdateState && (
                    <Form method="post" className="ml-2">
                        <input type="hidden" name="action" value="status" />
                        <input type="hidden" name="wikiId" value={wikiId} />
                        <input type="hidden" name="discussionId" value={discussion.id} />
                        <input type="hidden" name="status" value={discussion.status ? '0' : '1'} />
                        <Button type="submit" variant="ghost" className="size-8 p-0">
                            {discussion.status === 0 ? <Lock className="h-4 w-4 m-auto" /> : <Unlock className="h-4 w-4 m-auto" />}
                        </Button>
                    </Form>
                )}
            </div>
        </div>
    );
}

export default function DiscussionRoute() {
    const {wiki, discussions, canUpdateState} = useLoaderData<typeof loader>();
    const [isCreating, setIsCreating] = useState(false);
    const [loadedDiscussions, setLoadedDiscussions] = useState<Discussion[]>(discussions as Discussion[]);
    const navigate = useNavigate();
    const createFormRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        setLoadedDiscussions(discussions as Discussion[]);
    }, [discussions]);

    return (
        <Frame>
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between my-auto gap-2">
                    <div className="flex flex-1 mb-2 sm:mb-0">
                        <h1 className="text-2xl font-bold text-foreground flex-1">{JoinName(wiki.namespace, wiki.title)}의 토론</h1>
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-0 size-8">
                            <ArrowLeft className="h-4 w-4 m-auto" />
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Toggle onClick={() => setIsCreating(!isCreating)} isActive={+isCreating as 0 | 1} size="sm">
                            <PlusIcon className="h-4 w-4 m-auto" />
                        </Toggle>
                    </div>
                </div>

                {isCreating && (
                    <Form ref={createFormRef} method="post" className="mt-4 space-y-4 bg-muted/30 rounded-lg p-4">
                        <input type="hidden" name="action" value="create" />
                        <input type="hidden" name="wikiId" value={wiki.id} />
                        <Input name="title" placeholder="토론 제목을 입력하세요..." required className="w-full focus:ring-2 focus:ring-blue-500" />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                                취소
                            </Button>
                            <Button type="submit">생성</Button>
                        </div>
                    </Form>
                )}
            </div>

            <div>
                {loadedDiscussions
                    .filter((d) => d?.status === 1)
                    .map((discussion) => (
                        <DiscussionItem key={discussion!.id} canUpdateState={canUpdateState} discussion={discussion} wikiId={wiki.id} />
                    ))}
            </div>

            <div>
                {loadedDiscussions
                    .filter((d) => d?.status === 0)
                    .map((discussion) => (
                        <DiscussionItem key={discussion!.id} canUpdateState={canUpdateState} discussion={discussion} wikiId={wiki.id} />
                    ))}
            </div>
        </Frame>
    );
}
