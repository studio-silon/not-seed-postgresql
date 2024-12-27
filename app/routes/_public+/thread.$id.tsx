import {json, LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, useNavigate, Form, useSubmit, useNavigation, useRevalidator} from '@remix-run/react';
import {Wiki} from '@/system/wiki';
import {Button} from '~/components/ui/button';
import {ArrowLeft, Edit2, Lock, EyeOff, Eye, Send, Unlock, X, MoveRight, ArrowRight} from 'lucide-react';
import {useState, useEffect, useRef} from 'react';
import {getUserData, getUser} from '~/utils/sessions.server';
import {Frame} from '~/components/frame';
import metaTitle from '~/utils/meta';
import {Textarea} from '~/components/ui/textarea';
import {User} from '~/system/.server/user';
import {Acl} from '~/system/.server/acl';
import {prisma} from '~/db.server';
import {Input} from '~/components/ui/input';
import {Toggle} from '~/components/ui/toggle';
import Dialog from '~/stories/Dialog';
import {UserPopover} from '~/components/user-popover';

export const meta = metaTitle<typeof loader>((data) => (data.thread ? data.thread.title : ''));

export async function loader({request, params}: LoaderFunctionArgs & {params: {id: string}}) {
    const thread = await Wiki.getDiscussion(+params['id']);
    const user = await getUser(request);
    const userData = await getUserData(request);

    if (!thread) {
        throw new Response('Not Found', {status: 404});
    }

    if (!(await Acl.isAllowed(thread.wiki, user, userData, 'read'))) {
        throw new Response('Forbidden', {status: 403});
    }

    return json({
        thread,
        canUpdateState: await User.checkPermission('update_thread_status', user),
        canUpdateThread: await User.checkPermission('update_thread', user),
        canHideComments: await User.checkPermission('hide_thread_comment', user),
    });
}

export async function action({request}: {request: Request}) {
    const formData = await request.formData();
    const action = formData.get('action');
    const user = await getUser(request);
    const userData = await getUserData(request);
    const wikiId = parseInt(formData.get('wikiId') as string);

    const wiki = await Wiki.getPageById(wikiId);

    if (!wiki) {
        throw new Response('Not Found', {status: 404});
    }

    if (wiki && !(await Acl.isAllowed(wiki, user, userData, 'read'))) {
        throw new Response('Forbidden', {status: 403});
    }

    switch (action) {
        case 'comment': {
            if (wiki && !(await Acl.isAllowed(wiki, user, userData, 'comment_create'))) {
                throw new Response('Forbidden', {status: 403});
            }
            const discussionId = parseInt(formData.get('discussionId') as string);
            const content = formData.get('content') as string;
            const type = parseInt(formData.get('type') as string);

            const discussion = await prisma.discussion.findUnique({
                where: {
                    id: discussionId,
                },
            });

            if (!discussion) {
                throw new Response('Not Found', {status: 404});
            }

            if (!discussion.status && !(await User.checkPermission('update_thread_status', user))) {
                throw new Response('Forbidden', {status: 403});
            }

            await Wiki.addComment(discussionId, content, type, userData);
            break;
        }
        case 'hide_comment': {
            if (!user || !(await User.checkPermission('hide_thread_comment', user))) {
                throw new Response('Forbidden', {status: 403});
            }
            const commentId = parseInt(formData.get('commentId') as string);
            const hide = formData.get('hide') === 'true';
            await Wiki.hideComment(commentId, hide, user.id);
            break;
        }
        case 'edit': {
            if (!(await User.checkPermission('update_thread', user))) {
                throw new Response('Forbidden', {status: 403});
            }

            const discussionId = parseInt(formData.get('discussionId') as string);
            const title = formData.get('title') as string;
            await Wiki.updateDiscussion(discussionId, title);
            break;
        }
        case 'move': {
            if (!(await User.checkPermission('update_thread', user))) {
                throw new Response('Forbidden', {status: 403});
            }

            const discussionId = parseInt(formData.get('discussionId') as string);
            const targetWikiName = formData.get('targetWiki') as string;

            const targetWiki = await Wiki.getPage(...Wiki.splitName(targetWikiName));

            if (!targetWiki) {
                throw new Response('Not Found', {status: 404});
            }

            await Wiki.moveDiscussion(discussionId, targetWiki.id);
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

export default function DiscussionRoute() {
    const {thread, canUpdateState, canUpdateThread, canHideComments} = useLoaderData<typeof loader>();
    const [newComment, setNewComment] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(thread.title);
    const [isMoving, setIsMoving] = useState(false);
    const commentInputRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const submit = useSubmit();
    const navigate = useNavigate();
    const navigation = useNavigation();

    const revalidator = useRevalidator();

    useEffect(() => {
        const timer = setInterval(() => {
            revalidator.revalidate();
        }, 2000);

        return () => {
            clearInterval(timer);
        };
    }, [revalidator]);

    const formatDate = (date: string | Date) =>
        new Date(date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        await submit(formData, {method: 'post'});
        setNewComment('');
    };

    useEffect(() => {
        if (navigation.state === 'loading' && commentInputRef.current) {
            commentInputRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [navigation.state]);

    return (
        <Frame>
            <div className="mb-6 p-4">
                <div className="flex flex-col justify-between my-auto gap-2">
                    <div className="flex flex-1 mb-2 sm:mb-0">
                        {isEditing ? (
                            <Form method="post" className="flex gap-2" onSubmit={() => setIsEditing(false)}>
                                <input type="hidden" name="action" value="edit" />
                                <input type="hidden" name="wikiId" value={thread.wiki.id} />
                                <input type="hidden" name="discussionId" value={thread.id} />
                                <input
                                    type="text"
                                    name="title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="text-2xl font-bold text-gray-700 border-b border-gray-300 focus:border-gray-600 focus:outline-none"
                                />
                                <Button type="submit" className="size-8 p-0">
                                    <Send className="h-4 w-4 m-auto" />
                                </Button>
                            </Form>
                        ) : (
                            <h1 className="text-2xl font-bold text-foreground flex-1">{thread.title}</h1>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-0 size-8">
                            <ArrowLeft className="h-4 w-4 m-auto" />
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        {canUpdateState && (
                            <Form method="post" className="ml-2">
                                <input type="hidden" name="action" value="status" />
                                <input type="hidden" name="wikiId" value={thread.wiki.id} />
                                <input type="hidden" name="discussionId" value={thread.id} />
                                <input type="hidden" name="status" value={thread.status ? '0' : '1'} />
                                <Button type="submit" size="sm" variant="ghost" className="size-8 p-0">
                                    {thread.status === 0 ? <Lock className="h-4 w-4 m-auto" /> : <Unlock className="h-4 w-4 m-auto" />}
                                </Button>
                            </Form>
                        )}
                        {canUpdateThread && (
                            <>
                                <Button variant="ghost" className="size-8 p-0" size="sm" onClick={() => setIsMoving(true)}>
                                    <ArrowRight className="h-4 w-4 m-auto" />
                                </Button>
                                <Toggle className="size-8 p-0" size="sm" onClick={() => setIsEditing(true)} isActive={+isEditing as 0 | 1}>
                                    <Edit2 className="h-4 w-4 m-auto" />
                                </Toggle>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-4 max-w-full overflow-hidden">
                {thread.comments.map((comment, index) => (
                    <div
                        key={comment.id}
                        className={`bg-muted/50 rounded-lg p-4 hover:bg-muted transition-colors duration-200 w-fit max-w-full break-words ${comment.hidden ? 'opacity-50' : ''}`}
                    >
                        <div className="flex justify-between items-center mb-2 gap-4">
                            <div className="flex items-center gap-2">
                                <a id={'#r-' + index + 1} href={'#r-' + index + 1} className="text-blue-500">
                                    #{index + 1}
                                </a>
                                <UserPopover className="font-medium text-gray-700" username={comment.user?.username} ip={comment.ipAddress ?? '0.0.0.0'} />
                                {comment.hidden && <span className="text-xs text-muted-foreground">(숨김 처리됨)</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                                {canHideComments && (
                                    <Form method="post" className="inline">
                                        <input type="hidden" name="action" value="hide_comment" />
                                        <input type="hidden" name="wikiId" value={thread.wiki.id} />
                                        <input type="hidden" name="commentId" value={comment.id} />
                                        <input type="hidden" name="hide" value={(!comment.hidden).toString()} />
                                        <Button type="submit" variant="ghost" className="size-8 p-0 hover:bg-gray-200">
                                            {comment.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </Button>
                                    </Form>
                                )}
                            </div>
                        </div>
                        <div className="prose prose-sm max-w-full text-muted-foreground break-words">{!comment.hidden || canHideComments ? comment.content : ''}</div>
                    </div>
                ))}
            </div>

            {thread.status === 1 || canUpdateState ? (
                <Form ref={formRef} method="post" onSubmit={handleSubmitComment} className="flex gap-2 w-full">
                    <input type="hidden" name="action" value="comment" />
                    <input type="hidden" name="wikiId" value={thread.wiki.id} />
                    <input type="hidden" name="discussionId" value={thread.id} />
                    <input type="hidden" name="type" value="0" />
                    <div className="flex-1">
                        <Textarea
                            ref={commentInputRef}
                            name="content"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[100px] focus:ring-2 focus:ring-blue-500"
                            placeholder="댓글을 입력하세요..."
                        />
                    </div>
                    <Button type="submit" className="self-end">
                        <Send className="h-4 w-4" />
                    </Button>
                </Form>
            ) : null}

            <Dialog isOpen={isMoving} onClose={() => setIsMoving(false)}>
                <Form method="post">
                    <Dialog.Title>토론 이동하기</Dialog.Title>
                    <Dialog.Content>
                        <input type="hidden" name="action" value="move" />
                        <input type="hidden" name="wikiId" value={thread.wiki.id} />
                        <input type="hidden" name="discussionId" value={thread.id} />

                        <div className="space-y-4">
                            <Input type="text" name="targetWiki" placeholder="문서 선택..." className="w-full" />

                            <Input name="log" className="mt-2" placeholder="이동 로그 작성..." />
                        </div>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onClick={() => setIsMoving(false)} variant="ghost">
                            취소
                        </Button>
                        <Button type="submit" onClick={() => setIsMoving(false)}>
                            이동
                        </Button>
                    </Dialog.Actions>
                </Form>
            </Dialog>
        </Frame>
    );
}
